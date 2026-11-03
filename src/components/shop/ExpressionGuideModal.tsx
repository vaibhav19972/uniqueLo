import React from 'react';
import { Link } from 'react-router';
import { EXPRESSION_LEVELS } from '../../lib/data';
import { useDialogFocus } from '../../hooks/useDialogFocus';

interface ExpressionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScore?: number;
}

/**
 * WHAT "LOUDNESS" MEASURES — Modern Streetwear D2C Presence Guide
 *
 * Clean white ground, visual level badges (1–5), highlighted current piece,
 * coverage metrics, and instant links to presence shop collections.
 */
export const ExpressionGuideModal: React.FC<ExpressionGuideModalProps> = ({
  isOpen,
  onClose,
  currentScore,
}) => {
  const dialogRef = useDialogFocus<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  const levels = EXPRESSION_LEVELS.slice().sort((a, b) => a.score - b.score);

  return (
    <div className="fixed inset-0 z-[500] flex items-end justify-center sm:items-center sm:p-6">
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
        aria-labelledby="expression-modal-title"
        tabIndex={-1}
        className="relative z-10 flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-neutral-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-4.5">
          <div>
            <span className="rounded bg-black px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
              PRESENCE &amp; STYLES SPECTRUM
            </span>
            <h2
              id="expression-modal-title"
              className="mt-1 font-display text-lg font-black uppercase tracking-tight text-neutral-900"
            >
              How Loudly It Wears (Tiers 01–05)
            </h2>
            <p className="mt-1 max-w-[50ch] text-xs text-neutral-500 leading-relaxed">
              Every UniqueLo silhouette is calibrated across 5 embroidery presence levels, measuring thread coverage and visual density.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close presence guide"
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-black transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Levels List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 no-scrollbar">
          {levels.map((level) => {
            const isCurrent = level.score === currentScore;
            return (
              <div
                key={level.score}
                className={`rounded-xl border p-4 transition-all ${
                  isCurrent
                    ? 'border-red-600 bg-red-50/40 shadow-xs ring-1 ring-red-600/20'
                    : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Score Pill */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-black shadow-2xs ${
                      isCurrent
                        ? 'bg-red-600 text-white'
                        : 'bg-black text-white'
                    }`}
                  >
                    0{level.score}
                  </div>

                  {/* Level Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-sm font-black uppercase tracking-tight text-neutral-900">
                          {level.name}
                        </h3>
                        {isCurrent && (
                          <span className="rounded bg-red-600 px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-2xs animate-pulse">
                            Current Piece
                          </span>
                        )}
                      </div>
                      <Link
                        to={`/styles/${level.slug}`}
                        onClick={onClose}
                        className="text-xs font-bold text-neutral-600 hover:text-red-600 transition-colors"
                      >
                        Explore tier →
                      </Link>
                    </div>

                    <p className="mt-0.5 text-xs font-semibold text-neutral-800">
                      {level.tagline}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500 leading-relaxed">
                      {level.description}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-neutral-600">
                      <span className="text-neutral-400">Placement:</span>
                      <span className="rounded bg-white px-2 py-0.5 border border-neutral-200 text-neutral-800">
                        {level.characteristics}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-3.5 flex items-center justify-between">
          <Link
            to="/styles"
            onClick={onClose}
            className="text-xs font-black uppercase tracking-wider text-neutral-800 hover:text-red-600"
          >
            Open Styles &amp; Edits Studio →
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 items-center justify-center rounded-lg bg-black px-4 text-xs font-black uppercase tracking-wider text-white shadow-2xs hover:bg-neutral-800 transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
