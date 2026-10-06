# 04 — Motion System

> **Source of truth for animation.**  > One easing family. One duration scale. Transform + opacity only. Respect `prefers-reduced-motion`. No exceptions.

---

## 1. Principles

1. **Performance first:** animate only `transform`, `opacity`, and occasionally `filter` (with caution). No layout animations via `width`/`height`/`top`/`left`.
2. **Reduced-motion first:** every animation must read `prefers-reduced-motion: reduce` and skip/shorten itself.
3. **Easing consistency:** use the curves exported from `src/lib/motion.ts`.
4. **Duration consistency:** use the duration scale exported from `src/lib/motion.ts`.
5. **Purpose:** motion should reveal, guide, or delight — never obstruct.

---

## 2. Tokens File

Add these CSS custom properties to `src/styles/tokens.css` (inside `:root`):

```css
:root {
  /* ─────────────────────────────────────
     Easing
     ───────────────────────────────────── */
  --ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-expo:    cubic-bezier(0.7, 0, 0.84, 0);
  --ease-elastic:    cubic-bezier(0.68, -0.55, 0.265, 1.55);
  --ease-smooth:     cubic-bezier(0.4, 0, 0.2, 1);
  --ease-dramatic:   cubic-bezier(0.87, 0, 0.13, 1);

  /* ─────────────────────────────────────
     Durations
     ───────────────────────────────────── */
  --duration-instant: 100ms;
  --duration-fast:    200ms;
  --duration-normal:  400ms;
  --duration-slow:    700ms;
  --duration-dramatic: 1100ms;

  /* Stagger base */
  --stagger: 60ms;
}
```

---

## 3. Shared Motion Helpers (`src/lib/motion.ts`)

Create this file. It is the single source of truth for all animation constants.

```typescript
// src/lib/motion.ts

import type { Transition } from 'motion/react';

/** Detect reduced-motion preference */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Return a duration, collapsed to instant if reduced-motion is on */
export const withReducedMotion = (durationMs: number) =>
  prefersReducedMotion() ? 0 : durationMs;

/** Easing curves */
export const EASING = {
  outExpo:   [0.16, 1, 0.3, 1] as const,
  inExpo:    [0.7, 0, 0.84, 0] as const,
  elastic:   [0.68, -0.55, 0.265, 1.55] as const,
  smooth:    [0.4, 0, 0.2, 1] as const,
  dramatic:  [0.87, 0, 0.13, 1] as const,
} as const;

/** Duration scale in seconds */
export const DURATION = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.4,
  slow: 0.7,
  dramatic: 1.1,
} as const;

/** Shared transition presets */
export const transitions = {
  fade: {
    duration: DURATION.normal,
    ease: EASING.outExpo,
  } satisfies Transition,
  slideUp: {
    duration: DURATION.slow,
    ease: EASING.outExpo,
  } satisfies Transition,
  scale: {
    duration: DURATION.normal,
    ease: EASING.elastic,
  } satisfies Transition,
  drawer: {
    duration: DURATION.normal,
    ease: EASING.outExpo,
  } satisfies Transition,
  stagger: (index: number) => ({
    duration: DURATION.normal,
    ease: EASING.outExpo,
    delay: prefersReducedMotion() ? 0 : index * 0.06,
  }),
} as const;

/** Motion variants */
export const variants = {
  fadeInUp: {
    hidden: { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: DURATION.slow, ease: EASING.outExpo },
    },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: DURATION.normal, ease: EASING.outExpo },
    },
  },
  staggerContainer: {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion() ? 0 : 0.06,
      },
    },
  },
} as const;
```

---

## 4. Lenis + React Router Integration

Create `src/lib/lenis.ts`:

```typescript
// src/lib/lenis.ts
import Lenis from 'lenis';
import { useEffect } from 'react';
import { useLocation } from 'react-router';

let lenis: Lenis | null = null;

export function initLenis() {
  if (lenis || prefersReducedMotion()) return;

  lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });

  function raf(time: number) {
    lenis?.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

export function destroyLenis() {
  lenis?.destroy();
  lenis = null;
}

export function useLenisScrollReset() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);
}
```

In `src/main.tsx`:

