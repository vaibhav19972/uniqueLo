import React from 'react';
import { Link } from 'react-router';
import {
  type Product,
  formatPrice,
  getDefaultVariant,
  getIntensity,
} from '../../lib/data';
import { catalogMrp } from '../../lib/pricing';
import { useCartStore } from '../../stores/cart';
import { useQuickViewStore } from '../../stores/quickView';
import { useWishlistStore } from '../../stores/wishlist';
import { useToastStore } from '../../stores/toast';
import { Image } from '../ui/Image';

interface ProductCardProps {
  product: Product;
  /** Places the card in a ruled index row rather than a grid cell. */
  variant?: 'grid' | 'row';
}

const INTENSITY_COPY: Record<string, string> = {
  quiet: 'Quiet',
  balanced: 'Balanced',
  loud: 'Loud',
};

/**
 * THE CARD
 *
 * This world's atom, and it is deliberately almost nothing: a photograph on
 * paper, a name, a technique label, and a price. It refuses the category
 * default it used to be — a bordered, shadowed, rounded box carrying four
 * badges, a heart button, a hover flyout with three buttons, a size list, an
 * embroidery-hours count and a collection link. That card made every product
 * look identical and pushed the price into the bottom corner.
 *
 * Price is the second thing in reading order, set in mono so the digits line
 * up down the grid. The technique sits above it because it is the proof of
 * value at this price band. Everything else lives on the PDP, which is where
 * a buyer who has already decided wants to be.
 *
 * Interaction is one idea: the whole card is the link, and on hover the
 * photograph crosses to its macro detail. No flyout, no second button — the
 * quick-add lives on the PDP and in Quick View, which is reachable from the
 * card's only secondary control (a 44px corner target).
 */
export const ProductCard: React.FC<ProductCardProps> = ({ product, variant = 'grid' }) => {
  const defaultVariant = getDefaultVariant(product);
  const addItem = useCartStore((state) => state.addItem);
  const openQuickView = useQuickViewStore((state) => state.openQuickView);
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const showToast = useToastStore((state) => state.showToast);

  const frontImage = product.images[0]?.src || '/images/placeholders/hero.jpg';
  const macroImage = product.images[1]?.src || frontImage;
  const isWish = isWishlisted(product.slug);

  const mrp = catalogMrp(defaultVariant);
  const compareAt = mrp?.mrpCents ?? null;
  const offPct = mrp?.offPercent ?? 0;
  const soldOut = defaultVariant?.status === 'out-of-stock';
  const intensity = getIntensity(product);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (soldOut) {
      showToast({
        title: 'Sold out',
        description: `${product.name} is currently sold out in size ${defaultVariant.size}.`,
        type: 'info',
      });
      return;
    }
    addItem(product.slug, defaultVariant.sku, 1, undefined, defaultVariant.quantity ?? 99);
    showToast({
      title: 'Added to bag',
      description: `${product.name} (size ${defaultVariant.size})`,
      type: 'success',
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.slug);
    showToast({
      title: !isWish ? 'Saved' : 'Removed',
      description: product.name,
      type: !isWish ? 'accent' : 'info',
    });
  };

  const priceBlock = (
    <div className="flex items-baseline gap-2">
      <span className="loom-price text-[15px] font-medium text-ink">
        {defaultVariant ? formatPrice(defaultVariant.priceCents) : '—'}
      </span>
      {compareAt && defaultVariant && compareAt > defaultVariant.priceCents && (
        <>
          <span className="loom-price text-[12px] text-ink-muted line-through">
            {formatPrice(compareAt)}
          </span>
          {offPct > 0 && (
            <span className="font-sans text-[11px] font-medium uppercase tracking-[0.08em] text-accent">
              {offPct}% off
            </span>
          )}
        </>
      )}
    </div>
  );

  const meta = (
    <p className="font-sans text-[11px] uppercase tracking-[0.14em] text-ink-muted">
      {product.embroidery?.techniqueLabel ?? 'Hand embroidery'}
      <span aria-hidden="true"> · </span>
      {INTENSITY_COPY[intensity] ?? 'Balanced'}
    </p>
  );

  if (variant === 'row') {
    return (
      <div className="group relative flex gap-4 border-b border-stone py-4">
        <Link
          to={`/product/${product.slug}`}
          className="relative block h-[104px] w-[78px] shrink-0 overflow-hidden bg-panel sm:h-[132px] sm:w-[99px]"
        >
          <Image
            src={frontImage}
            alt={product.images[0]?.alt || product.name}
            aspectRatio="3/4"
            className="h-full w-full object-cover"
          />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <Link to={`/product/${product.slug}`} className="min-w-0">
            <h3 className="truncate font-sans text-sm font-medium text-ink group-hover:text-accent">
              {product.name}
            </h3>
          </Link>
          {meta}
          <div className="mt-1.5">{priceBlock}</div>
        </div>
        {!soldOut && (
          <button
            type="button"
            onClick={handleQuickAdd}
            className="hidden h-11 shrink-0 self-center border border-stone-strong px-4 font-sans text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream sm:block"
          >
            Add
          </button>
        )}
      </div>
    );
  }

  return (
    <article className="group relative flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-paper">
        <Link
          to={`/product/${product.slug}`}
          className="block h-full w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label={product.name}
        >
          <Image
            src={frontImage}
            alt={product.images[0]?.alt || product.name}
            aspectRatio="3/4"
            fit="contain"
            className="h-full w-full transition-opacity duration-500 group-hover:opacity-0"
          />
          <Image
            src={macroImage}
            alt=""
            aspectRatio="3/4"
            fit="contain"
            className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        </Link>

        {soldOut && (
          <p className="absolute inset-x-0 bottom-0 bg-ink/90 px-3 py-2 text-center font-sans text-[11px] uppercase tracking-[0.16em] text-cream">
            Sold out
          </p>
        )}

        {/* Two controls, both 44px, both labelled. Nothing else floats here. */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={isWish ? `Remove ${product.name} from saved` : `Save ${product.name}`}
          aria-pressed={isWish}
          className={`absolute right-0 top-0 grid h-11 w-11 place-items-center bg-paper/85 text-ink backdrop-blur-sm transition-colors hover:bg-paper ${
            isWish ? 'text-accent' : ''
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

      <div className="flex flex-1 flex-col pt-3">
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-sans text-[13px] font-medium leading-snug text-ink transition-colors group-hover:text-accent sm:text-sm">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1 hidden sm:block">{meta}</div>
        <div className="mt-1.5">{priceBlock}</div>
      </div>
    </article>
  );
};
