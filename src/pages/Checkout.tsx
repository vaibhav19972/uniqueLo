import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { useCartStore } from '../stores/cart';
import { useAuthStore, type CustomerAddress } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { useProducts } from '../hooks/useCatalog';
import { useQuote } from '../hooks/useQuote';
import { useReconcileCart } from '../hooks/useReconcileCart';
import { getCartLine, formatPrice, createOrder, type CartLine, type PaymentMethod } from '../lib/data';
import { PaymentError, isPaymentsConfigured, newClientOrderId, payOnline } from '../lib/payments';
import {
  UnknownVariantError,
  lineMrpCents,
  lineDiscountPercent,
  remainingForFreeShipping,
  type BestCoupon,
} from '../lib/pricing';

/**
 * Progress through the payment round trip.
 *
 * `verifying` matters most: after the Razorpay window closes the page waits on a
 * server round trip (read the payment, confirm it settled, write the order). With
 * no signal that gap looks frozen, and customers refresh — mid-payment. The button
 * label and the hint under it are driven by this.
 */
type PayStage = 'idle' | 'creating' | 'awaiting' | 'verifying';

/** A payment that may already have taken money. Never auto-dismissed. */
interface FatalPayment {
  message: string;
  paymentId?: string;
  /** False when re-attempting could double-charge. */
  allowRetry: boolean;
}

/**
 * The checkout page.
 *
 * Rules this page follows, because the bag used to break them:
 *   1. Every number comes from quote_order. Nothing is computed here.
 *   2. Nothing is advertised that the server would refuse. Offers are the
 *      server's available_offers; shipping and COD come from shipping_rules.
 *   3. A stale quote cannot become an order. The submit button is disabled
 *      while re-pricing, and place_order re-prices regardless.
 */
