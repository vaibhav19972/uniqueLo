import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/motion';

/**
 * Scroll reveal. Attach the ref to the element and add the matching class:
 *
 *   const ref = useReveal<HTMLElement>();
 *   <section ref={ref} className="reveal"> … </section>
 *
 * Classes (see styles/globals.css):
 *   .reveal          slides up 24px and fades in
 *   .reveal-soft     settles from 98.5% scale — for large blocks
 *   .reveal-stagger  fades its children in sequence; set --i on each child
 *
 * Behaviour:
 *   • fires once, at 5% visibility with a −5% bottom margin, so it lands just
 *     after the element clears the fold rather than the instant it peeks in
 *   • a scroll fallback covers jump navigation: IntersectionObserver only
 *     reports transitions, so a fast Lenis jump (or a deep link) that skips
 *     past a section would otherwise leave it at opacity 0 forever
 *   • reduced motion opts out entirely and shows content immediately
 *   • if IntersectionObserver is missing, everything is shown (never hidden)
 */
export function useReveal<T extends HTMLElement = HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => el.classList.add('is-visible');

    // Reduced motion: no animation at all, content simply present.
    if (prefersReducedMotion()) {
      show();
      return;
    }

    // Already in or above the viewport on mount (deep link, restored scroll).
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      show();
      return;
    }

    // No IntersectionObserver: fail open, never leave content invisible.
    if (typeof IntersectionObserver === 'undefined') {
      show();
      return;
    }

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      show();
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };

    // Fallback for jumps that skip the element without a transition.
    const onScroll = () => {
      if (el.getBoundingClientRect().top < window.innerHeight * 0.95) finish();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) finish();
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -5% 0px' },
    );

    observer.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return ref;
}
