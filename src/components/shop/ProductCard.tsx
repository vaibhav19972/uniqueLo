import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  type Product,
  type ProductVariant,
  formatPrice,
  formatCountryOfOrigin,
  getDefaultVariant,
  getExpressionByScore,
  getExpressionScore,
} from '../../lib/data';
import { catalogMrp } from '../../lib/pricing';
import { sortSizes } from '../../lib/sizes';
import { useCartStore } from '../../stores/cart';
import { useQuickViewStore } from '../../stores/quickView';
import { useQuickAddStore } from '../../stores/quickAdd';
import { useWishlistStore } from '../../stores/wishlist';
import { useToastStore } from '../../stores/toast';

export interface ProductCardProps {
  product: Product;
  type?: 'quick' | 'normal';
  variant?: 'grid' | 'row';
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * QUICK CARD
 * ─────────────────────────────────────────────────────────────────────────────
 * High-speed visual browsing card for Home, Rails, and Curated Sections.
 *
 * • Silhouette photo with smooth hover cross-fade to 3x Macro Stitch detail.
 * • Wishlist heart button.
 * • Clean hover flyout with solid buttons for Quick View & Quick Add (NO transparency clash).
 * • Quick Add triggers the QuickAddModal dialog (desktop) / bottom-sheet (mobile)
 *   to select size & color, or adds directly if no options needed.
 * • Displays country of origin, COD tag, title, price, subtitle, expression badge, and sizes.
 */
export const QuickCard: React.FC<{ product: Product }> = ({ product }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const defaultVariant = getDefaultVariant(product);
  const addItem = useCartStore((state) => state.addItem);
  const openQuickView = useQuickViewStore((state) => state.openQuickView);
  const openQuickAdd = useQuickAddStore((state) => state.openQuickAdd);
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const showToast = useToastStore((state) => state.showToast);

  const frontImage = product.images[0]?.src || '/images/placeholders/hero.jpg';
  const macroImage = product.images[1]?.src || frontImage;
  const isWish = isWishlisted(product.slug);

  const expScore = getExpressionScore(product);
  const expInfo = getExpressionByScore(expScore);

  const mrp = catalogMrp(defaultVariant);
  const compareAt = mrp?.mrpCents ?? null;
  const offPct = mrp?.offPercent ?? 0;
  const soldOut = defaultVariant?.status === 'out-of-stock';

  const sizes = useMemo(() => {
    return sortSizes([...new Set(product.variants.map((v) => v.size))]);
  }, [product]);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If product has multiple sizes or multiple variants, open the quick-add sheet/dialog
    if (product.variants.length > 1) {
      openQuickAdd(product);
      return;
    }

    // Single variant direct-add
    if (soldOut) {
      showToast({
        title: 'Sold out',
        description: `${product.name} is currently sold out.`,
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

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.slug);
    showToast({
      title: !isWish ? 'Saved to Wishlist' : 'Removed from Wishlist',
      description: product.name,
      type: !isWish ? 'accent' : 'info',
    });
  };

  const craftLabel =
    product.craftTechniques && product.craftTechniques.length > 0
      ? `${product.craftTechniques[0].replace(/-/g, ' ').toUpperCase()} NEEDLECRAFT`
      : 'HIGH-DENSITY SATIN NEEDLECRAFT';

  return (
    <div className="group relative flex flex-col bg-paper border border-stone shadow-xs transition-all duration-300 hover:shadow-lg hover:border-ink/60 hover:-translate-y-0.5">
      {/* ── Visual Canvas ────────────────────────────────────────── */}
      <div
        className="relative aspect-[3/4] overflow-hidden bg-cream/40"
        onMouseEnter={() => setIsRevealed(true)}
        onMouseLeave={() => setIsRevealed(false)}
        onClick={() => setIsRevealed((prev) => !prev)}
      >
        <Link to={`/product/${product.slug}`} className="block h-full w-full">
          {/* Front Image */}
          <img
            src={frontImage}
            alt={product.images[0]?.alt || product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
            }}
          />

          {/* Macro Stitch Detail on Hover */}
          <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <img
              src={macroImage}
              alt={product.images[1]?.alt || `${product.name} Macro Detail`}
              loading="lazy"
              className="h-full w-full object-cover"
            />
            <div className="absolute top-2.5 left-2.5 border border-stone/30 bg-ink/90 px-2 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-widest text-cream shadow-sm">
              + 3X MACRO STITCH
            </div>
          </div>
        </Link>

        {/* Wishlist Heart Toggle */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={isWish ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-2.5 right-2.5 z-10 grid h-7 w-7 place-items-center rounded-full transition-all sm:h-8 sm:w-8 ${
            isWish
              ? 'bg-accent text-paper shadow-md scale-105'
              : 'bg-paper/85 text-ink hover:text-accent hover:scale-110 shadow-xs'
          }`}
        >
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        {/* Bottom Craft Tag (Visible when NOT hovering action buttons) */}
        <div
          className={`absolute inset-x-0 bottom-0 border-t border-stone bg-paper/95 px-2.5 py-1 text-center font-sans text-[9px] font-semibold uppercase tracking-widest text-ink transition-opacity duration-200 pointer-events-none ${
            isRevealed ? 'opacity-0' : 'group-hover:opacity-0'
          }`}
        >
          {craftLabel}
        </div>

        {/* Quick Action Flyout (Solid buttons on hover or tap — Fixes transparency clash!) */}
        <div
          className={`absolute inset-x-2 bottom-2 z-20 flex items-center gap-1.5 transition-opacity duration-200 ${
            isRevealed
              ? 'opacity-100 pointer-events-auto'
              : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto'
          }`}
        >
          <button
            type="button"
            onClick={handleQuickView}
            className="flex-1 min-h-[36px] border border-stone bg-paper px-2 py-1.5 font-sans text-[10.5px] font-semibold uppercase tracking-wider text-ink shadow-md transition-colors hover:border-ink hover:bg-cream"
          >
            Quick View
          </button>
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex-1 min-h-[36px] bg-ink px-2 py-1.5 font-sans text-[10.5px] font-semibold uppercase tracking-wider text-cream shadow-md transition-colors hover:bg-accent"
          >
            Quick Add
          </button>
        </div>
      </div>

      {/* ── Info Body ────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-between p-3 sm:p-4 bg-paper">
        <div>
          {/* Origin & COD */}
          <div className="flex items-center justify-between text-[9.5px] uppercase tracking-widest text-ink-muted">
            <span className="truncate">
              {formatCountryOfOrigin(product.countryOfOrigin)} · {product.garmentType ?? 'GARMENT'}
            </span>
            {product.codAvailable && (
              <span className="font-semibold text-ink-muted">COD</span>
            )}
          </div>

          {/* Title & Price */}
          <div className="mt-1 flex items-baseline justify-between gap-2">
            <Link to={`/product/${product.slug}`} className="min-w-0 flex-1 hover:text-accent transition-colors">
              <h3 className="truncate font-sans text-[14px] sm:text-[15px] font-semibold text-ink">
                {product.name}
              </h3>
            </Link>
            <div className="flex shrink-0 items-baseline gap-1.5">
              <span className="loom-price text-[13px] sm:text-[14px] font-semibold text-ink">
                {formatPrice(defaultVariant.priceCents)}
              </span>
              {compareAt && compareAt > defaultVariant.priceCents && (
                <span className="loom-price text-[11px] text-ink-muted line-through">
                  {formatPrice(compareAt)}
                </span>
              )}
              {offPct > 0 && (
                <span className="font-sans text-[9px] font-semibold text-accent">
                  {offPct}%
                </span>
              )}
            </div>
          </div>

          {/* Subtitle / Tagline */}
          <p className="mt-1 line-clamp-1 font-sans text-[12px] text-ink-muted">
            {product.subtitle}
          </p>

          {/* Expression & Technique hit */}
          <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-wider text-ink-muted">
            {expInfo && (
              <span className="font-sans font-semibold text-accent">
                ◆ {expInfo.name.toUpperCase()}
              </span>
            )}
            {product.craftTechniques?.[0] && (
              <span className="font-sans text-ink/70">
                {product.craftTechniques[0].replace(/-/g, ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Sizes preview */}
        <div className="mt-3 flex items-center justify-between border-t border-stone/60 pt-2 text-[9.5px] uppercase tracking-wider text-ink-muted">
          <span>
            Sizes {sizes.slice(0, 5).join(' ')}
          </span>
          <span className="loom-price text-[10px]">
            {product.variants.length} options
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * NORMAL CARD (PLP CARD)
 * ─────────────────────────────────────────────────────────────────────────────
 * Rich, specification-dense card for Product Listing Pages (/shop, collections).
 *
 * • Product photograph with "Inspect Stitch & Fit" button at bottom right (opens Quick View).
 * • Wishlist heart toggle button.
 * • Top specs banner: Category/Silhouette · Fabric GSM · Stitch Count.
 * • Product Title (display serif/sans) and Price (tabular mono).
 * • Material composition & craft story subtitle.
 * • Inline interactive color swatches and size selector chips [S] [M] [L] [XL].
 * • Dual action buttons: [Add to Bag (Size)] outline button & [Express Buy] solid button.
 */
export const NormalCard: React.FC<{ product: Product }> = ({ product }) => {
  const navigate = useNavigate();
  const defaultVariant = getDefaultVariant(product);
  const addItem = useCartStore((state) => state.addItem);
  const setExpressItem = useCartStore((state) => state.setExpressItem);
  const closeCart = useCartStore((state) => state.closeCart);
  const openQuickView = useQuickViewStore((state) => state.openQuickView);
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const showToast = useToastStore((state) => state.showToast);

  const frontImage = product.images[0]?.src || '/images/placeholders/hero.jpg';
  const isWish = isWishlisted(product.slug);

  const sizes = useMemo(() => {
    return sortSizes([...new Set(product.variants.map((v) => v.size))]);
  }, [product]);

  const inStockSizes = useMemo(() => {
    return new Set(
      product.variants
        .filter((v) => v.status !== 'out-of-stock' && (v.quantity == null || v.quantity > 0))
        .map((v) => v.size),
    );
  }, [product]);

  // Color options if available
  const colors = useMemo(() => {
    const list: string[] = [];
    for (const v of product.variants) {
      if (v.color && !list.includes(v.color)) list.push(v.color);
    }
    return list;
  }, [product]);

  const [selectedSize, setSelectedSize] = useState<string>(
    sizes.find((s) => inStockSizes.has(s)) ?? sizes[0] ?? 'M',
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    colors[0] ?? defaultVariant.color ?? '',
  );

  const currentVariant: ProductVariant = useMemo(() => {
    const match = product.variants.find(
      (v) =>
        v.size === selectedSize &&
        (!selectedColor || !v.color || v.color.toLowerCase() === selectedColor.toLowerCase()),
    );
    return match ?? product.variants.find((v) => v.size === selectedSize) ?? defaultVariant;
  }, [product, selectedSize, selectedColor, defaultVariant]);

  const mrp = catalogMrp(currentVariant);
  const isSoldOut =
    currentVariant.status === 'out-of-stock' ||
    (currentVariant.quantity != null && currentVariant.quantity <= 0);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) {
      showToast({
        title: 'Sold out',
        description: `${product.name} is currently sold out in size ${selectedSize}.`,
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

  const handleExpressBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) {
      showToast({
        title: 'Sold out',
        description: `${product.name} is currently sold out in size ${selectedSize}.`,
        type: 'info',
      });
      return;
    }
    closeCart();
    setExpressItem(product.slug, currentVariant.sku, 1);
    navigate('/checkout?express=1');
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.slug);
    showToast({
      title: !isWish ? 'Saved to Wishlist' : 'Removed from Wishlist',
      description: product.name,
      type: !isWish ? 'accent' : 'info',
    });
  };

  // Specs calculations
  const categoryHeader = product.garmentType
    ? `${product.garmentType.toUpperCase()}S`
    : 'OUTERWEAR & TOPS';

  const gsmValue = product.fabricGsm ? `${product.fabricGsm} GSM` : '240 GSM';

  const stitchesValue = product.embroidery?.artisanHours
    ? `${(product.embroidery.artisanHours * 4.5).toFixed(1)}K STITCHES`
    : '28.9K STITCHES';

  return (
    <div className="group relative flex flex-col bg-paper border border-stone shadow-xs transition-all duration-300 hover:shadow-xl hover:border-ink/60">
      {/* ── Visual Canvas ────────────────────────────────────────── */}
      <div className="relative aspect-[3/4] overflow-hidden bg-cream/40 border-b border-stone">
        <Link to={`/product/${product.slug}`} className="block h-full w-full">
          <img
            src={frontImage}
            alt={product.images[0]?.alt || product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 ease-[var(--ease-base)] group-hover:scale-102"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
            }}
          />
        </Link>

        {/* Wishlist Heart Toggle */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={isWish ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-2.5 right-2.5 z-10 grid h-7 w-7 place-items-center rounded-full transition-all sm:h-8 sm:w-8 ${
            isWish
              ? 'bg-accent text-paper shadow-md scale-105'
              : 'bg-paper/85 text-ink hover:text-accent hover:scale-110 shadow-xs'
          }`}
        >
          <svg className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        {/* "Inspect Stitch & Fit" button with eye icon */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openQuickView(product);
          }}
          className="absolute bottom-2.5 right-2.5 z-10 flex items-center gap-1.5 border border-stone/40 bg-ink/90 px-3 py-1.5 font-sans text-[10.5px] font-medium tracking-wide text-cream shadow-md transition-colors hover:bg-ink"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Inspect Stitch & Fit
        </button>
      </div>

      {/* ── Rich Information Body ─────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-between p-4 bg-paper">
        <div>
          {/* Row 1: Specs Banner (Category · GSM · Stitches) */}
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-ink-muted border-b border-stone/50 pb-2.5">
            <span className="truncate max-w-[45%] font-medium text-ink-muted">
              {categoryHeader}
            </span>
            <span className="loom-price text-[10.5px]">{gsmValue}</span>
            <span className="loom-price text-[10.5px]">{stitchesValue}</span>
          </div>

          {/* Row 2: Product Name & Price */}
          <div className="mt-2.5 flex items-start justify-between gap-3">
            <Link to={`/product/${product.slug}`} className="hover:text-accent transition-colors flex-1 min-w-0">
              <h3 className="font-sans text-[15px] sm:text-[16px] font-semibold text-ink leading-snug line-clamp-2">
                {product.name}
              </h3>
            </Link>
            <div className="shrink-0 text-right">
              <span className="loom-price text-[15px] sm:text-[16px] font-bold text-ink">
                {formatPrice(currentVariant.priceCents)}
              </span>
              {mrp && mrp.offPercent > 0 && (
                <div className="mt-0.5 flex items-center justify-end gap-1">
                  <span className="loom-price text-[10.5px] text-ink-muted line-through">
                    {formatPrice(mrp.mrpCents)}
                  </span>
                  <span className="font-sans text-[9.5px] font-semibold text-accent">
                    {mrp.offPercent}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Row 3: Material and Craft Description */}
          <p className="mt-1.5 font-sans text-[12px] leading-relaxed text-ink-muted line-clamp-2">
            {product.subtitle || 'Original hand embroidery on unbleached Indian cotton.'}
          </p>

          {/* Row 4: Color Swatches & Size Chips */}
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-y-2 border-t border-stone/40 pt-3">
            {/* Color Swatches */}
            <div className="flex items-center gap-1.5 min-w-0">
              {colors.length > 0 ? (
                <>
                  <div className="flex -space-x-1">
                    {colors.slice(0, 3).map((col, idx) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setSelectedColor(col)}
                        title={col}
                        className={`h-4 w-4 rounded-full border border-paper shadow-xs transition-transform ${
                          selectedColor.toLowerCase() === col.toLowerCase()
                            ? 'scale-125 ring-1 ring-ink'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{
                          backgroundColor:
                            idx === 0
                              ? '#d8cbb8'
                              : idx === 1
                              ? '#1f242e'
                              : idx === 2
                              ? '#a4322a'
                              : '#6b6355',
                        }}
                      />
                    ))}
                  </div>
                  <span className="truncate font-sans text-[11px] capitalize text-ink-muted max-w-[85px] sm:max-w-[110px]">
                    {selectedColor || 'Natural'}
                  </span>
                </>
              ) : (
                <span className="font-sans text-[11px] text-ink-muted">100% Cotton</span>
              )}
            </div>

            {/* Interactive Size Chips */}
            <div className="flex items-center gap-1">
              {sizes.slice(0, 5).map((s) => {
                const inStock = inStockSizes.has(s);
                const isSelected = selectedSize === s;

                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => inStock && setSelectedSize(s)}
                    disabled={!inStock}
                    className={`h-7 w-7 text-center font-sans text-[11px] font-semibold uppercase border transition-colors ${
                      isSelected
                        ? 'border-ink bg-ink text-cream shadow-xs'
                        : inStock
                        ? 'border-stone bg-paper text-ink hover:border-ink'
                        : 'border-stone/30 bg-stone/20 text-ink-muted/40 cursor-not-allowed'
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 5: Action Buttons [Add to Bag (Size)] & [Express Buy] */}
        <div className="mt-4 flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            disabled={isSoldOut}
            onClick={handleAdd}
            className="flex-1 min-h-[42px] border border-ink bg-transparent px-1.5 sm:px-2 py-2 font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.06em] sm:tracking-[0.1em] text-ink transition-colors hover:bg-ink hover:text-cream disabled:opacity-40 truncate text-center"
          >
            {isSoldOut ? (
              'Sold Out'
            ) : (
              <>
                <span className="hidden sm:inline">Add to Bag</span>
                <span className="sm:hidden">Add</span> ({selectedSize})
              </>
            )}
          </button>
          <button
            type="button"
            disabled={isSoldOut}
            onClick={handleExpressBuy}
            className="flex-1 min-h-[42px] bg-ink px-1.5 sm:px-2 py-2 font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.06em] sm:tracking-[0.1em] text-cream transition-colors hover:bg-accent disabled:opacity-40 shadow-sm truncate text-center"
          >
            Express Buy
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Default ProductCard component:
 * Delegates to NormalCard if type="normal", or QuickCard if type="quick".
 */
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  type = 'quick',
}) => {
  if (type === 'normal') {
    return <NormalCard product={product} />;
  }
  return <QuickCard product={product} />;
};