export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const items = useCartStore((s) => s.items);
  const expressItem = useCartStore((s) => s.expressItem);
  const clearExpressItem = useCartStore((s) => s.clearExpressItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const removeItems = useCartStore((s) => s.removeItems);

  const isExpress = searchParams.get('express') === '1' && Boolean(expressItem);
  const checkoutItems = useMemo(
    () => (isExpress && expressItem ? [expressItem] : items),
    [isExpress, expressItem, items]
  );
  const { data: products = [] } = useProducts();
  const showToast = useToastStore((s) => s.showToast);

  // Prune bag lines the live catalogue can no longer price, before the quote
  // runs. See useReconcileCart for why this has to happen at all.
  useReconcileCart();

  const user = useAuthStore((s) => s.user);
  const addresses = useAuthStore((s) => s.addresses);
  const loadAddresses = useAuthStore((s) => s.loadAddresses);
  const saveAddress = useAuthStore((s) => s.saveAddress);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<PayStage>('idle');
  const [fatal, setFatal] = useState<FatalPayment | null>(null);

  /**
   * ONE id for this checkout attempt, for the life of the mount.
   *
   * It is the key the server uses to reuse a Razorpay order and to make
   * place_order idempotent. Regenerating per click would mint a new gateway order
   * on every retry — a customer who fails on UPI and succeeds on card would leave
   * two intents behind and the server could not tell they were the same basket.
   * A ref, not state: changing it must not re-render or re-price.
   */
  const clientOrderIdRef = useRef<string>(newClientOrderId());
  /**
   * Synchronous double-submit guard. `submitting` is React state and therefore a
   * tick behind; two clicks in the same frame both pass a state check and open two
   * payment windows.
   */
  const submitLock = useRef(false);

  // Address form. Progressive: a signed-in customer with saved addresses sees
  // them as cards and can add a new one without losing the list.
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [saveToAccount, setSaveToAccount] = useState(true);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const cartLines = useMemo(
    () =>
      checkoutItems
        .map((i) => getCartLine(i, products))
        .filter((l): l is CartLine => Boolean(l)),
    [checkoutItems, products]
  );

  const { quote, isLoading, error: quoteError, refetch: refetchQuote } = useQuote({
    couponCode: appliedCode,
    paymentMethod,
    items: checkoutItems,
  });

  useEffect(() => {
    if (user) loadAddresses();
  }, [user, loadAddresses]);

  // Prefer the default address once loaded, so a returning customer is one click
  // from paying rather than retyping an address they already gave us.
  useEffect(() => {
    if (selectedAddressId || addresses.length === 0) return;
    const preferred = addresses.find((a) => a.is_default) ?? addresses[0];
    setSelectedAddressId(preferred.id);
  }, [addresses, selectedAddressId]);

  const selectedAddress: CustomerAddress | undefined = addresses.find(
    (a) => a.id === selectedAddressId
  );

  const usingSaved = Boolean(selectedAddress) && !showAddressForm;

  // COD availability is the server's call, not ours.
  const codAvailable = quote ? quote.cod_max_units > 0 && quote.units <= quote.cod_max_units : true;

  // price_cart() RAISES when the bag exceeds the COD unit cap rather than
  // returning a quote with COD disabled. So selecting COD over the cap would
  // fail the whole quote and leave the customer with an error and no totals.
  // Fall back to prepaid so the page always has a price to show.
  useEffect(() => {
    if (!quoteError) return;
    const msg = quoteError.message.toLowerCase();
    const isCodCap = msg.includes('cash on delivery') || msg.includes('cod');
    if (isCodCap && paymentMethod === 'cod') setPaymentMethod('upi');
  }, [quoteError, paymentMethod]);

  useEffect(() => {
    if (!codAvailable && paymentMethod === 'cod') setPaymentMethod('upi');
  }, [codAvailable, paymentMethod]);

  // Safety net behind useReconcileCart.
  //
  // The pruner keys off the CATALOGUE, and the catalogue can disagree with the
  // server — a cached product list, a variant published to the DB but missing
  // from the client's copy, or a bag hydrated before either query settled. When
  // that happens the server is the authority: it names the SKU it refused
  // (`P0002`), so drop exactly those lines and let the quote re-run. Without
  // this, one unpurchasable SKU leaves the pay button permanently disabled and
  // the customer with no line to delete.
  useEffect(() => {
    if (!(quoteError instanceof UnknownVariantError)) return;
    if (isExpress && expressItem?.variantSku === quoteError.sku) {
      clearExpressItem();
      showToast({
        title: 'An item is no longer available',
        description: 'This item is no longer available to checkout.',
        type: 'info',
      });
      return;
    }
    const culprits = items.filter((i) => i.variantSku === quoteError.sku);
    if (culprits.length === 0) return;

    removeItems(culprits.map((i) => i.id));
    showToast({
      title: 'An item is no longer available',
      description: 'We removed it from your bag so you can complete your order.',
      type: 'info',
    });
    // Removing re-keys the quote query; no explicit refetch needed.
  }, [quoteError, isExpress, expressItem, clearExpressItem, items, removeItems, showToast]);

  const bestCoupon: BestCoupon | null = quote?.best_coupon ?? null;
  const offers: BestCoupon[] = quote?.available_offers ?? [];
  const remainingFree = quote ? remainingForFreeShipping(quote) : 0;
  const savings = quote?.savings_cents ?? 0;

  const applyCode = (code: string) => {
    setCouponError(null);
    setAppliedCode(code.trim().toUpperCase());
  };

  const removeCoupon = () => {
    setAppliedCode(null);
    setCouponCode('');
    setCouponError(null);
  };

  // When the server refuses the applied code, surface its own words.
  useEffect(() => {
    const c = quote?.coupon;
    if (appliedCode && c && c.error) {
      setCouponError(c.error);
      setAppliedCode(null);
    }
  }, [quote?.coupon, appliedCode]);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    const name = usingSaved ? selectedAddress!.recipient_name : form.name;
    const phone = usingSaved ? selectedAddress!.phone : form.phone;
    const pincode = usingSaved ? selectedAddress!.pincode : form.pincode;

    if (!name.trim()) e.name = 'Required';
    if (!usingSaved) {
      if (!/^[0-9]{6}$/.test(pincode.trim())) e.pincode = 'Six digits';
      if (form.address.trim().length < 8) e.address = 'Full street address';
      if (!form.city.trim()) e.city = 'Required';
      if (!form.state.trim()) e.state = 'Required';
    }
    if (!/^[0-9]{10}$/.test(phone.replace(/\D/g, '').slice(-10))) e.phone = 'Ten digits';
    if (!user && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) e.email = 'Valid email';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!quote) return;
    // Synchronous lock first: `submitting` is state and a tick behind, so two
    // clicks in one frame would both pass a state check and open two payment
    // windows against the same intent.
    if (submitLock.current) return;
    // A payment that may already have taken money must never be re-attempted.
    if (fatal && !fatal.allowRetry) return;
    if (!validate()) {
      showToast({ title: 'Check the highlighted fields', type: 'info' });
      return;
    }

    const addr = usingSaved ? selectedAddress! : null;
    const name = addr ? addr.recipient_name : form.name.trim();
    const phone = addr ? addr.phone : form.phone.replace(/\D/g, '').slice(-10);
    const pincode = addr ? addr.pincode : form.pincode.trim();
    const email = user?.email ?? form.email.trim();
    const shippingAddress = addr
      ? [addr.address_line, addr.landmark, `${addr.city}, ${addr.state}`].filter(Boolean).join(', ')
      : [form.address, form.landmark, `${form.city}, ${form.state}`].filter(Boolean).join(', ');

    setSubmitting(true);
    submitLock.current = true;
    try {
      // Persist a new address before charging, so a successful order never loses
      // the address the customer just typed.
      if (user && !usingSaved && saveToAccount) {
        await saveAddress({
          label: null,
          is_default: addresses.length === 0,
          recipient_name: name,
          phone,
          address_line: form.address.trim(),
          landmark: form.landmark.trim() || null,
          city: form.city.trim(),
          state: form.state.trim(),
          pincode,
        });
      }

      // ── Cash on delivery — the existing path, unchanged ──────────────
      if (paymentMethod === 'cod') {
        const res = await createOrder({
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          pincode,
          paymentMethod,
          shippingAddress,
          subtotalCents: quote.subtotal_cents,
          discountCents: quote.discount_cents,
          shippingCents: quote.shipping_cents,
          totalCents: quote.total_cents,
          couponCode: quote.coupon?.code ?? null,
          giftNote: null,
          lines: cartLines.map((l) => {
            const q = quote.lines.find((ql) => ql.sku === l.variant.sku);
            return {
              productSlug: l.product.slug,
              variantSku: l.variant.sku,
              productName: l.product.name,
              color: l.variant.color,
              size: l.variant.size,
              quantity: q?.quantity ?? l.quantity,
              // The server's unit price, not the client's. place_order re-prices
              // anyway, but sending an agreement we never checked is how a client
              // and server silently disagree.
              priceCents: q?.unit_price_cents ?? l.variant.priceCents,
              customization: l.customization,
            };
          }),
        });

        if (res.success && res.orderId) {
          if (isExpress) {
            clearExpressItem();
          } else {
            clearCart();
          }
          // The email is what lets the confirmation page fetch the receipt
          // itself. Without it the customer lands on a lookup form asking for an
          // id they never memorised.
          navigate(`/order-confirmation/${res.orderId}?email=${encodeURIComponent(email)}`, {
            replace: true,
          });
          return;
        }
        showToast({ title: res.message || 'Could not place the order', type: 'info' });
        return;
      }

      // ── Online payment ───────────────────────────────────────────────
      // The FULL line is sent, not just sku + quantity. place_order coalesces a
      // missing name/colour/size to "Embroidered Garment / Standard / M", so a
      // thin payload SUCCEEDS and writes a product the customer never bought.
      const result = await payOnline({
        items: cartLines.map((l) => {
          const q = quote.lines.find((ql) => ql.sku === l.variant.sku);
          return {
            variantSku: l.variant.sku,
            quantity: q?.quantity ?? l.quantity,
            productSlug: l.product.slug,
            productName: l.product.name,
            color: l.variant.color,
            size: l.variant.size,
            customization: l.customization,
          };
        }),
        couponCode: quote.coupon?.code ?? null,
        customerEmail: email,
        customerName: name,
        customerPhone: phone,
        shippingAddress: {
          address: shippingAddress,
          phone,
          pincode,
          city: addr ? addr.city : form.city.trim(),
          state: addr ? addr.state : form.state.trim(),
        },
        clientOrderId: clientOrderIdRef.current,
        // What the customer is looking at. If the server prices differently the
        // modal never opens — see the AMOUNT_CHANGED branch below.
        expectedTotalCents: quote.total_cents,
        prefill: { name, email, contact: phone },
        // The store's ink token, so the gateway does not look like another shop.
        accentColor: '#141414',
        onStage: setStage,
      });

      // Paid AND verified AND the order exists. Only now is the bag safe to drop.
      if (isExpress) {
        clearExpressItem();
      } else {
        clearCart();
      }
      navigate(`/order-confirmation/${result.orderId}?email=${encodeURIComponent(email)}`, {
        replace: true,
      });
    } catch (e) {
      handlePaymentError(e);
    } finally {
      // Always reset, or a cancelled attempt leaves the button permanently dead.
      setStage('idle');
      setSubmitting(false);
      submitLock.current = false;
    }
  };

  /**
   * One branch per failure mode, because they need different words.
   *
   * The rule that matters: a code meaning "money may have moved" must never look
   * like a network blip, and must never invite a second payment.
   */
  const handlePaymentError = (e: unknown) => {
    if (!(e instanceof PaymentError)) {
      showToast({
        title: e instanceof Error ? e.message : 'Could not place the order',
        type: 'info',
      });
      return;
    }

    switch (e.code) {
      case 'CANCELLED':
        // Not an error. Keep the bag, say nothing alarming.
        showToast({ title: e.message, type: 'info' });
        break;

      case 'AMOUNT_CHANGED':
        // Re-price so the number on screen is the number being charged. Never
        // auto-retry: the customer must see and accept the new total.
        void refetchQuote();
        showToast({
          title: 'Your total changed',
          description: 'Review the updated amount, then pay again.',
          type: 'info',
        });
        break;

      case 'TAKEN_NO_ORDER':
      case 'VERIFY_FAILED':
      case 'VERIFY_TIMEOUT':
        // Money may be captured. Hard stop: no retry, bag NOT cleared.
        setFatal({
          message: e.message,
          paymentId:
            e.detail && typeof e.detail.payment_id === 'string'
              ? e.detail.payment_id
              : undefined,
          allowRetry: false,
        });
        break;

      case 'NOT_CONFIGURED':
        // The functions are not deployed, or the gateway is misconfigured. COD is
        // still a real sale — do not strand a ready buyer.
        setPaymentMethod('cod');
        showToast({
          title: 'Online payment is unavailable right now',
          description: 'You can still complete this order with cash on delivery.',
          type: 'info',
        });
        break;

      case 'PAYMENT_SCRIPT_BLOCKED':
      case 'PAYMENT_SCRIPT_FAILED':
        showToast({
          title: e.message,
          description: 'Cash on delivery always works.',
          type: 'info',
        });
        break;

      default:
        // FAILED / REJECTED / NETWORK — nothing was captured; retrying is safe.
        showToast({ title: e.message, type: 'info' });
    }
  };

  // ── Empty bag ────────────────────────────────────────────────────────
  if (cartLines.length === 0) {
    return (
      <div className="bg-white min-h-screen text-neutral-900">
        <div className="max-w-2xl mx-auto px-5 py-20 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Checkout</p>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1">Your bag is empty</h1>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
            Nothing to check out yet. Discover our fresh drops and curated capsules.
          </p>
          <Link
            to="/shop"
            className="inline-flex min-h-[44px] items-center rounded-xs bg-black px-8 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs hover:bg-neutral-800 transition mt-6"
          >
            Browse the Collection
          </Link>
        </div>
      </div>
    );
  }

  const field =
    'w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:bg-white focus:outline-none transition-colors';

  const busy = submitting || stage !== 'idle';
  const onlinePayable = isPaymentsConfigured();
  // A captured-payment-with-no-order means the customer must not press this again.
  const hardStop = Boolean(fatal && !fatal.allowRetry);

  const payLabel = (): string => {
    if (stage === 'creating') return 'Preparing your payment…';
    if (stage === 'awaiting') return 'Complete payment in the window…';
    if (stage === 'verifying') return 'Confirming your payment…';
    if (submitting) return 'Placing order…';
    if (hardStop) return 'Payment already received';
    if (!quote) return 'Place order';
    return paymentMethod === 'cod'
      ? `Place Order · ${formatPrice(quote.total_cents)}`
      : `Pay ${formatPrice(quote.total_cents)} Securely →`;
  };

  return (
    <div className="bg-white min-h-screen text-neutral-900">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-10">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-5">
          <div>
            <span className="rounded bg-black px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
              EXPRESS CHECKOUT
            </span>
            <h1 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900 mt-1.5">
              Complete Your Order
            </h1>
          </div>
          <Link to="/shop" className="text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-black transition-colors">
            Keep Shopping →
          </Link>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10 mt-8 items-start">
          {/* ── Left: delivery, payment ─────────────────────────────── */}
          <div className="space-y-8">
            {/* Delivery */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
              <h2 className="font-display text-base font-black uppercase tracking-tight text-neutral-900 mb-4 flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-mono font-bold flex items-center justify-center">1</span>
                <span>Delivery Address</span>
              </h2>

              {!user && (
                <p className="text-xs text-neutral-500 mb-4">
                  Checking out as a guest. You can track this order with your order ID &amp; email.
                </p>
              )}

              {/* Saved addresses */}
              {user && addresses.length > 0 && !showAddressForm && (
                <div className="space-y-2.5">
                  {addresses.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setSelectedAddressId(a.id)}
                      className={`w-full text-left rounded-xl border p-4 transition-all ${
                        selectedAddressId === a.id
                          ? 'border-black bg-neutral-50 ring-1 ring-black shadow-xs'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase tracking-tight text-neutral-900">
                            {a.recipient_name}
                            {a.label && (
                              <span className="ml-2 rounded bg-neutral-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-neutral-700">
                                {a.label}
                              </span>
                            )}
                            {a.is_default && (
                              <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-emerald-800">
                                Default
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                            {a.address_line}
                            {a.landmark ? `, ${a.landmark}` : ''}
                            <br />
                            {a.city}, {a.state} – <span className="font-mono font-bold">{a.pincode}</span>
                            <br />
                            <span className="text-neutral-500 font-mono">📱 {a.phone}</span>
                          </p>
                        </div>
                        <span
                          className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            selectedAddressId === a.id ? 'border-black bg-black' : 'border-neutral-300'
                          }`}
                        >
                          {selectedAddressId === a.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </span>
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="text-xs font-bold text-neutral-700 hover:text-black underline underline-offset-2 pt-1 block"
                  >
                    + Deliver to a different address
                  </button>
                </div>
              )}

              {/* Address form */}
              {(!user || addresses.length === 0 || showAddressForm) && (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-5 space-y-3.5">
                  {user && addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="text-xs font-bold text-neutral-600 hover:text-black mb-1 block"
                    >
                      ← Use a saved address
                    </button>
                  )}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        className={field}
                        placeholder="Full name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        autoComplete="name"
                      />
                      {errors.name && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.name}</p>}
                    </div>
                    <div>
                      <input
                        className={field}
                        placeholder="Phone (10 digits)"
                        inputMode="numeric"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        autoComplete="tel"
                      />
                      {errors.phone && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.phone}</p>}
                    </div>
                  </div>
                  {!user && (
                    <div>
                      <input
                        className={field}
                        placeholder="Email for the order receipt"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        autoComplete="email"
                      />
                      {errors.email && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.email}</p>}
                    </div>
                  )}
                  <div>
                    <input
                      className={field}
                      placeholder="Flat / house no., street, locality"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      autoComplete="street-address"
                    />
                    {errors.address && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.address}</p>}
                  </div>
                  <input
                    className={field}
                    placeholder="Nearby landmark (optional)"
                    value={form.landmark}
                    onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <input
                        className={field}
                        placeholder="City"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        autoComplete="address-level2"
                      />
                      {errors.city && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.city}</p>}
                    </div>
                    <div>
                      <input
                        className={field}
                        placeholder="State"
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        autoComplete="address-level1"
                      />
                      {errors.state && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.state}</p>}
                    </div>
                    <div>
                      <input
                        className={field}
                        placeholder="Pincode (6 digits)"
                        inputMode="numeric"
                        maxLength={6}
                        value={form.pincode}
                        onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                        autoComplete="postal-code"
                      />
                      {errors.pincode && <p className="text-[10px] text-red-600 mt-1 font-semibold">{errors.pincode}</p>}
                    </div>
                  </div>
                  {user && (
                    <label className="flex items-center gap-2 text-xs text-neutral-600 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveToAccount}
                        onChange={(e) => setSaveToAccount(e.target.checked)}
                        className="rounded border-neutral-300 text-black focus:ring-black"
                      />
                      Save this address to my account
                    </label>
                  )}
                </div>
              )}
            </section>

            {/* Payment */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
              <h2 className="font-display text-base font-black uppercase tracking-tight text-neutral-900 mb-4 flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-black text-white text-xs font-mono font-bold flex items-center justify-center">2</span>
                <span>Payment Method</span>
              </h2>

              <div className="space-y-3">
                <button
                  type="button"
                  disabled={!onlinePayable}
                  onClick={() => setPaymentMethod('upi')}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${
                    !onlinePayable
                      ? 'border-neutral-200 bg-neutral-100 opacity-60 cursor-not-allowed'
                      : paymentMethod === 'upi'
                        ? 'border-black bg-neutral-50 ring-1 ring-black shadow-xs'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-900">
                      ⚡ Pay Online (UPI, Cards, Netbanking)
                    </span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${paymentMethod === 'upi' ? 'border-black bg-black' : 'border-neutral-300'}`}>
                      {paymentMethod === 'upi' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {onlinePayable
                      ? 'Instant UPI Intent, Google Pay, PhonePe, Paytm, Cards & NetBanking. Secured 256-bit.'
                      : 'Unavailable in this build — cash on delivery still works.'}
                  </p>
                </button>

                <button
                  type="button"
                  disabled={!codAvailable}
                  onClick={() => setPaymentMethod('cod')}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${
                    !codAvailable
                      ? 'border-neutral-200 bg-neutral-100 opacity-60 cursor-not-allowed'
                      : paymentMethod === 'cod'
                        ? 'border-black bg-neutral-50 ring-1 ring-black shadow-xs'
                        : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-neutral-900">
                      💵 Cash on Delivery (COD)
                    </span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${paymentMethod === 'cod' ? 'border-black bg-black' : 'border-neutral-300'}`}>
                      {paymentMethod === 'cod' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    {!codAvailable
                      ? `Not available for ${quote?.units ?? 0} items — COD is limited to ${quote?.cod_max_units ?? 10} per order.`
                      : quote && quote.cod_fee_cents > 0
                        ? `A ${formatPrice(quote.cod_fee_cents)} handling fee applies.`
                        : 'Pay cash upon doorstep verification.'}
                  </p>
                </button>
              </div>
            </section>
          </div>

          {/* ── Right: summary ──────────────────────────────────────── */}
          <aside className="lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
            <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
                <h2 className="font-display text-sm font-black uppercase tracking-tight text-neutral-900">
                  Order Summary
                </h2>
                <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-bold text-neutral-700">
                  {quote ? `${quote.units} ${quote.units === 1 ? 'item' : 'items'}` : '—'}
                </span>
              </div>

              {/* Lines */}
              <div className="px-5 py-4 space-y-3 max-h-[280px] overflow-y-auto divide-y divide-neutral-100 no-scrollbar">
                {cartLines.map((line) => {
                  const q = quote?.lines.find((x) => x.sku === line.variant.sku);
                  const mrp = q ? lineMrpCents(q) : null;
                  const pct = q ? lineDiscountPercent(q) : null;
                  return (
                    <div key={line.id} className="flex gap-3 pt-3 first:pt-0">
                      {line.product.images[0]?.src && (
                        <img
                          src={line.product.images[0].src}
                          alt=""
                          className="w-12 h-16 object-cover rounded-md border border-neutral-200 bg-neutral-100 shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black uppercase tracking-tight text-neutral-900 truncate">{line.product.name}</p>
                        <p className="text-[10px] text-neutral-500 mt-0.5">
                          Size: {line.variant.size} · Qty {q?.quantity ?? line.quantity}
                        </p>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="font-mono text-xs font-black text-[#D32F2F]">
                            {formatPrice(q?.line_total_cents ?? line.lineTotalCents)}
                          </span>
                          {mrp != null && q && (
                            <span className="font-mono text-[10px] text-neutral-400 line-through">
                              {formatPrice(mrp * q.quantity)}
                            </span>
                          )}
                          {pct != null && (
                            <span className="rounded bg-red-100 px-1 py-0.2 text-[9px] font-black text-red-600">
                              {pct}% off
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon */}
              <div className="px-5 py-3 border-t border-neutral-200 bg-neutral-50/50">
                {appliedCode ? (
                  <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black uppercase text-neutral-900">{appliedCode}</span>
                      {quote?.coupon && !quote.coupon.error && (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-black text-emerald-800">
                          −{formatPrice(quote.coupon.discount_cents ?? 0)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs font-bold text-neutral-400 hover:text-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        className="h-10 flex-1 rounded-lg border border-neutral-300 bg-white px-3 font-mono text-xs font-bold uppercase tracking-wider text-neutral-900 placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-neutral-400 focus:border-black focus:outline-none"
                        placeholder="Promo code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && couponCode.trim()) applyCode(couponCode);
                        }}
                      />
                      <button
                        type="button"
                        disabled={!couponCode.trim()}
                        onClick={() => applyCode(couponCode)}
                        className="h-10 rounded-lg bg-black px-4 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition active:scale-95 disabled:opacity-40"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-xs font-semibold text-red-600">{couponError}</p>}

                    {bestCoupon && (
                      <button
                        type="button"
                        onClick={() => applyCode(bestCoupon.code)}
                        className="w-full text-left rounded-lg bg-red-50/80 border border-red-200 p-2.5 hover:bg-red-100/80 transition-colors"
                      >
                        <p className="text-[10px] font-black uppercase tracking-wider text-red-700">
                          Save {formatPrice(bestCoupon.value_cents)} with {bestCoupon.code}
                        </p>
                        <p className="text-[11px] text-neutral-600 mt-0.5">
                          Tap to apply coupon
                          {bestCoupon.min_subtotal_cents > 0
                            ? ` on orders above ${formatPrice(bestCoupon.min_subtotal_cents)}`
                            : ''}
                        </p>
                      </button>
                    )}

                    {offers.length > 1 && (
                      <p className="text-[11px] text-neutral-500 font-medium">
                        {offers.length} exclusive offers available for this order.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Totals — server values only */}
              <div className="px-5 py-4 border-t border-neutral-200 space-y-2 text-xs">
                {quoteError ? (
                  <p className="text-xs font-semibold text-red-600 leading-relaxed">{quoteError.message}</p>
                ) : isLoading || !quote ? (
                  <p className="text-xs text-neutral-500">Pricing your bag…</p>
                ) : (
                  <>
                    <Row label="Subtotal" value={formatPrice(quote.subtotal_cents)} />
                    {quote.discount_cents > 0 && (
                      <Row label="Discount" value={`−${formatPrice(quote.discount_cents)}`} accent />
                    )}
                    <Row
                      label="Shipping"
                      value={quote.shipping_cents === 0 ? 'FREE' : formatPrice(quote.shipping_cents)}
                    />
                    {quote.cod_fee_cents > 0 && (
                      <Row label="COD fee" value={formatPrice(quote.cod_fee_cents)} />
                    )}
                    {remainingFree > 0 && (
                      <p className="text-[11px] text-neutral-500 pt-0.5 font-medium">
                        Add {formatPrice(remainingFree)} more for free delivery.
                      </p>
                    )}
                    <div className="pt-2.5 mt-1 border-t border-neutral-200 flex items-center justify-between">
                      <span className="text-sm font-black uppercase text-neutral-900">Total Payable</span>
                      <span className="font-mono text-xl font-black text-[#D32F2F]">{formatPrice(quote.total_cents)}</span>
                    </div>
                    {savings > 0 && (
                      <p className="text-xs font-bold text-emerald-700 pt-1">
                        🎉 Total savings: {formatPrice(savings)} on this order.
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="px-5 pb-5">
                {fatal && (
                  <div
                    role="alert"
                    className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3.5"
                  >
                    <p className="text-xs font-black uppercase tracking-wider text-amber-900">
                      Payment received — action needed
                    </p>
                    <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                      {fatal.message}
                    </p>
                    {fatal.paymentId && (
                      <p className="text-[11px] text-amber-900 font-mono mt-2">
                        Ref: {fatal.paymentId}
                      </p>
                    )}
                    <Link
                      to="/orders"
                      className="inline-block mt-2 text-xs font-bold text-amber-900 underline"
                    >
                      Check your orders →
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  onClick={submit}
                  disabled={busy || !quote || Boolean(quoteError) || hardStop}
                  className="w-full h-12 rounded-lg bg-black text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-neutral-800 transition active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {payLabel()}
                </button>

                <p className="text-[11px] text-neutral-500 text-center mt-3 leading-relaxed font-medium">
                  {paymentMethod === 'cod'
                    ? '🛡️ Pay cash on delivery upon doorstep verification.'
                    : '🛡️ 256-bit bank encrypted payment via Razorpay.'}
                </p>

                {stage === 'verifying' && (
                  <p className="text-xs text-neutral-800 text-center mt-2 leading-relaxed font-bold animate-pulse">
                    Confirming your order, please do not close this window…
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string; accent?: boolean }> = ({
  label,
  value,
  accent,
}) => (
  <div className="flex items-center justify-between text-neutral-600">
    <span>{label}</span>
    <span className={`font-mono font-bold ${accent ? 'text-[#D32F2F]' : 'text-neutral-900'}`}>{value}</span>
  </div>
);
