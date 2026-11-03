import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { useUIStore } from '../../stores/ui';

interface Slide {
  id: string;
  eyebrow?: string;
  headline: string;
  subtitle?: string;
  ctaText: string;
  link: string;
  imageMobile: string;
  imageDesktop: string;
}

const SLIDES: Slide[] = [
  {
    id: 'culture-corner',
    eyebrow: '★ NEW DROP · LIVE NOW ★',
    headline: 'CULTURE CORNER',
    subtitle: 'Original Heavyweight Streetwear · Limited Edition',
    ctaText: 'SHOP NOW',
    link: '/shop?universe=itihaas',
    imageMobile: '/images/campaigns/lookbook-01.jpg',
    imageDesktop: '/images/campaigns/hero-itihaas.jpg',
  },
  {
    id: 'anime-collab',
    eyebrow: '★ EXCLUSIVE COLLAB ★',
    headline: 'ANUSHKA SEN X UNIQUELO',
    subtitle: 'Fearless Graphic Tees & Parachute Cargos',
    ctaText: 'SHOP NOW',
    link: '/shop?universe=animeverse',
    imageMobile: '/images/campaigns/lookbook-02.jpg',
    imageDesktop: '/images/campaigns/hero-animeverse.jpg',
  },
  {
    id: 'winter-drop',
    eyebrow: '★ HEAVYWEIGHT FLEECE (400 GSM) ★',
    headline: 'OVERSIZED WINTER DROP',
    subtitle: 'Acid Wash Hoodies, Varsity & Bomber Jackets',
    ctaText: 'SHOP NOW',
    link: '/shop?category=outerwear',
    imageMobile: '/images/campaigns/lookbook-03.jpg',
    imageDesktop: '/images/campaigns/hero-heroverse.jpg',
  },
];

export const HeroBannerCarousel: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      // Swiped left -> next
      setCurrentIdx((prev) => (prev + 1) % SLIDES.length);
    } else if (diff < -50) {
      // Swiped right -> prev
      setCurrentIdx((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const slide = SLIDES[currentIdx];
  const isAnnouncementDismissed = useUIStore((state) => state.isAnnouncementDismissed);
  const heroHeight = isAnnouncementDismissed ? '100svh' : 'calc(100svh - 36px)';

  return (
    <section
      aria-label="Streetwear Featured Collections"
      className="relative w-full overflow-hidden bg-black select-none"
      style={{ height: heroHeight, maxHeight: '880px', minHeight: '560px' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Background Slides */}
      {SLIDES.map((s, idx) => {
        const isActive = idx === currentIdx;
        return (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Mobile Image (9:16 portrait) / Desktop Image (16:9) */}
            <picture>
              <source media="(min-width: 1024px)" srcSet={s.imageDesktop} />
              <img
                src={s.imageMobile}
                alt={s.headline}
                className="h-full w-full object-cover object-center brightness-90"
              />
            </picture>

            {/* Dark gradient overlay for bottom typography readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/35" />
          </div>
        );
      })}

      {/* Content Overlay pinned to bottom */}
      <div className="relative z-20 flex h-full flex-col justify-end items-center px-4 pb-8 text-center text-white sm:pb-12">
        {slide.eyebrow && (
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-white/90 drop-shadow-md">
            {slide.eyebrow}
          </p>
        )}

        <h1 className="mt-2 font-display text-2xl font-black uppercase tracking-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl">
          {slide.headline}
        </h1>

        {slide.subtitle && (
          <p className="mt-1 text-xs font-medium text-white/80 drop-shadow sm:text-sm">
            {slide.subtitle}
          </p>
        )}

        {/* Solid White Pill CTA */}
        <div className="mt-5">
          <Link
            to={slide.link}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-white px-8 py-3 text-xs font-black uppercase tracking-wider text-black shadow-lg transition-transform hover:bg-neutral-100 active:scale-95"
          >
            {slide.ctaText}
          </Link>
        </div>

        {/* Centered Pagination Indicators with 44x44px touch targets */}
        <div className="mt-4 flex items-center justify-center gap-1">
          {SLIDES.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => setCurrentIdx(dotIdx)}
              aria-label={`Go to slide ${dotIdx + 1}`}
              className="flex h-11 w-11 items-center justify-center"
            >
              <span
                className={`h-2 rounded-full transition-all ${
                  dotIdx === currentIdx
                    ? 'w-6 bg-white shadow-sm'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
