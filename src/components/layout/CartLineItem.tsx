import React from 'react';
import { Link } from 'react-router';
import type { CartLine } from '../../lib/data';
import { formatPrice } from '../../lib/data';
import { Image } from '../ui/Image';
import { lineMrpCents, lineDiscountPercent, type PricedLine } from '../../lib/pricing';

interface CartLineItemProps {
  line: CartLine;
  /** The server's priced view of this line. Absent while the quote loads. */
  priced?: PricedLine;
  onUpdateQuantity: (id: string, qty: number, max?: number) => void;
  onRemove: (id: string) => void;
}

/**
 * ONE LINE IN THE BAG — Streetwear D2C Revamp
 *
 * 3:4 image plate, bold product name, size/craft badge, quantity stepper,
 * crimson sale price, strikethrough MRP, and one-tap remove.
 */
export const CartLineItem: React.FC<CartLineItemProps> = ({
  line,
  priced,
  onUpdateQuantity,
  onRemove,
}) => {
  const { product, variant, quantity, lineTotalCents, customization } = line;

  const mrpCents = priced ? lineMrpCents(priced) : null;
  const discountPercent = priced ? lineDiscountPercent(priced) : null;
  const maxQty = variant.quantity ?? 99;

  return (
    <div className="flex gap-3.5 border-b border-neutral-100 py-4.5 last:border-b-0">
      {/* 3:4 Image Plate */}
      <Link
        to={`/product/${product.slug}`}
        className="group relative h-24 w-18 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100"
        aria-label={product.name}
      >
        <Image
          src={product.images[0]?.src || '/images/placeholders/hero.jpg'}
          alt={product.images[0]?.alt || product.name}
          aspectRatio="3/4"
          fit="cover"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Item Details */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/product/${product.slug}`}
              className="line-clamp-2 text-xs font-black uppercase tracking-tight text-neutral-900 transition-colors hover:text-red-600"
            >
              {product.name}
            </Link>

            {/* Remove Button */}
            <button
              type="button"
              onClick={() => onRemove(line.id)}
              className="-mr-1.5 -mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-red-600"
              aria-label={`Remove ${product.name} from bag`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>

          {/* Badges / Variants */}
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-bold uppercase text-neutral-800">
              Size: {variant.size}
            </span>
            {product.embroidery?.techniqueLabel && (
              <span className="rounded bg-neutral-100 px-1.5 py-0.5 font-medium text-neutral-600">
                {product.embroidery.techniqueLabel}
              </span>
            )}
          </div>

          {/* Bespoke Monogram Preview */}
          {customization?.monogramText && (
            <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-200">
              <span>🧵 Monogram: &ldquo;{customization.monogramText}&rdquo;</span>
              {customization.threadColor && <span>· {customization.threadColor}</span>}
            </div>
          )}
        </div>

        {/* Bottom Row: Stepper & Price */}
        <div className="mt-3 flex items-center justify-between pt-1">
          {/* Stepper */}
          <div className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 shadow-2xs">
            <button
              type="button"
              onClick={() => onUpdateQuantity(line.id, quantity - 1, maxQty)}
              aria-label={`Decrease quantity of ${product.name}`}
              className="flex h-8 w-8 items-center justify-center text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-200 hover:text-black active:scale-95"
            >
              −
            </button>
            <span className="w-7 text-center font-mono text-xs font-bold text-neutral-900" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(line.id, quantity + 1, maxQty)}
              aria-label={`Increase quantity of ${product.name}`}
              disabled={quantity >= maxQty}
              className="flex h-8 w-8 items-center justify-center text-sm font-bold text-neutral-700 transition-colors hover:bg-neutral-200 hover:text-black active:scale-95 disabled:opacity-30"
            >
              +
            </button>
          </div>

          {/* Pricing Stack */}
          <div className="text-right">
            <span className="font-mono text-sm font-black text-[#D32F2F]">
              {formatPrice(lineTotalCents)}
            </span>
            {mrpCents != null && mrpCents > lineTotalCents && (
              <div className="flex items-center justify-end gap-1.5">
                <span className="font-mono text-[11px] text-neutral-400 line-through">
                  {formatPrice(mrpCents)}
                </span>
                {discountPercent != null && discountPercent > 0 && (
                  <span className="rounded bg-red-100 px-1 py-0.2 text-[9px] font-black text-red-600">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
