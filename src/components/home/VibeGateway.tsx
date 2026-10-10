import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useProducts } from '../../hooks/useCatalog';
import { useFiltersStore } from '../../stores/filters';
import { MarketingHeader } from '../ui/MarketingHeader';
import type { Vibe } from '../../lib/data';

/**
 * Render target 02: Explore by Mood (chatgpt-v2).
 * Counts are computed from `vibes[]` discovery hints — never hardcoded.
 * Card chrome: borderless full-bleed photos, 16px radius, dual scrim;
 * the render's featured/hover state (gold ring, lift, filled gold CTA)
 * is implemented as the group-hover treatment. Mood photos are
 * placeholders until the P5 campaign shoots (current assets are blank).
 */
const VIBES: { vibe: Vibe; title: string; tagline: string; image: string }[] = [
  { vibe: 'aesthetic', title: 'Aesthetic', tagline: 'Art you can wear.', image: '/images/categories/knitwear.jpg' },
  { vibe: 'clean', title: 'Clean', tagline: 'Timeless pieces for everyday.', image: '/images/categories/tops.jpg' },
  { vibe: 'minimal', title: 'Minimal', tagline: 'Less noise. More meaning.', image: '/images/categories/accessories.jpg' },
  { vibe: 'expressive', title: 'Expressive', tagline: 'Louder stories. Bigger worlds.', image: '/images/categories/outerwear.jpg' },
];

export const VibeGateway: React.FC = () => {
  const { data: products } = useProducts();
  const setVibe = useFiltersStore((state) => state.setVibe);
  const navigate = useNavigate();

  const counts = useMemo(() => {
    const c: Record<Vibe, number> = { aesthetic: 0, clean: 0, minimal: 0, expressive: 0 };
    for (const p of products ?? []) {
      for (const v of p.vibes ?? []) c[v] += 1;
    }
    return c;
  }, [products]);

  const explore = (vibe: Vibe) => {
    setVibe(vibe);
    navigate('/shop');
  };

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
          eyebrow="Find your vibe"
          title="Explore by Mood"
          titleId="vibe-heading"
          sub="Different aesthetics. Same craftsmanship."
          linkTo="/shop"
          linkLabel="View all collections"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 py-4">
          {VIBES.map((v) => (
            <article
              key={v.vibe}
              className="group relative rounded-2xl transition-all duration-300 hover:z-10 hover:scale-[1.04] hover:ring-2 hover:ring-gold hover:shadow-[0_28px_70px_rgba(160,114,45,0.28)]"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-stone/30">
                <img
                  src={v.image}
                  alt={`${v.title} mood — ${v.tagline}`}
                  loading="lazy"
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
                    <span className="block font-serif text-2xl">{counts[v.vibe]}</span>
                    {/* sans voice — must be explicit now that body inherits serif */}
                    <span className="block font-sans text-[10px] uppercase tracking-widest text-cream/80 mt-1.5">
                      Styles
                    </span>
                  </p>
                </div>

                {/* CTA: functional sans voice resting, gold fill on hover */}
                <button
                  onClick={() => explore(v.vibe)}
                  aria-label={`Explore ${v.title} mood`}
                  className="absolute bottom-5 left-5 inline-flex items-center gap-2 rounded-md px-5 py-2.5 min-h-[44px] font-sans text-[15px] font-medium text-cream transition-all duration-300 group-hover:bg-gold hover:bg-gold"
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
          ))}
        </div>
      </div>
    </section>
  );
};