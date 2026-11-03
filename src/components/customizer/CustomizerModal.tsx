import React from 'react';
import { useCustomizerStore } from '../../stores/customizer';
import { useCartStore } from '../../stores/cart';
import { useToastStore } from '../../stores/toast';
import { getDefaultVariant } from '../../lib/data';

const THREAD_COLORS = [
  { name: '24K Gold Zari', hex: '#d4af37' },
  { name: 'Ecru Silk', hex: '#f4efe6' },
  { name: 'Burnt Terracotta', hex: '#c06b52' },
  { name: 'French Navy', hex: '#1d2a44' },
  { name: 'Vintage Ochre', hex: '#d4a373' },
  { name: 'Deep Forest', hex: '#2d3e30' },
];

const PLACEMENTS = ['Left Chest', 'Sleeve Cuff', 'Back Yoke', 'Hemline'];
const STYLES = ['Serif Monogram', 'Botanical Needlepoint', 'Heritage Crest', 'Contemporary Minimal'];

/**
 * BESPOKE MONOGRAM STUDIO MODAL — Modern Streetwear D2C Revamp
 *
 * Live garment thread preview, color palette selectors, placement controls,
 * and seamless one-click addition to the bag.
 */
export const CustomizerModal: React.FC = () => {
  const {
    isOpen,
    product,
    text,
    placement,
    threadColor,
    threadHex,
    style,
    closeCustomizer,
    setText,
    setPlacement,
    setThreadColor,
    setStyle,
  } = useCustomizerStore();

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const showToast = useToastStore((state) => state.showToast);

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    const defaultVariant = getDefaultVariant(product);
    addItem(product.slug, defaultVariant.sku, 1, {
      monogramText: text,
      threadColor: threadColor,
      placement: placement,
    });
    closeCustomizer();
    openCart();
    showToast({
      title: 'Added to Bag',
      description: `Custom embroidered piece added with "${text || 'UNIQUELO'}" monogram.`,
      type: 'success',
    });
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-3 sm:p-6 lg:p-8">
      {/* Backdrop */}
      <div
        onClick={closeCustomizer}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Studio Window */}
      <div className="relative z-10 flex h-full max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl md:flex-row">
        {/* Left: Live Canvas Simulation Plate */}
        <div className="relative flex w-full flex-col justify-between bg-neutral-950 p-6 text-white md:w-1/2 md:p-8 border-b md:border-b-0 md:border-r border-neutral-800">
          {/* Header */}
          <div className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
            <span>LIVE EMBROIDERY CANVAS</span>
            <span className="rounded bg-neutral-800 px-2 py-0.5 text-[10px] text-white">
              {placement}
            </span>
          </div>

          {/* Simulated Garment Fabric Texture with Needlework */}
          <div className="my-6 mx-auto flex h-60 w-60 sm:h-72 sm:w-72 flex-col items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/90 relative overflow-hidden shadow-2xl">
            {/* Fabric weave grain */}
            <div className="pointer-events-none absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:10px_10px]" />

            {/* Simulated Embroidery Needlework */}
            <div className="relative z-10 flex flex-col items-center">
              {style === 'Heritage Crest' && (
                <svg className="h-16 w-16 mb-2" viewBox="0 0 100 100" fill="none">
                  <path
                    d="M50 15 L80 30 L80 65 Q50 95 50 95 Q20 65 20 30 Z"
                    stroke={threadHex}
                    strokeWidth="2.5"
                    strokeDasharray="4 2"
                  />
                  <circle cx="50" cy="45" r="14" stroke={threadHex} strokeWidth="1.5" />
                </svg>
              )}

              {style === 'Botanical Needlepoint' && (
                <svg className="h-10 w-20 mb-1" viewBox="0 0 120 60" fill="none">
                  <path
                    d="M10 50 Q60 10 110 50"
                    stroke={threadHex}
                    strokeWidth="2"
                    strokeDasharray="3 1.5"
                  />
                  <circle cx="35" cy="30" r="3" fill={threadHex} />
                  <circle cx="85" cy="30" r="3" fill={threadHex} />
                </svg>
              )}

              {/* Stitched Monogram Letters */}
              <div
                className={`text-5xl tracking-widest transition-colors duration-300 font-black ${
                  style === 'Contemporary Minimal' ? 'font-mono' : 'font-display'
                }`}
                style={{
                  color: threadHex,
                  textShadow: `0 0 12px ${threadHex}60, 1px 1px 2px rgba(0,0,0,0.9)`,
                  letterSpacing: '0.2em',
                }}
              >
                {text || '—'}
              </div>

              {/* Specular luster bar */}
              <div
                className="mt-3 h-0.5 w-16 rounded-full opacity-80"
                style={{ backgroundColor: threadHex }}
              />
            </div>

            <span className="absolute bottom-3 text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              Thread: {threadColor}
            </span>
          </div>

          {/* Bottom Lore Note */}
          <div className="text-center">
            <p className="font-display text-xs font-bold uppercase tracking-wider text-neutral-200">
              {product.name}
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Precision hand-guided embroidery on 400 GSM heavyweight cotton
            </p>
          </div>
        </div>

        {/* Right: Customization Controls */}
        <div className="flex w-full flex-col justify-between overflow-y-auto bg-white p-6 sm:p-8 md:w-1/2 no-scrollbar">
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-neutral-200 pb-3.5">
              <div>
                <span className="rounded bg-black px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                  BESPOKE STUDIO
                </span>
                <h3 className="font-display text-lg font-black uppercase tracking-tight text-neutral-900 mt-1">
                  Personalize Your Piece
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Complimentary bespoke monogramming included
                </p>
              </div>
              <button
                type="button"
                onClick={closeCustomizer}
                className="-mr-2 flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-black transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Initials Input */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                Initials (Max 4 Characters)
              </label>
              <input
                type="text"
                maxLength={4}
                value={text}
                onChange={(e) => setText(e.target.value.toUpperCase())}
                placeholder="e.g. UQ"
                className="h-11 w-full rounded-lg border border-neutral-300 bg-neutral-50 px-4 text-center font-mono text-base font-black uppercase tracking-widest text-neutral-900 focus:border-black focus:bg-white focus:outline-none transition-colors"
              />
            </div>

            {/* Thread Palette */}
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold uppercase tracking-wider text-neutral-700 text-[11px]">
                  Thread Color
                </span>
                <span className="font-bold text-neutral-900 text-xs">{threadColor}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {THREAD_COLORS.map((color) => {
                  const isSelected = threadColor === color.name;
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => setThreadColor(color.name, color.hex)}
                      className={`flex items-center gap-2 rounded-lg border p-2 text-left transition-all ${
                        isSelected
                          ? 'border-black bg-neutral-100 ring-1 ring-black shadow-2xs font-bold'
                          : 'border-neutral-200 bg-white hover:border-neutral-400'
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-black/20 shrink-0 shadow-2xs"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="truncate text-[11px] text-neutral-800">{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Placement Selection */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-2">
                Placement
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PLACEMENTS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPlacement(item)}
                    className={`h-10 rounded-lg border text-xs font-bold uppercase tracking-wider transition-all ${
                      placement === item
                        ? 'border-black bg-black text-white shadow-xs'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-black'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Motif Style */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-2">
                Embroidered Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={`h-10 rounded-lg border px-2 text-[11px] font-bold uppercase tracking-wider transition-all ${
                      style === s
                        ? 'border-black bg-black text-white shadow-xs'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-black'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Add to Bag CTA */}
          <div className="pt-5 mt-5 border-t border-neutral-100">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-black text-xs font-black uppercase tracking-wider text-white shadow-md transition hover:bg-neutral-800 active:scale-[0.99]"
            >
              <span>Add Custom Piece to Bag — Free Monogram</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
