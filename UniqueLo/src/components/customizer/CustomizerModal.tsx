import React from 'react';
import { useCustomizerStore } from '../../stores/customizer';
import { useCartStore } from '../../stores/cart';
import { getDefaultVariant } from '../../lib/data';
import { Button } from '../ui/Button';

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

  if (!isOpen || !product) return null;

  const handleAddToCart = () => {
    const defaultVariant = getDefaultVariant(product);
    addItem(product.slug, defaultVariant.sku, 1, {
      monogramText: text,
      threadColor: threadColor,
      placement: placement,
    });
    closeCustomizer();
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Backdrop */}
      <div
        onClick={closeCustomizer}
        className="fixed inset-0 bg-ink/70 backdrop-blur-md transition-opacity"
      />

      {/* Atelier Studio Window */}
      <div className="relative w-full max-w-4xl bg-cream border border-stone/80 shadow-2xl rounded-sm overflow-hidden z-10 flex flex-col md:flex-row max-h-[90vh]">
        {/* Left: Interactive Embroidery Canvas Live Preview */}
        <div className="w-full md:w-1/2 bg-ink p-8 flex flex-col items-center justify-between relative overflow-hidden text-cream border-b md:border-b-0 md:border-r border-stone/20">
          <div className="w-full flex items-center justify-between text-xs tracking-widest text-warm-gray uppercase">
            <span>Atelier Live Canvas</span>
            <span>{placement}</span>
          </div>

          {/* Simulated Garment Fabric Texture with Needlework SVG */}
          <div className="my-8 w-64 h-64 sm:w-72 sm:h-72 rounded-sm bg-[#161618] border border-stone/20 flex flex-col items-center justify-center relative shadow-inner overflow-hidden">
            {/* Fabric weave grain */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:12px_12px]" />

            {/* Simulated Embroidery Needlework Stitches */}
            <div className="relative z-10 flex flex-col items-center">
              {style === 'Heritage Crest' && (
                <svg className="w-16 h-16 mb-2" viewBox="0 0 100 100" fill="none">
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
                <svg className="w-20 h-10 mb-1" viewBox="0 0 120 60" fill="none">
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
                className={`text-5xl font-serif tracking-widest transition-colors duration-300 ${
                  style === 'Contemporary Minimal' ? 'font-sans font-light' : 'font-serif'
                }`}
                style={{
                  color: threadHex,
                  textShadow: `1px 1px 0px rgba(0,0,0,0.8), 0 0 8px ${threadHex}40`,
                  letterSpacing: '0.2em',
                }}
              >
                {text || '—'}
              </div>

              {/* Thread luster specular highlight bar */}
              <div
                className="w-16 h-0.5 mt-3 rounded-full opacity-70"
                style={{ backgroundColor: threadHex }}
              />
            </div>

            <span className="absolute bottom-3 text-[10px] tracking-widest uppercase text-warm-gray/70">
              {threadColor} Thread
            </span>
          </div>

          <div className="text-center">
            <p className="text-xs font-serif text-cream">{product.name}</p>
            <p className="text-[10px] text-warm-gray mt-0.5">
              Hand-guided satin stitch by master artisans
            </p>
          </div>
        </div>

        {/* Right: Customization Controls */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto bg-cream">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone/60">
              <div>
                <h3 className="font-serif text-2xl text-ink">Bespoke Monogram Studio</h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Personalize with tailored embroidery initials
                </p>
              </div>
              <button
                onClick={closeCustomizer}
                className="text-ink-muted hover:text-ink transition-colors p-1"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Initials Input */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-ink mb-1.5">
                Initials (Max 4 Characters)
              </label>
              <input
                type="text"
                maxLength={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="E.G. UL"
                className="w-full bg-paper border border-stone px-4 py-2.5 text-lg font-serif tracking-widest text-ink focus:outline-none focus:border-accent uppercase"
              />
            </div>

            {/* Thread Palette */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-ink mb-2">
                Thread Selection: <span className="font-semibold text-accent">{threadColor}</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {THREAD_COLORS.map((color) => {
                  const isSelected = threadColor === color.name;
                  return (
                    <button
                      key={color.name}
                      onClick={() => setThreadColor(color.name, color.hex)}
                      className={`flex items-center space-x-2 p-2 border text-xs font-sans text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-ink bg-paper shadow-sm ring-1 ring-ink'
                          : 'border-stone hover:border-ink/50 bg-paper/60'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-stone flex-shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="truncate text-[11px] text-ink">{color.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Placement Selection */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-ink mb-2">
                Needlework Placement
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PLACEMENTS.map((item) => (
                  <button
                    key={item}
                    onClick={() => setPlacement(item)}
                    className={`py-2 px-3 text-xs border text-center transition-all cursor-pointer ${
                      placement === item
                        ? 'border-ink bg-ink text-cream'
                        : 'border-stone bg-paper text-ink hover:border-ink/50'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Typography / Motif Style */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-ink mb-2">
                Embroidered Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`py-2 px-3 text-xs border text-center transition-all cursor-pointer ${
                      style === s
                        ? 'border-accent bg-paper text-accent font-medium'
                        : 'border-stone bg-paper text-ink hover:border-ink/50'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Add to Atelier Bag with Monogram */}
          <div className="pt-6 mt-6 border-t border-stone/60">
            <Button
              variant="primary"
              size="lg"
              className="w-full tracking-widest text-xs"
              onClick={handleAddToCart}
            >
              Add Bespoke Garment to Bag — Free Monogram
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
