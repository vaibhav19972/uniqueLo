import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router';
import { isAppDownloadQREnabled } from '../../config/flags';
import { SITE_TWEAKS } from '../../config/tweaks';

export interface CarouselSlide {
  id: string;
  image: string;
  tagline: string;
  title: string;
  description?: string;
  ctaText: string;
  ctaLink: string;
}

const CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 'freestyle',
    image: '/images/campaigns/freestyle-hero-cleaned.jpg',
    tagline: 'MADE TO MOVE WITH YOU',
    title: 'FREESTYLE COLLECTION',
    description: 'Relaxed streetwear silhouettes • Raw textures • Everyday statement fits',
    ctaText: 'SHOP NOW',
    ctaLink: '/shop',
  },
  {
    id: 'animeverse',
    image: '/images/campaigns/hero-animeverse.jpg',
    tagline: 'STITCHED SAGAS • DROP 03',
    title: 'ANIME RETROFIT',
    description: 'Heavyweight organic cotton hoodies with handcrafted Sakura Ronin embroidery',
    ctaText: 'EXPLORE ANIME',
    ctaLink: '/universes/animeverse',
  },
  {
    id: 'heroverse',
    image: '/images/campaigns/hero-heroverse.jpg',
    tagline: 'LIMITED ATELIER CAPSULE',
    title: 'CELESTIAL HEROVERSE',
    description: 'Gold zari threadwork on structured outerwear inspired by cosmic archetypes',
    ctaText: 'DISCOVER HEROVERSE',
    ctaLink: '/universes/heroverse',
  },
  {
    id: 'itihaas',
    image: '/images/campaigns/hero-itihaas.jpg',
    tagline: 'HERITAGE REIMAGINED',
    title: 'ROYAL ITIHAAS ARCHIVE',
    description: 'Historic regional needlecraft transformed for contemporary modern living',
    ctaText: 'SHOP ITIHAAS',
    ctaLink: '/universes/itihaas',
  },
];

const SLIDE_DURATION_MS = SITE_TWEAKS.carousel.speedMs;

/**
 * High-fidelity Vector Dummy QR Code
 */
const DummyQRCode: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 100 100"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    shapeRendering="crispEdges"
  >
    {/* Finder Top-Left */}
    <rect x="6" y="6" width="28" height="28" rx="4" fill="black" />
    <rect x="10" y="10" width="20" height="20" rx="2" fill="white" />
    <rect x="14" y="14" width="12" height="12" rx="1.5" fill="black" />

    {/* Finder Top-Right */}
    <rect x="66" y="6" width="28" height="28" rx="4" fill="black" />
    <rect x="70" y="10" width="20" height="20" rx="2" fill="white" />
    <rect x="74" y="14" width="12" height="12" rx="1.5" fill="black" />

    {/* Finder Bottom-Left */}
    <rect x="6" y="66" width="28" height="28" rx="4" fill="black" />
    <rect x="10" y="70" width="20" height="20" rx="2" fill="white" />
    <rect x="14" y="74" width="12" height="12" rx="1.5" fill="black" />

    {/* Alignment Bottom-Right */}
    <rect x="68" y="68" width="16" height="16" rx="3" fill="black" />
    <rect x="72" y="72" width="8" height="8" rx="1.5" fill="white" />
    <rect x="74" y="74" width="4" height="4" fill="black" />

    {/* Timing patterns */}
    <rect x="38" y="10" width="4" height="4" fill="black" />
    <rect x="46" y="10" width="4" height="4" fill="black" />
    <rect x="54" y="10" width="4" height="4" fill="black" />
    <rect x="10" y="38" width="4" height="4" fill="black" />
    <rect x="10" y="46" width="4" height="4" fill="black" />
    <rect x="10" y="54" width="4" height="4" fill="black" />

    {/* QR matrix dots */}
    <rect x="38" y="22" width="4" height="4" fill="black" />
    <rect x="46" y="22" width="8" height="4" fill="black" />
    <rect x="58" y="22" width="4" height="4" fill="black" />
    <rect x="38" y="30" width="8" height="4" fill="black" />
    <rect x="50" y="30" width="4" height="4" fill="black" />
    <rect x="58" y="30" width="4" height="4" fill="black" />

    <rect x="22" y="38" width="4" height="8" fill="black" />
    <rect x="30" y="38" width="4" height="4" fill="black" />
    <rect x="38" y="38" width="4" height="4" fill="black" />
    <rect x="46" y="38" width="12" height="4" fill="black" />
    <rect x="62" y="38" width="8" height="4" fill="black" />
    <rect x="74" y="38" width="4" height="4" fill="black" />
    <rect x="82" y="38" width="8" height="4" fill="black" />

    <rect x="38" y="46" width="8" height="4" fill="black" />
    <rect x="50" y="46" width="4" height="4" fill="black" />
    <rect x="58" y="46" width="8" height="4" fill="black" />
    <rect x="70" y="46" width="4" height="4" fill="black" />
    <rect x="78" y="46" width="12" height="4" fill="black" />

    <rect x="22" y="54" width="8" height="4" fill="black" />
    <rect x="34" y="54" width="4" height="4" fill="black" />
    <rect x="42" y="54" width="4" height="4" fill="black" />
    <rect x="50" y="54" width="8" height="4" fill="black" />
    <rect x="62" y="54" width="4" height="4" fill="black" />
    <rect x="70" y="54" width="8" height="4" fill="black" />
    <rect x="82" y="54" width="4" height="4" fill="black" />

    <rect x="38" y="62" width="4" height="8" fill="black" />
    <rect x="46" y="62" width="4" height="4" fill="black" />
    <rect x="54" y="62" width="8" height="4" fill="black" />

    <rect x="38" y="74" width="8" height="4" fill="black" />
    <rect x="50" y="74" width="4" height="8" fill="black" />
    <rect x="58" y="74" width="4" height="4" fill="black" />

    <rect x="38" y="82" width="4" height="8" fill="black" />
    <rect x="46" y="86" width="8" height="4" fill="black" />
    <rect x="58" y="82" width="4" height="4" fill="black" />
    <rect x="70" y="86" width="8" height="4" fill="black" />
    <rect x="82" y="86" width="8" height="4" fill="black" />
  </svg>
);

