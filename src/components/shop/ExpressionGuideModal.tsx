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
 * WHAT "LOUDLY" MEASURES
 *
 * The guide behind the five-level presence axis on every product page. It was a
 * `shadow-2xl` card with a blurred backdrop, a gold eyebrow reading "Atelier
 * Discovery Axis", a serif heading, per-level cards that ringed themselves in
 * accent on the current piece, and a footer promising "bespoke initials in our
 * Studio" to every buyer whether or not the piece is customizable.
 *
 * Now it is the same five-row ruled index as `/styles`, at dialog scale: mono
 * score, display name, tagline, description, characteristics. The current piece
 * is marked with an ink rule and the word "This piece" — not a coloured ring,
 * because presence is an axis, not a state.
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
      <div onClick={onClose} className="fixed inset-0 bg-ink/70" aria-hidden="true" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="expression-modal-title"
        tabIndex={-1}
        className="relative z-10 flex max-h-[92svh] w-full max-w-2xl flex-col overflow-hidden border border-stone bg-paper"
      >
        <div className="flex items-start justify-between gap-4 border-b border-stone px-5 py-4">
          <div>
            <p className="loom-label text-ink-muted">Presence</p>
            <h2
              id="expression-modal-title"
              className="loom-display mt-1 text-[1.375rem] text-ink"
            >
              How loudly it wears
            </h2>
            <p className="mt-1.5 max-w-[52ch] font-sans text-[12.5px] leading-relaxed text-ink-muted">
              One question, five answers: how much of the garment the embroidery
              takes. Every piece sits on exactly one level.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close presence guide"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center text-ink transition-colors hover:text-accent"
          >
            <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          <ol className="border-t border-stone">
            {levels.map((level) => {
              const isCurrent = level.score === currentScore;
              return (
                <li
                  key={level.score}
                  className={`border-b border-stone py-3.5 ${isCurrent ? 'bg-accent-soft' : ''}`}
                >
                  <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-3 gap-y-1">
                    <span
                      className={`loom-price pt-0.5 text-[11px] ${
                        isCurrent ? 'text-accent' : 'text-ink-muted'
                      }`}
                    >
                      {String(level.score).padStart(2, '0')}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                        <h3 className="loom-display text-[1.0625rem] text-ink">{level.name}</h3>
                        {isCurrent && (
                          <span className="loom-label text-accent">This piece</span>
                        )}
                        <Link
                          to={`/styles/${level.slug}`}
                          onClick={onClose}
                          className="ml-auto font-sans text-[11.5px] text-ink underline decoration-stone-strong underline-offset-4 transition-colors hover:decoration-ink"
                        >
                          See the shop →
                        </Link>
                      </div>

                      <p className="mt-0.5 font-sans text-[12.5px] leading-snug text-ink">
                        {level.tagline}
                      </p>
                      <p className="mt-1 font-sans text-[12px] leading-relaxed text-ink-muted">
                        {level.description}
                      </p>
                      <p className="loom-label mt-1.5 text-ink-muted">
                        Reads as{' '}
                        <span className="normal-case tracking-normal text-ink">
                          {level.characteristics}
                        </span>
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone px-5 py-3">
          <p className="max-w-[42ch] font-sans text-[12px] leading-relaxed text-ink-muted">
            Monograms are available on the pieces whose record says so, not on
            every piece in the shop.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] bg-ink px-5 font-sans text-[11px] uppercase tracking-[0.12em] text-cream transition-colors hover:bg-accent"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
