import React, { useEffect } from 'react';
import { Link } from 'react-router';
import { EXPRESSION_LEVELS } from '../../lib/data';

interface ExpressionGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScore?: number;
}

export const ExpressionGuideModal: React.FC<ExpressionGuideModalProps> = ({
  isOpen,
  onClose,
  currentScore,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="expression-modal-title"
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-ink/70 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-paper border border-stone/80 shadow-2xl p-6 sm:p-8 z-10 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone/40 pb-4">
          <div>
            <span className="text-[10px] uppercase font-sans tracking-[0.25em] text-accent font-semibold block">
              Atelier Discovery Axis
            </span>
            <h2
              id="expression-modal-title"
              className="font-serif text-2xl sm:text-3xl text-ink mt-1"
            >
              The Expression Spectrum
            </h2>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed max-w-lg font-light">
              UniqueLo measures embroidery by visual presence, thread density, and narrative impact rather than generic sizing. Choose how loud you want your clothing to speak.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close expression guide"
            className="w-8 h-8 flex items-center justify-center border border-stone/60 hover:border-ink text-ink text-sm transition-colors cursor-pointer shrink-0 ml-4"
          >
            ✕
          </button>
        </div>

        {/* 5 Levels Stack */}
        <div className="space-y-3.5">
          {EXPRESSION_LEVELS.map((level) => {
            const isCurrent = level.score === currentScore;
            return (
              <div
                key={level.score}
                className={`p-4 border transition-all ${
                  isCurrent
                    ? 'border-accent bg-accent/5 ring-1 ring-accent/40'
                    : 'border-stone/60 bg-paper hover:border-stone/90'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 flex items-center justify-center font-mono text-xs font-bold ${
                        isCurrent
                          ? 'bg-accent text-cream'
                          : 'bg-stone/20 text-ink'
                      }`}
                    >
                      0{level.score}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-serif text-base font-semibold text-ink">
                          {level.name}
                        </h3>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-accent text-cream text-[9px] uppercase font-sans tracking-widest font-semibold">
                            Current Piece
                          </span>
                        )}
                      </div>
                      <span className="font-serif italic text-xs text-ink-muted block mt-0.5">
                        {level.tagline}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/expression/${level.slug}`}
                    onClick={onClose}
                    className="text-[10px] uppercase font-sans tracking-widest text-accent hover:underline font-semibold whitespace-nowrap shrink-0 mt-1"
                  >
                    View Tier →
                  </Link>
                </div>

                <p className="text-xs text-ink-muted font-light leading-relaxed mt-2.5">
                  {level.description}
                </p>

                <div className="mt-2.5 pt-2 border-t border-stone/30 flex items-center justify-between text-[10px] text-ink-muted uppercase tracking-wider font-mono">
                  <span>Characteristics:</span>
                  <span className="text-ink font-sans font-medium lowercase">
                    {level.characteristics}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-stone/40 flex items-center justify-between">
          <p className="text-[11px] text-ink-muted font-light">
            Every garment can also be customized with bespoke initials in our Studio.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-ink text-cream hover:bg-accent text-xs uppercase font-sans tracking-widest font-semibold transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
