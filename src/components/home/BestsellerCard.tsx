import React, { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { formatPrice, getDefaultVariant, type Product } from '../../lib/data';
import { catalogMrp } from '../../lib/pricing';
import { useCartStore } from '../../stores/cart';
import { useQuickViewStore } from '../../stores/quickView';
import { useWishlistStore } from '../../stores/wishlist';
import { useToastStore } from '../../stores/toast';

function Stars({ rating }: { rating: number }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5 text-gold-deep" role="img" aria-label={`Rated ${rating} out of 5`}>
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
 * compare-at + computed %OFF, hover Quick-View overlay with
 * size chips + Add to Cart. No colour option — sizes only.
 */
const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', 'OS'];

export const BestsellerCard: React.FC<{ product: Product; universeName?: string }> = ({
  product,
  universeName,
}) => {
  const defaultVariant = getDefaultVariant(product);
  const addItem = useCartStore((s) => s.addItem);
  const openQuickView = useQuickViewStore((s) => s.openQuickView);
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const showToast = useToastStore((s) => s.showToast);

  const sizes = useMemo(() => {
    const unique = [...new Set(product.variants.map((v) => v.size))];
    return unique.sort((a, b) => {
      const ia = SIZE_ORDER.indexOf(a);
      const ib = SIZE_ORDER.indexOf(b);
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [product]);

  const inStockSizes = useMemo(
    () => new Set(product.variants.filter((v) => v.status !== 'out-of-stock').map((v) => v.size)),
    [product],
  );
  const [size, setSize] = useState<string>(
    sizes.find((s) => inStockSizes.has(s)) ?? sizes[0] ?? 'M',
  );
  const isWish = isWishlisted(product.slug);

  const currentVariant = useMemo(() => {
    return (
      product.variants.find((v) => v.size === size && v.status !== 'out-of-stock') ??
      product.variants.find((v) => v.size === size) ??
      defaultVariant
    );
  }, [product, size, defaultVariant]);

  // One rule for the whole card: the markdown must belong to the variant being
  // sold (not borrowed from the default variant) and must still be live. The
  // `?? defaultVariant` fallback below was how an expired or different-size
  // markdown ended up on this card's price.
  const mrp = catalogMrp(currentVariant);
  const compareAt = mrp?.mrpCents ?? null;
  const offPct = mrp?.offPercent ?? 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (currentVariant.status === 'out-of-stock') {
      showToast({ title: 'Sold out', description: `${product.name} is currently sold out in size ${size}.`, type: 'info' });
      return;
    }
    addItem(product.slug, currentVariant.sku, 1, undefined, currentVariant.quantity ?? 99);
    showToast({
      title: 'Added to Atelier Bag',
      description: `${product.name} (size ${currentVariant.size})`,
      type: 'success',
    });
  };

  return (
    <div
      className="group relative flex flex-col bg-paper border border-stone/70 shadow-xs transition-all duration-500 hover:shadow-xl hover:border-stone0 hover:-translate-y-1 w-[220px] sm:w-[280px] lg:w-[300px] shrink-0 snap-start"
    >
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
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-gold text-on-gold text-xs font-sans tracking-wide px-3 py-1.5">
            <span aria-hidden="true">🔥</span> Bestseller{universeName ? ` in ${universeName}` : ''}
          </span>
        )}

        <button
          onClick={() => toggleWishlist(product.slug)}
          aria-label={isWish ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
          aria-pressed={isWish}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full bg-panel-raised flex items-center justify-center transition-colors ${
            isWish ? 'text-red-700' : 'text-ink'
          } hover:text-red-700`}
        >
          <svg className="w-5 h-5" fill={isWish ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Hover / focus Quick-View overlay — compact integrated capsule */}
        <div className="absolute inset-x-2.5 sm:inset-x-3 bottom-2.5 sm:bottom-3 flex flex-col opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all duration-300 z-10 filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.18)] pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
          {/* Quick View top bar */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openQuickView(product);
            }}
            aria-label={`Quick view ${product.name}`}
            className="w-full flex items-center justify-center gap-2 bg-coal-glass/85 hover:bg-coal-glass/95 backdrop-blur-md text-white py-2 min-h-[44px] font-serif text-sm sm:text-sm tracking-wide transition-colors"
          >
            <svg className="w-4 h-4 shrink-0 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
              <circle cx="12" cy="12" r="3" strokeWidth="1.5" />
            </svg>
            <span>Quick View</span>
          </button>

          {/* Size selection & Add to Cart — crisp white floating surface */}
          <div className="bg-panel p-2.5 sm:p-3 border-x border-b border-black/[0.04]">
            <div className="grid grid-flow-col auto-cols-fr gap-1.5" role="group" aria-label="Choose size">
              {sizes.map((s) => {
                const available = inStockSizes.has(s);
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={!available}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSize(s);
                    }}
                    aria-pressed={size === s}
                    aria-label={`Size ${s}${available ? '' : ', sold out'}`}
                    className={`min-h-[44px] min-w-[44px] px-1 text-xs sm:text-sm font-serif border transition-colors flex items-center justify-center ${
                      size === s
                        ? 'bg-panel-raised text-white border-transparent font-semibold'
                        : 'bg-panel border-stone-strong text-ink hover:border-accent'
                    } ${available ? '' : 'opacity-30 line-through cursor-not-allowed'}`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className={`w-full mt-2 min-h-[44px] py-2 font-serif text-sm sm:text-sm transition-colors flex items-center justify-center tracking-wide shadow-xs active:scale-[0.99] ${
                'bg-accent text-white hover:bg-accent-hover font-semibold'
              }`}
            >
              Add to Cart — {formatPrice(currentVariant.priceCents)}
            </button>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          {product.embroidery && (
            <span className="inline-block rounded-full text-xs font-serif text-ink bg-cream border border-stone/70 px-3 py-1">
              {product.embroidery.techniqueLabel}
            </span>
          )}
          {product.handcrafted && (
            <span className="inline-flex items-center gap-1.5 rounded-full text-xs font-serif text-gold-deep border border-gold-deep/50 px-3 py-1">
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-gold-deep" />
              Handcrafted
            </span>
          )}
        </div>
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-serif text-xl text-ink mt-2 hover:text-gold-deep transition-colors">{product.name}</h3>
        </Link>
        <p className="text-xs text-ink-muted mt-0.5">
          {product.fit ? `${product.fit} | ` : ''}{product.fabricGsm ?? ''}
        </p>
        {product.rating !== undefined && (
          <p className="flex items-center gap-1.5 mt-1.5 text-sm text-ink">
            <Stars rating={product.rating} />
            <span className="font-medium">{product.rating.toFixed(1)}</span>
            {product.reviewCount !== undefined && (
              <span className="text-ink-muted">({product.reviewCount})</span>
            )}
          </p>
        )}
        <p className="flex items-baseline gap-2 mt-1.5">
          {/* Tracks the selected size chip like the CTA below it. Pinned to
              defaultVariant this read one price while "Add to Cart —" read
              another for the same card. */}
          <span className="font-serif text-2xl text-ink">{formatPrice(currentVariant.priceCents)}</span>
          {compareAt && compareAt > currentVariant.priceCents && (
            <>
              <span className="text-sm text-ink-muted line-through">{formatPrice(compareAt)}</span>
              <span
                className={`text-xs font-sans px-1.5 py-0.5 ${
                  'font-semibold text-success bg-success/10'
                }`}
              >
                ({offPct}% off)
              </span>
            </>
          )}
        </p>
        {product.artStyleSlug && (
          <p className="text-xs uppercase tracking-widest text-ink-muted mt-2">
            {product.artStyleSlug.replace(/-/g, ' ')}
          </p>
        )}
      </div>
    </div>
  );
};
