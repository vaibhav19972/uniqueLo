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
    tag.addEventListener('error', () => reject(scriptFailure()), { once: true });
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
  | 'PAYMENT_SCRIPT_FAILED'
  | 'PAYMENT_SCRIPT_BLOCKED'
  | 'CANCELLED'
  | 'FAILED';

export class PaymentError extends Error {
  constructor(
    readonly code: PaymentErrorCode,
    message: string,
    /** True when retrying the same action could plausibly succeed. */
    readonly retryable = true
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

/** True when online payment can be attempted at all in this build. */
export function isPaymentsConfigured(): boolean {
  return isSupabaseConfigured() && Boolean(supabase);
}

// ── create-order ────────────────────────────────────────────────────────
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
  shippingAddress: string;
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
 * Invoke an Edge Function and turn every failure shape into a PaymentError.
 *
 * `functions.invoke` reports non-2xx as a `FunctionsHttpError` whose JSON body
 * sits on `error.context`. Without this unwrapping every server-side message —
 * "coupon expired", "gateway rejected our credentials" — collapses into a
 * generic network error, which is how a checkout becomes undebuggable.
 */
async function invoke<T>(fn: EdgeFn, body: unknown): Promise<T> {
  if (!supabase) {
    throw new PaymentError('NOT_CONFIGURED', 'Online payment is unavailable in this build.', false);
  }

  const { data, error } = await supabase.functions.invoke(fn, { body });

  if (error) {
    let message = error.message || 'The payment service is unavailable.';
    let code: PaymentErrorCode = 'NETWORK';

    // FunctionsHttpError carries the response; read our own { error } field off it.
    const ctx = (error as { context?: Response }).context;
    if (ctx && typeof ctx.json === 'function') {
      try {
        const parsed = await ctx.json();
        if (parsed?.error) message = parsed.error;
        code = ctx.status === 400 ? 'REJECTED' : 'NETWORK';
        if (/not configured/i.test(message)) code = 'NOT_CONFIGURED';
      } catch {
        /* non-JSON body; keep the generic message */
      }
    }

    throw new PaymentError(code, message, code !== 'NOT_CONFIGURED');
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
    shipping_address: { address: input.shippingAddress, payment_method: 'prepaid' },
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
  const Razorpay = await loadRazorpay();
  const order = await createPaymentOrder(input);

  if (order.amount !== input.expectedTotalCents) {
    throw new PaymentError(
      'AMOUNT_CHANGED',
      'Your order total changed while you were paying. Please review the updated amount.',
      true
    );
  }

  return new Promise<PayOnlineResult>((resolve, reject) => {
    let settled = false;
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
        // The customer closed the window. Not an error, not a lost sale — the bag
        // is intact and the same intent is reused if they try again.
        ondismiss: () =>
          finish(() =>
            reject(new PaymentError('CANCELLED', 'Payment cancelled — your bag is saved.'))
          ),
      },
      handler: (resp: RazorpaySuccess) => {
        // Razorpay does not await this callback, so the promise resolution must
        // happen inside it rather than after `open()` returns.
        finish(() => {
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
                      'We could not confirm your payment. Do not retry payment — contact us with your reference.'
                    )
              )
            );
        });
      },
    });

    rzp.on('payment.failed', (resp) => {
      finish(() =>
        reject(
          new PaymentError(
            'FAILED',
            resp.error?.description || 'The payment did not go through. No money was taken.'
          )
        )
      );
    });

    try {
      rzp.open();
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
