import React, { useCallback, useEffect, useState } from 'react';
import { useUniverses } from '../../hooks/useCatalog';
import { CtaLink } from '../ui/Cta';

/**
 * Render target 01: Hero with full-width background crossfade carousel.
 *
 * Visual anatomy:
 * - Full-width hero container with responsive outer margins and subtle luxury frame.
 * - Background layer: 16:9 widescreen editorial images crossfading between universes.
 * - Gradient mask: Deep atelier cream (#f7f5f0) on the left ~50% fading smoothly
 *   into transparent on the right, keeping headline & CTAs perfectly crisp while
 *   revealing the character / embroidered garment on the right.
 * - Interactive carousel:
 *   - Auto-scrolls continuously every 5.5s with a smooth crossfade (infinite loop).
 *   - Two-way synced with the universe tabs (Anime, Heroes, History) and slide dots.
 */
const TAB_LABELS: Record<string, string> = {
  animeverse: 'Anime',
  heroverse: 'Heroes',
  itihaas: 'History',
};

const DEFAULT_HERO_IMAGES: Record<string, string> = {
  animeverse: '/images/campaigns/hero-animeverse.jpg',
  heroverse: '/images/campaigns/hero-heroverse.jpg',
  itihaas: '/images/campaigns/hero-itihaas.jpg',
};

const SLIDE_DURATION_MS = 5500;

