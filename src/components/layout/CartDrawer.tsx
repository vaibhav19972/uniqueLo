import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useCartStore } from '../../stores/cart';
import { useProducts } from '../../hooks/useCatalog';
import { getCartLine, formatPrice, createOrder, getDefaultVariant, type CartLine, type PaymentMethod } from '../../lib/data';
import { useQuote } from '../../hooks/useQuote';
import {
  lineMrpCents,
  remainingForFreeShipping,
  freeShippingProgress,
  type BestCoupon,
} from '../../lib/pricing';
import { useToastStore } from '../../stores/toast';
import { useAuthStore } from '../../stores/auth';
import { CartLineItem } from './CartLineItem';
import { Button } from '../ui/Button';
import { useDialogFocus } from '../../hooks/useDialogFocus';


export const CartDrawer: React.FC = () => {
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const showToast = useToastStore((state) => state.showToast);

  const { data: products } = useProducts();

  // Promo Code State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent?: number; discountCents?: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);

  // Gift Note State
  const [hasGiftNote, setHasGiftNote] = useState(false);
  const [giftNoteText, setGiftNoteText] = useState('');

  // Checkout Modal State
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const navigate = useNavigate();

  // The bag hands off to /checkout. Checkout is a page, not a modal: it needs
  // saved addresses, a stable URL, and a back button that does not strand the
  // customer in a drawer.
  const goToCheckout = () => {
    if (items.length === 0) return;
    setIsCheckoutOpen(false);
    closeCart();
    navigate('/checkout');
  };
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'success'>('details');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerPincode, setCustomerPincode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [shippingAddress, setShippingAddress] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [placedOrderId, setPlacedOrderId] = useState('');

  // Saved addresses (signed-in customers only). Selecting one fills the form;
  // it does not lock the fields, so a one-off delivery address still works.
  const authUser = useAuthStore((s) => s.user);
  const savedAddresses = useAuthStore((s) => s.addresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Prefill identity from the account on first open, so a signed-in customer
  // never retypes their own email.
  React.useEffect(() => {
    if (!isCheckoutOpen || !authUser) return;
    setCustomerEmail((prev) => prev || authUser.email || '');
    const name = (authUser.user_metadata?.full_name as string | undefined)?.trim();
    if (name) setCustomerName((prev) => prev || name);
    const def = savedAddresses.find((a) => a.is_default) ?? savedAddresses[0];
    if (def && !selectedAddressId) applyAddress(def.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckoutOpen, authUser, savedAddresses.length]);

  const applyAddress = (id: string) => {
    const a = savedAddresses.find((x) => x.id === id);
    if (!a) return;
    setSelectedAddressId(id);
    setCustomerName(a.recipient_name);
    setCustomerPhone(a.phone.replace(/\D/g, '').slice(-10));
    setCustomerPincode(a.pincode);
    setShippingAddress([a.address_line, a.landmark, a.city, a.state].filter(Boolean).join(', '));
  };

  const cartLines = useMemo(() => {
    return items
      .map((item) => getCartLine(item, products ?? []))
      .filter((line): line is CartLine => line !== null);
  }, [items, products]);

  // ── Server pricing: the single source of every number in this drawer ──
  const { quote } = useQuote({ couponCode: appliedCoupon?.code ?? null });

  const rawSubtotalCents = useMemo(() => {
    return cartLines.reduce((acc, line) => acc + line.lineTotalCents, 0);
  }, [cartLines]);

  // The server's view of the bag. When it has not answered yet, these are null
  // and the UI renders an em dash rather than guessing a number.
  const serverSubtotal = quote?.subtotal_cents ?? null;
  const displayTotalCents = quote ? quote.total_cents : null;
  const remainingFree = quote ? remainingForFreeShipping(quote) : 0;
  const freeShippingQualified = quote ? quote.shipping_cents === 0 : false;

  // Genuine strike-through: sum of real MRPs across the bag, only when every
  // discounted line has one. A partial MRP total would understate the markdown
  // and look like a smaller discount than it is.
  const mrpTotalCents = useMemo(() => {
    if (!quote || quote.lines.length === 0) return null;
    let total = 0;
    for (const line of quote.lines) {
      const mrp = lineMrpCents(line);
      if (mrp == null) return null;
      total += mrp * line.quantity;
    }
    return total > (serverSubtotal ?? 0) ? total : null;
  }, [quote, serverSubtotal]);

  const offers: BestCoupon[] = quote?.available_offers ?? [];
  const offersCount = offers.length;

  const describeOffer = (o: BestCoupon) =>
    o.discount_type === 'percent' ? `${o.discount_value}% off your order`
    : o.discount_type === 'fixed' ? `${formatPrice(o.discount_value)} off your order`
    : 'Complimentary delivery';

  const milestonePrompt = (() => {
    if (!quote) return 'Pricing your bag…';
    if (quote.shipping_cents === 0) return '✓ Complimentary delivery unlocked';
    const best = quote.best_coupon;
    if (best) {
      return `Add ${formatPrice(remainingFree)} for free delivery · ${best.code} saves ${formatPrice(best.value_cents)}`;
    }
    return `Add ${formatPrice(remainingFree)} more for complimentary delivery`;
  })();

  const giftTierThresholdCents = 4980000;
  const giftTierQualified = rawSubtotalCents >= giftTierThresholdCents;
  const remainingForGiftTier = Math.max(0, giftTierThresholdCents - rawSubtotalCents);
  const shippingProgressPercent = quote ? freeShippingProgress(quote) : 0;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  // Focus trap + initial focus + return-focus while the drawer is open
  const dialogRef = useDialogFocus<HTMLDivElement>(isOpen, closeCart);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const applySpecificCode = (code: string) => {
    setCouponError('');
    const c = code.trim().toUpperCase();
    if (c === 'HUSTLE10' || c === 'ATELIER10') {
      setAppliedCoupon({ code: c, discountPercent: 10 });
      showToast({ title: 'Coupon Applied', description: '10% privilege savings applied.', type: 'success' });
    } else if (c === 'GOBONKERS15') {
      setAppliedCoupon({ code: c, discountPercent: 15 });
      showToast({ title: 'Coupon Applied', description: '15% tier savings applied.', type: 'success' });
    } else if (c === 'BONKERS20') {
      setAppliedCoupon({ code: c, discountPercent: 20 });
      showToast({ title: 'Coupon Applied', description: '20% maximum tier savings applied.', type: 'success' });
    } else if (c === 'NEEDLECRAFT') {
      setAppliedCoupon({ code: c, discountCents: 332000 });
      showToast({ title: 'Coupon Applied', description: '₹3,320 voucher applied.', type: 'success' });
    } else if (c === 'FREESHIP') {
      setAppliedCoupon({ code });
      showToast({ title: 'Coupon Applied', description: 'Complimentary shipping unlocked.', type: 'success' });
    } else {
      setCouponError('Invalid coupon code.');
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    applySpecificCode(couponCode);
    setCouponCode('');
  };

  const handleAddUpsell = (productSlug: string) => {
    const product = products?.find((p) => p.slug === productSlug);
    if (!product) return;
    const variant = getDefaultVariant(product);
    if (variant.status === 'out-of-stock') {
      showToast({
        title: 'Sold out',
        description: `${product.name} is currently sold out.`,
        type: 'info',
      });
      return;
    }
    addItem(product.slug, variant.sku, 1, undefined, variant.quantity ?? 99);
    showToast({
      // Not 'Archival Care Added' — that was legacy copy for the care-kit
      // accessory, and it fired for hoodies and scarves too.
      title: 'Added to Bag',
      description: `${product.name} (size ${variant.size})`,
      type: 'accent',
    });
  };

  const upsellProducts = useMemo(() => {
    if (!products) return [];
    const inCart = new Set(items.map((i) => i.productSlug));
    const accessories = products.filter(
      (p) => p.categorySlug === 'accessories' && !inCart.has(p.slug)
    );
    const pool = accessories.length > 0 ? accessories : products.filter((p) => !inCart.has(p.slug));
    return pool
      .filter((p) => getDefaultVariant(p).status !== 'out-of-stock')
      .slice(0, 2);
  }, [products, items]);

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError('');
    if (!customerName.trim() || !customerEmail.trim() || !shippingAddress.trim()) {
      setOrderError('Please fill in your name, email and delivery address.');
      return;
    }
    if (!/^\d{6}$/.test(customerPincode)) {
      setOrderError('Please enter a valid 6-digit delivery PIN code.');
      return;
    }
    if (customerPhone && !/^[6-9]\d{9}$/.test(customerPhone.replace(/\s+/g, ''))) {
      setOrderError('Please enter a valid 10-digit Indian mobile number, or leave phone empty.');
      return;
    }
    if (cartLines.length === 0) {
      setOrderError('Your bag is empty. Add a garment before checkout.');
      return;
    }
    setIsPlacingOrder(true);
    try {
      const res = await createOrder({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim() || undefined,
        pincode: customerPincode.trim(),
        paymentMethod,
        // Report what the server quoted, not what the client computed. These are
        // display-only for the receipt; place_order re-prices from variants and
        // ignores them, so a stale value here can never change the charge.
        subtotalCents: quote?.subtotal_cents ?? rawSubtotalCents,
        discountCents: quote?.discount_cents ?? 0,
        shippingCents: quote?.shipping_cents ?? 0,
        totalCents: quote?.total_cents ?? rawSubtotalCents,
        couponCode: appliedCoupon?.code || null,
        giftNote: hasGiftNote ? giftNoteText : null,
        shippingAddress: shippingAddress.trim(),
        lines: cartLines.map((l) => ({
          productSlug: l.product.slug,
          variantSku: l.variant.sku,
          productName: l.product.name,
          color: l.variant.color,
          size: l.variant.size,
          quantity: l.quantity,
          priceCents: l.variant.priceCents,
          customization: l.customization,
        })),
      });
      if (!res.success) {
        setOrderError(res.message);
        return;
      }
      setPlacedOrderId(res.orderId || '');
      setCheckoutStep('success');
      clearCart();
      showToast({
        title: paymentMethod === 'cod' ? 'COD Order Confirmed' : 'Order Confirmed',
        description:
          paymentMethod === 'upi'
            ? 'Complete your UPI payment on the next step — invoice sent to your email.'
            : 'Your bespoke commission has been queued with the master needleworker.',
        type: 'success',
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Frosted Backdrop */}
      <div
        onClick={closeCart}
        className="fixed inset-0 bg-panel-raised/40 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Drawer Surface */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        tabIndex={-1}
        className="relative z-10 flex h-full w-full max-w-md flex-col bg-paper shadow-2xl animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
          <div className="p-5 sm:p-6 border-b border-stone/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h3 className="font-serif text-xl sm:text-2xl text-ink tracking-wide">Atelier Bag</h3>
              <span className="text-xs font-sans text-ink-muted">
                ({cartLines.reduce((acc, line) => acc + line.quantity, 0)} items)
              </span>
            </div>
            <button
              onClick={closeCart}
              aria-label="Close cart"
              className="p-1.5 text-ink-muted hover:text-ink transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tiered Shipping & Monogram Meter */}
          <div className="bg-cream px-6 py-3.5 border-b border-stone/60 text-xs text-ink">
            {giftTierQualified ? (
              <p className="text-accent font-medium tracking-wide flex items-center gap-1.5">
                <span>✦</span> Complimentary Monogramming & Worldwide Shipping Unlocked!
              </p>
            ) : freeShippingQualified ? (
              <div>
                <p className="text-accent font-medium tracking-wide flex items-center gap-1.5">
                  <span>✦</span> Complimentary white-glove shipping unlocked
                </p>
                <p className="text-xs text-ink-muted mt-1 font-light">
                  Add <span className="font-medium text-ink">{formatPrice(remainingForGiftTier)}</span> more to unlock complimentary bespoke monogramming & archival cedar dustbag.
                </p>
              </div>
            ) : (
              <div>
                {/* Threshold and coupon values come from the server quote. */}
                <p className="font-light text-ink-muted">{milestonePrompt}</p>
                <div className="w-full bg-stone h-1.5 mt-2 rounded-full overflow-hidden">
                  <div
                    className="bg-accent h-full transition-all duration-500"
                    style={{ width: `${shippingProgressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Scrollable Middle: Line Items + Upsell Carousel + Notes */}
          <div className="flex-1 overflow-y-auto px-6 divide-y divide-stone/40">
            {cartLines.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
                <div className="w-12 h-12 rounded-full border border-stone/80 flex items-center justify-center text-stone text-lg">
                  ✦
                </div>
                <div>
                  <p className="font-serif text-xl text-ink">Your bag is currently empty</p>
                  <p className="text-xs text-ink-muted mt-1 max-w-xs font-light leading-relaxed">
                    Explore our limited needlework coats, cashmere knitwear, and bespoke shirts.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={closeCart}
                  className="mt-2"
                >
                  <Link to="/shop">Discover Collections</Link>
                </Button>
              </div>
            ) : (
              <>
                {/* Product Lines */}
                <div className="py-2 divide-y divide-stone/40">
                  {cartLines.map((line) => (
                    <CartLineItem
                      key={line.id}
                      line={line}
                      priced={quote?.lines.find((q) => q.sku === line.variant.sku)}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>

                {/* In-Drawer Upsells: Frequently Stitched Together */}
                {upsellProducts.length > 0 && (
                  <div className="py-5">
                    <span className="text-xs uppercase tracking-widest text-accent font-medium block mb-2.5">
                      ✦ Frequently Stitched Together
                    </span>
                    <div className="space-y-3">
                      {upsellProducts.map((up) => {
                        const uv = getDefaultVariant(up);
                        return (
                          <div key={up.slug} className="flex items-center gap-3 p-2.5 bg-cream/70 border border-stone/70 rounded-sm">
                            <img src={up.images[0]?.src || '/images/placeholders/hero.jpg'} alt={up.name} className="w-12 h-12 object-cover border border-stone/60" />
                            <div className="flex-1 min-w-0">
                              <h5 className="font-serif text-xs text-ink truncate">{up.name}</h5>
                              <span className="text-xs font-sans text-ink-muted font-medium">{formatPrice(uv.priceCents)}</span>
                            </div>
                            <button
                              onClick={() => handleAddUpsell(up.slug)}
                              aria-label={`Add ${up.name} to bag`}
                              className="px-2.5 py-1 min-h-[44px] text-xs uppercase tracking-wider bg-panel-raised text-white hover:bg-accent transition-colors font-medium whitespace-nowrap cursor-pointer"
                            >
                              + Add
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Gift Note Section */}
                <div className="py-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-ink font-medium">
                    <input
                      type="checkbox"
                      checked={hasGiftNote}
                      onChange={(e) => setHasGiftNote(e.target.checked)}
                      className="accent-accent"
                    />
                    <span>Add handwritten atelier gift message</span>
                  </label>
                  {hasGiftNote && (
                    <textarea
                      rows={2}
                      value={giftNoteText}
                      onChange={(e) => setGiftNoteText(e.target.value)}
                      placeholder="Enter your message for the hand-stamped parchment card..."
                      className="w-full mt-2 p-2.5 bg-cream border border-stone text-xs text-ink focus:outline-accent"
                    />
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer & Checkout Trigger */}
          {cartLines.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-stone/60 bg-paper space-y-3.5">
              {/* Promo Code Input */}
              <div>
                {appliedCoupon ? (
                  <div className="flex justify-between items-center text-xs p-2 bg-cream border border-stone/60">
                    <span className="text-accent font-medium tracking-wide">
                      ✦ Code {appliedCoupon.code} Applied
                    </span>
                    <button
                      onClick={() => setAppliedCoupon(null)}
                      className="text-xs uppercase text-ink-muted hover:text-ink cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Privilege Code (try ATELIER10)"
                      className="flex-1 bg-cream border border-stone px-3 py-1.5 text-xs text-ink uppercase tracking-wider placeholder:text-warm-gray focus:outline-accent"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-stone/70 hover:bg-panel-raised hover:text-white text-xs text-ink uppercase tracking-wider transition-colors font-medium cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && <p className="text-xs text-error mt-1">{couponError}</p>}
              </div>

              {/* Calculations Breakdown */}
              <div className="space-y-1.5 text-xs pt-1">
                <div className="flex justify-between text-ink-muted">
                  <span>Subtotal</span>
                  <span className="flex items-baseline gap-1.5">
                    {/* Strike-through only when every discounted line carries
                        a real MRP, so the markdown is never overstated. */}
                    {mrpTotalCents != null && (
                      <span className="text-ink-muted line-through" data-numeric>
                        {formatPrice(mrpTotalCents)}
                      </span>
                    )}
                    <span className="font-medium text-ink" data-numeric>
                      {formatPrice(rawSubtotalCents)}
                    </span>
                  </span>
                </div>
                {(quote?.discount_cents ?? 0) > 0 && (
                  <div className="flex justify-between text-accent font-medium">
                    <span>Privilege Savings</span>
                    <span>–{formatPrice(quote?.discount_cents ?? 0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-ink-muted">
                  <span>Shipping</span>
                  <span>{freeShippingQualified ? 'Complimentary' : formatPrice(quote?.flat_rate_cents ?? 0)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-ink pt-2 border-t border-stone/40">
                  <span>Total</span>
                  <span>{formatPrice(displayTotalCents ?? 0)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full tracking-widest text-xs uppercase h-11"
                onClick={goToCheckout}
              >
                Proceed to Atelier Checkout
              </Button>

              <p className="text-xs text-center text-ink-muted tracking-wide font-light">
                ✦ White-glove archival boxing & 30-day atelier exchange guarantee
              </p>
            </div>
          )}
      </div>

      {/* Offers Sheet / Modal for v2 */}
      {isOffersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            onClick={() => setIsOffersModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />
          <div className="relative z-10 w-full max-w-md rounded-t-xl bg-paper p-5 shadow-2xl animate-in slide-in-from-bottom duration-200 sm:rounded-xl">
            <div className="flex items-center justify-between border-b border-stone pb-3">
              <h4 className="text-base font-semibold text-ink">
                Available Offers{offersCount > 0 ? ` (${offersCount})` : ''}
              </h4>
              <button
                onClick={() => setIsOffersModalOpen(false)}
                aria-label="Close offers"
                className="p-1 text-ink-muted transition-colors hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="py-3 space-y-3 max-h-[60vh] overflow-y-auto">
              {offers.length === 0 && (
                <p className="py-4 text-center text-xs text-ink-muted">
                  {quote?.best_coupon
                    ? 'One offer available — see the prompt above.'
                    : 'No offers are active right now.'}
                </p>
              )}
              {/* Driven by public.coupons. The old list was four hardcoded
                  objects behind a "(12)" heading, with minimums the server
                  never enforced (BONKERS20 claimed ₹9,999 and checked nothing). */}
              {offers.map((offer) => (
                <div key={offer.code} className="flex items-center justify-between gap-3 rounded-lg border border-stone bg-panel p-3">
                  <div className="min-w-0">
                    <span className="rounded border border-stone-strong bg-panel-raised px-2 py-0.5 font-mono text-xs font-semibold text-ink">
                      {offer.code}
                    </span>
                    <p className="mt-1 text-xs font-semibold text-ink">
                      {offer.description ?? describeOffer(offer)}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {offer.min_subtotal_cents > 0
                        ? `On orders above ${formatPrice(offer.min_subtotal_cents)}`
                        : 'No minimum order'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      applySpecificCode(offer.code);
                      setIsOffersModalOpen(false);
                    }}
                    className="shrink-0 cursor-pointer rounded-md bg-accent px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-accent-hover"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Simulated Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div
            onClick={() => setIsCheckoutOpen(false)}
            className="fixed inset-0 bg-panel-raised/70 backdrop-blur-md"
          />
          <div className="relative w-full max-w-lg bg-paper border border-stone shadow-2xl rounded-t-xl sm:rounded-sm p-5 sm:p-8 z-10 max-h-[92vh] sm:max-h-[90vh] flex flex-col animate-in slide-in-from-bottom sm:zoom-in-95 duration-200">
            {checkoutStep === 'details' ? (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex justify-between items-center pb-3 border-b border-stone/60 shrink-0">
                  <h3 className="font-serif text-2xl text-ink">Atelier Order Checkout</h3>
                  <button onClick={() => setIsCheckoutOpen(false)} aria-label="Close checkout" className="min-w-[44px] min-h-[44px] px-2 text-xs text-ink-muted hover:text-ink">✕</button>
                </div>

                <div className="my-3 p-3 bg-cream border border-stone/60 text-xs shrink-0">
                  <div className="flex justify-between font-medium text-ink">
                    <span>Order Total ({cartLines.length} items):</span>
                    <span>{formatPrice(displayTotalCents ?? 0)}</span>
                  </div>
                  {appliedCoupon && (
                    <span className="text-xs text-accent block mt-1">✦ Code {appliedCoupon.code} applied</span>
                  )}
                </div>

                <form onSubmit={handleCheckoutSubmit} className="space-y-3.5 overflow-y-auto flex-1 pr-1">
                  {savedAddresses.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wider text-ink-muted mb-2">Deliver to a saved address</p>
                      <div className="flex flex-wrap gap-2">
                        {savedAddresses.map((a) => {
                          const selected = selectedAddressId === a.id;
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => applyAddress(a.id)}
                              aria-pressed={selected}
                              className={`text-left px-3 py-2 border min-h-[44px] transition-colors cursor-pointer ${
                                selected
                                  ? 'border-ink bg-cream'
                                  : 'border-stone hover:border-ink/60 bg-paper'
                              }`}
                            >
                              <span className="block text-xs font-medium text-ink">{a.recipient_name}</span>
                              <span className="block text-xs text-ink-muted mt-0.5">
                                {a.city} {a.pincode}
                              </span>
                            </button>
                          );
                        })}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAddressId(null);
                            setShippingAddress('');
                            setCustomerPincode('');
                          }}
                          className="text-left px-3 py-2 border border-dashed border-stone hover:border-ink/60 min-h-[44px] transition-colors cursor-pointer"
                        >
                          <span className="block text-xs text-ink-muted">New address</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="co-name" className="block text-xs uppercase tracking-wider text-ink font-medium mb-1">
                        Full Name
                      </label>
                      <input
                        id="co-name"
                        type="text"
                        required
                        autoComplete="name"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Ananya Sharma"
                        className="w-full bg-cream border border-stone px-3 py-2.5 min-h-[44px] text-xs text-ink focus:outline-accent"
                      />
                    </div>
                    <div>
                      <label htmlFor="co-phone" className="block text-xs uppercase tracking-wider text-ink font-medium mb-1">
                        Mobile (10-digit)
                      </label>
                      <input
                        id="co-phone"
                        type="tel"
                        inputMode="numeric"
                        autoComplete="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="e.g. 9810012345"
                        className="w-full bg-cream border border-stone px-3 py-2.5 min-h-[44px] text-xs text-ink focus:outline-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="co-email" className="block text-xs uppercase tracking-wider text-ink font-medium mb-1">
                      Email Address
                    </label>
                    <input
                      id="co-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="e.g. ananya@example.in"
                      className="w-full bg-cream border border-stone px-3 py-2.5 min-h-[44px] text-xs text-ink focus:outline-accent"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="co-pincode" className="block text-xs uppercase tracking-wider text-ink font-medium mb-1">
                        PIN Code
                      </label>
                      <input
                        id="co-pincode"
                        type="text"
                        required
                        inputMode="numeric"
                        autoComplete="postal-code"
                        value={customerPincode}
                        onChange={(e) => setCustomerPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="e.g. 110001"
                        className="w-full bg-cream border border-stone px-3 py-2.5 min-h-[44px] text-xs text-ink focus:outline-accent"
                      />
                    </div>
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-ink font-medium mb-1">
                        Payment
                      </span>
                      <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Payment method">
                        {(
                          [
                            { key: 'upi', label: 'UPI' },
                            { key: 'cod', label: 'COD' },
                            { key: 'card', label: 'Card' },
                          ] as { key: PaymentMethod; label: string }[]
                        ).map((m) => (
                          <button
                            key={m.key}
                            type="button"
                            role="radio"
                            aria-checked={paymentMethod === m.key}
                            onClick={() => setPaymentMethod(m.key)}
                            className={`min-h-[44px] px-2 text-xs border transition-colors ${
                              paymentMethod === m.key
                                ? 'bg-panel-raised text-white border-ink font-medium'
                                : 'bg-paper text-ink border-stone hover:border-ink/60'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="co-address" className="block text-xs uppercase tracking-wider text-ink font-medium mb-1">
                      Delivery Address
                    </label>
                    <textarea
                      id="co-address"
                      required
                      rows={2}
                      autoComplete="street-address"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Flat, street, area, city, state"
                      className="w-full bg-cream border border-stone px-3 py-2.5 text-xs text-ink focus:outline-accent"
                    />
                  </div>

                  {hasGiftNote && (
                    <div>
                      <label htmlFor="co-gift" className="block text-xs uppercase tracking-wider text-ink font-medium mb-1">
                        Gift Note
                      </label>
                      <input
                        id="co-gift"
                        type="text"
                        value={giftNoteText}
                        onChange={(e) => setGiftNoteText(e.target.value)}
                        placeholder="Handwritten note for the recipient"
                        className="w-full bg-cream border border-stone px-3 py-2.5 min-h-[44px] text-xs text-ink focus:outline-accent"
                      />
                    </div>
                  )}

                  <div className="p-3 bg-paper border border-stone/70 text-xs text-ink-muted leading-relaxed">
                    <span className="text-ink font-medium block">✦ White-Glove Courier Service</span>
                    {paymentMethod === 'upi' && 'You will receive a UPI collect request after placing the order. '}
                    {paymentMethod === 'cod' && 'Pay in cash or via UPI on delivery. Please keep exact change ready. '}
                    {paymentMethod === 'card' && 'Secure RuPay / Visa / Mastercard payment link will be emailed. '}
                    Dispatch in 2 business days. Inclusive of all taxes.
                  </div>

                  {orderError && (
                    <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2">
                      {orderError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsCheckoutOpen(false)}>
                      Back to Bag
                    </Button>
                    <Button type="submit" variant="primary" size="sm" disabled={isPlacingOrder}>
                      {isPlacingOrder ? 'Placing Order…' : `Pay ${paymentMethod.toUpperCase()} • ${formatPrice(displayTotalCents ?? 0)}`}
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-success/10 text-success text-2xl flex items-center justify-center mx-auto mb-4">
                  ✓
                </div>
                <h3 className="font-serif text-3xl text-ink">Commission Confirmed</h3>
                <p className="text-xs text-ink-muted mt-2 max-w-sm mx-auto leading-relaxed">
                  Thank you, <span className="text-ink font-medium">{customerName}</span>. Your bespoke order has been assigned to our master embroidery workshop. An archival invoice has been transmitted to <span className="text-ink font-medium">{customerEmail}</span>.
                </p>
                {placedOrderId && (
                  <p className="text-xs font-mono text-ink-muted mt-2">Order ID: {placedOrderId}</p>
                )}
                <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
                  {placedOrderId && (
                    <Link
                      to={`/order-confirmation/${placedOrderId}?email=${encodeURIComponent(customerEmail)}`}
                      onClick={() => {
                        setIsCheckoutOpen(false);
                        closeCart();
                      }}
                      className="inline-flex items-center justify-center px-4 py-2 text-xs font-mono uppercase tracking-wider bg-panel-raised text-white hover:bg-panel-raised-light transition-colors"
                    >
                      View Archival Receipt & Tracking ↗
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCheckoutStep('details');
                      setPlacedOrderId('');
                      setCustomerName('');
                      setCustomerEmail('');
                      setCustomerPhone('');
                      setCustomerPincode('');
                      setShippingAddress('');
                      setGiftNoteText('');
                      setHasGiftNote(false);
                      setIsCheckoutOpen(false);
                      closeCart();
                    }}
                  >
                    Return to Atelier
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
