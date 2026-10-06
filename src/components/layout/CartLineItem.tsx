import React from 'react';
import type { CartLine } from '../../lib/data';
import { formatPrice } from '../../lib/data';
import { Image } from '../ui/Image';

interface CartLineItemProps {
  line: CartLine;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export const CartLineItem: React.FC<CartLineItemProps> = ({
  line,
  onUpdateQuantity,
  onRemove,
}) => {
  const { product, variant, quantity, lineTotalCents, customization } = line;

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
            {variant.color} / {variant.size}
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
              onClick={() => onUpdateQuantity(line.id, quantity - 1)}
              aria-label="Decrease quantity"
              className="w-7 h-7 flex items-center justify-center text-xs text-ink hover:bg-stone/30 transition-colors"
            >
              −
            </button>
            <span className="w-8 text-center text-xs font-sans font-medium text-ink">
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(line.id, quantity + 1)}
              aria-label="Increase quantity"
              className="w-7 h-7 flex items-center justify-center text-xs text-ink hover:bg-stone/30 transition-colors"
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
