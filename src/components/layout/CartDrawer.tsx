import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useCartStore } from '../../stores/cart';
import { useProducts } from '../../hooks/useCatalog';
import { getCartLine, formatPrice, getDefaultVariant, type CartLine } from '../../lib/data';
import { useQuote } from '../../hooks/useQuote';
import { useReconcileCart } from '../../hooks/useReconcileCart';
import {
  lineMrpCents,
  remainingForFreeShipping,
  freeShippingProgress,
} from '../../lib/pricing';
import { useToastStore } from '../../stores/toast';
import { hasLicensedMark } from '../../lib/licensed-marks';
import { CartLineItem } from './CartLineItem';
import { useDialogFocus } from '../../hooks/useDialogFocus';

/**
 * THE BAG — Modern Streetwear D2C Bag Drawer
 *
 * Clean white ground, gamified progress meter, instant coupon application,
 * complete-the-look recommendations, and lightning checkout CTA.
 */
export const CartDrawer: React.FC = () => {
  const isOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const showToast = useToastStore((state) => state.showToast);

  const { data: products } = useProducts();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [isCouponInputOpen, setIsCouponInputOpen] = useState(false);
  const [hasGiftNote, setHasGiftNote] = useState(false);
  const [giftNoteText, setGiftNoteText] = useState('');

  const cartLines = useMemo(
    () => items.map((item) => getCartLine(item, products ?? [])).filter((l): l is CartLine => l !== null),
    [items, products],
  );

  const unitCount = cartLines.reduce((acc, line) => acc + line.quantity, 0);

  // ── Server pricing: the single source of truth ──
  const { quote, isLoading: quoteLoading } = useQuote({ couponCode: appliedCode });

  useReconcileCart();

  const rawSubtotalCents = useMemo(
    () => cartLines.reduce((acc, line) => acc + line.lineTotalCents, 0),
    [cartLines],
  );

  const serverSubtotal = quote?.subtotal_cents ?? null;
  const displayTotalCents = quote?.total_cents ?? null;
  const remainingFree = quote ? remainingForFreeShipping(quote) : 0;
  const freeShippingQualified = quote ? quote.shipping_cents === 0 : false;
  const shippingProgressPercent = quote ? freeShippingProgress(quote) : 0;

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

  const totalDiscountPercent = useMemo(() => {
    if (mrpTotalCents == null || !serverSubtotal || mrpTotalCents <= 0) return null;
    const pct = Math.floor(((mrpTotalCents - serverSubtotal) / mrpTotalCents) * 100);
    return pct > 0 ? pct : null;
  }, [mrpTotalCents, serverSubtotal]);

  const availableOffers = quote?.available_offers ?? [];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeCart();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeCart]);

  const dialogRef = useDialogFocus<HTMLDivElement>(isOpen, closeCart);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const couponError = appliedCode && quote?.coupon?.error ? quote.coupon.error : '';

  const applyCode = (raw: string) => {
    const code = raw.trim().toUpperCase();
    if (!code) return;
    setAppliedCode(code);
    setCouponCode('');
  };

  const removeCoupon = () => {
    setAppliedCode(null);
  };

  const goToCheckout = () => {
    if (cartLines.length === 0) return;
    closeCart();
    navigate('/checkout');
  };

  const handleAddUpsell = (slug: string) => {
    const product = products?.find((p) => p.slug === slug);
    if (!product) return;
    const variant = getDefaultVariant(product);
    if (variant.status === 'out-of-stock') {
      showToast({ title: 'Sold out', description: `${product.name} is currently sold out.`, type: 'info' });
      return;
    }
    addItem(product.slug, variant.sku, 1, undefined, variant.quantity ?? 99);
    showToast({ title: 'Added to bag', description: `${product.name} (size ${variant.size})`, type: 'success' });
  };

  const upsellProducts = useMemo(() => {
    if (!products) return [];
    const inCart = new Set(items.map((i) => i.productSlug));
    const available = products.filter(
      (p) =>
        !inCart.has(p.slug) &&
        !hasLicensedMark(p) &&
        getDefaultVariant(p).status !== 'out-of-stock',
    );
    const accessories = available.filter((p) => p.categorySlug === 'accessories');
    return (accessories.length >= 2 ? accessories : available).slice(0, 2);
  }, [products, items]);

  if (!isOpen) return null;

  const money = (cents: number | null) => (cents == null ? '—' : formatPrice(cents));

  return (
    <div className="fixed inset-0 z-[300] flex justify-end">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close bag"
        onClick={closeCart}
        className="fixed inset-0 cursor-default bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Panel */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bag-title"
        tabIndex={-1}
        className="relative z-10 flex h-full w-full max-w-[28rem] flex-col bg-white text-neutral-900 shadow-2xl"
      >
        {/* ── Head ─────────────────────────────────────────────────── */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-5">
          <div className="flex items-center gap-2.5">
            <h2 id="bag-title" className="font-display text-lg font-black uppercase tracking-tight text-neutral-900">
              Your Bag
            </h2>
            <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-bold text-neutral-700">
              {unitCount} {unitCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close bag"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-black"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* ── Gamified Free Shipping Meter ─────────────────────────── */}
        {cartLines.length > 0 && (
          <div className="border-b border-neutral-200 bg-neutral-50 px-5 py-3">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-900">
              <span className="flex items-center gap-1.5">
                <span>{freeShippingQualified ? '🎉' : '🚚'}</span>
                <span>
                  {freeShippingQualified
                    ? 'Free express shipping unlocked!'
                    : `Add ${formatPrice(remainingFree)} more for FREE SHIPPING`}
                </span>
              </span>
              <span className="font-mono text-[11px] font-black text-neutral-600">
                {Math.min(100, Math.round(shippingProgressPercent))}%
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
              <div
                className="h-full rounded-full bg-black transition-[width] duration-500"
                style={{ width: `${Math.min(100, Math.max(6, shippingProgressPercent))}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Cart Items List ──────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 divide-y divide-neutral-100 no-scrollbar">
          {cartLines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400 mb-4">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-black uppercase tracking-tight text-neutral-900">
                Your Bag is Empty
              </h3>
              <p className="mt-1.5 max-w-[28ch] text-xs text-neutral-500 leading-relaxed">
                Heavyweight handcrafted streetwear pieces and exclusive anime drops are waiting for you.
              </p>
              <Link
                to="/shop"
                onClick={closeCart}
                className="mt-6 inline-flex min-h-[46px] items-center rounded-lg bg-black px-6 text-xs font-black uppercase tracking-wider text-white shadow-sm transition hover:bg-neutral-800 active:scale-95"
              >
                Explore Collection →
              </Link>
            </div>
          ) : (
            <>
              <div className="divide-y divide-neutral-100">
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

              {/* Complete the Look (Upsells) */}
              {upsellProducts.length > 0 && (
                <div className="py-4 border-t border-neutral-100">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                      <span>★</span>
                      <span>Complete The Look</span>
                    </span>
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase">Quick Add</span>
                  </div>
                  <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
                    {upsellProducts.map((up) => {
                      const uv = getDefaultVariant(up);
                      return (
                        <div
                          key={up.slug}
                          className="flex w-[210px] shrink-0 items-center gap-2.5 rounded-lg border border-neutral-200 bg-neutral-50 p-2 shadow-2xs"
                        >
                          <img
                            src={up.images[0]?.src || '/images/placeholders/hoodie.jpg'}
                            alt=""
                            loading="lazy"
                            className="h-12 w-10 shrink-0 rounded object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-neutral-900">{up.name}</p>
                            <p className="text-xs font-bold text-[#D32F2F]">
                              {formatPrice(uv.priceCents)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAddUpsell(up.slug)}
                            aria-label={`Add ${up.name}`}
                            className="flex h-8 items-center justify-center rounded bg-black px-2.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs transition hover:bg-neutral-800 active:scale-95"
                          >
                            + ADD
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Gift Note Accordion */}
              <div className="py-3.5 border-t border-neutral-100">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-neutral-700 select-none">
                  <input
                    type="checkbox"
                    checked={hasGiftNote}
                    onChange={(e) => setHasGiftNote(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-300 text-black focus:ring-black"
                  />
                  <span>Add a handwritten gift note (free)</span>
                </label>
                {hasGiftNote && (
                  <textarea
                    rows={2}
                    value={giftNoteText}
                    onChange={(e) => setGiftNoteText(e.target.value)}
                    placeholder="Enter your personal message for the recipient..."
                    aria-label="Gift note"
                    className="mt-2 w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-black focus:bg-white focus:outline-none"
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Totals & Checkout ────────────────────────────────────── */}
        {cartLines.length > 0 && (
          <div className="border-t border-neutral-200 bg-neutral-50/50 px-5 pb-5 pt-3.5">
            {/* Quick 1-Tap Coupon Pill */}
            {!appliedCode && (
              <div className="mb-2.5 flex items-center justify-between rounded-lg bg-red-50/80 px-3 py-2 border border-red-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-red-950">
                  <span>✨</span>
                  <span>
                    Get extra 10% OFF with code <strong className="font-mono font-black text-red-700">HUSTLE10</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => applyCode('HUSTLE10')}
                  className="rounded bg-black px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white hover:bg-neutral-800 active:scale-95"
                >
                  Apply
                </button>
              </div>
            )}

            {/* Custom Coupon Input */}
            {!appliedCode && !isCouponInputOpen ? (
              <button
                type="button"
                onClick={() => setIsCouponInputOpen(true)}
                className="text-xs font-bold text-neutral-600 underline underline-offset-2 hover:text-black"
              >
                + Have a promo code? Enter here
              </button>
            ) : appliedCode ? (
              <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold uppercase text-neutral-900">{appliedCode}</span>
                  {quote?.coupon && !quote.coupon.error && quote.discount_cents > 0 && (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-black text-emerald-800">
                      −{formatPrice(quote.discount_cents)} applied
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs font-bold text-neutral-400 hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  applyCode(couponCode);
                }}
                className="flex gap-2"
              >
                <input
                  id="bag-coupon"
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter Promo Code"
                  autoComplete="off"
                  className="h-10 flex-1 rounded-lg border border-neutral-300 bg-white px-3 font-mono text-xs font-bold uppercase tracking-wider text-neutral-900 placeholder:normal-case placeholder:font-normal placeholder:tracking-normal placeholder:text-neutral-400 focus:border-black focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-black px-4 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 active:scale-95"
                >
                  Apply
                </button>
              </form>
            )}

            {couponError && (
              <p role="alert" className="mt-1.5 text-xs font-semibold text-red-600">
                {couponError}
              </p>
            )}

            {/* Available Offer Prompt */}
            {!appliedCode && availableOffers.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsCouponInputOpen(true);
                  setCouponCode(availableOffers[0].code);
                }}
                className="mt-1.5 block text-left text-xs font-medium text-neutral-600 hover:text-black"
              >
                <strong className="font-bold text-neutral-900">{availableOffers[0].code}</strong>:{' '}
                {availableOffers[0].description ?? 'is available on this order'} →
              </button>
            )}

            {/* Order Price Breakdown */}
            <dl className="mt-3.5 space-y-1.5 border-t border-neutral-200 pt-3 text-xs">
              <div className="flex items-center justify-between text-neutral-600">
                <dt>Subtotal</dt>
                <dd className="flex items-center gap-2">
                  {mrpTotalCents != null && (
                    <span className="font-mono text-neutral-400 line-through">
                      {formatPrice(mrpTotalCents)}
                    </span>
                  )}
                  <span className="font-mono font-bold text-neutral-900">
                    {money(serverSubtotal ?? (quoteLoading ? null : rawSubtotalCents))}
                  </span>
                  {totalDiscountPercent != null && (
                    <span className="rounded bg-red-100 px-1 py-0.2 text-[9px] font-black text-red-600">
                      {totalDiscountPercent}% OFF
                    </span>
                  )}
                </dd>
              </div>

              {(quote?.discount_cents ?? 0) > 0 && (
                <div className="flex items-center justify-between font-bold text-[#D32F2F]">
                  <dt>{quote?.coupon?.code ?? 'Discount'} Savings</dt>
                  <dd className="font-mono">−{formatPrice(quote?.discount_cents ?? 0)}</dd>
                </div>
              )}

              <div className="flex items-center justify-between text-neutral-600">
                <dt>Shipping</dt>
                <dd className="font-mono font-bold text-neutral-900">
                  {!quote ? '—' : freeShippingQualified ? (
                    <span className="font-black text-emerald-600 uppercase">FREE</span>
                  ) : (
                    formatPrice(quote.shipping_cents)
                  )}
                </dd>
              </div>

              <div className="flex items-center justify-between border-t border-neutral-200 pt-2.5">
                <dt className="text-sm font-black uppercase text-neutral-900">Total Amount</dt>
                <dd className="font-mono text-base font-black text-[#D32F2F]">
                  {money(displayTotalCents)}
                </dd>
              </div>
            </dl>

            {/* Checkout Button */}
            <button
              type="button"
              onClick={goToCheckout}
              disabled={!quote}
              className="mt-3.5 flex min-h-[50px] w-full items-center justify-center gap-2 rounded-lg bg-black text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-neutral-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              <span>Proceed to Checkout</span>
              <span aria-hidden="true">→</span>
            </button>

            <p className="mt-2 text-center text-[11px] text-neutral-500 font-medium">
              🛡️ 100% Secure Checkout · COD Available · 7-Day Exchange
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
