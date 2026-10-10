import React, { useState } from 'react';

/**
 * Render target 01: gold announcement bar.
 * Left: shipping + craft promise · Right (desktop): studio tagline.
 */
export const AnnouncementBar: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div
      className="relative z-[210] text-cream text-[10px] sm:text-[11px] tracking-[0.18em] uppercase font-sans"
      style={{ backgroundColor: 'var(--brand-gold)' }}
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-2 flex items-center justify-center sm:justify-between gap-3">
        <p className="flex items-center gap-2 truncate">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7h11v10H3zM14 10h4l3 3v4h-7zM7 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm11 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
          <span className="truncate">Free shipping on all orders above ₹29,050&ensp;|&ensp;Hand-embroidered. Made in India.</span>
        </p>
        <p className="hidden sm:block shrink-0 opacity-90">A small studio. A bigger universe.</p>
      </div>

      <button
        onClick={() => setIsDismissed(true)}
        aria-label="Dismiss announcement"
        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-cream/70 hover:text-cream transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
      >
        ✕
      </button>
    </div>
  );
};
