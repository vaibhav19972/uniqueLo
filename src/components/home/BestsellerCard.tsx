import React, { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { formatPrice, getDefaultVariant, type Product } from '../../lib/data';
import { useCartStore } from '../../stores/cart';
import { useQuickViewStore } from '../../stores/quickView';
import { useWishlistStore } from '../../stores/wishlist';
import { useToastStore } from '../../stores/toast';

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5 text-gold" role="img" aria-label={`Rated ${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} aria-hidden="true" className={i < full ? '' : 'opacity-30'}>
          ★
        </span>
      ))}
    </span>
  );
}

/**
 * Render-05 product card: ribbon, technique tag, fit+GSM, stars, price +
 * compare-at + computed %OFF, color dots, hover Quick-View overlay with
 * size chips + Add to Cart.
 */
export const BestsellerCard: React.FC<{ product: Product; universeName?: string }> = ({
  product,
  universeName,
}) => {
  const defaultVariant = getDefaultVariant(product);
  const addItem = useCartStore((s) => s.addItem);
  const openQuickView = useQuickViewStore((s) => s.openQuickView);
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const showToast = useToastStore((s) => s.showToast);

  const sizes = useMemo(() => [...new Set(product.variants.map((v) => v.size))], [product]);
  const colors = useMemo(() => {
    const seen = new Map<string, string>();
    for (const v of product.variants) {
      if (!seen.has(v.color)) seen.set(v.color, v.colorHex);
    }
    return [...seen.entries()];
  }, [product]);

  const inStockSizes = useMemo(
    () => new Set(product.variants.filter((v) => v.status !== 'out-of-stock').map((v) => v.size)),
    [product],
  );
  const [size, setSize] = useState<string>(
    sizes.find((s) => inStockSizes.has(s)) ?? sizes[0] ?? 'M',
  );
  const isWish = isWishlisted(product.slug);

  const compareAt = defaultVariant.compareAtPriceCents;
  const offPct =
    compareAt && compareAt > defaultVariant.priceCents
      ? Math.round((1 - defaultVariant.priceCents / compareAt) * 100)
      : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const variant =
      product.variants.find((v) => v.size === size && v.status !== 'out-of-stock') ?? defaultVariant;
    if (variant.status === 'out-of-stock') {
      showToast({ title: 'Sold out', description: `${product.name} is currently sold out.`, type: 'info' });
      return;
    }
    addItem(product.slug, variant.sku, 1, undefined, variant.quantity ?? 99);
    showToast({
      title: 'Added to Atelier Bag',
      description: `${product.name} (${variant.color} / ${variant.size})`,
      type: 'success',
    });
  };

  return (
    <div className="group relative flex flex-col bg-paper border border-stone/70 transition-shadow duration-500 hover:shadow-xl w-[270px] sm:w-[300px] shrink-0 snap-start">
      {/* Visual */}
      <div className="relative aspect-[3/4] overflow-hidden bg-stone/20">
        <Link to={`/product/${product.slug}`} aria-label={product.name}>
          <img
            src={product.images[0]?.src}
            alt={product.images[0]?.alt || product.name}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </Link>

        {product.featured && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-gold text-cream text-[11px] font-sans tracking-wide px-3 py-1.5">
            <span aria-hidden="true">🔥</span> Bestseller{universeName ? ` in ${universeName}` : ''}
          </span>
        )}

        <button
          onClick={() => toggleWishlist(product.slug)}
          aria-label={isWish ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={isWish}
          className="absolute top-3 right-3 w-11 h-11 rounded-full bg-paper/90 flex items-center justify-center text-ink hover:text-gold transition-colors"
        >
          <svg className="w-5 h-5" fill={isWish ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Hover / focus Quick-View overlay */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-300 bg-paper/95 backdrop-blur border border-stone/60 p-3">
          <button
            onClick={() => openQuickView(product)}
            className="w-full text-center font-serif text-[16px] text-ink py-1.5 min-h-[44px]"
          >
            👁 Quick View
          </button>
          <div className="flex items-center justify-center gap-1.5 mt-1" role="group" aria-label="Choose size">
            {sizes.map((s) => {
              const available = inStockSizes.has(s);
              return (
                <button
                  key={s}
                  disabled={!available}
                  onClick={() => setSize(s)}
                  aria-pressed={size === s}
                  aria-label={`Size ${s}${available ? '' : ', sold out'}`}
                  className={`min-w-[36px] min-h-[36px] px-1.5 text-xs border transition-colors ${
                    size === s ? 'bg-gold text-cream border-transparent' : 'border-stone text-ink hover:border-ink'
                  } ${available ? '' : 'opacity-30 line-through'}`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <button
            onClick={handleAdd}
            className="w-full mt-2 bg-gold text-cream font-serif text-[16px] py-2.5 min-h-[44px] hover:bg-gold-hover transition-colors"
          >
            Add to Cart — {formatPrice(defaultVariant.priceCents)}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        {product.embroidery && (
          <span className="inline-block text-[10px] uppercase tracking-[0.18em] text-ink-muted bg-cream border border-stone/70 px-2.5 py-1">
            {product.embroidery.techniqueLabel}
          </span>
        )}
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-serif text-xl text-ink mt-2 hover:text-gold transition-colors">{product.name}</h3>
        </Link>
        <p className="text-xs text-ink-muted mt-0.5">
          {product.fit ? `${product.fit} | ` : ''}{product.fabricGsm ?? ''}
        </p>
        {product.rating !== undefined && (
          <p className="flex items-center gap-1.5 mt-1.5 text-[13px] text-ink">
            <Stars rating={product.rating} />
            <span className="font-medium">{product.rating.toFixed(1)}</span>
            {product.reviewCount !== undefined && (
              <span className="text-ink-muted">({product.reviewCount})</span>
            )}
          </p>
        )}
        <p className="flex items-baseline gap-2 mt-1.5">
          <span className="font-serif text-2xl text-ink">{formatPrice(defaultVariant.priceCents)}</span>
          {compareAt && compareAt > defaultVariant.priceCents && (
            <>
              <span className="text-sm text-ink-muted line-through">{formatPrice(compareAt)}</span>
              <span className="text-[11px] font-sans bg-gold/15 text-gold px-1.5 py-0.5">{offPct}% OFF</span>
            </>
          )}
        </p>
        {colors.length > 0 && (
          <div className="flex items-center gap-2 mt-2.5" aria-label="Available colors">
            {colors.map(([name, hex]) => (
              <span
                key={name}
                title={name}
                className="w-5 h-5 rounded-full border border-ink/20"
                style={{ backgroundColor: hex }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