export const UniverseHero: React.FC = () => {
  const { data: universes } = useUniverses();
  const list = universes ?? [];

  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Keep active index within bounds if universe list changes
  const validIndex = list.length > 0 ? activeIndex % list.length : 0;
  const active = list[validIndex] ?? list[0];

  const nextSlide = useCallback(() => {
    if (list.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % list.length);
  }, [list.length]);

  const prevSlide = useCallback(() => {
    if (list.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + list.length) % list.length);
  }, [list.length]);

  // Infinite continuous auto-scroll timer
  useEffect(() => {
    if (list.length <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION_MS);

    return () => clearInterval(timer);
  }, [list.length, nextSlide, validIndex]);

  const handleTabKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    }
  };

  return (
    <section
      className="relative bg-cream overflow-hidden pt-4 sm:pt-6 pb-6 sm:pb-10"
      aria-label="Hero carousel"
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        {/* Full-width container frame with margins and square border */}
        <div className="relative overflow-hidden rounded-sm border border-stone/70 min-h-[580px] sm:min-h-[620px] lg:min-h-[660px] flex items-center">
          {/* ─────────────────────────────────────────────────────────────
              1. Background Crossfade Carousel
              ───────────────────────────────────────────────────────────── */}
          <div className="absolute inset-0 z-0 bg-cream" aria-hidden="true">
            {list.map((u, i) => {
              const isCurrent = i === validIndex;
              const imgSrc = u.hero_image || DEFAULT_HERO_IMAGES[u.slug] || u.emblem_src;

              return (
                <div
                  key={u.slug}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  {imgSrc && (
                    <img
                      src={imgSrc}
                      alt={`${u.name} — ${u.tagline}`}
                      className={`w-full h-full object-cover object-right sm:object-[80%_center] lg:object-center transform transition-transform duration-[7000ms] ease-out ${
                        isCurrent ? 'scale-100' : 'scale-105'
                      }`}
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* ─────────────────────────────────────────────────────────────
              2. Left-to-Right Fade Gradient Overlay
                 - Left side is solid/high-opacity cream to keep copy pristine.
                 - Smoothly tapers off so the character on the right shines.
              ───────────────────────────────────────────────────────────── */}
          {/* Desktop & tablet horizontal gradient */}
          <div
            className="absolute inset-0 z-10 pointer-events-none hidden sm:block"
            style={{
              background:
                'linear-gradient(to right, var(--color-cream) 0%, var(--color-cream) 32%, color-mix(in srgb, var(--color-cream) 94%, transparent) 46%, color-mix(in srgb, var(--color-cream) 65%, transparent) 60%, color-mix(in srgb, var(--color-cream) 15%, transparent) 75%, transparent 100%)',
            }}
            aria-hidden="true"
          />

          {/* Mobile vertical gradient (covers text above, reveals model below) */}
          <div
            className="absolute inset-0 z-10 pointer-events-none sm:hidden"
            style={{
              background:
                'linear-gradient(to bottom, var(--color-cream) 0%, color-mix(in srgb, var(--color-cream) 95%, transparent) 55%, color-mix(in srgb, var(--color-cream) 70%, transparent) 75%, color-mix(in srgb, var(--color-cream) 20%, transparent) 100%)',
            }}
            aria-hidden="true"
          />

          {/* Subtle perimeter vignettes for luxury framing */}
          <div
            className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-cream/40 via-transparent to-cream/20"
            aria-hidden="true"
          />

          {/* ─────────────────────────────────────────────────────────────
              3. Foreground Content Layer
              ───────────────────────────────────────────────────────────── */}
          <div className="relative z-20 w-full px-6 sm:px-10 lg:px-16 py-10 sm:py-14 lg:py-16 flex flex-col justify-between min-h-[580px] sm:min-h-[620px] lg:min-h-[660px]">
            {/* Top / Main Copy Area */}
            <div className="max-w-xl lg:max-w-2xl my-auto">
              {/* Tracked caps eyebrow + hairline rule */}
              <div className="flex items-center gap-4 max-w-md">
                <span
                  className="text-[12px] font-sans uppercase tracking-eyebrow font-medium leading-relaxed"
                  style={{ color: 'var(--brand-gold-deep)' }}
                >
                  Embroidered apparel for dreamers, believers and builders
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-stone/80" />
              </div>

              {/* Bold Headline */}
              <h1
                className="font-serif font-bold text-ink leading-display tracking-tight mt-5"
                style={{ fontSize: 'var(--text-display)' }}
              >
                Wear the Universe,{' '}
                <span className="text-gold-deep italic block sm:inline">
                  Embroidered for You.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="font-serif text-lg text-ink-muted mt-5 max-w-lg leading-relaxed">
                Explore embroidered apparel inspired by Anime, Heroes and Indian
                History. For dreamers, collectors and everyone in between.
              </p>

              {/* Universe Tabs (Two-way synced with the background carousel) */}
              <div
                role="tablist"
                aria-label="Choose a universe"
                onKeyDown={handleTabKeyDown}
                className="flex items-center gap-3 mt-7 max-w-md"
              >
                {list.map((u, i) => {
                  const selected = i === validIndex;
                  return (
                    <React.Fragment key={u.slug}>
                      {i > 0 && (
                        <span aria-hidden="true" className="text-stone select-none text-lg font-light">
                          |
                        </span>
                      )}
                      <button
                        role="tab"
                        aria-selected={selected}
                        onClick={() => setActiveIndex(i)}
                        className="relative pb-0.5 text-xl font-serif transition-colors min-h-[44px] flex items-center group cursor-pointer focus-visible:outline-accent"
                      >
                        <span
                          className={
                            selected
                              ? 'text-gold-deep font-semibold'
                              : 'text-ink-muted hover:text-ink transition-colors'
                          }
                        >
                          {TAB_LABELS[u.slug] ?? u.name}
                        </span>
                        {selected && (
                          <span
                            aria-hidden="true"
                            className="absolute bottom-0 left-0 right-0 h-[2px] transition-all"
                            style={{ backgroundColor: 'var(--brand-gold)' }}
                          />
                        )}
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Action CTAs */}
              <div className="flex flex-wrap gap-3 mt-8">
                <CtaLink to={active ? `/universes/${active.slug}` : '/shop'}>
                  Shop {active?.name ?? 'the Universes'} <span aria-hidden="true">→</span>
                </CtaLink>
                <CtaLink to="/atelier" variant="outline">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 9l5 3-5 3V9z" />
                  </svg>
                  Our Craft
                </CtaLink>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                4. Bottom Bar: Slide Indicators & Active Universe Chip
                ───────────────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between pt-6 border-t border-stone/50 mt-8">
              {/* Slide dots */}
              <div className="flex items-center gap-2">
                {list.map((u, idx) => {
                  const isActive = idx === validIndex;
                  return (
                    <button
                      key={u.slug}
                      onClick={() => setActiveIndex(idx)}
                      aria-label={`Switch to ${u.name} slide`}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer focus-visible:outline-accent group"
                    >
                      <span
                        aria-hidden="true"
                        className={`h-2 transition-all duration-500 rounded-full ${
                          isActive ? 'w-8 bg-gold-deep' : 'w-2 bg-stone group-hover:bg-warm-gray'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Active universe badge */}
              {active && (
                <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-paper/85 backdrop-blur-md border border-stone/60 text-xs font-serif text-ink shadow-sm transition-all">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: 'var(--brand-gold)' }}
                    aria-hidden="true"
                  />
                  <span className="font-medium text-ink">{active.name}</span>
                  <span className="text-stone">·</span>
                  <span className="text-ink-muted truncate max-w-[220px]">
                    {active.tagline}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
