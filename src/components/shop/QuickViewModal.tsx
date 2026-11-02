import React, { useState } from 'react';
import { Link } from 'react-router';
import { useQuickViewStore } from '../../stores/quickView';
import { useCartStore } from '../../stores/cart';
import { useCustomizerStore } from '../../stores/customizer';
import { useToastStore } from '../../stores/toast';
import { formatPrice, getDefaultVariant, type ProductVariant } from '../../lib/data';
import { orderedVariants } from '../../lib/sizes';
import { Image } from '../ui/Image';
import { useDialogFocus } from '../../hooks/useDialogFocus';

/**
 * QUICK VIEW
 *
 * The grid's eye button opens this. What it used to say, and no longer does:
 *
 *  · "Complimentary Shipping" beneath a ₹899 price. Carriage is ₹99 and free
 *    only above ₹1,499 — the quote's own rule.
 *  · A "✦ 3x Macro Stitch View" badge on the second photograph. No image in the
 *    catalogue is a calibrated macro, so the badge was a claim about resolution
 *    the assets do not support.
 *  · "{n}h embroidery" from `embroidery.artisanHours`, which is null on 28 of
 *    29 products — so it either printed nothing or printed the one recorded
 *    figure as though it were the norm.
 *
 * It also carried a blurred backdrop, rounded surfaces and a serif product
 * name. Those are gone: this is now the same plate-and-label grammar as the
 * product page, at modal scale, with the price in mono and the one action.
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
      <div onClick={closeQuickView} className="fixed inset-0 bg-ink/70" aria-hidden="true" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={product.name}
        tabIndex={-1}
        className="relative z-10 flex max-h-[92svh] w-full max-w-4xl flex-col overflow-hidden border border-stone bg-paper sm:flex-row"
      >
        <button
          onClick={closeQuickView}
          aria-label="Close"
          className="absolute right-2 top-2 z-20 inline-flex h-11 w-11 items-center justify-center bg-paper text-ink transition-colors hover:text-accent"
        >
          <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Plate */}
        <div className="flex w-full flex-col border-b border-stone sm:w-1/2 sm:border-b-0 sm:border-r">
          <div className="flex min-h-[38svh] items-center justify-center bg-cream p-3">
            <Image
              src={product.images[activeImageIndex]?.src || product.images[0]?.src}
              alt={product.images[activeImageIndex]?.alt || product.name}
              aspectRatio="4/5"
              fit="contain"
              className="max-h-[52svh] w-full"
              lazy={false}
            />
          </div>

          <div className="hidden gap-2 overflow-x-auto border-t border-stone p-2.5 sm:flex">
            {product.images.map((img, idx) => (
              <button
                key={img.src}
                onClick={() => setActiveImageIndex(idx)}
                aria-label={`View image ${idx + 1} of ${product.images.length}`}
                aria-pressed={activeImageIndex === idx}
                className={`h-14 w-11 shrink-0 overflow-hidden border transition-colors ${
                  activeImageIndex === idx
                    ? 'border-ink'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img.src} alt={img.alt} className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>

        {/* Label */}
        <div className="flex w-full flex-col overflow-y-auto p-5 sm:w-1/2 sm:p-7">
          <p className="loom-label text-ink-muted">
            {product.universeSlug ?? 'The Atelier'}
            {product.craftTechniques?.[0] ? ` · ${product.craftTechniques[0].replace(/-/g, ' ')}` : ''}
          </p>

          <h2 className="loom-display mt-2 text-[1.5rem] text-ink">{product.name}</h2>

          <p className="mt-1.5 font-sans text-[13.5px] leading-relaxed text-ink-muted">
            {product.subtitle}
          </p>

          <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-stone pt-3">
            <span className="loom-price text-[1.25rem] text-ink">
              {currentVariant ? formatPrice(currentVariant.priceCents) : '—'}
            </span>
            <span className="font-sans text-[11.5px] text-ink-muted">
              Carriage ₹99, waived above ₹1,499
            </span>
          </div>

          <div className="mt-5">
            <p className="loom-label text-ink-muted">
              Size{' '}
              {currentVariant?.size && (
                <span className="ml-1 normal-case tracking-normal text-ink">
                  {currentVariant.size}
                </span>
              )}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
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
                    className={`inline-flex h-11 min-w-[44px] items-center justify-center border px-2 font-sans text-[13px] transition-colors ${
                      isOut
                        ? 'cursor-not-allowed border-stone text-warm-gray line-through'
                        : isSelected
                          ? 'border-ink bg-ink text-cream'
                          : 'border-stone-strong text-ink hover:border-ink'
                    }`}
                  >
                    {v.size}
                  </button>
                );
              })}
            </div>
          </div>

          <dl className="mt-5 border-t border-stone pt-3 font-sans text-[12.5px]">
            {product.embroidery?.techniqueLabel && (
              <div className="flex justify-between gap-4 py-1.5">
                <dt className="text-ink-muted">Technique</dt>
                <dd className="text-right text-ink">{product.embroidery.techniqueLabel}</dd>
              </div>
            )}
            {artisanHours != null && artisanHours > 0 && (
              <div className="flex justify-between gap-4 py-1.5">
                <dt className="text-ink-muted">Working time</dt>
                <dd className="loom-price text-right text-ink">{artisanHours} hours</dd>
              </div>
            )}
            {product.fabricGsm != null && (
              <div className="flex justify-between gap-4 py-1.5">
                <dt className="text-ink-muted">Cloth</dt>
                <dd className="loom-price text-right text-ink">{product.fabricGsm} GSM</dd>
              </div>
            )}
          </dl>

          <div className="mt-auto pt-6">
            <button
              onClick={handleAdd}
              disabled={!currentVariant || currentVariant.status === 'out-of-stock'}
              className="flex min-h-[48px] w-full items-center justify-center gap-2 bg-ink font-sans text-[12px] font-medium uppercase tracking-[0.12em] text-cream transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:bg-stone-strong"
            >
              {currentVariant?.status === 'out-of-stock' ? 'Sold out' : 'Add to bag'}
              <span aria-hidden="true">→</span>
            </button>

            {product.customizable && (
              <button
                onClick={() => {
                  closeQuickView();
                  openCustomizer(product);
                }}
                className="mt-2 flex min-h-[44px] w-full items-center justify-center border border-stone-strong font-sans text-[12px] uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink"
              >
                Add a monogram
              </button>
            )}

            <Link
              to={`/product/${product.slug}`}
              onClick={closeQuickView}
              className="mt-3 block text-center font-sans text-[12px] text-ink underline decoration-stone-strong underline-offset-4 transition-colors hover:decoration-ink"
            >
              Full details, cloth and measurements
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
