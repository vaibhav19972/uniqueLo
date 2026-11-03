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
import { useWishlistStore } from '../../stores/wishlist';
import { useQuickViewStore } from '../../stores/quickView';
import { useToastStore } from '../../stores/toast';
import { useUIStore } from '../../stores/ui';

export interface ProductCardProps {
  product: Product;
  type?: 'quick' | 'normal';
  variant?: 'grid' | 'row';
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * QUICK CARD (Mobile-First Modern Streetwear Card)
 * ─────────────────────────────────────────────────────────────────────────────
 * Sleek, high-converting browsing card matching Home's D2C aesthetic.
 *
 * • 3:4 image with smooth hover zoom & macro stitch cross-fade.
 * • Top-left SAVE % badge in solid black.
 * • 44x44 ergonomic wishlist heart button with backdrop blur.
 * • Quick "+ ADD TO CART" / "SELECT OPTIONS" overlay triggering size modal.
 * • Origin, Garment silhouette, and Artisan Craft Technique tag.
 * • Strikethrough MRP and bold Crimson sale price.
 * • Available size chips preview.
 */
export const QuickCard: React.FC<{ product: Product }> = ({ product }) => {
  const defaultVariant = getDefaultVariant(product);
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const showToast = useToastStore((state) => state.showToast);
  const openQuickView = useUIStore((state) => state.openQuickView);

  const [isHovered, setIsHovered] = useState(false);
  const frontImage = product.images[0]?.src || '/images/placeholders/hero.jpg';
  const macroImage = product.images[1]?.src || frontImage;
  const isWish = isWishlisted(product.slug);

  const expScore = getExpressionScore(product);
  const expInfo = getExpressionByScore(expScore);

  const firstVariant = product.variants?.[0] || defaultVariant;
  const priceCents = firstVariant?.priceCents || 129900;
  const mrpInfo = catalogMrp(firstVariant);
  const mrpCents = mrpInfo?.mrpCents ?? Math.round(priceCents * 1.55);
  const savePercent = mrpInfo?.offPercent ?? Math.round(((mrpCents - priceCents) / mrpCents) * 100);
  const isSoldOut = firstVariant?.status === 'out-of-stock';

  const sizes = useMemo(() => {
    return sortSizes([...new Set(product.variants.map((v) => v.size))]);
  }, [product]);

  const handleQuickAdd = (e: React.MouseEvent) => {
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
      ? `${product.craftTechniques[0].replace(/-/g, ' ').toUpperCase()}`
      : 'NEEDLECRAFT';

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-md bg-white border border-neutral-200/80 shadow-xs transition-all duration-300 hover:shadow-xl hover:border-neutral-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Visual Canvas (3:4 ratio) ── */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        <Link to={`/product/${product.slug}`} className="block h-full w-full" aria-label={product.name}>
          <img
            src={isHovered && macroImage ? macroImage : frontImage}
            alt={product.images[0]?.alt || product.name}
            loading="lazy"
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/placeholders/hoodie.jpg';
            }}
          />
        </Link>

        {/* Top-Left Save % Badge */}
        {savePercent > 0 && (
          <div className="pointer-events-none absolute left-2 top-2 z-10">
            <span className="inline-block rounded-xs bg-black/90 px-2 py-0.5 text-[9.5px] font-black italic tracking-wider text-white shadow-xs">
              SAVE {savePercent}%
            </span>
          </div>
        )}

