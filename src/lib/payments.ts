/**
 * Razorpay Standard Checkout — the single client seam.
 *
 * NOTHING HERE HOLDS A SECRET. The key id arrives from the server with every
 * create-order response, so there is no `VITE_RAZORPAY_KEY_ID` to drift between
 * test and live. The key secret never existed in this bundle at all.
 *
 * Transport is `supabase.functions.invoke`, not raw `fetch`, for one specific
 * reason: it attaches the customer's session JWT. `razorpay-verify` forwards that
 * header into `place_order`, whose `auth.uid()` becomes `orders.user_id`. Hand-
 * rolled fetch would silently write guest orders for signed-in customers and
 * they would never see the order in their history.
 */

import { supabase, isSupabaseConfigured } from './supabase';

// ── Razorpay's browser global ───────────────────────────────────────────
// Declared here rather than in a global .d.ts so the shape lives next to the
// code that depends on it.
interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
interface RazorpayFailure {
  error: { code?: string; description?: string; reason?: string; source?: string; step?: string };
}
interface RazorpayInstance {
  open: () => void;
  close: () => void;
  on: (event: 'payment.failed', cb: (resp: RazorpayFailure) => void) => void;
}
interface RazorpayConstructor {
  new (options: Record<string, unknown>): RazorpayInstance;
}
declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

let scriptPromise: Promise<RazorpayConstructor> | null = null;

/**
 * Load Razorpay's checkout script on demand.
 *
 * Deliberately NOT a tag in `index.html`: it is ~100 KB of third-party JS that
 * only matters for the ~4% of sessions that reach the pay click. Putting it in
 * the document would tax LCP on every product page to serve the last step.
 *
 * A failed load is a real state — adblockers and flaky networks produce it — so
 * it rejects and the caller falls back to COD rather than a dead button.
 */
export function loadRazorpay(): Promise<RazorpayConstructor> {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<RazorpayConstructor>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SRC}"]`);
    const done = () => {
      if (window.Razorpay) resolve(window.Razorpay);
      else reject(new PaymentError('PAYMENT_SCRIPT_FAILED', 'Razorpay did not initialise.'));
    };

    if (existing) {
      existing.addEventListener('load', done, { once: true });
      existing.addEventListener('error', () => reject(scriptFailure()), { once: true });
      // Already finished loading before this listener attached.
      if (window.Razorpay) done();
      return;
    }

    const tag = document.createElement('script');
    tag.src = CHECKOUT_SRC;
    tag.async = true;
    tag.addEventListener('load', done, { once: true });
    tag.addEventListener(
      'error',
      () => {
        // Remove the dead tag. Leaving it in the DOM means the next call finds it
        // via querySelector, attaches listeners to a script that has already
        // finished failing, and hangs forever waiting for load/error that will
        // never fire again.
        tag.remove();
        reject(scriptFailure());
      },
      { once: true }
    );
    document.head.appendChild(tag);
  }).catch((err) => {
    // Never cache a rejection: a retry after the adblocker is disabled must work.
    scriptPromise = null;
    throw err;
  });

  return scriptPromise;
}

function scriptFailure(): PaymentError {
  return new PaymentError(
    'PAYMENT_SCRIPT_BLOCKED',
    'Could not load the secure payment window. Check your connection or try Cash on delivery.'
  );
}

// ── Error model ─────────────────────────────────────────────────────────
// A union rather than a bare Error, because the page must react differently to
// "you cancelled" (reassure, keep the bag) and "the amount changed" (re-price).
export type PaymentErrorCode =
  | 'NOT_CONFIGURED'
  | 'NETWORK'
  | 'REJECTED'
  | 'AMOUNT_CHANGED'
  | 'VERIFY_FAILED'
  | 'VERIFY_TIMEOUT'
  | 'TAKEN_NO_ORDER'
  | 'PAYMENT_SCRIPT_FAILED'
  | 'PAYMENT_SCRIPT_BLOCKED'
  | 'CANCELLED'
  | 'FAILED';

export class PaymentError extends Error {
  readonly code: PaymentErrorCode;
  /** True when retrying the same action could plausibly succeed. */
  readonly retryable: boolean;
  /** The server's parsed body. Carries `payment_id` on a taken-but-unplaced row. */
  readonly detail: Record<string, unknown> | null;
  readonly status: number | null;

