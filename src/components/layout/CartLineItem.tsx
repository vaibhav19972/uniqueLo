import React from 'react';
import type { CartLine } from '../../lib/data';
import { formatPrice } from '../../lib/data';
import { Image } from '../ui/Image';
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
  const { product, variant, quantity, lineTotalCents, customization } = line;

  // Strike-through and "% OFF" come from the quote, never from arithmetic on
  // the selling price. The previous version used `priceCents * 1.266` with a
  // `Math.max(10, ...)` floor, which showed a discount badge on every line
  // whether or not any discount existed.
  const mrpCents = priced ? lineMrpCents(priced) : null;
  const discountPercent = priced ? lineDiscountPercent(priced) : null;

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
            <div className="text-right shrink-0">
              <span className="block font-sans text-sm font-medium text-ink" data-numeric>
                {formatPrice(lineTotalCents)}
              </span>
              {/* Strike-through and % OFF come from the server's priced line,
                  so they can never disagree with what the bag charges. */}
              {mrpCents != null && mrpCents > lineTotalCents && (
                <span className="mt-0.5 flex items-center justify-end gap-1.5">
                  <span className="font-sans text-[11px] text-ink-muted line-through" data-numeric>
                    {formatPrice(mrpCents)}
                  </span>
                  {discountPercent != null && discountPercent > 0 && (
                    <span className="bg-accent-soft px-1 py-0.5 font-sans text-[10px] font-semibold text-accent">
                      {discountPercent}% off
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>

          <p className="mt-1 text-xs text-ink-muted">
            Size <span className="text-ink">{variant.size}</span>
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
