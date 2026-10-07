import React from 'react';
import type { Product } from '../../lib/data';
import { formatPrice, getDefaultVariant } from '../../lib/data';
import { useCartStore } from '../../stores/cart';
import { useCustomizerStore } from '../../stores/customizer';
import { Image } from '../ui/Image';
import { Button } from '../ui/Button';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const defaultVariant = getDefaultVariant(product);
  const addItem = useCartStore((state) => state.addItem);
  const openCustomizer = useCustomizerStore((state) => state.openCustomizer);

  const frontImage = product.images[0]?.src || '/images/placeholders/hero.jpg';
  const macroImage = product.images[1]?.src || frontImage;

  return (
    <div className="group flex flex-col bg-paper border border-stone/60 transition-colors duration-300 hover:border-ink/40">
      {/* Visual Canvas: Image Swap on Hover */}
      <div className="relative aspect-[3/4] overflow-hidden bg-stone/20">
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
          <div className="absolute top-3 left-3 bg-ink/80 text-cream backdrop-blur-md px-2 py-0.5 text-[9px] uppercase tracking-widest font-sans">
            3x Stitch Macro
          </div>
        </div>

        {/* Technique Badge */}
        {product.embroidery && (
          <div className="absolute bottom-3 left-3 bg-cream/90 text-ink backdrop-blur-md px-2.5 py-1 text-[10px] tracking-widest uppercase border border-stone/80">
            {product.embroidery.techniqueLabel}
          </div>
        )}

        {/* Quick Add Flyout */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-gradient-to-t from-ink/80 to-transparent flex gap-2">
          <Button
            variant="primary"
            size="sm"
            className="flex-1 text-[10px] tracking-widest"
            onClick={() => addItem(product.slug, defaultVariant.sku, 1)}
          >
            Quick Add
          </Button>

          {product.customizable && (
            <Button
              variant="accent"
              size="sm"
              className="text-[10px] tracking-widest px-3"
              onClick={() => openCustomizer(product)}
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
            <h3 className="font-serif text-base sm:text-lg text-ink font-medium leading-snug group-hover:text-accent transition-colors">
              {product.name}
            </h3>
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
              {product.embroidery.artisanHours}h Needlework
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
