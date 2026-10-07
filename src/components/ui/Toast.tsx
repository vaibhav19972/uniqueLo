import React from 'react';
import { useToastStore } from '../../stores/toast';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[500] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-ink/95 text-cream border border-stone/30 shadow-2xl backdrop-blur-md p-4 rounded-sm flex items-start justify-between gap-3 animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start gap-3">
            <span className="text-accent text-base mt-0.5">✦</span>
            <div>
              <h4 className="font-serif text-sm font-medium tracking-wide text-cream">
                {toast.title}
              </h4>
              {toast.description && (
                <p className="text-xs text-warm-gray font-light mt-0.5 leading-relaxed">
                  {toast.description}
                </p>
              )}
              {toast.actionLabel && toast.onAction && (
                <button
                  onClick={toast.onAction}
                  className="mt-2 text-[11px] font-sans tracking-widest uppercase text-accent hover:underline font-medium"
                >
                  {toast.actionLabel} →
                </button>
              )}
            </div>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss toast"
            className="text-warm-gray hover:text-cream p-1 transition-colors"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
};
