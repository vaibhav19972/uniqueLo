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
