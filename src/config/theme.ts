import { useEffect, useState } from 'react';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * UNIQUE LO — GLOBAL THEME CONFIGURATION FLAG
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * Toggle between the two design systems:
 * 
 * • false -> "v1": The Atelier
 *   Quiet-luxury haute needlecraft, warm canvas cream (#f7f5f0), paper white,
 *   Playfair Display serif headlines, hairline stone rules, obsidian CTAs.
 * 
 * • true  -> "v2": Modern D2C Streetwear & Gokwik-Style Cart Bag
 *   Extracted from sketches/design system.png:
 *   Cool slate ground (#f0f2f5), pure white rounded cards (16px radius),
 *   neo-grotesque sans-serif typography (Satoshi/Inter), high-contrast onyx,
 *   emerald savings green (#059669 / #e6f7ef), multi-tier discount milestone bar,
 *   size-picker cart cards, and fast checkout bar.
 * 
 * Simply toggle USE_THEME_V2 below to switch between v1 and v2 across the entire site.
 */
export const USE_THEME_V2: boolean = true;

/**
 * Hook to read the current theme configuration and ensure the <html> element
 * attributes (data-theme="v2" | "v1") and classnames are synchronized.
 */
export function useIsThemeV2(): boolean {
  const [isV2] = useState<boolean>(() => {
    // Check if query parameter explicitly overrides (e.g. ?theme=v2 or ?theme=v1)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTheme = params.get('theme');
      if (urlTheme === 'v2') return true;
      if (urlTheme === 'v1') return false;
    }
    return USE_THEME_V2;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isV2) {
      root.setAttribute('data-theme', 'v2');
      root.classList.add('theme-v2');
      root.classList.remove('theme-v1');
    } else {
      root.setAttribute('data-theme', 'v1');
      root.classList.add('theme-v1');
      root.classList.remove('theme-v2');
    }
  }, [isV2]);

  return isV2;
}
