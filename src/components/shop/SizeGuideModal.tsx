import React, { useState } from 'react';
import type { Product } from '../../lib/data';
import { sortSizes } from '../../lib/sizes';
import { useDialogFocus } from '../../hooks/useDialogFocus';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

type ChartRow = Record<string, unknown>;
type Chart = Record<string, ChartRow>;

const MEASUREMENT_LABELS: Record<string, string> = {
  chest: 'Chest',
  length: 'Length',
  sleeve: 'Sleeve',
  shoulder: 'Shoulder',
  width: 'Width',
  waist: 'Waist',
  hip: 'Hip',
};

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/**
 * GARMENT MEASUREMENTS — Modern Streetwear D2C Size Guide
 *
 * Clean white ground, responsive measurement table, CM/IN toggle,
 * and clear flat garment measurement instructions.
 */
export const SizeGuideModal: React.FC<SizeGuideModalProps> = ({ isOpen, onClose, product }) => {
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const dialogRef = useDialogFocus<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  const chart = (product.sizeChart ?? {}) as Chart;
  const sizes = sortSizes(Object.keys(chart));

  // Every measurement key that appears on any size, in a stable order.
  const fields = Array.from(
    new Set(sizes.flatMap((s) => Object.keys(chart[s] ?? {}))),
  ).filter((k) => isNum((chart[sizes[0]] ?? {})[k]) || sizes.some((s) => isNum(chart[s]?.[k])));

  const format = (value: unknown) => {
    if (!isNum(value)) return '—';
    return unit === 'cm' ? `${value} cm` : `${(value / 2.54).toFixed(1)}"`;
  };

  const hasAnyValue = fields.length > 0;

  return (
    <div className="fixed inset-0 z-[460] flex items-end justify-center sm:items-center sm:p-6">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-guide-title"
        tabIndex={-1}
        className="relative z-10 flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-neutral-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4.5">
          <div>
            <span className="rounded bg-black px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
              SIZE &amp; FIT GUIDE
            </span>
            <h3 id="size-guide-title" className="font-display text-lg font-black uppercase tracking-tight text-neutral-900 mt-1">
              {product.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close size guide"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-black transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Subhead / Unit Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 bg-neutral-50 px-6 py-3">
          <p className="max-w-[44ch] text-xs text-neutral-600 leading-relaxed">
            Exact garment dimensions laid flat. Compare against a favorite piece you own.
          </p>
          <div
            className="inline-flex rounded-lg border border-neutral-200 bg-white p-0.5 shadow-2xs"
            role="group"
            aria-label="Measurement unit"
          >
            {(['cm', 'in'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                aria-pressed={unit === u}
                className={`min-h-[34px] min-w-[46px] rounded-md px-3 text-xs font-black uppercase transition-all ${
                  unit === u
                    ? 'bg-black text-white shadow-xs'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                {u.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {hasAnyValue ? (
            <div className="overflow-x-auto rounded-xl border border-neutral-200">
              <table className="w-full border-collapse text-left text-xs">
                <caption className="sr-only">
                  Measurements for {product.name} by size, in {unit === 'cm' ? 'centimetres' : 'inches'}
                </caption>
                <thead>
                  <tr className="bg-neutral-100 border-b border-neutral-200">
                    <th scope="col" className="py-3 px-4 font-black uppercase tracking-wider text-neutral-900">
                      Size
                    </th>
                    {fields.map((f) => (
                      <th key={f} scope="col" className="py-3 px-4 font-black uppercase tracking-wider text-neutral-700">
                        {MEASUREMENT_LABELS[f] ?? f}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {sizes.map((size) => (
                    <tr key={size} className="hover:bg-neutral-50 transition-colors">
                      <th scope="row" className="py-3 px-4 font-mono font-black text-neutral-900 uppercase">
                        {size}
                      </th>
                      {fields.map((f) => (
                        <td key={f} className="py-3 px-4 font-mono font-medium text-neutral-700">
                          {format(chart[size]?.[f])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center">
              <p className="text-xs text-neutral-500 leading-relaxed">
                Specific flat measurements for this silhouette are calibrated according to standard Indian relaxed sizing. Check the size chips on the product page.
              </p>
            </div>
          )}

          {/* Fit Advice Callout */}
          <div className="mt-4 rounded-xl bg-amber-50/70 p-3.5 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <span className="text-sm">💡</span>
            <div>
              <p className="font-bold">Streetwear Fit Recommendation:</p>
              <p className="text-[11.5px] text-amber-800 mt-0.5">
                Our silhouettes are cut with a relaxed drop-shoulder aesthetic. For a fitted look, consider sizing down; for dramatic oversized volume, choose your regular size.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-3.5 flex items-center justify-between">
          <p className="text-[11px] text-neutral-500 font-medium">
            Need styling advice? Chat with our WhatsApp concierge.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 items-center justify-center rounded-lg bg-black px-4 text-xs font-black uppercase tracking-wider text-white shadow-2xs hover:bg-neutral-800 transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
