import React from 'react';
import type { CartLine } from '../../lib/data';
import { formatPrice } from '../../lib/data';
import { Image } from '../ui/Image';
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
  const updateVariant = useCartStore((state) => state.updateVariant);
  const { product, variant, quantity, lineTotalCents, customization } = line;

  // Strike-through and "% OFF" come from the quote, never from arithmetic on
  // the selling price. A missing number is better than an invented one.
  const mrpCents = priced ? lineMrpCents(priced) : null;
  const discountPercent = priced ? lineDiscountPercent(priced) : null;

  return (
    <article className="mb-3 flex gap-3.5 rounded-xl border border-stone bg-panel p-4">
      <div className="relative h-25 w-19 shrink-0 overflow-hidden rounded-lg bg-panel-raised">
        <Image
          src={product.images[0]?.src || '/images/placeholders/hero.jpg'}
          alt={product.images[0]?.alt || product.name}
          aspectRatio="3/4"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h4 className="line-clamp-1 text-sm font-medium leading-snug text-ink">
              {product.name}
            </h4>
            {mrpCents != null && (
              <span className="whitespace-nowrap text-xs text-ink-muted line-through" data-numeric>
                {formatPrice(mrpCents)}
              </span>
            )}
          </div>

          {/* Size selector — the label is the control, so it needs a visible
              focus ring and a 44px hit target. */}
          <div className="mt-2 flex items-center justify-between">
            <label className="sr-only" htmlFor={`size-${line.id}`}>
              Size for {product.name}
            </label>
            <div className="relative">
              <select
                id={`size-${line.id}`}
                value={variant.sku}
                onChange={(e) => updateVariant(line.id, e.target.value)}
                className="min-h-9 cursor-pointer appearance-none rounded-md border border-stone-strong bg-panel-raised py-1 pl-2.5 pr-7 text-xs font-medium text-ink transition-colors hover:border-ink-muted"
              >
                {product.variants.map((v) => (
                  <option key={v.sku} value={v.sku} disabled={v.status === 'out-of-stock'}>
                    {v.size} {v.status === 'out-of-stock' ? '(Out)' : ''}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-ink-muted">
                ⌄
              </span>
            </div>

            {/* LINE total, not unit price: at qty 2 this must read the priced
                line (2 × unit), matching what the footer and the server charge. */}
            <span className="text-base font-semibold text-ink" data-numeric>
              {formatPrice(priced ? priced.line_total_cents : lineTotalCents)}
            </span>
          </div>

          {customization?.monogramText && (
            <p className="mt-2 text-xs text-ink-muted">
              <span className="font-medium text-accent">Bespoke embroidery:</span>{' '}
              {customization.monogramText} ({customization.threadColor || 'Gold Zari'} ·{' '}
              {customization.placement || 'Left chest'})
            </p>
          )}

          {product.embroidery && (
            <p className="mt-1 text-xs font-medium tracking-label text-accent">
              {product.embroidery.techniqueLabel}
            </p>
          )}

          {discountPercent != null && (
            <p className="mt-1 text-xs font-medium text-success" data-numeric>
              {discountPercent}% off
            </p>
          )}
        </div>

        <div className="mt-3 flex items-center justify-end gap-3">
          <div className="inline-flex items-center gap-2.5 rounded-md bg-panel-raised px-2 py-0.5 text-xs font-semibold text-ink">
            <button
              type="button"
              onClick={() => onUpdateQuantity(line.id, quantity - 1, variant.quantity ?? 99)}
              aria-label="Decrease quantity"
              className="flex h-7 w-6 items-center justify-center text-ink-muted transition-colors hover:text-ink"
            >
              −
            </button>
            <span className="w-4 text-center text-xs font-semibold text-ink" aria-live="polite" data-numeric>
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(line.id, quantity + 1, variant.quantity ?? 99)}
              aria-label="Increase quantity"
              disabled={variant.quantity != null && quantity >= variant.quantity}
              className="flex h-7 w-6 items-center justify-center text-ink-muted transition-colors hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => onRemove(line.id)}
            aria-label={`Remove ${product.name} from bag`}
            className="p-1.5 text-ink-muted transition-colors hover:text-error"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </article>
  );
};
