import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useProducts } from '../../hooks/useCatalog';
import { useFiltersStore } from '../../stores/filters';
import { MarketingHeader } from '../ui/MarketingHeader';
import { VIBES, type Vibe, type VibeInfo } from '../../lib/data';

/**
 * Render target 02: Explore by Style (chatgpt-v2) — data-driven from
 * src/data/vibes.json. Featured vibes render as cards; the rest sit in an
 * expandable "More styles" row (adding a vibe = one JSON row + one CSS
 * [data-vibe] block, zero component changes). Counts are computed from
 * `vibes[]` discovery hints — never hardcoded. Styles (how loud it renders)
 * are deliberately labeled apart from Moods (buyer intent) in MoodGateway —
 * buyers must never see the two axes under one name. Style photos are
 * placeholders until the P5 campaign shoots.
 */
const VIBE_IMAGE: Record<Vibe, string> = {
  aesthetic: '/images/vibes/aesthetic.png',
  clean: '/images/vibes/clean.png',
  minimal: '/images/vibes/minimal.png',
  expressive: '/images/vibes/expressive.png',
  noir: '/images/categories/outerwear.jpg',
  pearl: '/images/categories/tops.jpg',
  gilded: '/images/categories/knitwear.jpg',
};

const VIBE_OBJECT_POSITION: Partial<Record<Vibe, string>> = {
  aesthetic: '78% center',
  clean: '68% center',
  minimal: '75% center',
  expressive: '68% center',
};

export const VibeGateway: React.FC = () => {
  const { data: products } = useProducts();
  const setVibe = useFiltersStore((state) => state.setVibe);
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of products ?? []) {
      for (const v of p.vibes ?? []) c[v] = (c[v] ?? 0) + 1;
    }
    return c;
  }, [products]);

  const featured = VIBES.filter((v) => v.featured);
  const more = VIBES.filter((v) => !v.featured);

  const explore = (vibe: Vibe) => {
    setVibe(vibe);
    navigate('/shop');
  };

  const card = (v: VibeInfo) => (
    <article
      key={v.slug}
      className="group relative rounded-2xl transition-all duration-300 hover:z-10 hover:scale-[1.04] hover:ring-2 hover:ring-gold hover:shadow-[0_28px_70px_rgba(160,114,45,0.28)]"
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#ded7cb]">
        <img
          src={VIBE_IMAGE[v.slug]}
          alt={`${v.title} style — ${v.tagline}`}
          loading="lazy"
          style={{ objectPosition: VIBE_OBJECT_POSITION[v.slug] ?? 'center' }}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Dual scrim: top for the title block, bottom for the CTA */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/5 to-ink/60" />

        {/* Title block + count */}
        <div className="absolute top-5 left-5 right-5 flex items-start justify-between text-cream">
          <div>
            <h3 className="font-serif uppercase tracking-label text-[26px] leading-none">
              {v.title}
            </h3>
            <span aria-hidden="true" className="mt-2.5 block h-[2px] w-7 bg-cream/80" />
            <p className="font-serif italic text-[17px] mt-2.5 text-cream/90">
              {v.tagline}
            </p>
          </div>
          <p className="text-right leading-none shrink-0">
            <span className="block font-serif text-2xl">{counts[v.slug] ?? 0}</span>
            {/* sans voice — must be explicit now that body inherits serif */}
            <span className="block font-sans text-[10px] uppercase tracking-widest text-cream/80 mt-1.5">
              Styles
            </span>
          </p>
        </div>

        {/* CTA: functional sans voice resting, gold fill on hover */}
        <button
          onClick={() => explore(v.slug)}
          aria-label={`Explore ${v.title} style`}
          className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-md px-5 py-2.5 min-h-[44px] font-sans text-[15px] font-medium text-cream transition-all duration-300 group-hover:bg-gold group-hover:text-on-gold hover:bg-gold hover:text-on-gold"
        >
          <span>Explore {v.title}</span>
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            →
          </span>
        </button>
      </div>
    </article>
  );

  return (
    <section aria-labelledby="vibe-heading" className="relative overflow-hidden bg-cream py-16 lg:py-24">
      {/* Faint radial gold glow behind the card row (render accent) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[36rem] w-[80rem] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{ background: 'radial-gradient(closest-side, rgba(203, 160, 67, 0.10), transparent)' }}
      />

      <div className="relative max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          eyebrow="Find your style"
          title="Explore by Style"
          titleId="vibe-heading"
          sub="How loud your world renders. Different aesthetics, same craftsmanship."
          linkTo="/shop"
          linkLabel="View all collections"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 py-4">
          {featured.map(card)}
        </div>

        {more.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setMoreOpen((o) => !o)}
              aria-expanded={moreOpen}
              aria-controls="more-styles"
              className="inline-flex items-center gap-2 text-[15px] font-sans font-medium text-ink border-b border-ink/30 hover:border-ink pb-1 transition-colors min-h-[44px]"
            >
              {moreOpen ? 'Fewer styles' : `More styles (${more.length})`}
              <span aria-hidden="true" className={`transition-transform duration-300 ${moreOpen ? 'rotate-180' : ''}`}>↓</span>
            </button>
            {moreOpen && (
              <div id="more-styles" className="flex flex-wrap gap-2.5 mt-4">
                {more.map((v) => (
                  <button
                    key={v.slug}
                    onClick={() => explore(v.slug)}
                    className="rounded-full border border-stone bg-paper px-4 py-2.5 text-xs uppercase tracking-widest font-sans text-ink hover:border-ink transition-colors min-h-[44px]"
                  >
                    {v.title}
                    <span className="ml-1.5 text-ink-muted normal-case tracking-normal">({counts[v.slug] ?? 0})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};