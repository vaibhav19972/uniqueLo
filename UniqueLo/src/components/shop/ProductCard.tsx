import React from 'react';
import { Link } from 'react-router';
import type { Product } from '../../lib/data';
import { formatPrice, getDefaultVariant } from '../../lib/data';
import { useCartStore } from '../../stores/cart';
import { useCustomizerStore } from '../../stores/customizer';
import { useQuickViewStore } from '../../stores/quickView';
import { useWishlistStore } from '../../stores/wishlist';
import { useToastStore } from '../../stores/toast';
import { Image } from '../ui/Image';
import { Button } from '../ui/Button';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const defaultVariant = getDefaultVariant(product);
  const addItem = useCartStore((state) => state.addItem);
  const openCustomizer = useCustomizerStore((state) => state.openCustomizer);
  const openQuickView = useQuickViewStore((state) => state.openQuickView);
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const showToast = useToastStore((state) => state.showToast);

  const frontImage = product.images[0]?.src || '/images/placeholders/hero.jpg';
  const macroImage = product.images[1]?.src || frontImage;
  const isWish = isWishlisted(product.slug);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product.slug, defaultVariant.sku, 1);
    showToast({
      title: 'Added to Atelier Bag',
      description: `${product.name} (${defaultVariant.color} / ${defaultVariant.size})`,
      type: 'success',
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  const handleBespoke = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openCustomizer(product);
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
    <div className="group relative flex flex-col bg-paper border border-stone/70 shadow-xs transition-all duration-500 hover:shadow-xl hover:border-ink/50 hover:-translate-y-1">
      {/* Visual Canvas */}
      <div className="relative aspect-[3/4] overflow-hidden bg-stone/20">
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          {/* Silhouette Image */}
          <Image
            src={frontImage}
            alt={product.images[0]?.alt || product.name}
            aspectRatio="3/4"
            className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
          />

          {/* Macro Stitch Detail Image on Hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <Image
              src={macroImage}
              alt={product.images[1]?.alt || `${product.name} Macro Detail`}
              aspectRatio="3/4"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-ink/90 text-cream backdrop-blur-md px-2.5 py-1 text-[9px] uppercase tracking-widest font-sans border border-stone/30">
              ✦ 3x Macro Stitch
            </div>
          </div>
        </Link>

        {/* Wishlist Heart Toggle */}
        <button
          onClick={handleWishlist}
          aria-label={isWish ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
            isWish
              ? 'bg-accent text-paper shadow-md scale-105'
              : 'bg-paper/85 text-ink hover:text-accent hover:scale-110'
          }`}
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        {/* Technique Badge */}
        {product.embroidery && (
          <div className="absolute bottom-3 left-3 bg-cream/95 text-ink backdrop-blur-md px-2.5 py-1 text-[10px] tracking-widest uppercase border border-stone/80 font-medium">
            {product.embroidery.techniqueLabel}
          </div>
        )}

        {/* Quick Action Flyout */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-gradient-to-t from-ink/90 via-ink/60 to-transparent flex gap-1.5 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="bg-paper/90 text-ink hover:bg-paper text-[10px] tracking-wider px-2 py-1.5"
            onClick={handleQuickView}
          >
            Quick View
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="flex-1 text-[10px] tracking-widest bg-ink text-cream hover:bg-accent py-1.5"
            onClick={handleQuickAdd}
          >
            Quick Add
          </Button>

          {product.customizable && (
            <Button
              variant="accent"
              size="sm"
              className="text-[10px] tracking-widest px-2.5 py-1.5"
              onClick={handleBespoke}
            >
              Bespoke
            </Button>
          )}
        </div>
      </div>

      {/* Info Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between bg-paper">
        <div>
          <div className="flex justify-between items-start gap-2">
            <Link to={`/product/${product.slug}`} className="hover:text-accent transition-colors">
              <h3 className="font-serif text-base sm:text-lg text-ink font-normal leading-snug">
                {product.name}
              </h3>
            </Link>
            <span className="font-sans text-sm font-medium text-ink whitespace-nowrap">
              {formatPrice(defaultVariant.priceCents)}
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1.5 font-light line-clamp-2">
            {product.subtitle}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="mt-4 pt-3 border-t border-stone/40 flex justify-between items-center text-[10px] text-ink-muted uppercase tracking-wider">
          <span>{product.variants.length} Options</span>
          {product.embroidery?.artisanHours && (
            <span className="font-medium text-accent">
              ✦ {product.embroidery.artisanHours}h Needlework
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
