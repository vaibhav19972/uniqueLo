import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/motion';

/**
 * Scroll reveal driven by IntersectionObserver — no scroll listener.
 *
 * The element starts at opacity 0 via the `reveal` class and gains
 * `is-visible` once, when it first enters the viewport. The animation itself
 * lives in globals.css (700ms, ease-base) so the JS only flips one class.
 *
 * Reduced motion is honoured twice: this hook adds nothing, and the stylesheet
 * forces the element visible, so content can never get stuck hidden.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    // Render the content immediately where IntersectionObserver is missing
    // (older browsers, some webviews) rather than leaving it invisible.
    if (typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
