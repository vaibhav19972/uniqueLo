import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { formatPrice, getDefaultVariant, type ProductVariant } from '../../lib/data';
import { catalogMrp } from '../../lib/pricing';
import { sortSizes } from '../../lib/sizes';
import { useCartStore } from '../../stores/cart';
import { useQuickAddStore } from '../../stores/quickAdd';
import { useToastStore } from '../../stores/toast';

export const QuickAddModal: React.FC = () => {
  const { isOpen, product, closeQuickAdd } = useQuickAddStore();
  const addItem = useCartStore((state) => state.addItem);
  const showToast = useToastStore((state) => state.showToast);

  // Available unique sizes in product
  const sizes = useMemo(() => {
    if (!product) return [];
    return sortSizes([...new Set(product.variants.map((v) => v.size))]);
  }, [product]);

  // Set of in-stock sizes
  const inStockSizes = useMemo(() => {
    if (!product) return new Set<string>();
    return new Set(
      product.variants
        .filter((v) => v.status !== 'out-of-stock' && (v.quantity == null || v.quantity > 0))
        .map((v) => v.size),
    );
  }, [product]);

  // Unique colors in variants if any
  const colors = useMemo(() => {
    if (!product) return [];
    const set = new Set<string>();
    for (const v of product.variants) {
      if (v.color) set.add(v.color);
    }
    return Array.from(set);
  }, [product]);

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  // Reset selections when product changes
  useEffect(() => {
    if (product) {
      const defaultVariant = getDefaultVariant(product);
      setSelectedColor(colors[0] ?? defaultVariant.color ?? '');
      const firstInStockSize = sizes.find((s) => inStockSizes.has(s)) ?? sizes[0] ?? 'M';
      setSelectedSize(firstInStockSize);
    }
  }, [product, colors, sizes, inStockSizes]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeQuickAdd();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeQuickAdd]);

  // Prevent background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const selectedVariant: ProductVariant | undefined = useMemo(() => {
    if (!product) return undefined;
    const match = product.variants.find(
      (v) =>
        v.size === selectedSize &&
        (!selectedColor || !v.color || v.color.toLowerCase() === selectedColor.toLowerCase()),
    );
    return match ?? product.variants.find((v) => v.size === selectedSize) ?? getDefaultVariant(product);
  }, [product, selectedSize, selectedColor]);

  if (!isOpen || !product || !selectedVariant) return null;

  const isSoldOut =
    selectedVariant.status === 'out-of-stock' ||
    (selectedVariant.quantity != null && selectedVariant.quantity <= 0);

  const mrp = catalogMrp(selectedVariant);
  const compareAt = mrp?.mrpCents ?? null;
  const offPct = mrp?.offPercent ?? 0;
  const thumbnail = product.images[0]?.src || '/images/placeholders/hero.jpg';

  const handleAddToCart = () => {
    if (isSoldOut) {
      showToast({
        title: 'Size unavailable',
        description: `${product.name} in size ${selectedSize} is currently out of stock.`,
        type: 'info',
      });
      return;
    }

    addItem(product.slug, selectedVariant.sku, 1, undefined, selectedVariant.quantity ?? 99);
    showToast({
      title: 'Added to bag',
      description: `${product.name} · Size ${selectedVariant.size}`,
      type: 'success',
    });
    closeQuickAdd();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-add-title"
      className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/50 backdrop-blur-sm transition-opacity"
        onClick={closeQuickAdd}
        aria-hidden="true"
      />

      {/* Sheet / Dialog Container */}
      <div className="relative z-10 w-full sm:max-w-md bg-paper border-t sm:border border-stone p-5 sm:p-6 sm:rounded-none shadow-2xl transition-all max-h-[90vh] overflow-y-auto">
        {/* Header with thumbnail, title, price, and close button */}
        <div className="flex items-start gap-3.5 pb-4 border-b border-stone">
          <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-cream border border-stone">
            <img
              src={thumbnail}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <p className="loom-label text-ink-muted uppercase">
              {product.countryOfOrigin ? `${product.countryOfOrigin} · ` : ''}
              {product.garmentType ?? 'Garment'}
            </p>
            <h3
              id="quick-add-title"
              className="mt-0.5 font-sans text-base font-semibold text-ink truncate"
            >
              {product.name}
            </h3>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="loom-price text-sm font-semibold text-ink">
                {formatPrice(selectedVariant.priceCents)}
              </span>
              {compareAt && compareAt > selectedVariant.priceCents && (
                <span className="loom-price text-xs text-ink-muted line-through">
                  {formatPrice(compareAt)}
                </span>
              )}
              {offPct > 0 && (
                <span className="font-sans text-[10px] font-semibold text-accent bg-accent-soft px-1.5 py-0.5">
                  {offPct}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={closeQuickAdd}
            aria-label="Close"
            className="absolute top-4 right-4 grid h-8 w-8 place-items-center text-ink-muted hover:text-ink hover:bg-cream rounded-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Color Options (if multiple colors) */}
        {colors.length > 1 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-sans font-medium text-ink">Color</span>
              <span className="font-sans text-ink-muted capitalize">{selectedColor}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`min-h-[36px] px-3 font-sans text-xs capitalize border transition-colors ${
                    selectedColor.toLowerCase() === c.toLowerCase()
                      ? 'border-ink bg-ink text-cream'
                      : 'border-stone bg-cream text-ink hover:border-ink'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size Selection */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-sans font-medium text-ink">Select Size</span>
            <span className="loom-price text-ink-muted">
              {isSoldOut ? 'Sold out in this size' : 'In stock'}
            </span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {sizes.map((s) => {
              const inStock = inStockSizes.has(s);
              const isSelected = selectedSize === s;

              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  className={`relative min-h-[44px] flex items-center justify-center font-sans text-xs font-medium uppercase border transition-all ${
                    isSelected
                      ? 'border-ink bg-ink text-cream shadow-sm'
                      : inStock
                      ? 'border-stone bg-paper text-ink hover:border-ink hover:bg-cream'
                      : 'border-stone/40 bg-stone/20 text-ink-muted/50 cursor-not-allowed'
                  }`}
                >
                  {s}
                  {!inStock && (
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <span className="w-full h-[1px] bg-ink-muted/40 rotate-45" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button: Add to Bag */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            disabled={isSoldOut}
            onClick={handleAddToCart}
            className="w-full min-h-[48px] flex items-center justify-center gap-2 bg-ink text-cream hover:bg-accent font-sans text-xs font-semibold uppercase tracking-[0.14em] transition-colors disabled:opacity-50 disabled:pointer-events-none shadow-sm"
          >
            {isSoldOut
              ? 'Sold Out in this Size'
              : `Add to Bag · ${formatPrice(selectedVariant.priceCents)}`}
          </button>

          <Link
            to={`/product/${product.slug}`}
            onClick={closeQuickAdd}
            className="text-center font-sans text-xs text-ink-muted hover:text-ink underline underline-offset-4 py-1"
          >
            View full garment & craft details →
          </Link>
        </div>
      </div>
    </div>
  );
};

