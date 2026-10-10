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
          <p className="text-[11px] font-sans uppercase tracking-[0.28em] text-ink-muted">
            Embroidered apparel for dreamers, believers and builders
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-ink leading-[1.02] mt-4 tracking-tight">
            Wear the
            <br />
            Universe,
            <br />
            <em className="font-light text-gold">
              Stitched by Hand
            </em>
          </h1>
          <p className="text-sm sm:text-base text-ink-muted mt-5 max-w-md font-light leading-relaxed">
            Explore hand-embroidered apparel inspired by Anime, Heroes and Indian History.
          </p>

          {/* Universe tabs */}
          <div role="tablist" aria-label="Choose a universe" className="flex items-center gap-6 mt-7 border-b border-stone/70 max-w-md">
            {list.map((u) => {
              const selected = u.slug === (active?.slug ?? '');
              return (
                <button
                  key={u.slug}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveSlug(u.slug)}
                  className={`relative pb-2.5 text-sm font-serif tracking-wide transition-colors min-h-[44px] ${
                    selected ? 'text-ink font-semibold' : 'text-ink-muted hover:text-ink'
                  }`}
                  style={selected ? { color: 'var(--color-gold)' } : undefined}
                >
                  {TAB_LABELS[u.slug] ?? u.name}
                  {selected && (
                    <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-gold" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 mt-7">
            <CtaLink to={active ? `/universes/${active.slug}` : '/shop'}>
              Shop the Universes <span aria-hidden="true">→</span>
            </CtaLink>
            <CtaLink to="/atelier" variant="outline">
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