  constructor(
    code: PaymentErrorCode,
    message: string,
    retryable = true,
    detail: Record<string, unknown> | null = null,
    status: number | null = null
  ) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
    this.retryable = retryable;
    this.detail = detail;
    this.status = status;
  }
}

/** True when online payment can be attempted at all in this build. */
export function isPaymentsConfigured(): boolean {
  return isSupabaseConfigured() && Boolean(supabase);
}

// ── create-order ────────────────────────────────────────────────────────
/** The delivery details place_order stores. Mirrors the COD path's shape — the
 *  confirmation page and admin queue both read `phone` and `pincode` off it, so
 *  sending a bare address string silently loses them. */
export interface ShippingDetails {
  address: string;
  phone?: string;
  pincode?: string;
  city?: string;
  state?: string;
}

export interface CreatePaymentOrderInput {
  items: {
    variantSku: string;
    quantity: number;
    productSlug: string;
    productName: string;
    color: string;
    size: string;
    customization?: unknown;
  }[];
  couponCode?: string | null;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  shippingAddress: ShippingDetails;
  /**
   * The total the page is showing. The server compares it to what it just priced
   * and refuses with 409 BEFORE creating a Razorpay order, so a mid-checkout price
   * move leaves no gateway order behind. Optional only so a caller that cannot
   * know the total still works; omitting it is a weaker guarantee, not a safe one.
   */
  expectedTotalCents?: number;
  /** Generated once per checkout attempt and reused on retry. */
  clientOrderId: string;
}

export interface PaymentOrder {
  razorpay_order_id: string;
  amount: number;
  currency: string;
  key_id: string;
}

type EdgeFn = 'razorpay-create-order' | 'razorpay-verify';

/**
 * Hard ceilings on the function round trip.
 *
 * Observed reality: verify normally answers in ~2s, but a cold Deno isolate plus a
 * Razorpay payment lookup plus `place_order` under row locks can push it to 10s+.
 * Without a ceiling, ANY stall (edge redeploy, Cloudflare hiccup, a request that
 * never returns) leaves `payOnline` unresolved — and because the checkout awaits
 * it, the page sits on "Confirming your payment…" forever with no way out. That is
 * worse than an error: the customer cannot retry, cannot navigate, and does not
 * know whether they were charged.
 *
 * Generous on purpose. These exist to break a hang, not to cut off slow-but-fine
 * payments.
 */
const CREATE_TIMEOUT_MS = 20_000;
const VERIFY_TIMEOUT_MS = 45_000;

/**
 * Race a promise against a deadline.
 *
 * `functions.invoke` accepts a `timeout` option, but this is a second, independent
 * belt: the SDK's timeout guards its own fetch, while this guards the whole call
 * (including any await inside `invoke` that could itself stall). Cheap, and the
 * failure it prevents is the one this bug was.
 */
function withDeadline<T>(promise: Promise<T>, ms: number, fn: EdgeFn): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new PaymentError(
          fn === 'razorpay-verify' ? 'VERIFY_TIMEOUT' : 'NETWORK',
          fn === 'razorpay-verify'
            ? 'We could not confirm your payment in time. Do not pay again — check your orders or contact us.'
            : 'The payment service took too long to respond. Please try again.',
          // A verify timeout means money may already have moved: not retryable.
          fn !== 'razorpay-verify'
        )
      );
    }, ms);

    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

/**
 * Invoke an Edge Function and turn every failure shape into a PaymentError.
 *
 * `functions.invoke` reports non-2xx as a `FunctionsHttpError` whose JSON body
 * sits on `error.context`. Unwrapping it matters more than it looks: the server
 * answers 400 (bad coupon), 402 (not settled), 409 (amount changed) and 502
 * (money taken, no order) and the page must react DIFFERENTLY to each. Collapsing
 * them into "network error" produces the one outcome that must never happen — a
 * customer whose payment was captured being invited to pay again.
 */
