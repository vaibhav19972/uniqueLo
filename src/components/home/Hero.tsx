import React, { useRef } from 'react';
import { Link } from 'react-router';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { prefersReducedMotion } from '../../lib/motion';
import { Button } from '../ui/Button';

export const Hero: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const sublineRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        imageRef.current,
        { scale: 1.08, opacity: 0.7 },
        { scale: 1, opacity: 1, duration: 1.4 }
      )
        .fromTo(
          badgeRef.current,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=1.0'
        )
        .fromTo(
          headlineRef.current,
          { clipPath: 'inset(100% 0% 0% 0%)', y: 40 },
          { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.1, ease: 'expo.out' },
          '-=0.7'
        )
        .fromTo(
          sublineRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.6'
        )
        .fromTo(
          ctaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.5'
        );
    },
    { scope: containerRef }
  );

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-ink text-cream"
    >
      {/* Background Campaign Visual */}
      <div
        ref={imageRef}
        className="absolute inset-0 z-0 bg-cover bg-center filter brightness-[0.72] transform will-change-transform"
        style={{
          backgroundImage: `url('/images/campaigns/hero.jpg')`,
        }}
      >
        {/* Subtle Gradient & Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/30" />
      </div>

      {/* Floating Atelier Spec Sheet Tag */}
      <div
        ref={badgeRef}
        className="absolute top-8 sm:top-12 left-4 sm:left-8 z-10 hidden sm:flex items-center space-x-3 text-[11px] uppercase tracking-[0.22em] text-cream/80 border border-stone/30 bg-ink/50 backdrop-blur-md px-4 py-1.5"
      >
        <span className="w-2 h-2 rounded-full bg-accent" />
        <span>Atelier Edition 2026 — Hand Zardozi & Botanical Stitch</span>
      </div>

      {/* Hero Editorial Typography & CTAs */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center pt-8">
        <span className="text-xs sm:text-sm font-sans tracking-[0.25em] uppercase text-accent mb-4 font-medium">
          Hand-Embroidered Essentials • Made in India
        </span>

        <h1
          ref={headlineRef}
          className="font-serif text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-[1.05] text-cream max-w-4xl"
        >
          Needlecraft for Everyday Living.
        </h1>

        <p
          ref={sublineRef}
          className="mt-6 text-sm sm:text-base lg:text-lg font-light text-stone/90 max-w-2xl leading-relaxed tracking-wide font-sans"
        >
          Heavyweight organic cotton tees, chore jackets, and relaxed shirting enriched with verifiable regional Indian embroidery. Crafted in historic ateliers across Jaipur, Lucknow, and Bengal. Built to endure.
        </p>

        {/* Action Group */}
        <div
          ref={ctaRef}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <Link to="/shop" className="w-full sm:w-auto">
            <Button
              variant="accent"
              size="lg"
              className="w-full sm:w-auto text-xs tracking-[0.2em] px-10 py-4"
            >
              Explore Collection
            </Button>
          </Link>

          <a href="#editorial-manifesto" className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto text-xs tracking-[0.2em] border-stone/40 text-cream hover:bg-paper/10 hover:border-cream"
            >
              Artisanal Provenance
            </Button>
          </a>
        </div>

        {/* Micro Credential Grid */}
        <div className="mt-16 grid grid-cols-3 gap-6 sm:gap-12 text-left border-t border-stone/20 pt-6 w-full max-w-2xl text-cream/70 text-xs">
          <div>
            <div className="font-serif text-base text-cream">100% Pure</div>
            <div className="text-[10px] uppercase tracking-wider text-warm-gray mt-0.5">
              Mulberry Silk Floss
            </div>
          </div>
          <div>
            <div className="font-serif text-base text-cream">18–32 Hours</div>
            <div className="text-[10px] uppercase tracking-wider text-warm-gray mt-0.5">
              Artisan Needlework
            </div>
          </div>
          <div>
            <div className="font-serif text-base text-cream">Bespoke</div>
            <div className="text-[10px] uppercase tracking-wider text-warm-gray mt-0.5">
              Monogram Studio
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
