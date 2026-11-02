import React from 'react';
import { Link } from 'react-router';
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

/**
 * ONE LINE IN THE BAG
 *
 * Photograph, name, size, price. The technique label stays because it is the
 * reason the price is what it is; the "Bespoke Embroidery" ribbon renders only
 * for pieces that actually carry a monogram, with the thread the customer
 * chose rather than a "Gold Zari" default.
 */
export const CartLineItem: React.FC<CartLineItemProps> = ({
  line,
  priced,
  onUpdateQuantity,
  onRemove,
}) => {
  const { product, variant, quantity, lineTotalCents, customization } = line;

  // Strike-through and "% off" come from the quote, never from arithmetic on
  // the selling price.
  const mrpCents = priced ? lineMrpCents(priced) : null;
  const discountPercent = priced ? lineDiscountPercent(priced) : null;
  const maxQty = variant.quantity ?? 99;

  return (
    <div className="flex gap-3.5 border-b border-stone py-4">
      <Link
        to={`/product/${product.slug}`}
        className="shrink-0"
        aria-label={product.name}
      >
        <div className="h-[88px] w-[66px] overflow-hidden bg-panel">
          <Image
            src={product.images[0]?.src || '/images/placeholders/hero.jpg'}
            alt={product.images[0]?.alt || product.name}
            aspectRatio="3/4"
            fit="cover"
            className="h-full w-full"
          />
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/product/${product.slug}`}
              className="block font-sans text-[13px] font-medium leading-snug text-ink transition-colors hover:text-accent"
            >
              {product.name}
            </Link>
            <p className="mt-0.5 font-sans text-[12px] text-ink-muted">
              Size <span className="text-ink">{variant.size}</span>
              {product.embroidery?.techniqueLabel && (
                <>
                  <span aria-hidden="true"> · </span>
                  {product.embroidery.techniqueLabel}
                </>
              )}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <span className="loom-price block text-[13px] text-ink">
              {formatPrice(lineTotalCents)}
            </span>
            {mrpCents != null && mrpCents > lineTotalCents && (
              <span className="mt-0.5 flex items-baseline justify-end gap-1.5">
                <span className="loom-price text-[11px] text-ink-muted line-through">
                  {formatPrice(mrpCents)}
                </span>
                {discountPercent != null && discountPercent > 0 && (
                  <span className="font-sans text-[10px] text-accent">{discountPercent}%</span>
                )}
              </span>
            )}
          </div>
        </div>

        {customization?.monogramText && (
          <p className="mt-1.5 font-sans text-[11px] text-ink-muted">
            Monogram “{customization.monogramText}”
            {customization.threadColor ? ` · ${customization.threadColor}` : ''}
            {customization.placement ? ` · ${customization.placement}` : ''}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="inline-flex items-center border border-stone">
            <button
              type="button"
              onClick={() => onUpdateQuantity(line.id, quantity - 1, maxQty)}
              aria-label={`Decrease quantity of ${product.name}`}
              className="flex h-11 w-10 items-center justify-center text-ink transition-colors hover:text-accent"
            >
              –
            </button>
            <span className="w-6 text-center font-sans text-[12px] text-ink" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(line.id, quantity + 1, maxQty)}
              aria-label={`Increase quantity of ${product.name}`}
              disabled={quantity >= maxQty}
              className="flex h-11 w-10 items-center justify-center text-ink transition-colors hover:text-accent disabled:opacity-40"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(line.id)}
            className="min-h-[44px] font-sans text-[11px] uppercase tracking-[0.12em] text-ink-muted transition-colors hover:text-error"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};
