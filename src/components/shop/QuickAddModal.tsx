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

  useEffect(() => {
    if (product) {
      const defaultVariant = getDefaultVariant(product);
      setSelectedColor(colors[0] ?? defaultVariant.color ?? '');
      const firstInStockSize = sizes.find((s) => inStockSizes.has(s)) ?? sizes[0] ?? 'M';
      setSelectedSize(firstInStockSize);
    }
  }, [product, colors, sizes, inStockSizes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeQuickAdd();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeQuickAdd]);

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
      className="fixed inset-0 z-[250] flex items-end sm:items-center justify-center p-0 sm:p-4"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeQuickAdd}
        aria-hidden="true"
      />

      {/* Sheet / Dialog Container */}
      <div className="relative z-10 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white border border-neutral-200 p-5 sm:p-6 shadow-2xl transition-all max-h-[90vh] overflow-y-auto">
        {/* Header with thumbnail, title, price, and close button */}
        <div className="flex items-start gap-3.5 pb-4 border-b border-neutral-200">
          <div className="relative h-22 w-16.5 shrink-0 overflow-hidden rounded-lg bg-neutral-100 border border-neutral-200">
            <img
              src={thumbnail}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1 min-w-0 pr-6">
            <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-neutral-700">
              {product.garmentType ?? 'STREETWEAR'}
            </span>
            <h3
              id="quick-add-title"
              className="mt-1 font-display text-sm font-black uppercase tracking-tight text-neutral-900 line-clamp-2"
            >
              {product.name}
            </h3>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono text-sm font-black text-[#D32F2F]">
                {formatPrice(selectedVariant.priceCents)}
              </span>
              {compareAt && compareAt > selectedVariant.priceCents && (
                <span className="font-mono text-xs text-neutral-400 line-through">
                  {formatPrice(compareAt)}
                </span>
              )}
              {offPct > 0 && (
                <span className="rounded bg-red-100 px-1 py-0.2 text-[9px] font-black text-red-600">
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
            className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Color Options */}
        {colors.length > 1 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-neutral-900 uppercase text-[11px] tracking-wider">Color</span>
              <span className="text-neutral-500 capitalize">{selectedColor}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  className={`min-h-[36px] rounded-lg px-3.5 text-xs font-bold capitalize border transition-colors ${
                    selectedColor.toLowerCase() === c.toLowerCase()
                      ? 'border-black bg-black text-white shadow-2xs'
                      : 'border-neutral-300 bg-white text-neutral-800 hover:border-black'
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
            <span className="font-bold text-neutral-900 uppercase text-[11px] tracking-wider">Select Size</span>
            <span className={`text-[11px] font-bold ${isSoldOut ? 'text-red-600' : 'text-emerald-700'}`}>
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
                  className={`relative min-h-[44px] rounded-lg flex items-center justify-center text-xs font-black uppercase border transition-all ${
                    isSelected
                      ? 'border-black bg-black text-white shadow-xs'
                      : inStock
                      ? 'border-neutral-300 bg-white text-neutral-800 hover:border-black'
                      : 'border-neutral-200 bg-neutral-100 text-neutral-400 line-through cursor-not-allowed'
                  }`}
                >
                  {s}
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
            className="w-full min-h-[48px] rounded-lg flex items-center justify-center gap-2 bg-black text-white hover:bg-neutral-800 text-xs font-black uppercase tracking-wider shadow-md transition active:scale-[0.99] disabled:opacity-40 disabled:pointer-events-none"
          >
            {isSoldOut
              ? 'Sold Out in this Size'
              : `Add to Bag · ${formatPrice(selectedVariant.priceCents)}`}
          </button>

          <Link
            to={`/product/${product.slug}`}
            onClick={closeQuickAdd}
            className="text-center text-xs font-bold text-neutral-500 hover:text-black underline underline-offset-4 py-1 transition-colors"
          >
            View full garment &amp; craft details →
          </Link>
        </div>
      </div>
    </div>
  );
};
