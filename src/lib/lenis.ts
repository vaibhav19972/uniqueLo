import Lenis from 'lenis';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './motion';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function initLenis() {
  if (typeof window === 'undefined') return;
  if (lenis || prefersReducedMotion()) return;

  lenis = new Lenis({
    duration: 1.2,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

export function destroyLenis() {
  lenis?.destroy();
  lenis = null;
}

export function useLenisScrollReset() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // A hash target wins over the top-of-page reset. Without this, a footer
    // link like `/#atelier-list` lands at the top of the home page and the
    // anchor is silently ignored — the reader is told to go somewhere and
    // arrives at the wrong place.
    //
    // The target's offset is only final once the catalogue query resolves and
    // the bands above it have their real height, so the scroll is re-applied
    // for a short window while the document is still growing.
    const scrollToHash = () => {
      const target = hash ? document.getElementById(hash.slice(1)) : null;
      if (!target) return false;
      const y = target.getBoundingClientRect().top + window.scrollY;
      if (lenis) lenis.scrollTo(y, { immediate: true });
      else window.scrollTo(0, y);
      return true;
    };

    if (hash && scrollToHash()) {
      let frames = 0;
      let raf = 0;
      const settle = () => {
        frames += 1;
        scrollToHash();
        if (frames < 40) raf = requestAnimationFrame(settle);
      };
      raf = requestAnimationFrame(settle);
      return () => cancelAnimationFrame(raf);
    }

    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
}

export function getLenis() {
  return lenis;
}
