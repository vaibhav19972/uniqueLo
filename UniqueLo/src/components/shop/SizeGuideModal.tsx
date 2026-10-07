import React, { useState } from 'react';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose, category = 'outerwear' }) => {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  if (!isOpen) return null;

  const sizeData: Record<string, { size: string; chest: string; length: string; shoulder: string }[]> = {
    outerwear: [
      { size: 'S / 38', chest: unit === 'inches' ? '41.5"' : '105 cm', length: unit === 'inches' ? '28.5"' : '72 cm', shoulder: unit === 'inches' ? '18.0"' : '46 cm' },
      { size: 'M / 40', chest: unit === 'inches' ? '43.5"' : '110 cm', length: unit === 'inches' ? '29.5"' : '75 cm', shoulder: unit === 'inches' ? '18.8"' : '48 cm' },
      { size: 'L / 42', chest: unit === 'inches' ? '46.0"' : '117 cm', length: unit === 'inches' ? '30.2"' : '77 cm', shoulder: unit === 'inches' ? '19.5"' : '50 cm' },
      { size: 'XL / 44', chest: unit === 'inches' ? '48.5"' : '123 cm', length: unit === 'inches' ? '31.0"' : '79 cm', shoulder: unit === 'inches' ? '20.2"' : '51 cm' },
    ],
    knitwear: [
      { size: 'S', chest: unit === 'inches' ? '40.0"' : '102 cm', length: unit === 'inches' ? '26.0"' : '66 cm', shoulder: unit === 'inches' ? '17.5"' : '44 cm' },
      { size: 'M', chest: unit === 'inches' ? '42.0"' : '107 cm', length: unit === 'inches' ? '27.0"' : '68 cm', shoulder: unit === 'inches' ? '18.2"' : '46 cm' },
      { size: 'L', chest: unit === 'inches' ? '44.5"' : '113 cm', length: unit === 'inches' ? '28.0"' : '71 cm', shoulder: unit === 'inches' ? '19.0"' : '48 cm' },
    ],
    tops: [
      { size: 'S', chest: unit === 'inches' ? '39.0"' : '99 cm', length: unit === 'inches' ? '27.0"' : '68 cm', shoulder: unit === 'inches' ? '17.5"' : '44 cm' },
      { size: 'M', chest: unit === 'inches' ? '41.5"' : '105 cm', length: unit === 'inches' ? '28.0"' : '71 cm', shoulder: unit === 'inches' ? '18.2"' : '46 cm' },
      { size: 'L', chest: unit === 'inches' ? '44.0"' : '112 cm', length: unit === 'inches' ? '29.0"' : '74 cm', shoulder: unit === 'inches' ? '19.0"' : '48 cm' },
    ],
  };

  const currentRows = sizeData[category] || sizeData.outerwear;

  return (
    <div className="fixed inset-0 z-[460] flex items-center justify-center p-4">
      <div
        onClick={onClose}
        className="fixed inset-0 bg-ink/70 backdrop-blur-md transition-opacity"
      />

      <div className="relative w-full max-w-xl bg-paper border border-stone shadow-2xl rounded-sm p-6 sm:p-8 z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between pb-4 border-b border-stone/60">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-accent font-medium font-sans">
              Tailoring Standards
            </span>
            <h3 className="font-serif text-2xl text-ink mt-0.5">
              Atelier Fit & Dimensions
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close size guide"
            className="p-1 text-ink-muted hover:text-ink text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Unit Switcher */}
        <div className="my-5 flex items-center justify-between">
          <p className="text-xs text-ink-muted">
            All pieces cut relaxed with natural ease for movement.
          </p>
          <div className="inline-flex border border-stone rounded-sm p-0.5 bg-cream">
            <button
              onClick={() => setUnit('inches')}
              className={`px-3 py-1 text-[10px] font-sans uppercase tracking-wider font-medium transition-colors ${
                unit === 'inches' ? 'bg-ink text-cream' : 'text-ink-muted hover:text-ink'
              }`}
            >
              Inches
            </button>
            <button
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 text-[10px] font-sans uppercase tracking-wider font-medium transition-colors ${
                unit === 'cm' ? 'bg-ink text-cream' : 'text-ink-muted hover:text-ink'
              }`}
            >
              Centimeters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-stone/60">
            <thead className="bg-cream border-b border-stone/60 text-[10px] uppercase tracking-widest text-ink">
              <tr>
                <th className="py-2.5 px-3 font-medium">Garment Size</th>
                <th className="py-2.5 px-3 font-medium">Chest Circumference</th>
                <th className="py-2.5 px-3 font-medium">Back Length</th>
                <th className="py-2.5 px-3 font-medium">Shoulder Width</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/40">
              {currentRows.map((row) => (
                <tr key={row.size} className="hover:bg-cream/40 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-ink">{row.size}</td>
                  <td className="py-2.5 px-3 text-ink-muted">{row.chest}</td>
                  <td className="py-2.5 px-3 text-ink-muted">{row.length}</td>
                  <td className="py-2.5 px-3 text-ink-muted">{row.shoulder}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 p-3.5 bg-cream border border-stone/60 text-[11px] text-ink-muted flex items-start gap-2.5">
          <span className="text-accent text-sm">✦</span>
          <p className="leading-relaxed">
            Need bespoke tailored dimensions or sleeve adjustment? Contact our atelier master stitcher for complimentary pre-dispatch adjustments.
          </p>
        </div>
      </div>
    </div>
  );
};
