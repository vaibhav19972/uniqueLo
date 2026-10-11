import React, { useState } from 'react';
import { useUniverses } from '../../hooks/useCatalog';
import { CtaLink } from '../ui/Cta';

/**
 * Render target 01: tabbed universe hero.
 * Tabs are presentation config; tab *options* come from universes data.
 */
const TAB_LABELS: Record<string, string> = {
  animeverse: 'Anime',
  heroverse: 'Heroes',
  itihaas: 'History',
};

export const UniverseHero: React.FC = () => {
  const { data: universes } = useUniverses();
  const list = universes ?? [];
  const [activeSlug, setActiveSlug] = useState<string>('animeverse');
  const active = list.find((u) => u.slug === activeSlug) ?? list[0];

  return (
    <section className="relative bg-cream overflow-hidden">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 pt-10 lg:pt-16 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Copy */}
        <div>
          {/* Tracked caps eyebrow + hairline rule (render 01) */}
          <div className="flex items-center gap-4 max-w-md">
            <span className="text-[12px] font-sans uppercase tracking-eyebrow font-medium leading-relaxed" style={{ color: 'var(--brand-gold-deep)' }}>
              Embroidered apparel for dreamers, believers and builders
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-stone" />
          </div>
          <h1
            className="font-serif font-bold text-ink leading-display tracking-tight mt-5 max-w-xl"
            style={{ fontSize: 'var(--text-display)' }}
          >
            Wear the Universe,{' '}
            <span className="text-gold-deep italic">Embroidered for You.</span>
          </h1>
          <p className="font-serif text-lg text-ink-muted mt-6 max-w-md leading-relaxed">
            Explore embroidered apparel inspired by Anime, Heroes and Indian
            History. For dreamers, collectors and everyone in between.
          </p>

          {/* Universe tabs — pipe-separated per render 01, selected = gold + underline */}
          <div role="tablist" aria-label="Choose a universe" className="flex items-center gap-3 mt-7 max-w-md">
            {list.map((u, i) => {
              const selected = u.slug === (active?.slug ?? '');
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
                    onClick={() => setActiveSlug(u.slug)}
                    className="relative pb-0.5 text-xl font-serif transition-colors min-h-[44px] flex items-center"
                  >
                    <span className={selected ? 'text-gold-deep font-medium' : 'text-warm-gray hover:text-ink'}>
                      {TAB_LABELS[u.slug] ?? u.name}
                    </span>
                    {selected && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: 'var(--brand-gold)' }} />
                    )}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 mt-7">
            <CtaLink to={active ? `/universes/${active.slug}` : '/shop'}>
              Shop the Universes <span aria-hidden="true">→</span>
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

        {/* Visual — active universe emblem (replaced by campaign shoot at P5) */}
        <div className="relative">
          <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] overflow-hidden bg-stone/30 border border-stone/60">
            {active?.emblem_src && (
              <img
                key={active.slug}
                src={active.emblem_src}
                alt={`${active.name} — ${active.tagline}`}
                className="w-full h-full object-cover"
                loading="eager"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-cream/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 bg-paper/90 backdrop-blur px-5 py-4 border border-stone/60">
              <p className="font-serif text-xl text-ink">{active?.name}</p>
              <p className="text-xs text-ink-muted mt-1">{active?.tagline}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
