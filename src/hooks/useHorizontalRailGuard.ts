import { useEffect, type RefObject } from 'react';

/**
 * Gesture-custody guard for horizontal rails on a Lenis-smoothed page.
 *
 * The collision it fixes: Lenis listens for `wheel` on window and converts
 * every delta into vertical page scroll. A trackpad swipe over a horizontal
 * rail therefore moves BOTH the rail (native deltaX) and the page (Lenis
 * reading the gesture's small deltaY) — the "both axes scroll at once" bug.
 *
 * Layered resolution (the caller must also spread `data-lenis-prevent` onto
 * the rail element — see RAIL_PREVENT_ATTR):
 *
 * 1. `data-lenis-prevent` makes Lenis stand down for events composed inside
 *    the rail, so it stops driving the page during rail gestures.
 * 2. This capture-phase wheel listener resolves diagonal intent by dominant
 *    axis: when horizontal intent dominates AND the rail can still move that
 *    way, the whole event is default-prevented (killing the vertical leak)
 *    and the horizontal delta is applied manually. At either rail edge — or
 *    when vertical intent dominates — the event passes through untouched so
 *    the page keeps scrolling normally.
 * 3. While a guarded gesture is active, `scroll-snap-type` AND
 *    `scroll-behavior` are temporarily suspended:
 *      - Chrome re-snaps snap-proximity containers after every programmatic
 *        scrollLeft set, clawing each manual delta back to the nearest snap
 *        point (verified in a headless harness).
 *      - `scroll-behavior: smooth` (Tailwind scroll-smooth) animates even
 *        direct scrollLeft assignments, so every wheel tick would stack a
 *        new animation onto the last one — floaty, rubber-banding feel
 *        (also harness-verified: ticks accumulated 0px while animating).
 *    Both re-engage ~180ms after the last wheel tick, so the arrow
 *    buttons' snap-aligned smooth card-stepping still works.
 *
 * Touch intentionally needs no handler: browsers axis-lock touch pans
 * natively, and pinning `touch-action: pan-x` here would turn the rail's
 * full card height into a vertical scroll dead zone.
 */
export const RAIL_PREVENT_ATTR = { 'data-lenis-prevent': true } as const;

const SNAP_RESTORE_DELAY_MS = 180;

export function useHorizontalRailGuard(ref: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let suspended = false;
    let restoreTimer: number | undefined;

    const suspend = () => {
      if (!suspended) {
        el.style.scrollSnapType = 'none';
        el.style.scrollBehavior = 'auto';
        suspended = true;
      }
      window.clearTimeout(restoreTimer);
      restoreTimer = window.setTimeout(() => {
        // Clearing the inline styles lets the snap-x/snap-proximity and
        // scroll-smooth utilities reapply — no hard-coded values to drift.
        el.style.scrollSnapType = '';
        el.style.scrollBehavior = '';
        suspended = false;
      }, SNAP_RESTORE_DELAY_MS);
    };

    const onWheel = (e: WheelEvent) => {
      const horizontalIntent = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!horizontalIntent) return;

      const atStart = el.scrollLeft <= 0;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      const canScroll = (e.deltaX < 0 && !atStart) || (e.deltaX > 0 && !atEnd);
      if (!canScroll) return;

      // Default-preventing kills the native scroll action for BOTH axes —
      // that's the point (the small vertical delta can't reach the page) —
      // so the horizontal delta must be re-applied by hand.
      e.preventDefault();
      suspend();
      el.scrollLeft += e.deltaX;
    };

    el.addEventListener('wheel', onWheel, { passive: false, capture: true });
    return () => {
      el.removeEventListener('wheel', onWheel, { capture: true });
      window.clearTimeout(restoreTimer);
      el.style.scrollSnapType = '';
      el.style.scrollBehavior = '';
    };
  }, [ref]);
}