export const HeroCarousel: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isQrDismissed, setIsQrDismissed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('uniquelo_dismiss_app_qr') === 'true';
    }
    return false;
  });

  const showAppQR = isAppDownloadQREnabled() && !isQrDismissed;

  const slides = CAROUSEL_SLIDES;
  const currentSlide = slides[activeIndex];

  // Progress animation refs
  const startTimeRef = useRef<number>(0);
  const elapsedBeforePauseRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
    setProgress(0);
    elapsedBeforePauseRef.current = 0;
    startTimeRef.current = Date.now();
  }, []);

  const nextSlide = useCallback(() => {
    goToSlide((activeIndex + 1) % slides.length);
  }, [activeIndex, goToSlide, slides.length]);

  const prevSlide = useCallback(() => {
    goToSlide((activeIndex - 1 + slides.length) % slides.length);
  }, [activeIndex, goToSlide, slides.length]);

  // Smooth circular timer progress loop
  useEffect(() => {
    startTimeRef.current = Date.now() - elapsedBeforePauseRef.current;

    const tick = () => {
      if (SITE_TWEAKS.carousel.pauseOnHover && isHovered) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      const elapsed = Date.now() - startTimeRef.current;
      elapsedBeforePauseRef.current = elapsed;
      const pct = Math.min((elapsed / SLIDE_DURATION_MS) * 100, 100);

      setProgress(pct);

      if (pct >= 100) {
        nextSlide();
      } else {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [activeIndex, isHovered, nextSlide]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    }
  };

  // Mobile Touch Swipe Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartXRef.current - touchEndX;

    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
  };

  const handleDismissQR = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsQrDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('uniquelo_dismiss_app_qr', 'true');
    }
  };

  // SVG circular timer geometry
  const radius = 8;
  const circumference = 2 * Math.PI * radius; // ~50.265
  const strokeDashoffset = circumference * (1 - progress / 100);

  return (
    <section
      className="relative w-full overflow-hidden bg-neutral-950 select-none"
      aria-label="Home campaign carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        // Full viewport minus the header bar, with responsive clamp
        minHeight: 'clamp(580px, 86vh, 920px)',
        height: 'calc(100vh - var(--header-height, 64px) - 2.2rem)',
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. Full-Length Edge-to-Edge Image Slides Layer
          ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        {slides.map((slide, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
              style={{ transitionDuration: `${SITE_TWEAKS.carousel.fadeDurationMs}ms` }}
              aria-hidden={!isActive}
            >
              <img
                src={slide.image}
                alt={`${slide.title} — ${slide.tagline}`}
                className={`w-full h-full object-cover object-center transition-transform duration-[7000ms] ease-out ${
                  isActive ? 'scale-100' : 'scale-105'
                }`}
                loading={idx === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </div>
          );
        })}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Vignette & Bottom Contrast Gradient
             Smoothly darkens towards the bottom so the white typography,
             CTA button, and timer pills pop with razor-sharp legibility.
          ───────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/85 via-black/35 via-35% to-transparent"
        aria-hidden="true"
      />

      {/* Subtle top header shadow vignette */}
      <div
        className="absolute top-0 inset-x-0 h-28 z-10 pointer-events-none bg-gradient-to-b from-black/40 to-transparent"
        aria-hidden="true"
      />

      {/* ─────────────────────────────────────────────────────────────
          3. Centered Content Layer: Tagline, Title, CTA Button
          ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 w-full h-full flex flex-col justify-end items-center text-center px-4 pb-12 sm:pb-16 lg:pb-20">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          {/* Subtitle / Kicker */}
          <p
            key={`kicker-${activeIndex}`}
            className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-white/95 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-in fade-in duration-500"
          >
            {currentSlide.tagline}
          </p>

          {/* Main Collection Headline */}
          <h1
            key={`title-${activeIndex}`}
            className="mt-3 sm:mt-4 text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-wider text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] animate-in fade-in slide-in-from-bottom-2 duration-500"
            style={{ fontFamily: "'Satoshi', var(--font-sans), sans-serif" }}
          >
            {currentSlide.title}
          </h1>

          {/* Optional editorial description for rich context */}
          {currentSlide.description && (
            <p
              key={`desc-${activeIndex}`}
              className="mt-2 text-xs sm:text-sm text-stone-200/80 font-normal max-w-xl hidden sm:block drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)] animate-in fade-in duration-700"
            >
              {currentSlide.description}
            </p>
          )}

          {/* CTA Button: White rounded capsule button with black text */}
          <div className="mt-6 sm:mt-7">
            <Link
              to={currentSlide.ctaLink}
              className="inline-flex items-center justify-center rounded-full bg-white text-black font-extrabold uppercase tracking-widest text-xs sm:text-sm px-9 py-3.5 sm:px-11 sm:py-4 shadow-[0_10px_25px_rgba(0,0,0,0.5)] hover:bg-neutral-100 hover:scale-105 active:scale-95 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-white"
            >
              {currentSlide.ctaText}
            </Link>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              4. Bottom Carousel Indicators: Timer Circle Fill-In
              ───────────────────────────────────────────────────────────── */}
          <div
            role="tablist"
            aria-label="Carousel slide indicators"
            className="mt-7 sm:mt-8 flex items-center justify-center gap-3 sm:gap-4"
          >
            {slides.map((slide, idx) => {
              const isActive = idx === activeIndex;

              return (
                <button
                  key={slide.id}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Slide ${idx + 1} of ${slides.length}: ${slide.title}`}
                  onClick={() => goToSlide(idx)}
                  className="relative flex items-center justify-center min-w-[32px] min-h-[32px] cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-full transition-transform active:scale-90"
                >
                  {isActive ? (
                    /* Active Indicator: Circular Progress Ring filling clockwise */
                    <div className="relative w-6 h-6 flex items-center justify-center">
                      <svg
                        className="w-6 h-6 transform -rotate-90"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        {/* Background track circle */}
                        <circle
                          cx="12"
                          cy="12"
                          r={radius}
                          stroke="rgba(255, 255, 255, 0.35)"
                          strokeWidth="2"
                          fill="none"
                        />
                        {/* Animated fill-in progress circle */}
                        <circle
                          cx="12"
                          cy="12"
                          r={radius}
                          stroke="#ffffff"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          fill="none"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                          style={{
                            transition:
                              SITE_TWEAKS.carousel.pauseOnHover && isHovered
                                ? 'none'
                                : 'stroke-dashoffset 40ms linear',
                          }}
                        />
                      </svg>
                      {/* Center white dot inside the circle */}
                      <span className="absolute w-2 h-2 rounded-full bg-white shadow-sm" />
                    </div>
                  ) : (
                    /* Inactive Indicator: Clean small white dot */
                    <span
                      aria-hidden="true"
                      className="w-2.5 h-2.5 rounded-full bg-white/50 group-hover:bg-white/90 group-hover:scale-125 transition-all duration-300"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          5. Bottom-Left Floating "Download our app" Card (Feature Flagged)
             Exact design from sketches/home setion 1.png:
             - Translucent glassmorphism pill/card
             - Dummy QR code
             - "Download our app" text
             - Circular close ("X") button
          ───────────────────────────────────────────────────────────── */}
      {showAppQR && (
        <div
          role="complementary"
          aria-label="Download mobile application"
          className="absolute bottom-6 left-5 sm:bottom-8 sm:left-8 lg:left-12 z-30 flex items-center gap-3.5 bg-black/75 backdrop-blur-md border border-white/20 rounded-sm p-3 sm:p-3.5 shadow-2xl text-white max-w-[260px] animate-in fade-in slide-in-from-bottom-3 duration-500 hover:bg-black/85 transition-colors"
        >
          {/* Close button with circular white badge */}
          <button
            onClick={handleDismissQR}
            aria-label="Close download app banner"
            className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:bg-neutral-200 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Dummy QR Code Image */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-sm bg-white p-1.5 shrink-0 flex items-center justify-center text-black shadow-md">
            <DummyQRCode className="w-full h-full" />
          </div>

          {/* Text Information */}
          <div className="flex flex-col pr-2">
            <span className="text-sm sm:text-base font-bold text-white leading-tight">
              Download our app
            </span>
            <span className="text-[11px] text-white/70 font-normal mt-0.5 leading-tight">
              Scan with camera
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
