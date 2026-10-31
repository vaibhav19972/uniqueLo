import { useCallback, useEffect, useState } from 'react';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * THEME — two independent axes
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * MODE (`data-mode` on <html>)
 *   'light' → warm paper. Ivory canvas, cream cards, warm near-black ink.
 *   'dark'  → black atelier. #000 canvas, #181818 cards, white ink.
 *
 *   The customer's choice is persisted in localStorage and wins over the OS.
 *   With no stored choice we follow `prefers-color-scheme` — and keep following
 *   it live, so a site that has never been toggled tracks a system change.
 *
 * ACCENT (`data-accent` on any subtree)
 *   One accent per universe, declared in styles/tokens.css. Canvas and ink stay
 *   put; only the accent moves. See `universeAccent()` below.
 *
 * The values themselves live in styles/tokens.css. Nothing here duplicates a
 * colour — this file only decides which scope is active.
 */

export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'uniquelo:theme-mode';

/** Universe slugs that own an accent. Anything else falls back to the house accent. */
export type AccentScope = 'atelier' | 'animeverse' | 'heroverse' | 'itihaas';

const ACCENT_SCOPES: readonly AccentScope[] = ['atelier', 'animeverse', 'heroverse', 'itihaas'];

/**
 * Map a universe slug (or null/undefined, meaning unbranded catalogue) to the
 * accent scope that should wrap it. Unknown slugs fall back to the house accent
 * rather than silently picking one universe's colour.
 */
export function universeAccent(slug: string | null | undefined): AccentScope {
  if (!slug) return 'atelier';
  return ACCENT_SCOPES.includes(slug as AccentScope) ? (slug as AccentScope) : 'atelier';
}

/** Read the stored preference, or null when the customer has never chosen. */
function readStoredMode(): ThemeMode | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    // Private browsing / blocked storage — fall through to the OS setting.
    return null;
  }
}

function systemMode(): ThemeMode {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyMode(mode: ThemeMode) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-mode', mode);
  // Keeps the browser's own UI (form controls, scrollbars, autofill) in step.
  document.documentElement.style.colorScheme = mode;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', mode === 'dark' ? '#000000' : '#f7f3ec');
}

/**
 * The single source of truth for the active mode.
 *
 * Mounted once in Layout. Any component that needs to know the mode — the
 * toggle's pressed state, a logo that swaps, an image with a light variant —
 * reads it through `useThemeMode()`, which subscribes to the same store.
 */
let currentMode: ThemeMode | null = null;
const listeners = new Set<(mode: ThemeMode) => void>();

function setModeGlobal(mode: ThemeMode) {
  currentMode = mode;
  applyMode(mode);
  for (const listener of listeners) listener(mode);
}

/** Commit a mode and remember it. */
export function setThemeMode(mode: ThemeMode) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Storage unavailable: the choice still applies for this page view.
  }
  setModeGlobal(mode);
}

/** Flip light ⇄ dark and persist the result. */
export function toggleThemeMode(): ThemeMode {
  const next: ThemeMode = (currentMode ?? systemMode()) === 'dark' ? 'light' : 'dark';
  setThemeMode(next);
  return next;
}

/**
 * Subscribe a component to the active mode.
 * Returns the current mode plus the two mutators.
 */
export function useThemeMode(): {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
} {
  const [mode, setModeState] = useState<ThemeMode>(() => currentMode ?? readStoredMode() ?? systemMode());

  useEffect(() => {
    listeners.add(setModeState);
    // Sync in case another component or the inline boot script changed it.
    if (currentMode && currentMode !== mode) setModeState(currentMode);
    return () => {
      listeners.delete(setModeState);
    };
    // `mode` is intentionally omitted: this effect owns the subscription only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    mode,
    setMode: useCallback((next: ThemeMode) => setThemeMode(next), []),
    toggle: useCallback(() => {
      toggleThemeMode();
    }, []),
  };
}

/**
 * Boot the theme. Mounted once, at the top of Layout.
 *
 * - Applies the resolved mode before first paint (index.html repeats this
 *   inline so there is no flash — this keeps it correct after hydration and
 *   after any later change).
 * - Tracks the OS preference live, but only while the customer has not chosen.
 */
export function useThemeBoot(): ThemeMode {
  const [mode, setModeState] = useState<ThemeMode>(
    () => currentMode ?? readStoredMode() ?? systemMode(),
  );

  useEffect(() => {
    // Sync with an external system (localStorage + the OS colour scheme), which
    // is exactly what an effect is for — the lint rule can't tell the difference.
    // Re-applies after hydration because the inline index.html boot script has
    // already set the attribute, but `currentMode` may not know about it yet.
    const resolved = readStoredMode() ?? systemMode();
    setModeGlobal(resolved);
    // eslint-disable-next-line react/set-state-in-effect
    setModeState((prev) => (prev === resolved ? prev : resolved));

    if (!window.matchMedia) return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (event: MediaQueryListEvent) => {
      // A stored choice always wins over the OS.
      if (readStoredMode()) return;
      const next: ThemeMode = event.matches ? 'dark' : 'light';
      setModeGlobal(next);
      setModeState(next);
    };

    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return mode;
}
