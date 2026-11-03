import React, { useState } from 'react';
import { Link } from 'react-router';
import { useQuickViewStore } from '../../stores/quickView';
import { useCartStore } from '../../stores/cart';
import { useCustomizerStore } from '../../stores/customizer';
import { useToastStore } from '../../stores/toast';
import { formatPrice, getDefaultVariant, type ProductVariant } from '../../lib/data';
import { catalogMrp } from '../../lib/pricing';
import { orderedVariants } from '../../lib/sizes';
import { Image } from '../ui/Image';
import { useDialogFocus } from '../../hooks/useDialogFocus';

/**
 * QUICK VIEW MODAL — Modern Streetwear D2C Revamp
 *
 * Clean white ground, high-res 3:4 gallery with thumbnail switcher,
 * crimson pricing, size selector, technique & cloth specs, and instant CTA.
 */
export const QuickViewModal: React.FC = () => {
  const { isOpen, product, closeQuickView } = useQuickViewStore();
  const dialogRef = useDialogFocus<HTMLDivElement>(isOpen, closeQuickView);
  const addItem = useCartStore((state) => state.addItem);
  const openCustomizer = useCustomizerStore((state) => state.openCustomizer);
  const showToast = useToastStore((state) => state.showToast);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!isOpen || !product) return null;

  const currentVariant = selectedVariant || getDefaultVariant(product);
  const artisanHours = product.embroidery?.artisanHours;
  const mrp = currentVariant ? catalogMrp(currentVariant) : null;
  const compareAt = mrp?.mrpCents ?? null;
  const offPct = mrp?.offPercent ?? 0;

  const handleAdd = () => {
    if (!currentVariant || currentVariant.status === 'out-of-stock') {
      showToast({
        title: 'Sold out in this size',
        description: 'Please choose another size.',
        type: 'info',
      });
      return;
    }
    addItem(product.slug, currentVariant.sku, 1, undefined, currentVariant.quantity ?? 99);
    showToast({
      title: 'Added to bag',
      description: `${product.name} (size ${currentVariant.size})`,
      type: 'success',
    });
    closeQuickView();
  };

  return (
    <div className="fixed inset-0 z-[420] flex items-end justify-center sm:items-center sm:p-6">
      {/* Backdrop */}
      <div
        onClick={closeQuickView}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        tabIndex={-1}
        className="relative z-10 flex max-h-[92svh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-neutral-200 bg-white shadow-2xl sm:flex-row"
      >
        {/* Close Button */}
        <button
          onClick={closeQuickView}
          aria-label="Close"
          className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-500 shadow-sm backdrop-blur-sm transition-colors hover:bg-neutral-100 hover:text-black"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Media Gallery (Left) */}
        <div className="flex w-full flex-col border-b border-neutral-200 sm:w-1/2 sm:border-b-0 sm:border-r bg-neutral-50">
          <div className="flex min-h-[36svh] items-center justify-center p-4">
            <Image
              src={product.images[activeImageIndex]?.src || product.images[0]?.src}
              alt={product.images[activeImageIndex]?.alt || product.name}
              aspectRatio="3/4"
              fit="contain"
              className="max-h-[50svh] w-full rounded-lg"
              lazy={false}
            />
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto border-t border-neutral-200 p-3 no-scrollbar bg-white">
              {product.images.map((img, idx) => (
                <button
                  key={img.src}
                  onClick={() => setActiveImageIndex(idx)}
                  aria-label={`View image ${idx + 1} of ${product.images.length}`}
                  aria-pressed={activeImageIndex === idx}
                  className={`h-14 w-11 shrink-0 overflow-hidden rounded-md border transition-all ${
                    activeImageIndex === idx
                      ? 'border-black ring-1 ring-black shadow-xs'
                      : 'border-neutral-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.src} alt={img.alt} className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details & Selection (Right) */}
        <div className="flex w-full flex-col overflow-y-auto p-5 sm:w-1/2 sm:p-7 no-scrollbar">
          {/* Tag Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded bg-black px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
              {product.universeSlug ?? 'UNIQUELO'}
            </span>
            {product.craftTechniques?.[0] && (
              <span className="rounded bg-neutral-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-neutral-800">
                {product.craftTechniques[0].replace(/-/g, ' ')}
              </span>
            )}
            {product.expressionScore && (
              <span className="rounded bg-neutral-100 px-2 py-0.5 text-[9px] font-bold text-neutral-600">
                LOUDNESS {product.expressionScore}/5
              </span>
            )}
          </div>

          <h2 className="mt-2 font-display text-xl font-black uppercase tracking-tight text-neutral-900 leading-tight">
            {product.name}
          </h2>

          <p className="mt-1.5 text-xs text-neutral-500 leading-relaxed">
            {product.subtitle}
          </p>

          {/* Pricing Stack */}
          <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-neutral-100 pt-3">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl font-black text-[#D32F2F]">
                {currentVariant ? formatPrice(currentVariant.priceCents) : '—'}
              </span>
              {compareAt && compareAt > (currentVariant?.priceCents ?? 0) && (
                <span className="font-mono text-xs text-neutral-400 line-through">
                  {formatPrice(compareAt)}
                </span>
              )}
              {offPct > 0 && (
                <span className="rounded bg-red-100 px-1.5 py-0.5 text-[9.5px] font-black text-red-600 uppercase">
                  {offPct}% OFF
                </span>
              )}
            </div>
            <span className="text-[11px] font-bold text-emerald-700">
              Free Shipping &gt; ₹1,499
            </span>
          </div>

          {/* Size Selector */}
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold uppercase tracking-wider text-neutral-900 text-[11px]">
                Select Size: {currentVariant?.size}
              </span>
              <span className="text-[11px] text-neutral-400 font-semibold">Standard Indian Fit</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {orderedVariants(product).map((v) => {
                const isSelected = currentVariant?.sku === v.sku;
                const isOut = v.status === 'out-of-stock';
                return (
                  <button
                    key={v.sku}
                    onClick={() => !isOut && setSelectedVariant(v)}
                    disabled={isOut}
                    aria-label={`Size ${v.size}${isOut ? ' — sold out' : ''}`}
                    aria-pressed={isSelected}
                    className={`inline-flex h-10 min-w-[44px] items-center justify-center rounded-lg border px-3 text-xs font-black uppercase transition-all ${
                      isOut
                        ? 'cursor-not-allowed border-neutral-200 bg-neutral-100 text-neutral-400 line-through'
                        : isSelected
                          ? 'border-black bg-black text-white shadow-xs'
                          : 'border-neutral-300 bg-white text-neutral-800 hover:border-black'
                    }`}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Garment & Craft Specs */}
          <dl className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 text-xs divide-y divide-neutral-200">
            {product.embroidery?.techniqueLabel && (
              <div className="flex justify-between py-1.5 first:pt-0">
                <dt className="font-semibold text-neutral-600">Embroidery Craft</dt>
                <dd className="font-bold text-neutral-900">{product.embroidery.techniqueLabel}</dd>
              </div>
            )}
            {artisanHours != null && artisanHours > 0 && (
              <div className="flex justify-between py-1.5">
                <dt className="font-semibold text-neutral-600">Hand-Guided Work</dt>
                <dd className="font-mono font-bold text-neutral-900">{artisanHours} artisan hours</dd>
              </div>
            )}
            {product.fabricGsm != null && (
              <div className="flex justify-between py-1.5 last:pb-0">
                <dt className="font-semibold text-neutral-600">Heavyweight Cloth</dt>
                <dd className="font-mono font-bold text-neutral-900">{product.fabricGsm} GSM Indian Cotton</dd>
              </div>
            )}
          </dl>

          {/* Action CTAs */}
          <div className="mt-6 pt-2 space-y-2">
            <button
              onClick={handleAdd}
              disabled={!currentVariant || currentVariant.status === 'out-of-stock'}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-black text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-neutral-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
            >
              <span>{currentVariant?.status === 'out-of-stock' ? 'Sold Out in this Size' : 'Add to Bag'}</span>
              {currentVariant?.status !== 'out-of-stock' && <span aria-hidden="true">→</span>}
            </button>

            {product.customizable && (
              <button
                onClick={() => {
                  closeQuickView();
                  openCustomizer(product);
                }}
                className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white text-xs font-bold uppercase tracking-wider text-neutral-800 hover:border-black hover:text-black transition-colors"
              >
                <span>🧵 Add Bespoke Monogram (Free)</span>
              </button>
            )}

            <Link
              to={`/product/${product.slug}`}
              onClick={closeQuickView}
              className="block text-center text-xs font-bold text-neutral-500 hover:text-black underline underline-offset-4 pt-1 transition-colors"
            >
              View full size measurements &amp; craft breakdown →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
