import { useEffect } from 'react';

/**
 * UNIQUE LO — THEME
 *
 * The storefront ships one system: the dark canvas in src/styles/tokens.css
 * (black ground, #181818 surfaces, a single terracotta accent, Geist).
 *
 * The previous v1/v2 switch is retired. It shipped a second palette and a
 * second typeface side by side, which meant every component carried two
 * layouts and the light one leaked onto dark surfaces. `useTheme()` now only
 * keeps the <html> hook in sync for any CSS that still keys off it.
 */
export function useTheme(): void {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', 'dark');
    root.classList.add('theme-dark');
  }, []);
}
