import React, { useState } from 'react';
import { Link } from 'react-router';
import { useIsThemeV2 } from '../../config/theme';

/**
 * Announcement bar with dual-mode support:
 * - v1: The Atelier gold bar with quiet luxury craftsmanship copy.
 * - v2: High-contrast D2C streetwear banner matching sketches/design system.png
 *       (HUSTLE10 promo, ₹500 free shipping threshold, express UPI/COD).
 */
export const AnnouncementBar: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const isV2 = useIsThemeV2();

  if (isDismissed) return null;

  if (isV2) {
    return (
      <div className="relative z-[210] bg-ink text-white text-[12px] sm:text-[13px] font-sans border-b border-stone/20">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-2 flex items-center justify-center gap-3 sm:gap-6 lg:justify-between">
          {/* Left: Free shipping promise */}
          <div className="flex items-center gap-2 text-white/90">
            <span className="text-emerald-400 font-bold">⚡</span>
            <span className="font-medium">Free Shipping on orders above ₹500</span>
          </div>

          {/* Center: Promo code pill */}
          <div className="hidden md:flex items-center gap-2">
            <span className="text-white/80">Get 10% OFF on your order with code</span>
            <span className="inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-sm bg-white/10 text-emerald-400 border border-emerald-500/30 text-xs tracking-wider">
              HUSTLE10
            </span>
          </div>

          {/* Right: Payment modes */}
          <div className="hidden sm:flex items-center gap-3 text-white/75 text-xs">
            <span>COD Available</span>
            <span className="text-white/30">|</span>
            <span>Express UPI & Cards</span>
          </div>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          aria-label="Dismiss announcement"
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/60 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative z-[210] text-on-gold text-[12px] sm:text-[13px] font-serif"
      style={{ backgroundColor: 'var(--brand-gold)' }}
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-2.5 flex items-center justify-center gap-4 lg:gap-0 lg:justify-between">
        {/* Left zone: shipping promise */}
        <p className="flex items-center gap-2.5 shrink-0">
          <svg className="w-4 h-4 shrink-0 opacity-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7h11v10H3zM14 10h4l3 3v4h-7zM7 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm11 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
          <span className="truncate">Free shipping on all orders above ₹29,050</span>
        </p>

        {/* Center zone: craft line (hidden < lg) */}
        <p className="hidden lg:flex items-center gap-3 opacity-95">
          <span aria-hidden="true" className="h-4 w-px bg-cream/40" />
          <span>Embroidered in India&ensp;|&ensp;Worldwide Shipping</span>
          <span aria-hidden="true" className="h-4 w-px bg-cream/40" />
        </p>

        {/* Right zone: first-order offer */}
        <Link to="/#atelier-list" className="hidden sm:flex items-center gap-2.5 opacity-95 hover:opacity-100 group shrink-0">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 12v9H4v-9M2 7h20v5H2zM12 22V7m0 0c-1.5-2.5-4-3.5-5-2.5S7 7.5 12 7zm0 0c1.5-2.5 4-3.5 5-2.5S17 7.5 12 7z" />
          </svg>
          <span>10% off your first order&ensp;|&ensp;</span>
          <span className="underline underline-offset-2 decoration-cream/50 group-hover:decoration-cream">
            Join the Atelier List
          </span>
          <span aria-hidden="true">→</span>
        </Link>
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