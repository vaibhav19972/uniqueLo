import React, { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { formatPrice, getDefaultVariant, getIntensity, type Product } from '../../lib/data';
import { catalogMrp } from '../../lib/pricing';
import { useCartStore } from '../../stores/cart';
import { useQuickViewStore } from '../../stores/quickView';
import { useWishlistStore } from '../../stores/wishlist';
import { useToastStore } from '../../stores/toast';
import { Image } from '../ui/Image';
import { sortSizes } from '../../lib/sizes';

const INTENSITY_COPY: Record<string, string> = {
  quiet: 'Quiet',
  balanced: 'Balanced',
  loud: 'Loud',
};

/**
 * The rail card. Same grammar as the grid card — photograph, name, technique,
 * price — with one addition that only makes sense in a rail: the size chips
 * stay on the card, because a horizontal scroll is a browsing gesture and
 * forcing a PDP visit to pick a size breaks it.
 *
 * Ratings render only when the catalog actually carries them. The seed data
 * does not, so no star row appears; a fabricated 4.8 next to a real price is
 * exactly the dishonesty PRODUCT.md rules out.
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

  const sizes = useMemo(() => {
    return sortSizes([...new Set(product.variants.map((v) => v.size))]);
  }, [product]);

  const inStockSizes = useMemo(
    () => new Set(product.variants.filter((v) => v.status !== 'out-of-stock').map((v) => v.size)),
    [product],
  );
  const [size, setSize] = useState<string>(
    sizes.find((s) => inStockSizes.has(s)) ?? sizes[0] ?? 'M',
  );
  const isWish = isWishlisted(product.slug);

  const currentVariant = useMemo(
    () =>
      product.variants.find((v) => v.size === size && v.status !== 'out-of-stock') ??
      product.variants.find((v) => v.size === size) ??
      defaultVariant,
    [product, size, defaultVariant],
  );

  // The markdown must belong to the variant being sold (not borrowed from the
  // default variant) and must still be live.
  const mrp = catalogMrp(currentVariant);
  const compareAt = mrp?.mrpCents ?? null;
  const offPct = mrp?.offPercent ?? 0;
  const soldOut = currentVariant.status === 'out-of-stock';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) {
      showToast({
        title: 'Sold out',
        description: `${product.name} is currently sold out in size ${size}.`,
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
  };

  return (
    <div className="group flex w-[228px] shrink-0 flex-col border border-stone bg-paper sm:w-[264px] lg:w-[288px]">
      <div className="relative aspect-[3/4] overflow-hidden bg-paper">
        <Link to={`/product/${product.slug}`} aria-label={product.name} className="block h-full w-full">
          <Image
            src={product.images[0]?.src ?? ''}
            alt={product.images[0]?.alt || product.name}
            aspectRatio="3/4"
            fit="contain"
            className="h-full w-full transition-transform duration-500 ease-[var(--ease-base)] group-hover:scale-[1.02]"
          />
        </Link>

        {/* A flag, not a fire emoji. Marks the piece the catalogue promotes,
            which is a fact; "bestseller in X" would be a claim. */}
        {product.featured && (
          <span className="absolute left-0 top-0 bg-ink px-2 py-1 font-sans text-[10px] uppercase tracking-[0.14em] text-cream">
            Featured
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.slug);
          }}
          aria-label={isWish ? `Remove ${product.name} from saved` : `Save ${product.name}`}
          aria-pressed={isWish}
          className={`absolute right-0 top-0 grid h-11 w-11 place-items-center bg-paper/85 backdrop-blur-sm transition-colors hover:bg-paper ${
            isWish ? 'text-accent' : 'text-ink'
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill={isWish ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M12 20.5 4.9 13.6a4.5 4.5 0 0 1 6.4-6.3l.7.7.7-.7a4.5 4.5 0 0 1 6.4 6.3Z" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openQuickView(product);
          }}
          aria-label={`Quick view ${product.name}`}
          className="absolute bottom-0 right-0 grid h-11 w-11 place-items-center bg-paper/85 text-ink backdrop-blur-sm transition-colors hover:bg-paper"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="2.5" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 flex-col border-t border-stone p-3">
        <Link to={`/product/${product.slug}`}>
          <h3 className="truncate font-sans text-[13px] font-medium text-ink transition-colors group-hover:text-accent">
            {product.name}
          </h3>
        </Link>
        <p className="mt-0.5 font-sans text-[10px] uppercase tracking-[0.12em] text-ink-muted">
          {product.embroidery?.techniqueLabel ?? 'Hand embroidery'}
          <span aria-hidden="true"> · </span>
          {INTENSITY_COPY[getIntensity(product)] ?? 'Balanced'}
          {universeName ? ` · ${universeName}` : ''}
        </p>

        <p className="mt-1.5 flex items-baseline gap-1.5">
          <span className="loom-price text-[15px] font-medium text-ink">
            {formatPrice(currentVariant.priceCents)}
          </span>
          {compareAt && compareAt > currentVariant.priceCents && (
            <>
              <span className="loom-price text-[11px] text-ink-muted line-through">
                {formatPrice(compareAt)}
              </span>
              <span className="font-sans text-[10px] font-medium uppercase tracking-[0.06em] text-accent">
                {offPct}%
              </span>
            </>
          )}
        </p>

        <div className="mt-2.5 grid grid-flow-col auto-cols-fr gap-1" role="group" aria-label="Choose size">
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
                className={`grid min-h-[44px] place-items-center border font-sans text-[12px] transition-colors ${
                  size === s
                    ? 'border-ink bg-ink text-cream'
                    : 'border-stone text-ink hover:border-ink'
                } ${available ? '' : 'cursor-not-allowed line-through opacity-30'}`}
              >
                {s}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={soldOut}
          className="mt-1.5 min-h-[44px] w-full bg-ink px-2 font-sans text-[11.5px] font-medium uppercase tracking-[0.12em] text-cream transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          {soldOut ? 'Sold out' : 'Add to bag'}
        </button>
      </div>
    </div>
  );
};