async function invoke<T>(fn: EdgeFn, body: Record<string, unknown>): Promise<T> {
  if (!supabase) {
    throw new PaymentError('NOT_CONFIGURED', 'Online payment is unavailable in this build.', false);
  }

  const ceiling = fn === 'razorpay-verify' ? VERIFY_TIMEOUT_MS : CREATE_TIMEOUT_MS;

  const { data, error } = await withDeadline(
    supabase.functions.invoke(fn, { body, timeout: ceiling }),
    ceiling + 5_000,
    fn
  );

  if (error) {
    let message = error.message || 'The payment service is unavailable.';
    let code: PaymentErrorCode = 'NETWORK';
    let detail: Record<string, unknown> | null = null;
    let status: number | null = null;

    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === 'function') {
      status = ctx.status;
      try {
        const parsed = await ctx.json();
        if (parsed && typeof parsed === 'object') {
          detail = parsed as Record<string, unknown>;
          if (typeof detail.error === 'string') message = detail.error;
        }
      } catch {
        /* non-JSON body; the status alone still tells us enough */
      }
    }

    // A body carrying a payment_id means money moved. That outranks the status
    // code: 409 and 502 both use it, and both mean "do NOT pay again."
    const hasPaymentRef =
      detail !== null && (typeof detail.payment_id === 'string' || detail.owed !== undefined);

    if (hasPaymentRef) {
      code = 'TAKEN_NO_ORDER';
    } else if (status === 404) {
      // The function is not deployed, or the project ref is wrong. A build
      // problem, not a network blip — the caller switches to COD.
      code = 'NOT_CONFIGURED';
    } else if (status === 409) {
      code = 'AMOUNT_CHANGED';
    } else if (status === 402) {
      code = 'FAILED';
    } else if (status === 400) {
      code = 'REJECTED';
    } else if (status === 503) {
      code = 'NOT_CONFIGURED';
    } else if (/not configured|not available/i.test(message)) {
      code = 'NOT_CONFIGURED';
    }

    // Only these two are safe to retry: a rejected input can be corrected, and a
    // network fault may clear. Anything else may already have taken money.
    const retryable = code === 'REJECTED' || code === 'NETWORK';
    throw new PaymentError(code, message, retryable, detail, status);
  }

  return data as T;
}

export async function createPaymentOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder> {
  return invoke<PaymentOrder>('razorpay-create-order', {
    items: input.items,
    coupon_code: input.couponCode ?? null,
    customer_email: input.customerEmail,
    customer_name: input.customerName,
    customer_phone: input.customerPhone ?? null,
    // Structured, not a bare string: phone and pincode are what the courier and
    // the confirmation page actually need.
    shipping_address: {
      address: input.shippingAddress.address,
      phone: input.shippingAddress.phone ?? null,
      pincode: input.shippingAddress.pincode ?? null,
      city: input.shippingAddress.city ?? null,
      state: input.shippingAddress.state ?? null,
      payment_method: 'prepaid',
    },
    // Must be sent, or the server's pre-check never fires: Number(undefined) is
    // NaN and the guard is written as `Number.isFinite(expected) && expected > 0`.
    expected_total_cents: input.expectedTotalCents ?? null,
    client_order_id: input.clientOrderId,
  });
}

// ── verify ──────────────────────────────────────────────────────────────
export interface VerifyResult {
  success: boolean;
  order_id: string;
  payment_id?: string;
  already_verified?: boolean;
}

export async function verifyPayment(success: RazorpaySuccess): Promise<VerifyResult> {
  return invoke<VerifyResult>('razorpay-verify', {
    razorpay_order_id: success.razorpay_order_id,
    razorpay_payment_id: success.razorpay_payment_id,
    razorpay_signature: success.razorpay_signature,
  });
}

// ── The whole dance, in one place ───────────────────────────────────────
export interface PayOnlineInput extends CreatePaymentOrderInput {
  /** The total the page is currently showing. */
  expectedTotalCents: number;
  prefill: { name: string; email: string; contact?: string };
  /** Store's ink token, so the modal does not look like a different product. */
  accentColor?: string;
  /**
   * Progress, because the gap after the modal closes is where customers panic.
   * `verifying` covers a server round trip (fetch payment, capture, place_order)
   * that can take seconds; without a signal the page looks frozen and people
   * refresh — mid-payment. The caller disables the button and says so.
   */
  onStage?: (stage: 'creating' | 'awaiting' | 'verifying') => void;
}

export interface PayOnlineResult {
  orderId: string;
  paymentId: string;
}

