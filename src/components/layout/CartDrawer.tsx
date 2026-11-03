import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
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
 * THE BAG
 *
 * The one place in this world that is allowed a curve (PRODUCT.md scopes
 * rounded corners to the bag), so the drawer reads as a different kind of
 * surface from the ruled pages behind it: a paper pouch, not a page.
 *
 * What was removed, and why:
 *  · A modal checkout with its own name / email / PIN / payment form. It could
 *    not be opened by any control in the file — `setIsCheckoutOpen(true)` was
 *    never called — and the real checkout lives at /checkout with saved
 *    addresses and a stable URL. ~430 lines of unreachable duplicate order
 *    flow, including a second copy of the order-placement call, is a bug
 *    waiting to be reintroduced. Removed.
 *  · An offers sheet behind the same kind of dead trigger, listing coupons
 *    with a `setIsOffersModalOpen(true)` that did not exist.
 *  · "Complimentary Monogramming & Worldwide Shipping Unlocked" at a ₹49,800
 *    gift tier. No such tier exists in the pricing function, and there is no
 *    international shipping rule. The only real threshold is free carriage
 *    above ₹1,499, which the quote reports.
 *  · "White-glove archival boxing & 30-day atelier exchange guarantee." The
 *    catalogue's own `returnWindowDays` is 7.
 *  · A hardcoded coupon allow-list that applied a discount client-side and
 *    announced "Coupon Applied" before the server had priced anything. A code
 *    is now only claimed once `quote.coupon` comes back clean.
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

  // ── Server pricing: the single source of every number in this drawer ──
  const { quote, isLoading: quoteLoading } = useQuote({ couponCode: appliedCode });

  // A stale line is most visible here: the drawer drops unpurchasable lines
  // while the quote would refuse the whole bag. Prune first, then price.
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

  // Genuine strike-through: the sum of real MRPs across the bag, only when
  // every line has one. A partial total would understate the markdown.
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

  /**
   * The server's verdict on the applied code, derived during render rather than
   * pushed through an effect. A code is only claimed once the quote prices it:
   * a code below its minimum subtotal cannot look applied while the total is
   * unchanged.
   */
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
      <button
        type="button"
        aria-label="Close bag"
        onClick={closeCart}
        className="fixed inset-0 cursor-default bg-ink/45"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bag-title"
        tabIndex={-1}
        className="relative z-10 flex h-full w-full max-w-[27rem] flex-col bg-paper"
      >
        {/* ── Head ─────────────────────────────────────────────────── */}
        <div className="flex items-baseline justify-between gap-3 border-b border-stone px-5 py-4">
          <div className="flex items-baseline gap-2">
            <h2 id="bag-title" className="loom-display text-xl text-ink">Bag</h2>
            <span className="loom-price text-[12px] text-ink-muted">
              {unitCount} {unitCount === 1 ? 'piece' : 'pieces'}
            </span>
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Close bag"
            className="-mr-2 flex h-11 w-11 items-center justify-center text-ink-muted transition-colors hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 18 18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* ── Gamified Free Shipping & Coupon Meter ────────── */}
        {cartLines.length > 0 && (
          <div className="border-b border-[#EDEDED] bg-emerald-50/70 px-5 py-3.5">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
              <span className="flex items-center gap-1.5">
                <span>🚚</span>
                <span>
                  {freeShippingQualified
                    ? '🎉 You unlocked FREE SHIPPING & 10% OFF!'
                    : `Add ${formatPrice(remainingFree)} more to unlock FREE SHIPPING!`}
                </span>
              </span>
              <span className="font-mono text-[11px] text-emerald-700">
                {Math.min(100, Math.round(shippingProgressPercent))}%
              </span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-emerald-200/80">
              <div
                className="h-full rounded-full bg-emerald-600 transition-[width] duration-500"
                style={{ width: `${Math.min(100, Math.max(8, shippingProgressPercent))}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Lines ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5">
          {cartLines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-16 text-center">
              <h3 className="loom-display text-2xl text-ink">Nothing in the bag yet</h3>
              <p className="mt-2 max-w-[32ch] font-sans text-[13px] leading-relaxed text-ink-muted">
                Every piece in the catalogue is priced on its own page, with the
                technique that made it.
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="mt-5 inline-flex min-h-[44px] items-center bg-ink px-5 font-sans text-[11px] uppercase tracking-[0.14em] text-cream transition-colors hover:bg-accent"
              >
                Shop the collection
              </button>
            </div>
          ) : (
            <>
              <ul>
                {cartLines.map((line) => (
                  <li key={line.id}>
                    <CartLineItem
                      line={line}
                      priced={quote?.lines.find((q) => q.sku === line.variant.sku)}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  </li>
                ))}
              </ul>

              {/* Impulse Add-Ons / Grab an Accessory */}
              {upsellProducts.length > 0 && (
                <div className="border-b border-[#EDEDED] py-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="font-mono text-[11px] font-black uppercase tracking-wider text-neutral-900">
                      ★ COMPLETE THE LOOK
                    </span>
                    <span className="text-[10px] text-neutral-500 font-medium">Quick add</span>
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

              <div className="py-4">
                <label className="flex min-h-[32px] cursor-pointer items-center gap-2.5 font-sans text-[13px] text-ink">
                  <input
                    type="checkbox"
                    checked={hasGiftNote}
                    onChange={(e) => setHasGiftNote(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Include a handwritten note
                </label>
                {hasGiftNote && (
                  <textarea
                    rows={2}
                    value={giftNoteText}
                    onChange={(e) => setGiftNoteText(e.target.value)}
                    placeholder="What should the note say?"
                    aria-label="Gift note"
                    className="mt-2 w-full resize-none border border-stone bg-cream px-3 py-2 font-sans text-[13px] text-ink placeholder:text-ink-muted/70 focus:border-ink focus:outline-none"
                  />
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Totals ───────────────────────────────────────────────── */}
        {cartLines.length > 0 && (
          <div className="border-t border-stone px-5 pb-5 pt-4">
            {/* Quick 1-Tap Coupon Pill */}
            {!appliedCode && (
              <div className="mb-2 flex items-center justify-between rounded-md bg-amber-50 px-2.5 py-1.5 border border-amber-200">
                <span className="text-[11px] font-bold text-amber-900">
                  ✨ Extra 10% OFF: <span className="font-mono font-black">HUSTLE10</span>
                </span>
                <button
                  type="button"
                  onClick={() => applyCode('HUSTLE10')}
                  className="rounded bg-black px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white hover:bg-neutral-800"
                >
                  Apply
                </button>
              </div>
            )}

            {/* Coupon */}
            {!appliedCode && !isCouponInputOpen ? (
              <button
                type="button"
                onClick={() => setIsCouponInputOpen(true)}
                className="font-sans text-[12px] text-ink-muted underline decoration-stone-strong underline-offset-4 transition-colors hover:decoration-ink"
              >
                Add a code
              </button>
            ) : appliedCode ? (
              <div className="flex items-center justify-between gap-3 border border-stone px-3 py-2">
                <span className="loom-price text-[12px] text-ink">
                  {appliedCode}
                  {quote?.coupon && !quote.coupon.error && quote.discount_cents > 0 && (
                    <span className="ml-2 text-accent">−{formatPrice(quote.discount_cents)}</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="font-sans text-[11px] uppercase tracking-[0.12em] text-ink-muted transition-colors hover:text-ink"
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
                <label htmlFor="bag-coupon" className="sr-only">Discount code</label>
                <input
                  id="bag-coupon"
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Code"
                  autoComplete="off"
                  className="min-h-[44px] min-w-0 flex-1 border border-stone bg-cream px-3 font-sans text-[13px] uppercase tracking-[0.08em] text-ink placeholder:normal-case placeholder:tracking-normal placeholder:text-ink-muted/70 focus:border-ink focus:outline-none"
                />
                <button
                  type="submit"
                  className="min-h-[44px] shrink-0 border border-stone-strong px-4 font-sans text-[11px] uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink"
                >
                  Apply
                </button>
              </form>
            )}

            {couponError && (
              <p role="alert" className="mt-2 font-sans text-[12px] text-error">
                {couponError}
              </p>
            )}

            {/* An eligible offer the buyer has not applied. Never auto-applied:
                a discount the customer did not ask for is a surprise at the
                payment step. */}
            {!appliedCode && availableOffers.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setIsCouponInputOpen(true);
                  setCouponCode(availableOffers[0].code);
                }}
                className="mt-2 block text-left font-sans text-[12px] text-ink-muted transition-colors hover:text-ink"
              >
                <span className="font-medium text-ink">{availableOffers[0].code}</span>{' '}
                {availableOffers[0].description ?? 'is available on this bag'} →
              </button>
            )}

            {/* The arithmetic, as the server returned it. */}
            <dl className="mt-4 space-y-1.5 border-t border-stone pt-3">
              <div className="flex items-baseline justify-between">
                <dt className="font-sans text-[13px] text-ink-muted">Subtotal</dt>
                <dd className="flex items-baseline gap-2">
                  {mrpTotalCents != null && (
                    <span className="loom-price text-[12px] text-ink-muted line-through">
                      {formatPrice(mrpTotalCents)}
                    </span>
                  )}
                  <span className="loom-price text-[13px] text-ink">
                    {money(serverSubtotal ?? (quoteLoading ? null : rawSubtotalCents))}
                  </span>
                  {totalDiscountPercent != null && (
                    <span className="font-sans text-[11px] text-accent">{totalDiscountPercent}% off</span>
                  )}
                </dd>
              </div>

              {(quote?.discount_cents ?? 0) > 0 && (
                <div className="flex items-baseline justify-between">
                  <dt className="font-sans text-[13px] text-ink-muted">
                    {quote?.coupon?.code ?? 'Discount'}
                  </dt>
                  <dd className="loom-price text-[13px] text-accent">
                    −{formatPrice(quote?.discount_cents ?? 0)}
                  </dd>
                </div>
              )}

              <div className="flex items-baseline justify-between">
                <dt className="font-sans text-[13px] text-ink-muted">Carriage</dt>
                <dd className="loom-price text-[13px] text-ink">
                  {!quote ? '—' : freeShippingQualified ? 'Free' : formatPrice(quote.shipping_cents)}
                </dd>
              </div>

              <div className="flex items-baseline justify-between border-t border-stone pt-2.5">
                <dt className="font-sans text-[13px] font-medium text-ink">Total</dt>
                <dd className="loom-price text-[17px] font-medium text-ink">
                  {money(displayTotalCents)}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={goToCheckout}
              disabled={!quote}
              className="mt-4 flex min-h-[52px] w-full items-center justify-center gap-2 bg-ink font-sans text-[12px] font-medium uppercase tracking-[0.16em] text-cream transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:bg-stone-strong"
            >
              Checkout
              <span aria-hidden="true">→</span>
            </button>

            <p className="mt-2.5 text-center font-sans text-[11px] text-ink-muted">
              Inclusive of taxes. Cash on delivery available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
