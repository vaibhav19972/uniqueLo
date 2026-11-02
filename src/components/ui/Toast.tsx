import React from 'react';
import { useToastStore } from '../../stores/toast';

/**
 * CONFIRMATION, NOT CONFETTI
 *
 * This is global chrome: it appears over every surface in the product, so it
 * was the one component still wearing the retired world. It carried a ✦ glyph
 * (a refused glyph icon), a serif title, `shadow-2xl`, a rounded corner and a
 * blurred backdrop — and it announced "Added to bag" with ornament rather than
 * with type.
 *
 * The toast is now the ruled grammar at small scale: square, ink ground, a 1px
 * rule, the label face for the title in sentence case. A shadow is kept because
 * a toast is a floating element over unknown ground — the one legitimate use
 * per DESIGN.md — but it is the float tier, not a decorative `2xl`.
 *
 * The glyph that remains is a 1px hairline check/dot rule, drawn in CSS, not a
 * typeface character.
 */
export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[500] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className="pointer-events-auto flex items-start justify-between gap-3 border border-stone bg-ink p-4 text-cream shadow-[var(--shadow-float)]"
        >
          <div className="flex min-w-0 items-start gap-3">
            <span
              aria-hidden="true"
              className="mt-[0.45rem] h-[3px] w-4 shrink-0"
              style={{
                background:
                  toast.type === 'success'
                    ? 'var(--color-success)'
                    : toast.type === 'accent'
                      ? 'var(--color-accent)'
                      : 'var(--color-stone-strong)',
              }}
            />
            <div className="min-w-0">
              <p className="loom-label text-cream">{toast.title}</p>
              {toast.description && (
                <p className="mt-1 font-sans text-[12.5px] leading-relaxed text-cream/75">
                  {toast.description}
                </p>
              )}
              {toast.actionLabel && toast.onAction && (
                <button
                  type="button"
                  onClick={toast.onAction}
                  className="mt-2 min-h-[44px] font-sans text-[11px] uppercase tracking-[0.12em] text-cream underline decoration-cream/40 underline-offset-4 transition-colors hover:decoration-cream"
                >
                  {toast.actionLabel}
                </button>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss notification"
            className="-mr-1 -mt-1 grid h-11 w-11 shrink-0 place-items-center text-cream/60 transition-colors hover:text-cream"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};
