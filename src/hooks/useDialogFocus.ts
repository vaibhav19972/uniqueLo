import { useEffect, useRef } from 'react';

/**
 * Dialog focus management: initial focus on open, Tab trap while open,
 * Escape to close, and return-focus to the opener on close.
 * Attach the returned ref to the dialog surface (with tabIndex={-1}).
 *
 * IMPORTANT — `onClose` must be referentially stable (a store action, or
 * wrapped in useCallback). If the caller passes an inline arrow, its identity
 * changes on every render, this effect re-runs, and it re-runs `initial.focus()`
 * — which yanks focus back to the first field after every keystroke and makes
 * the rest of the form impossible to fill.
 */
export function useDialogFocus<T extends HTMLElement>(
  isOpen: boolean,
  onClose: () => void,
) {
  const ref = useRef<T | null>(null);
  // Latest onClose in a ref so the effect does not depend on its identity.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const node = ref.current;
    if (!node) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;

    const focusables = () =>
      Array.from(
        node.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.getClientRects().length > 0);

    // Initial focus: explicit target, else first control, else the surface.
    const initial =
      node.querySelector<HTMLElement>('[data-autofocus]') ??
      focusables()[0] ??
      node;
    initial.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (items.length === 0) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    node.addEventListener('keydown', onKeyDown);
    return () => {
      node.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [isOpen]);

  return ref;
}