/**
 * Open Razorpay, take payment, verify it, and return the placed order id.
 *
 * Rejects with a `PaymentError`. `CANCELLED` is not a failure to apologise for —
 * the caller keeps the bag and says so.
 *
 * THE AMOUNT CHECK IS THE POINT. `createPaymentOrder` prices the cart fresh on
 * the server and returns what it will actually charge. If that differs from what
 * the page showed (a coupon expired, stock moved a variant to a new price), the
 * modal must never open: charging a number the customer did not see is the worst
 * outcome at a payment page, and silently "fixing" it is not better.
 */
export async function payOnline(input: PayOnlineInput): Promise<PayOnlineResult> {
  const stage = input.onStage ?? (() => {});
  stage('creating');

  const Razorpay = await loadRazorpay();
  const order = await createPaymentOrder(input);

  if (order.amount !== input.expectedTotalCents) {
    // The server re-priced and got a different number than the page shows.
    // The modal must NOT open: charging an amount the customer never saw is the
    // worst outcome at a payment page, and silently "fixing" it is not better.
    throw new PaymentError(
      'AMOUNT_CHANGED',
      'Your order total changed while you were paying. Please review the updated amount.',
      true
    );
  }

  return new Promise<PayOnlineResult>((resolve, reject) => {
    let settled = false;
    /**
     * The most recent gateway failure, if any.
     *
     * NOT used to settle the promise. Razorpay keeps the modal open after a
     * failed attempt so the customer can retry another method — UPI fails, they
     * pay by card, which is the single most common recovery path in Indian
     * checkout. Settling on `payment.failed` would set `settled = true` and then
     * silently DROP the later `handler` success: money captured, verify never
     * called, no order. This variable exists only so that *closing* the modal
     * after a failure reports the gateway's reason instead of "you cancelled".
     */
    let lastFailure: PaymentError | null = null;

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      fn();
    };

    const rzp = new Razorpay({
      key: order.key_id,
      order_id: order.razorpay_order_id,
      amount: order.amount,
      currency: order.currency,
      name: 'UniqueLo',
      description: 'Hand-embroidered essentials',
      // Prefilled so the customer retypes nothing they already entered.
      prefill: {
        name: input.prefill.name,
        email: input.prefill.email,
        contact: input.prefill.contact ?? '',
      },
      notes: { client_order_id: input.clientOrderId },
      theme: { color: input.accentColor ?? '#141414' },
      modal: {
        // The customer closed the window. If the last thing that happened was a
        // gateway failure, that is the more useful message than "cancelled".
        ondismiss: () =>
          finish(() => reject(lastFailure ?? new PaymentError('CANCELLED', 'Payment cancelled — your bag is saved.'))),
      },
      handler: (resp: RazorpaySuccess) => {
        // Razorpay does not await this callback, so the promise resolution must
        // happen inside it rather than after `open()` returns.
        finish(() => {
          stage('verifying');
          verifyPayment(resp)
            .then((result) =>
              resolve({ orderId: result.order_id, paymentId: result.payment_id ?? resp.razorpay_payment_id })
            )
            .catch((err) =>
              reject(
                err instanceof PaymentError
                  ? err
                  : new PaymentError(
                      'VERIFY_FAILED',
                      'We could not confirm your payment. Do not retry payment — contact us with your reference.',
                      // NOT retryable: money may already be captured, and a second
                      // attempt could charge twice.
                      false
                    )
              )
            );
        });
      },
    });

    rzp.on('payment.failed', (resp) => {
      // Record only. See `lastFailure` above — settling here breaks retry-to-success.
      lastFailure = new PaymentError(
        'FAILED',
        resp.error?.description || 'The payment did not go through. No money was taken.',
        // A different method can plausibly succeed, so the *customer* may try
        // again; this flag governs retrying the same action, which is safe here
        // because nothing was captured.
        true
      );
    });

    try {
      rzp.open();
      stage('awaiting');
    } catch {
      finish(() => reject(new PaymentError('FAILED', 'Could not open the payment window.')));
    }
  });
}

/** A stable id for one checkout attempt. Not a v4-for-crypto requirement: it is
 *  an idempotency key, and `crypto.randomUUID` is the same generator `data.ts`
 *  already uses for the COD path. */
export function newClientOrderId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
