import React, { useState } from 'react';
import { Link } from 'react-router';
import { useQuickViewStore } from '../../stores/quickView';
import { useCartStore } from '../../stores/cart';
import { useCustomizerStore } from '../../stores/customizer';
import { useToastStore } from '../../stores/toast';
import { formatPrice, getDefaultVariant, type ProductVariant } from '../../lib/data';
import { Image } from '../ui/Image';
import { Button } from '../ui/Button';

export const QuickViewModal: React.FC = () => {
  const { isOpen, product, closeQuickView } = useQuickViewStore();
  const addItem = useCartStore((state) => state.addItem);
  const openCustomizer = useCustomizerStore((state) => state.openCustomizer);
  const showToast = useToastStore((state) => state.showToast);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!isOpen || !product) return null;

  const currentVariant = selectedVariant || getDefaultVariant(product);

  const handleAdd = () => {
    addItem(product.slug, currentVariant.sku, 1);
    showToast({
      title: 'Added to Atelier Bag',
      description: `${product.name} (${currentVariant.color} / ${currentVariant.size})`,
      type: 'success',
    });
    closeQuickView();
  };

  const handleCustomizer = () => {
    closeQuickView();
    openCustomizer(product);
  };

  return (
    <div className="fixed inset-0 z-[420] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        onClick={closeQuickView}
        className="fixed inset-0 bg-ink/75 backdrop-blur-md transition-opacity"
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-4xl bg-paper border border-stone shadow-2xl rounded-sm overflow-hidden z-10 flex flex-col md:flex-row max-h-[90vh] animate-in zoom-in-95 duration-200">
        <button
          onClick={closeQuickView}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-ink-muted hover:text-ink text-sm p-1.5 transition-colors z-20 bg-paper/80 rounded-full"
        >
          ✕
        </button>

        {/* Gallery Column */}
        <div className="w-full md:w-1/2 bg-stone/20 relative flex flex-col">
          <div className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={product.images[activeImageIndex]?.src || product.images[0]?.src}
              alt={product.images[activeImageIndex]?.alt || product.name}
              aspectRatio="3/4"
              className="w-full h-full object-cover"
            />
            {activeImageIndex === 1 && (
              <div className="absolute top-4 left-4 bg-ink/90 text-cream text-[10px] uppercase tracking-widest px-2.5 py-1 backdrop-blur-sm">
                ✦ 3x Macro Stitch View
              </div>
            )}
          </div>

          {/* Image Thumbnails */}
          <div className="p-3 bg-cream/80 border-t border-stone/50 flex gap-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-14 h-16 border overflow-hidden transition-all ${
                  activeImageIndex === idx ? 'border-accent ring-1 ring-accent' : 'border-stone opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.tried) {
                      target.dataset.tried = 'true';
                      if (target.src.endsWith('.jpg')) target.src = target.src.replace(/\.jpg$/, '.png');
                      else if (target.src.endsWith('.png')) target.src = target.src.replace(/\.png$/, '.jpg');
                    }
                  }}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details Column */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-sans tracking-[0.25em] text-accent uppercase font-medium">
                {product.categorySlug}
              </span>
              {product.embroidery && (
                <span className="text-[10px] tracking-widest text-ink-muted uppercase border-l border-stone pl-2">
                  {product.embroidery.artisanHours}h Needlework
                </span>
              )}
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl text-ink font-normal leading-tight">
              {product.name}
            </h3>

            <div className="mt-2 flex items-baseline gap-3">
              <span className="font-sans text-xl font-medium text-ink">
                {formatPrice(currentVariant.priceCents)}
              </span>
              <span className="text-[11px] text-ink-muted">Complimentary Shipping</span>
            </div>

            <p className="text-xs text-ink-muted mt-3 font-light leading-relaxed">
              {product.subtitle}
            </p>

            {/* Color Swatches */}
            <div className="mt-6">
              <label className="text-[11px] font-sans tracking-widest uppercase text-ink block mb-2 font-medium">
                Color: <span className="text-ink-muted font-normal">{currentVariant.color}</span>
              </label>
              <div className="flex gap-2.5">
                {Array.from(new Set(product.variants.map((v) => v.color))).map((color) => {
                  const variantForColor = product.variants.find((v) => v.color === color);
                  const isSelected = currentVariant.color === color;
                  return (
                    <button
                      key={color}
                      onClick={() => variantForColor && setSelectedVariant(variantForColor)}
                      className={`w-7 h-7 rounded-full border transition-all ${
                        isSelected ? 'ring-2 ring-accent ring-offset-2 scale-105 border-transparent' : 'border-stone hover:scale-105'
                      }`}
                      style={{ backgroundColor: variantForColor?.colorHex }}
                      title={color}
                    />
                  );
                })}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mt-5">
              <label className="text-[11px] font-sans tracking-widest uppercase text-ink block mb-2 font-medium">
                Size: <span className="text-ink-muted font-normal">{currentVariant.size}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants
                  .filter((v) => v.color === currentVariant.color)
                  .map((v) => {
                    const isSelected = currentVariant.sku === v.sku;
                    return (
                      <button
                        key={v.sku}
                        onClick={() => setSelectedVariant(v)}
                        className={`px-3.5 py-1.5 text-xs font-sans border transition-colors ${
                          isSelected
                            ? 'bg-ink text-cream border-ink font-medium'
                            : 'bg-paper text-ink border-stone hover:border-ink/60'
                        }`}
                      >
                        {v.size}
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Embroidery Tech Pill */}
            {product.embroidery && (
              <div className="mt-6 p-3 bg-cream border border-stone/60 rounded-sm text-xs">
                <span className="block text-[9px] uppercase tracking-widest text-accent font-medium mb-1">
                  Artisanal Technique
                </span>
                <p className="text-ink font-serif text-sm">
                  {product.embroidery.techniqueLabel}
                </p>
                <p className="text-ink-muted text-[11px] mt-0.5">
                  {product.embroidery.threadComposition}
                </p>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="mt-8 pt-6 border-t border-stone/50 space-y-2.5">
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="md"
                className="flex-1 text-xs tracking-widest"
                onClick={handleAdd}
              >
                Add to Atelier Bag
              </Button>
              {product.customizable && (
                <Button
                  variant="accent"
                  size="md"
                  className="text-xs tracking-widest px-4"
                  onClick={handleCustomizer}
                >
                  Bespoke
                </Button>
              )}
            </div>

            <Link
              to={`/product/${product.slug}`}
              onClick={closeQuickView}
              className="block text-center text-xs uppercase tracking-widest text-ink hover:text-accent font-medium py-1 transition-colors"
            >
              Inspect Full Macro & Provenance Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