```tsx
initLenis();
```

In `src/app/App.tsx`:

```tsx
import { useLenisScrollReset } from '../lib/lenis';

export function App() {
  useLenisScrollReset();
  return ...
}
```

**Important:** Lenis is disabled entirely when `prefers-reduced-motion: reduce` is active.

---

## 5. Section-by-Section Motion Map

### Global

| Element | Tech | Motion | Reduced Motion |
|---------|------|--------|----------------|
| Page transition | Motion AnimatePresence | fade `0.2s` crossfade | none |
| Header scroll | React state + CSS | hide on scroll down, show on scroll up via `translateY` | instant or disabled |
| Custom cursor | Framer Motion | follow pointer with spring, scale on hover targets | disabled |
| Smooth scroll | Lenis | inertia scroll | disabled |

### Home

| Section | Tech | Motion |
|---------|------|--------|
| Hero headline | GSAP ScrollTrigger / timeline | masked text reveal: clip-path `inset(0 100% 0 0)` → `inset(0 0 0 0)`, scrubbed to 0.5s after load |
| Hero image | Motion | scale 1.08 → 1.0 + opacity 0 → 1 over 1.2s on load |
| Category strip | Motion / CSS | horizontal drag on mobile, fade-in-up on desktop with 60ms stagger |
| Featured products | GSAP ScrollTrigger pin | section pins while horizontal track scrolls; cards slide in from right |
| Editorial split | Motion whileInView | text fades up, image parallax `translateY(-5%)` tied to scroll |
| Lookbook | GSAP ScrollTrigger | full-bleed panels stacked with scale/opacity scrub |
| Newsletter | Motion whileInView | headline slide up, input/button stagger |
| Footer | Motion whileInView | links stagger fade-in |

### Shop

| Element | Tech | Motion |
|---------|------|--------|
| Category tabs | Motion layout | animated underline `layoutId="activeTab"` |
| Filter bar | Motion | height accordion, chips fade/slide |
| Product grid on filter change | Motion layout | `layout` prop on cards + AnimatePresence for exit/enter |
| Product card hover | CSS/Motion | second image opacity 0 → 1 over 400ms; quick-add button translateY(100%) → 0 |
| Card quick-add | Framer Motion | button appears on hover, drawer opens from right |
| Drawer | Framer Motion | slide in from right + backdrop fade |

### Cart Drawer

| Element | Tech | Motion |
|---------|------|--------|
| Drawer open | Motion | `x: '100%'` → `x: 0`, backdrop opacity 0 → 0.4 |
| Item add | Motion | line item slides in, cart count pop `scale` |
| Item remove | AnimatePresence | fade + slide left |

---

## 6. GSAP Rules

1. Always import the plugin and register it:

```typescript
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
```

2. Use `useGSAP()` from `@gsap/react` inside components. It handles cleanup.
3. Always call `ctx.revert()` or let `useGSAP` do it on unmount.
4. Pinning requires a wrapper with `height: 100vh` and an inner track.
5. Use `fromTo()` instead of `from()` for explicit start/end states.
6. GSAP + Lenis: ScrollTrigger is automatically compatible if Lenis calls `ScrollTrigger.update()` on each raf. Include this in `src/lib/lenis.ts`:

```typescript
import { ScrollTrigger } from 'gsap/ScrollTrigger';

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);
```

---

## 7. Accessibility Rules

1. **Respect `prefers-reduced-motion: reduce`:**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

2. **Motion helper must gate all JS animations.** Use `prefersReducedMotion()` from `src/lib/motion.ts`.
3. **Pinned sections must remain navigable:** keyboard users can tab through content. Do not trap focus for hero animations.
4. **Avoid vestibular triggers:** no large parallax on body text, no rapid zooms.
5. **Focus visible:** focus rings use `--color-accent` and are always visible unless the user is using a pointer.

---

## 8. Do Not

- Use `setTimeout` chains for UI animation.
- Animate `width`, `height`, `top`, `left`, `margin`.
- Use random or one-off cubic-bezier values outside `EASING`.
- Run GSAP animations before fonts load without fallback states.
- Forget to kill/revert GSAP contexts on unmount.

