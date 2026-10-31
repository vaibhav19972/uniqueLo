import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useCartStore } from '../stores/cart';
import { useAuthStore, type CustomerAddress } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { useProducts } from '../hooks/useCatalog';
import { useQuote } from '../hooks/useQuote';
import { getCartLine, formatPrice, createOrder, type CartLine, type PaymentMethod } from '../lib/data';
import { PaymentError, isPaymentsConfigured, newClientOrderId, payOnline } from '../lib/payments';
import {
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
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const { data: products = [] } = useProducts();
  const showToast = useToastStore((s) => s.showToast);

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
      items
        .map((i) => getCartLine(i, products))
        .filter((l): l is CartLine => Boolean(l)),
    [items, products]
  );

  const { quote, isLoading, error: quoteError, refetch: refetchQuote } = useQuote({
    couponCode: appliedCode,
    paymentMethod,
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
          clearCart();
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
      clearCart();
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
      <div className="bg-cream min-h-screen">
        <div className="max-w-2xl mx-auto px-5 py-24 text-center">
          <p className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">Checkout</p>
          <h1 className="font-serif text-3xl text-ink mt-2">Your bag is empty</h1>
          <p className="text-sm text-ink-muted mt-3 leading-relaxed">
            Nothing to check out yet.
          </p>
          <Link
            to="/shop"
            className="inline-block mt-8 px-8 py-3 bg-ink text-cream text-[11px] uppercase tracking-[0.18em]"
          >
            Browse the collection
          </Link>
        </div>
      </div>
    );
  }

  const field =
    'w-full border border-ink/15 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-ink/40';

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
      ? `Place order · ${formatPrice(quote.total_cents)}`
      : `Pay ${formatPrice(quote.total_cents)} securely`;
  };

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto px-5 lg:px-8 py-10">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.22em] text-ink-muted">Checkout</p>
            <h1 className="font-serif text-3xl text-ink mt-1">Complete your order</h1>
          </div>
          <Link to="/shop" className="text-[11px] uppercase tracking-[0.16em] text-ink-muted hover:text-ink">
            Keep shopping
          </Link>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-10 mt-9 items-start">
          {/* ── Left: delivery, payment ─────────────────────────────── */}
          <div className="space-y-8">
            {/* Delivery */}
            <section>
              <h2 className="font-serif text-lg text-ink mb-4 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-ink text-cream text-[11px] flex items-center justify-center">1</span>
                Delivery
              </h2>

              {!user && (
                <p className="text-xs text-ink-muted mb-4">
                  Checking out as a guest. <span className="text-ink">Sign in</span> to use saved
                  addresses and track this order.
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
                      className={`w-full text-left border p-4 transition-colors ${
                        selectedAddressId === a.id
                          ? 'border-ink bg-white'
                          : 'border-ink/15 bg-white/50 hover:border-ink/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-ink">
                            {a.recipient_name}
                            {a.label && (
                              <span className="ml-2 text-[9px] uppercase tracking-[0.14em] text-ink-muted border border-ink/15 px-1.5 py-0.5">
                                {a.label}
                              </span>
                            )}
                            {a.is_default && (
                              <span className="ml-2 text-[9px] uppercase tracking-[0.14em] text-ink-muted">
                                Default
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                            {a.address_line}
                            {a.landmark ? `, ${a.landmark}` : ''}
                            <br />
                            {a.city}, {a.state} {a.pincode}
                            <br />
                            {a.phone}
                          </p>
                        </div>
                        <span
                          className={`mt-1 w-3.5 h-3.5 rounded-full border shrink-0 ${
                            selectedAddressId === a.id ? 'border-ink bg-ink' : 'border-ink/30'
                          }`}
                        />
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(true)}
                    className="text-[11px] uppercase tracking-[0.16em] text-ink-muted hover:text-ink underline underline-offset-4"
                  >
                    + Deliver to a different address
                  </button>
                </div>
              )}

              {/* Address form */}
              {(!user || addresses.length === 0 || showAddressForm) && (
                <div className="bg-white border border-ink/15 p-5 space-y-3">
                  {user && addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="text-[11px] uppercase tracking-[0.16em] text-ink-muted hover:text-ink mb-1"
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
                      {errors.name && <p className="text-[10px] text-red-600 mt-1">{errors.name}</p>}
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
                      {errors.phone && <p className="text-[10px] text-red-600 mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                  {!user && (
                    <div>
                      <input
                        className={field}
                        placeholder="Email for the receipt"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        autoComplete="email"
                      />
                      {errors.email && <p className="text-[10px] text-red-600 mt-1">{errors.email}</p>}
                    </div>
                  )}
                  <div>
                    <input
                      className={field}
                      placeholder="Flat / house, street, area"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      autoComplete="street-address"
                    />
                    {errors.address && <p className="text-[10px] text-red-600 mt-1">{errors.address}</p>}
                  </div>
                  <input
                    className={field}
                    placeholder="Landmark (optional)"
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
                      {errors.city && <p className="text-[10px] text-red-600 mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <input
                        className={field}
                        placeholder="State"
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        autoComplete="address-level1"
                      />
                      {errors.state && <p className="text-[10px] text-red-600 mt-1">{errors.state}</p>}
                    </div>
                    <div>
                      <input
                        className={field}
                        placeholder="Pincode"
                        inputMode="numeric"
                        maxLength={6}
                        value={form.pincode}
                        onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                        autoComplete="postal-code"
                      />
                      {errors.pincode && <p className="text-[10px] text-red-600 mt-1">{errors.pincode}</p>}
                    </div>
                  </div>
                  {user && (
                    <label className="flex items-center gap-2 text-xs text-ink-muted pt-1">
                      <input
                        type="checkbox"
                        checked={saveToAccount}
                        onChange={(e) => setSaveToAccount(e.target.checked)}
                        className="accent-ink"
                      />
                      Save this address to my account
                    </label>
                  )}
                </div>
              )}
            </section>

            {/* Payment */}
            <section>
              <h2 className="font-serif text-lg text-ink mb-4 flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-ink text-cream text-[11px] flex items-center justify-center">2</span>
                Payment
              </h2>

              <div className="space-y-2.5">
                {/* Online. Razorpay's window IS the method picker — it knows the
                    customer's saved cards, offers UPI intent on mobile, and
                    handles netbanking and wallets. Asking "UPI or card?" here and
                    then again inside the modal is the same question twice, and
                    every extra decision at this point costs conversion. The page
                    asks ONE question: pay now, or pay on delivery. */}
                <button
                  type="button"
                  disabled={!onlinePayable}
                  onClick={() => setPaymentMethod('upi')}
                  className={`w-full text-left border p-4 ${
                    !onlinePayable
                      ? 'border-ink/10 bg-white/30 opacity-60 cursor-not-allowed'
                      : paymentMethod === 'upi'
                        ? 'border-ink bg-white'
                        : 'border-ink/15 bg-white/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink">Pay online</span>
                    <span className={`w-3.5 h-3.5 rounded-full border ${paymentMethod === 'upi' ? 'border-ink bg-ink' : 'border-ink/30'}`} />
                  </div>
                  <p className="text-xs text-ink-muted mt-1">
                    {onlinePayable
                      ? 'UPI, cards, netbanking and wallets. Secured by Razorpay.'
                      : 'Unavailable in this build — cash on delivery still works.'}
                  </p>
                </button>

                <button
                  type="button"
                  disabled={!codAvailable}
                  onClick={() => setPaymentMethod('cod')}
                  className={`w-full text-left border p-4 ${
                    !codAvailable
                      ? 'border-ink/10 bg-white/30 opacity-60 cursor-not-allowed'
                      : paymentMethod === 'cod'
                        ? 'border-ink bg-white'
                        : 'border-ink/15 bg-white/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-ink">Cash on delivery</span>
                    <span className={`w-3.5 h-3.5 rounded-full border ${paymentMethod === 'cod' ? 'border-ink bg-ink' : 'border-ink/30'}`} />
                  </div>
                  <p className="text-xs text-ink-muted mt-1">
                    {!codAvailable
                      ? `Not available for ${quote?.units ?? 0} items — COD is limited to ${quote?.cod_max_units ?? 10} per order.`
                      : quote && quote.cod_fee_cents > 0
                        ? `A ${formatPrice(quote.cod_fee_cents)} handling fee applies.`
                        : 'Verify the amount in cash when your order arrives.'}
                  </p>
                </button>
              </div>
            </section>
          </div>

          {/* ── Right: summary ──────────────────────────────────────── */}
          <aside className="lg:sticky lg:top-[calc(var(--header-height)+2rem)]">
            <div className="bg-white border border-ink/15">
              <div className="px-5 py-4 border-b border-ink/10 flex items-baseline justify-between">
                <h2 className="font-serif text-lg text-ink">Order summary</h2>
                <span className="text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                  {quote ? `${quote.units} item${quote.units === 1 ? '' : 's'}` : '—'}
                </span>
              </div>

              {/* Lines */}
              <div className="px-5 py-4 space-y-3 max-h-[280px] overflow-y-auto">
                {cartLines.map((line) => {
                  const q = quote?.lines.find((x) => x.sku === line.variant.sku);
                  const mrp = q ? lineMrpCents(q) : null;
                  const pct = q ? lineDiscountPercent(q) : null;
                  return (
                    <div key={line.id} className="flex gap-3">
                      {line.product.images[0]?.src && (
                        <img
                          src={line.product.images[0].src}
                          alt=""
                          className="w-12 h-14 object-cover bg-cream shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-ink truncate">{line.product.name}</p>
                        <p className="text-[10px] text-ink-muted mt-0.5">
                          {line.variant.color} · {line.variant.size} · Qty {q?.quantity ?? line.quantity}
                        </p>
                        <p className="text-xs text-ink mt-1">
                          {formatPrice(q?.line_total_cents ?? line.lineTotalCents)}
                          {mrp != null && q && (
                            <span className="ml-2 text-ink-muted line-through text-[10px]">
                              {formatPrice(mrp * q.quantity)}
                            </span>
                          )}
                          {pct != null && (
                            <span className="ml-1.5 text-[10px] text-emerald-700">{pct}% off</span>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon */}
              <div className="px-5 py-3 border-t border-ink/10">
                {appliedCode ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-ink">
                      <span className="font-mono bg-cream px-1.5 py-0.5 border border-ink/10">{appliedCode}</span>
                      {quote?.coupon && !quote.coupon.error && (
                        <span className="ml-2 text-emerald-700">
                          −{formatPrice(quote.coupon.discount_cents ?? 0)}
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[10px] uppercase tracking-[0.14em] text-ink-muted hover:text-ink"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        className="flex-1 border border-ink/15 bg-cream px-3 py-2 text-xs text-ink placeholder:text-ink-muted/60 focus:outline-none focus:border-ink/40 uppercase"
                        placeholder="Coupon code"
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
                        className="px-4 py-2 bg-ink text-cream text-[10px] uppercase tracking-[0.14em] disabled:opacity-40"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-[10px] text-red-600">{couponError}</p>}

                    {/* Best-coupon prompt. Never auto-applied — the customer
                        clicks. Server-gated, so it cannot fail on click. */}
                    {bestCoupon && (
                      <button
                        type="button"
                        onClick={() => applyCode(bestCoupon.code)}
                        className="w-full text-left bg-emerald-50 border border-emerald-200 px-3 py-2 hover:bg-emerald-100/70"
                      >
                        <p className="text-[10px] uppercase tracking-[0.14em] text-emerald-800 font-medium">
                          Save {formatPrice(bestCoupon.value_cents)}
                        </p>
                        <p className="text-[11px] text-emerald-900/80 mt-0.5">
                          Apply <span className="font-mono">{bestCoupon.code}</span>
                          {bestCoupon.min_subtotal_cents > 0
                            ? ` on orders above ${formatPrice(bestCoupon.min_subtotal_cents)}`
                            : ''}
                        </p>
                      </button>
                    )}
                    {offers.length > 1 && (
                      <p className="text-[10px] text-ink-muted">
                        {offers.length} offers available on this bag.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Totals — server values only */}
              <div className="px-5 py-4 border-t border-ink/10 space-y-2 text-xs">
                {quoteError ? (
                  <p className="text-[11px] text-red-600 leading-relaxed">{quoteError.message}</p>
                ) : isLoading || !quote ? (
                  <p className="text-[11px] text-ink-muted">Pricing your bag…</p>
                ) : (
                  <>
                    <Row label="Subtotal" value={formatPrice(quote.subtotal_cents)} />
                    {quote.discount_cents > 0 && (
                      <Row label="Discount" value={`−${formatPrice(quote.discount_cents)}`} accent />
                    )}
                    <Row
                      label="Shipping"
                      value={quote.shipping_cents === 0 ? 'Free' : formatPrice(quote.shipping_cents)}
                    />
                    {quote.cod_fee_cents > 0 && (
                      <Row label="COD fee" value={formatPrice(quote.cod_fee_cents)} />
                    )}
                    {remainingFree > 0 && (
                      <p className="text-[10px] text-ink-muted pt-0.5">
                        Add {formatPrice(remainingFree)} for free delivery.
                      </p>
                    )}
                    <div className="pt-2 mt-1 border-t border-ink/10 flex items-baseline justify-between">
                      <span className="text-sm font-medium text-ink">Total</span>
                      <span className="font-serif text-xl text-ink">{formatPrice(quote.total_cents)}</span>
                    </div>
                    {savings > 0 && (
                      <p className="text-[10px] text-emerald-700 pt-1">
                        You save {formatPrice(savings)} on this order.
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="px-5 pb-5">
                {/* Money may have moved. Persistent, above the button, no retry. */}
                {fatal && (
                  <div
                    role="alert"
                    className="mb-4 border border-amber-300 bg-amber-50 px-3.5 py-3"
                  >
                    <p className="text-[10px] uppercase tracking-[0.14em] text-amber-900 font-medium">
                      Payment received — action needed
                    </p>
                    <p className="text-[11px] text-amber-900/90 mt-1 leading-relaxed">
                      {fatal.message}
                    </p>
                    {fatal.paymentId && (
                      <p className="text-[10px] text-amber-900/80 mt-2">
                        Your payment reference:{' '}
                        <span className="font-mono break-all">{fatal.paymentId}</span>
                      </p>
                    )}
                    <p className="text-[10px] text-amber-900/70 mt-2">
                      Do not pay again. Quote this reference if you contact us.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={submit}
                  disabled={busy || !quote || Boolean(quoteError) || hardStop}
                  className="w-full py-3.5 bg-ink text-cream text-[11px] uppercase tracking-[0.2em] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-ink/90 transition-colors"
                >
                  {payLabel()}
                </button>

                {/* Reassurance at the moment of commitment — the reference
                    teardowns all put trust copy here, not on the way out. */}
                <p className="text-[10px] text-ink-muted text-center mt-3 leading-relaxed">
                  {paymentMethod === 'cod'
                    ? 'Pay in cash when your order arrives.'
                    : 'Card details are entered on Razorpay’s secure page, never on ours.'}
                </p>

                {stage === 'verifying' && (
                  <p className="text-[10px] text-ink text-center mt-2 leading-relaxed">
                    Please don’t close this window — we’re confirming your payment.
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
  <div className="flex items-baseline justify-between">
    <span className="text-ink-muted">{label}</span>
    <span className={accent ? 'text-emerald-700' : 'text-ink'}>{value}</span>
  </div>
);