        {/* Top-Right Wishlist Heart Button (Ergonomic 44x44px target) */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={isWish ? 'Remove from wishlist' : 'Save to wishlist'}
          className="absolute right-0 top-0 z-20 flex h-11 w-11 items-center justify-center text-neutral-700 transition hover:scale-110 active:scale-95"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-xs shadow-xs">
            <svg
              className={`h-4 w-4 transition-colors ${
                isWish ? 'fill-red-600 stroke-red-600 text-red-600' : 'stroke-neutral-800 fill-none'
              }`}
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </div>
        </button>

        {/* Macro Stitch badge indicator on hover */}
        {macroImage !== frontImage && (
          <div className="pointer-events-none absolute bottom-12 left-2 z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="rounded-xs bg-neutral-900/90 px-1.5 py-0.5 text-[8.5px] font-bold uppercase tracking-wider text-white shadow-sm">
              3× Macro Stitch
            </span>
          </div>
        )}

        {/* Quick Add Bottom Trigger */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-2 opacity-95 transition-all">
          <button
            type="button"
            disabled={isSoldOut}
            onClick={handleQuickAdd}
            className="flex min-h-[38px] w-full items-center justify-center rounded-sm bg-black/90 py-2 px-3 text-[11px] font-bold uppercase tracking-wider text-white shadow-md backdrop-blur-xs transition hover:bg-black active:scale-98 disabled:opacity-40"
          >
            {isSoldOut ? 'SOLD OUT' : '+ ADD TO CART'}
          </button>
        </div>
      </div>

      {/* ── Details Box ── */}
      <div className="flex flex-1 flex-col p-3 text-left bg-white">
        {/* Silhouette & Origin */}
        <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-wider text-neutral-500">
          <span className="truncate">
            {formatCountryOfOrigin(product.countryOfOrigin)} · {product.garmentType ?? 'GARMENT'}
          </span>
          {product.codAvailable && (
            <span className="font-bold text-emerald-700">COD</span>
          )}
        </div>

        {/* Title */}
        <Link to={`/product/${product.slug}`} className="block mt-1">
          <h4 className="text-[12.5px] font-bold uppercase tracking-tight text-neutral-900 line-clamp-1 hover:text-black">
            {product.name}
          </h4>
        </Link>

        {/* Subtitle / Narrative */}
        {product.subtitle && (
          <p className="mt-0.5 text-[11px] text-neutral-500 line-clamp-1">
            {product.subtitle}
          </p>
        )}

        {/* Pricing: Bold Crimson Sale Price + Strikethrough MRP */}
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[14px] font-black text-[#D32F2F]">
            {formatPrice(priceCents)}
          </span>
          {mrpCents > priceCents && (
            <span className="text-[11.5px] text-neutral-400 line-through">
              {formatPrice(mrpCents)}
            </span>
          )}
        </div>

        {/* Craft Technique & Presence */}
        <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2 text-[9px] uppercase tracking-wider text-neutral-500">
          <span className="font-medium text-neutral-700 truncate">
            {craftLabel}
          </span>
          {expInfo && (
            <span className="font-bold text-neutral-900 shrink-0">
              {expInfo.name}
            </span>
          )}
        </div>

        {/* Sizes Preview */}
        {sizes.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1 text-[9px] font-semibold text-neutral-600">
            {sizes.slice(0, 5).map((s) => (
              <span key={s} className="rounded-xs bg-neutral-100 px-1 py-0.5">
                {s}
              </span>
            ))}
            {sizes.length > 5 && (
              <span className="text-neutral-400">+{sizes.length - 5}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * NORMAL CARD (PLP Detailed Card)
 * ─────────────────────────────────────────────────────────────────────────────
 * Specification-rich card for deep shopping exploration with inline size selection.
 */
export const NormalCard: React.FC<{ product: Product }> = ({ product }) => {
  const navigate = useNavigate();
  const defaultVariant = getDefaultVariant(product);
  const addItem = useCartStore((state) => state.addItem);
  const setExpressItem = useCartStore((state) => state.setExpressItem);
  const closeCart = useCartStore((state) => state.closeCart);
  const openQuickViewModal = useQuickViewStore((state) => state.openQuickView);
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const showToast = useToastStore((state) => state.showToast);

  const [isHovered, setIsHovered] = useState(false);
  const frontImage = product.images[0]?.src || '/images/placeholders/hero.jpg';
  const macroImage = product.images[1]?.src || frontImage;
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
  const [selectedColor] = useState<string>(
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

  const priceCents = currentVariant.priceCents;
  const mrpCents = mrp?.mrpCents ?? Math.round(priceCents * 1.55);
  const savePercent = mrp?.offPercent ?? Math.round(((mrpCents - priceCents) / mrpCents) * 100);

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
      title: 'Added to Bag',
      description: `${product.name} (${selectedSize})`,
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
    setExpressItem(product.slug, currentVariant.sku, 1);
    closeCart();
    navigate('/checkout');
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

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-md bg-white border border-neutral-200/90 shadow-xs transition-all duration-300 hover:shadow-xl hover:border-neutral-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Image Plate ── */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        <Link to={`/product/${product.slug}`} className="block h-full w-full">
          <img
            src={isHovered && macroImage ? macroImage : frontImage}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        {savePercent > 0 && (
          <div className="pointer-events-none absolute left-2 top-2 z-10">
            <span className="inline-block rounded-xs bg-black/90 px-2 py-0.5 text-[9.5px] font-black italic tracking-wider text-white shadow-xs">
              SAVE {savePercent}%
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={handleWishlist}
          aria-label={isWish ? 'Remove from wishlist' : 'Save to wishlist'}
          className="absolute right-0 top-0 z-20 flex h-11 w-11 items-center justify-center text-neutral-700 transition hover:scale-110 active:scale-95"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-xs shadow-xs">
            <svg
              className={`h-4 w-4 transition-colors ${
                isWish ? 'fill-red-600 stroke-red-600 text-red-600' : 'stroke-neutral-800 fill-none'
              }`}
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </div>
        </button>

        <button
          type="button"
          onClick={() => openQuickViewModal(product)}
          className="absolute bottom-2 right-2 z-20 rounded-xs bg-white/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-900 shadow-xs backdrop-blur-xs hover:bg-black hover:text-white transition-colors"
        >
          Quick View
        </button>
      </div>

      {/* ── Specs & Controls ── */}
      <div className="flex flex-1 flex-col p-3.5 bg-white">
        <div className="flex items-center justify-between text-[9px] font-semibold uppercase tracking-wider text-neutral-500">
          <span>{formatCountryOfOrigin(product.countryOfOrigin)} · {product.garmentType ?? 'GARMENT'}</span>
          {product.codAvailable && <span className="font-bold text-emerald-700">COD</span>}
        </div>

        <Link to={`/product/${product.slug}`} className="mt-1 block">
          <h4 className="text-[13px] font-bold uppercase tracking-tight text-neutral-900 line-clamp-1 hover:text-black">
            {product.name}
          </h4>
        </Link>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[14px] font-black text-[#D32F2F]">
            {formatPrice(priceCents)}
          </span>
          {mrpCents > priceCents && (
            <span className="text-[11.5px] text-neutral-400 line-through">
              {formatPrice(mrpCents)}
            </span>
          )}
        </div>

        {/* Size Selection Chips */}
        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
          {sizes.slice(0, 5).map((s) => {
            const inStock = inStockSizes.has(s);
            const isSelected = selectedSize === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => inStock && setSelectedSize(s)}
                disabled={!inStock}
                className={`h-7 min-w-[28px] px-1 text-center text-[10.5px] font-bold uppercase rounded-xs border transition-colors ${
                  isSelected
                    ? 'border-black bg-black text-white'
                    : inStock
                    ? 'border-neutral-300 bg-white text-neutral-800 hover:border-black'
                    : 'border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed line-through'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>

        {/* Dual Actions: Add to Bag + Express Buy */}
        <div className="mt-3.5 flex items-center gap-1.5">
          <button
            type="button"
            disabled={isSoldOut}
            onClick={handleAdd}
            className="flex-1 min-h-[38px] rounded-xs border border-neutral-900 bg-white px-2 py-2 text-[10.5px] font-bold uppercase tracking-wider text-neutral-900 transition hover:bg-neutral-100 disabled:opacity-40"
          >
            {isSoldOut ? 'Sold Out' : `Add (${selectedSize})`}
          </button>
          <button
            type="button"
            disabled={isSoldOut}
            onClick={handleExpressBuy}
            className="flex-1 min-h-[38px] rounded-xs bg-black px-2 py-2 text-[10.5px] font-bold uppercase tracking-wider text-white shadow-xs transition hover:bg-neutral-800 disabled:opacity-40"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  type = 'quick',
}) => {
  if (type === 'normal') {
    return <NormalCard product={product} />;
  }
  return <QuickCard product={product} />;
};
