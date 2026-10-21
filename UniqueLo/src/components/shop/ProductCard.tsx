import React from 'react';
import { Link } from 'react-router';
import {
  type Product,
  formatPrice,
  getDefaultVariant,
  getExpressionByScore,
  getExpressionScore,
  COLLECTIONS,
} from '../../lib/data';
import { useCartStore } from '../../stores/cart';
import { useCustomizerStore } from '../../stores/customizer';
import { useQuickViewStore } from '../../stores/quickView';
import { useWishlistStore } from '../../stores/wishlist';
import { useToastStore } from '../../stores/toast';
import { Image } from '../ui/Image';
import { Button } from '../ui/Button';
import { useIsThemeV2 } from '../../config/theme';

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
  const isV2 = useIsThemeV2();

  const expScore = getExpressionScore(product);
  const expInfo = getExpressionByScore(expScore);

  const compareAt = defaultVariant.compareAtPriceCents;
  const offPct =
    compareAt && compareAt > defaultVariant.priceCents
      ? Math.round((1 - defaultVariant.priceCents / compareAt) * 100)
      : 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (defaultVariant.status === 'out-of-stock') {
      showToast({
        title: 'Sold out',
        description: `${product.name} is currently sold out in size ${defaultVariant.size}.`,
        type: 'info',
      });
      return;
    }
    addItem(product.slug, defaultVariant.sku, 1, undefined, defaultVariant.quantity ?? 99);
    showToast({
      title: 'Added to Atelier Bag',
      description: `${product.name} (size ${defaultVariant.size})`,
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
            <div className="absolute top-3 left-3 bg-ink/90 text-cream px-2.5 py-1 text-[9px] uppercase tracking-widest font-sans border border-stone/30">
              ✦ 3x Macro Stitch
            </div>
          </div>
        </Link>

        {/* Wishlist Heart Toggle */}
        <button
          onClick={handleWishlist}
          aria-label={isWish ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
            isWish
              ? 'bg-accent text-paper shadow-md scale-105'
              : 'bg-paper/85 text-ink hover:text-accent hover:scale-110'
          }`}
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>

        {/* Technique Badge */}
        {product.embroidery && (
          <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-cream/95 text-ink px-2 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[10px] tracking-widest uppercase border border-stone/80 font-medium">
            {product.embroidery.techniqueLabel}
          </div>
        )}

        {/* Quick Action Flyout - Desktop hover */}
        <div className="hidden sm:flex absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-gradient-to-t from-ink/90 via-ink/60 to-transparent gap-1.5 z-10">
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
      <div className="p-2.5 sm:p-4 md:p-5 flex-1 flex flex-col justify-between bg-paper">
        <div>
          <div className="flex items-center justify-between text-[9px] sm:text-[10px] uppercase font-sans tracking-widest text-ink-muted mb-0.5 sm:mb-1">
            <span className="truncate max-w-[120px] sm:max-w-none">
              {product.craftRegion || 'Made in India'}
              {product.garmentType ? ` · ${product.garmentType}` : ''}
            </span>
            {product.batchNumber != null && product.batchTotal != null && (
              <span className="shrink-0">Ed. {product.batchNumber}/{product.batchTotal}</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
            <Link to={`/product/${product.slug}`} className="hover:text-accent transition-colors flex-1 min-w-0">
              <h3 className="font-serif text-[13px] sm:text-base lg:text-lg text-ink font-normal leading-snug line-clamp-2">
                {product.name}
              </h3>
            </Link>
            <div className="flex sm:flex-col items-baseline sm:items-end gap-1.5 sm:gap-0 shrink-0">
              <span className="font-sans text-xs sm:text-sm font-semibold text-ink whitespace-nowrap">
                {formatPrice(defaultVariant.priceCents)}
              </span>
              {compareAt && compareAt > defaultVariant.priceCents && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] sm:text-[11px] text-ink-muted line-through">{formatPrice(compareAt)}</span>
                  {isV2 && offPct > 0 && (
                    <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.2 sm:px-1.5 sm:py-0.5">
                      ({offPct}%)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <p className="text-xs text-ink-muted mt-1.5 font-light line-clamp-2 hidden sm:block">
            {product.subtitle}
          </p>
          <div className="mt-1.5 sm:mt-2 flex flex-wrap items-center gap-x-2 sm:gap-x-3 gap-y-1 text-[9px] sm:text-[10px] uppercase tracking-wider text-ink-muted">
            {expInfo && (
              <span className="font-sans font-medium text-accent">
                ✦ {expInfo.name}
              </span>
            )}
            {product.collectionSlug && (
              <Link
                to={`/collections/${product.collectionSlug}`}
                className="font-medium text-ink hover:text-accent transition-colors underline decoration-stone/60 underline-offset-2 truncate max-w-[100px] sm:max-w-none"
                onClick={(e) => e.stopPropagation()}
              >
                {COLLECTIONS.find((c) => c.slug === product.collectionSlug)?.name || product.collectionSlug.replace(/-/g, ' ')}
              </Link>
            )}
            {!product.collectionSlug && product.artStyleSlug && (
              <span className="font-medium truncate max-w-[80px] sm:max-w-none">{product.artStyleSlug.replace(/-/g, ' ')}</span>
            )}
            {(product.craftTechniques ?? []).slice(0, 1).map((t) => (
              <span key={t} className="normal-case tracking-normal text-ink/70 hidden sm:inline">
                {t.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Meta: Sizes & Embroidery Hours */}
        <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-stone/40 flex justify-between items-center text-[9px] sm:text-[10px] text-ink-muted uppercase tracking-wider">
          {/* Available sizes */}
          <div className="flex items-center gap-1">
            <span className="text-[8px] sm:text-[9px] text-ink-muted truncate max-w-[80px] sm:max-w-none">
              Sizes {Array.from(new Set(product.variants.map((v) => v.size))).slice(0, 4).join('·')}
            </span>
          </div>

          {product.embroidery?.artisanHours && (
            <span className="font-medium text-ink text-[8px] sm:text-[10px] shrink-0">
              {product.embroidery.artisanHours}h <span className="hidden sm:inline">embroidery</span>
              {product.handcrafted && <span className="text-gold-deep hidden sm:inline"> · Handcrafted</span>}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
