import React, { useState } from 'react';
import type { Product } from '../../lib/data';
import { sortSizes } from '../../lib/sizes';
import { useDialogFocus } from '../../hooks/useDialogFocus';

interface SizeGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * The product whose measurements this guide shows. Required: the previous
   * version took a category string and printed a hard-coded table per category,
   * so a knitwear blouse and a knitwear cardigan advertised identical chests and
   * lengths that neither product's record contains. Every product in the
   * catalogue carries its own `size_chart`, and that is what this reads.
   */
  product: Product;
}

type ChartRow = Record<string, unknown>;
type Chart = Record<string, ChartRow>;

/** Ordered so the table reads XS → 3XL wherever those keys exist. */
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
 * GARMENT MEASUREMENTS
 *
 * Shape: the same ruled dialog grammar as the bag and the quick view — paper
 * ground, square corners, a mono table, label type for the field names. The old
 * version was a `shadow-2xl` rounded card with a blurred backdrop, a serif
 * "Atelier Fit & Dimensions", a gold ✦ notice promising complimentary bespoke
 * tailoring from a "master stitcher", and three invented measurement tables
 * selected by category.
 *
 * What remains is the product's own record: every variant's `size_chart` entry,
 * printed as it is stored, with the unit stated. Sizes with no recorded
 * measurement are listed as "Not recorded" rather than filled in.
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
    if (!isNum(value)) return 'Not recorded';
    // Records are stored in centimetres.
    return unit === 'cm' ? `${value} cm` : `${(value / 2.54).toFixed(1)}"`;
  };

  const hasAnyValue = fields.length > 0;

  return (
    <div className="fixed inset-0 z-[460] flex items-end justify-center sm:items-center sm:p-6">
      <div onClick={onClose} className="fixed inset-0 bg-ink/70" aria-hidden="true" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="size-guide-title"
        tabIndex={-1}
        className="relative z-10 flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden border border-stone bg-paper"
      >
        <div className="flex items-baseline justify-between gap-4 border-b border-stone px-5 py-4">
          <div>
            <p className="loom-label text-ink-muted">Garment measurements</p>
            <h3 id="size-guide-title" className="loom-display mt-1 text-[1.25rem] text-ink">
              {product.name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close size guide"
            className="inline-flex h-11 w-11 items-center justify-center text-ink transition-colors hover:text-accent"
          >
            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone px-5 py-3">
          <p className="max-w-[46ch] font-sans text-[12.5px] leading-relaxed text-ink-muted">
            This is the piece's own measurement record. Garment figures, not body
            figures — compare them against something you already own.
          </p>
          <div
            className="inline-flex shrink-0 border border-stone"
            role="group"
            aria-label="Measurement unit"
          >
            {(['cm', 'in'] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                aria-pressed={unit === u}
                className={`min-h-[44px] min-w-[52px] px-3 font-sans text-[11px] uppercase tracking-[0.1em] transition-colors ${
                  unit === u ? 'bg-ink text-cream' : 'text-ink hover:text-accent'
                }`}
              >
                {u === 'cm' ? 'CM' : 'IN'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto px-5 py-4">
          {hasAnyValue ? (
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">
                Measurements for {product.name} by size, in {unit === 'cm' ? 'centimetres' : 'inches'}
              </caption>
              <thead>
                <tr className="border-b border-stone">
                  <th scope="col" className="py-2 pr-3 loom-label text-ink-muted">
                    Size
                  </th>
                  {fields.map((f) => (
                    <th key={f} scope="col" className="py-2 pr-3 loom-label text-ink-muted">
                      {MEASUREMENT_LABELS[f] ?? f}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizes.map((size) => (
                  <tr key={size} className="border-b border-stone last:border-b-0">
                    <th scope="row" className="py-2 pr-3 font-sans text-[13px] text-ink">
                      {size}
                    </th>
                    {fields.map((f) => (
                      <td key={f} className="py-2 pr-3 loom-price text-[12.5px] text-ink-muted">
                        {format(chart[size]?.[f])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="font-sans text-[13px] leading-relaxed text-ink-muted">
              No measurements are recorded for this piece yet. The size run is on
              the product page; ask before ordering if the fit matters and we will
              measure one.
            </p>
          )}
        </div>

        <div className="border-t border-stone px-5 py-3">
          <p className="font-sans text-[12px] leading-relaxed text-ink-muted">
            Measurements are recorded per size in the catalogue. Anything absent
            above is absent from the record, not rounded to a guess.
          </p>
        </div>
      </div>
    </div>
  );
};
