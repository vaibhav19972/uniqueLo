import React from 'react';
import type { CartLine } from '../../lib/data';
import { formatPrice } from '../../lib/data';
import { Image } from '../ui/Image';
import { useIsThemeV2 } from '../../config/theme';
import { useCartStore } from '../../stores/cart';
import { lineMrpCents, lineDiscountPercent, type PricedLine } from '../../lib/pricing';

interface CartLineItemProps {
  line: CartLine;
  /** The server's priced view of this line. Absent while the quote loads, in
   *  which case NO discount is shown — a missing number is better than an
   *  invented one. */
  priced?: PricedLine;
  onUpdateQuantity: (id: string, qty: number, max?: number) => void;
  onRemove: (id: string) => void;
}

export const CartLineItem: React.FC<CartLineItemProps> = ({
  line,
  priced,
  onUpdateQuantity,
  onRemove,
}) => {
  const isV2 = useIsThemeV2();
  const updateVariant = useCartStore((state) => state.updateVariant);
  const { product, variant, quantity, lineTotalCents, customization } = line;

  // Strike-through and "% OFF" come from the quote, never from arithmetic on
  // the selling price. The previous version used `priceCents * 1.266` with a
  // `Math.max(10, ...)` floor, which showed a discount badge on every line
  // whether or not any discount existed.
  const mrpCents = priced ? lineMrpCents(priced) : null;
  const discountPercent = priced ? lineDiscountPercent(priced) : null;

  if (isV2) {

    return (
      <div className="bg-white rounded-2xl p-4 border border-gray-200/90 shadow-sm mb-3.5 flex gap-3.5 transition-all text-gray-900">
        {/* Tall 3:4 thumbnail matching the sketch */}
        <div className="w-[76px] h-[100px] flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden relative border border-gray-100">
          <Image
            src={product.images[0]?.src || '/images/placeholders/hero.jpg'}
            alt={product.images[0]?.alt || product.name}
            aspectRatio="3/4"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content stack */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Title & Original Price */}
            <div className="flex justify-between items-start gap-2">
              <h4 className="font-sans font-medium text-[15px] text-gray-900 leading-snug line-clamp-1">
                {product.name}
              </h4>
              {mrpCents != null && (
                <span className="font-sans text-xs text-gray-400 line-through whitespace-nowrap">
                  {formatPrice(mrpCents)}
                </span>
              )}
            </div>

            {/* Size Dropdown Chip & Current Price */}
            <div className="flex justify-between items-center mt-1.5">
              <div className="relative">
                <select
                  value={variant.sku}
                  onChange={(e) => updateVariant(line.id, e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-md pl-2.5 pr-6 py-0.5 text-xs font-sans font-medium text-gray-800 cursor-pointer hover:border-gray-500 focus:outline-none focus:ring-1 focus:ring-black"
                >
                  {product.variants.map((v) => (
                    <option key={v.sku} value={v.sku} disabled={v.status === 'out-of-stock'}>
                      {v.size} {v.status === 'out-of-stock' ? '(Out)' : ''}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]">
                  ⌄
                </span>
              </div>

              {/* LINE total, not unit price. At qty 2 this must read the priced
                  line (2 x unit), matching what the footer and the server charge.
                  V1 below already did this; V2 rendered one unit beside a stepper
                  reading 2. */}
              <span className="font-sans font-bold text-base text-gray-900">
                {formatPrice(priced ? priced.line_total_cents : lineTotalCents)}
              </span>
            </div>

            {/* Discount tag — only when the server says there is one. */}
            {discountPercent != null && (
              <div className="flex justify-end mt-0.5">
                <span className="font-sans font-bold text-xs text-emerald-600">
                  ({discountPercent}% OFF)
                </span>
              </div>
            )}
          </div>

          {/* Stepper & Trash Icon */}
          <div className="flex justify-end items-center gap-3 mt-2.5">
            <div className="inline-flex items-center bg-[#f3f4f6] rounded-md px-2 py-0.5 gap-2.5 font-sans text-xs font-semibold text-gray-800">
              <button
                type="button"
                onClick={() => onUpdateQuantity(line.id, quantity - 1, variant.quantity ?? 99)}
                aria-label="Decrease quantity"
                className="w-5 h-6 flex items-center justify-center text-gray-600 hover:text-black font-bold text-sm transition-colors cursor-pointer"
              >
                −
              </button>
              <span className="w-4 text-center font-bold text-xs text-gray-900" aria-live="polite">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(line.id, quantity + 1, variant.quantity ?? 99)}
                aria-label="Increase quantity"
                disabled={variant.quantity != null && quantity >= variant.quantity}
                className="w-5 h-6 flex items-center justify-center text-gray-600 hover:text-black font-bold text-sm transition-colors disabled:opacity-40 cursor-pointer"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={() => onRemove(line.id)}
              aria-label="Delete item"
              className="p-1.5 text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 py-4 border-b border-stone/60 group">
      {/* Thumbnail */}
      <div className="w-20 h-24 flex-shrink-0 bg-stone/20 overflow-hidden relative">
        <Image
          src={product.images[0]?.src || '/images/placeholders/hero.jpg'}
          alt={product.images[0]?.alt || product.name}
          aspectRatio="3/4"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2">
            <h4 className="text-sm font-serif font-medium text-ink leading-tight">
              {product.name}
            </h4>
            <span className="text-sm font-sans font-medium text-ink">
              {formatPrice(lineTotalCents)}
            </span>
          </div>

          <p className="text-xs text-ink-muted mt-1">
            Size {variant.size}
          </p>

          {/* Bespoke Monogram details if present */}
          {customization?.monogramText && (
            <div className="mt-1.5 px-2 py-1 bg-cream border border-stone/80 text-[10px] text-ink-muted">
              <span className="font-semibold text-accent uppercase tracking-wider">
                Bespoke Embroidery:
              </span>{' '}
              "{customization.monogramText}" ({customization.threadColor || 'Gold Zari'} · {customization.placement || 'Left Chest'})
            </div>
          )}

          {product.embroidery && (
            <p className="text-[10px] text-accent font-medium tracking-wide mt-1">
              {product.embroidery.techniqueLabel}
            </p>
          )}
        </div>

        {/* Quantity Controls and Remove */}
        <div className="flex items-center justify-between pt-2">
          <div className="inline-flex items-center border border-stone">
            <button
              onClick={() => onUpdateQuantity(line.id, quantity - 1, variant.quantity ?? 99)}
              aria-label="Decrease quantity"
              className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center text-xs text-ink hover:bg-stone/30 transition-colors"
            >
              −
            </button>
            <span className="w-8 text-center text-xs font-sans font-medium text-ink" aria-live="polite">
              {quantity}
              {variant.quantity != null && (
                <span className="block text-[9px] text-ink-muted font-normal">of {variant.quantity}</span>
              )}
            </span>
            <button
              onClick={() => onUpdateQuantity(line.id, quantity + 1, variant.quantity ?? 99)}
              aria-label="Increase quantity"
              disabled={variant.quantity != null && quantity >= variant.quantity}
              className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center text-xs text-ink hover:bg-stone/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>

          <button
            onClick={() => onRemove(line.id)}
            className="text-xs text-ink-muted hover:text-error transition-colors uppercase tracking-wider font-light"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};
