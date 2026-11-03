import React, { useState } from 'react';
import { Link } from 'react-router';
import type { Product } from '../../lib/data';
import { formatPrice } from '../../lib/data';
import { useWishlistStore } from '../../stores/wishlist';
import { useUIStore } from '../../stores/ui';

interface ProductCardMobileProps {
  product: Product;
  className?: string;
}

export const ProductCardMobile: React.FC<ProductCardMobileProps> = ({
  product,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isInWishlist = useWishlistStore((state) => state.isWishlisted(product.slug));
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist);
  const openQuickView = useUIStore((state) => state.openQuickView);

  const firstVariant = product.variants?.[0];
  const priceCents = firstVariant?.priceCents || 129900;
  // Calculate synthetic MRP for classic D2C discount representation
  const mrpCents = Math.round(priceCents * 1.55);
  const savePercent = Math.round(((mrpCents - priceCents) / mrpCents) * 100);

  const primaryImage = product.images?.[0]?.src || '/images/placeholders/hoodie.jpg';
  const secondaryImage = product.images?.[1]?.src || primaryImage;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.slug);
  };

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-md bg-white transition-all ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Image Container (3:4 aspect ratio) ── */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        <Link
          to={`/product/${product.slug}`}
          className="block h-full w-full"
          aria-label={product.name}
        >
          <img
            src={isHovered && secondaryImage ? secondaryImage : primaryImage}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </Link>

        {/* Top-Left Save % Badge */}
        <div className="pointer-events-none absolute left-2 top-2 z-10">
          <span className="inline-block rounded-xs bg-black/90 px-2 py-0.5 text-[9.5px] font-black italic tracking-wider text-white shadow-xs">
            SAVE {savePercent}%
          </span>
        </div>

        {/* Top-Right Wishlist Heart Button (Ergonomic 44x44px target) */}
        <button
          type="button"
          onClick={handleWishlistToggle}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute right-0 top-0 z-20 flex h-11 w-11 items-center justify-center text-neutral-700 transition hover:scale-110 active:scale-95"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-xs shadow-xs">
            <svg
              className={`h-4 w-4 transition-colors ${
                isInWishlist ? 'fill-red-600 stroke-red-600 text-red-600' : 'stroke-black fill-none'
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

        {/* Quick Add Overlay / Bottom trigger on mobile and desktop */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-2 opacity-95 transition-all">
          <button
            type="button"
            onClick={handleQuickAdd}
            className="flex min-h-[38px] w-full items-center justify-center rounded-sm bg-black/90 py-2 px-3 text-[11px] font-bold uppercase tracking-wider text-white shadow-md backdrop-blur-xs transition hover:bg-black active:scale-98"
          >
            + ADD TO CART
          </button>
        </div>
      </div>

      {/* ── Details Box ── */}
      <div className="flex flex-1 flex-col pt-2 pb-1 text-left">
        <Link to={`/product/${product.slug}`} className="block">
          <h4 className="text-[12px] font-bold uppercase tracking-tight text-neutral-900 line-clamp-1 hover:text-black">
            {product.name}
          </h4>
        </Link>

        {product.subtitle && (
          <p className="mt-0.5 text-[11px] text-neutral-500 line-clamp-1">
            {product.subtitle}
          </p>
        )}

        {/* Pricing Row: Strikethrough MRP + Crimson Sale Price */}
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-[13px] font-extrabold text-[#D32F2F]">
            {formatPrice(priceCents)}
          </span>
          <span className="text-[11px] text-neutral-400 line-through">
            {formatPrice(mrpCents)}
          </span>
        </div>
      </div>
    </div>
  );
};
