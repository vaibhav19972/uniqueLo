import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useUIStore } from '../../stores/ui';
import { useCartStore } from '../../stores/cart';
import { formatPrice } from '../../lib/data';

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const COLOR_SWATCHES = [
  { name: 'Washed Black', hex: '#1C1C1E' },
  { name: 'Vintage Olive', hex: '#3E4234' },
  { name: 'Acid Maroon', hex: '#4A1521' },
  { name: 'Bone White', hex: '#EBE5D8' },
  { name: 'Shadow Navy', hex: '#1C2433' },
];

export const SelectOptionsModal: React.FC = () => {
  const product = useUIStore((state) => state.quickViewProduct);
  const closeQuickView = useUIStore((state) => state.closeQuickView);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const navigate = useNavigate();

  const [selectedSize, setSelectedSize] = useState('L');
  const [selectedColor, setSelectedColor] = useState(COLOR_SWATCHES[0].name);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedSize('L');
      setSelectedImageIdx(0);
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const firstVariant = product.variants?.[0];
  const priceCents = firstVariant?.priceCents || 129900;
  const mrpCents = Math.round(priceCents * 1.55);
  const savePercent = Math.round(((mrpCents - priceCents) / mrpCents) * 100);
  const emiPerMonth = Math.round(priceCents / 100 / 3);

  const images = product.images && product.images.length > 0
    ? product.images.map((img) => img.src)
    : ['/images/placeholders/hoodie.jpg'];

  const activeImage = images[selectedImageIdx] || images[0];

  const handleAddToCart = () => {
    const sku = firstVariant?.sku || `${product.slug}-${selectedSize}`;
    addItem(product.slug, sku, quantity, undefined, undefined, true);
    closeQuickView();
    openCart();
  };

  const handleBuyItNow = () => {
    const sku = firstVariant?.sku || `${product.slug}-${selectedSize}`;
    addItem(product.slug, sku, quantity, undefined, undefined, false);
    closeQuickView();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={closeQuickView}
        aria-hidden="true"
      />

      {/* Modal / Bottom Sheet Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-view-title"
        className="relative z-10 flex max-h-[90dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl md:max-h-[85vh] md:rounded-2xl"
      >
        {/* Mobile Drag / Grab Handle */}
        <div className="flex h-5 w-full items-center justify-center pt-2 md:hidden">
          <div className="h-1.5 w-12 rounded-full bg-neutral-300" />
        </div>

        {/* Header Row */}
        <div className="flex items-center justify-between border-b border-[#EDEDED] px-4 py-3">
          <span className="font-mono text-xs font-black uppercase tracking-wider text-black">
            SELECT OPTIONS
          </span>
          <button
            type="button"
            onClick={closeQuickView}
            aria-label="Close modal"
            className="flex h-11 w-11 items-center justify-center -mr-2 text-neutral-500 hover:text-black"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 no-scrollbar space-y-4">
          {/* Product Media & Basic Info */}
          <div className="flex gap-4">
            {/* Main Thumbnail + Thumb row */}
            <div className="flex flex-col gap-1.5 w-24 shrink-0">
              <div className="aspect-[3/4] w-full overflow-hidden rounded bg-neutral-100">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="h-full w-full object-cover object-center"
                />
              </div>

              {images.length > 1 && (
                <div className="flex gap-1 overflow-x-auto no-scrollbar">
                  {images.slice(0, 4).map((imgSrc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`h-7 w-7 shrink-0 overflow-hidden rounded border ${
                        idx === selectedImageIdx ? 'border-black ring-1 ring-black' : 'border-neutral-200'
                      }`}
                    >
                      <img src={imgSrc} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Meta */}
            <div className="flex flex-1 flex-col justify-center">
              <h3 id="quick-view-title" className="text-sm font-black uppercase tracking-tight text-neutral-900 leading-snug">
                {product.name}
              </h3>

              {/* Price row */}
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-base font-black text-[#D32F2F]">
                  {formatPrice(priceCents)}
                </span>
                <span className="text-xs text-neutral-400 line-through">
                  {formatPrice(mrpCents)}
                </span>
                <span className="rounded-xs bg-black px-1.5 py-0.5 text-[9px] font-black italic text-white">
                  SAVE {savePercent}%
                </span>
              </div>

              {/* Reviews & Tax note */}
              <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-500">
                <span className="text-amber-500 font-bold">★★★★★</span>
                <span>(668 reviews)</span>
              </div>
              <span className="text-[10px] text-neutral-400">
                Inclusive of all taxes • Ships in 48 hrs
              </span>
            </div>
          </div>

          {/* Size Selector */}
          <div className="pt-2 border-t border-neutral-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wide text-neutral-900">
                SIZE: <span className="font-black text-black">{selectedSize}</span>
              </span>
              <button
                type="button"
                onClick={() => setShowSizeGuide(!showSizeGuide)}
                className="text-xs font-bold text-neutral-700 underline hover:text-black"
              >
                📏 Sizing guide
              </button>
            </div>

            {showSizeGuide && (
              <div className="my-2 rounded bg-neutral-50 p-2.5 text-[11px] text-neutral-600 border border-neutral-200">
                <p className="font-bold text-black">UniqueLo Oversized Fit Guide:</p>
                <p className="mt-0.5">Crafted with dropped shoulders and relaxed chest. If you prefer a regular boxy look, size down. For true baggy streetwear, order your normal size.</p>
              </div>
            )}

            {/* Size Pills (Min 44x44px touch targets) */}
            <div className="mt-2.5 grid grid-cols-6 gap-2">
              {SIZES.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`flex h-11 min-w-[44px] items-center justify-center rounded border font-mono text-xs font-bold uppercase transition ${
                      isSelected
                        ? 'border-black bg-black text-white shadow-sm'
                        : 'border-neutral-300 bg-white text-neutral-800 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Colorway Selection */}
          <div className="pt-2 border-t border-neutral-100">
            <span className="block text-xs font-bold uppercase tracking-wide text-neutral-900">
              COLOR: <span className="font-black text-black">{selectedColor}</span>
            </span>

            <div className="mt-2 flex flex-wrap gap-2.5">
              {COLOR_SWATCHES.map((color) => {
                const isSelected = selectedColor === color.name;
                return (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.name)}
                    aria-label={`Select ${color.name}`}
                    className={`flex h-11 w-11 items-center justify-center rounded-full transition ${
                      isSelected ? 'ring-2 ring-black ring-offset-2' : 'hover:scale-105'
                    }`}
                  >
                    <span
                      className="h-8 w-8 rounded-full border border-black/20 shadow-xs"
                      style={{ backgroundColor: color.hex }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Stepper */}
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-neutral-900">
              QUANTITY
            </span>
            <div className="flex h-11 items-center rounded border border-neutral-300 bg-white">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="flex h-11 w-11 items-center justify-center text-sm font-bold text-neutral-700 hover:bg-neutral-100"
              >
                −
              </button>
              <span className="w-10 text-center font-mono text-xs font-bold text-black">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
                className="flex h-11 w-11 items-center justify-center text-sm font-bold text-neutral-700 hover:bg-neutral-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex min-h-[48px] w-full items-center justify-center rounded bg-black py-3 px-4 font-display text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-neutral-800 active:scale-98"
            >
              ADD TO CART • {formatPrice(priceCents * quantity)}
            </button>

            <button
              type="button"
              onClick={handleBuyItNow}
              className="flex min-h-[48px] w-full items-center justify-center rounded border-2 border-black bg-white py-3 px-4 font-display text-xs font-black uppercase tracking-wider text-black transition hover:bg-neutral-50 active:scale-98"
            >
              BUY IT NOW ⚡
            </button>
          </div>

          {/* ── Fintech Conversion Widgets ── */}
          <div className="space-y-2 rounded-xl bg-neutral-50 p-3 border border-neutral-200">
            <span className="block text-[10px] font-black uppercase tracking-widest text-neutral-400">
              ★ SPECIAL OFFERS ★
            </span>

            {/* Zero-Cost UPI EMI */}
            <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-neutral-200 shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-emerald-100 text-emerald-800 font-black text-xs">
                  ₹
                </span>
                <div className="text-left">
                  <p className="text-[11px] font-black text-neutral-900 leading-tight">
                    Zero-Cost EMI on UPI | Pay ₹{emiPerMonth} × 3 Months
                  </p>
                  <p className="text-[9.5px] text-neutral-500">
                    No credit card required • Instant verification
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-[10px] font-bold text-emerald-700 underline">
                Available
              </span>
            </div>

            {/* Prepaid UPI ₹60 Off */}
            <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-neutral-200 shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-amber-100 text-amber-800 font-black text-xs">
                  ⚡
                </span>
                <div className="text-left">
                  <p className="text-[11px] font-black text-neutral-900 leading-tight">
                    Prepaid Discounts | Get ₹60 Off on UPI
                  </p>
                  <p className="text-[9.5px] text-neutral-500">
                    5+ Instant payment discounts available at checkout
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-[10px] font-bold text-amber-700">
                AUTO-APPLIED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
