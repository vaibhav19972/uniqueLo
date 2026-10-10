import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useProducts } from '../../hooks/useCatalog';
import { useFiltersStore } from '../../stores/filters';
import { MarketingHeader } from '../ui/MarketingHeader';
import type { Vibe } from '../../lib/data';

/**
 * Render target 02: Explore by Mood.
 * Counts are computed from `vibes[]` discovery hints — never hardcoded.
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
    <section aria-labelledby="vibe-heading" className="bg-cream py-16 lg:py-24">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          eyebrow="Find your vibe"
          title="Explore by Mood"
          titleId="vibe-heading"
          sub="Different aesthetics. Same craftsmanship."
          linkTo="/shop"
          linkLabel="View all collections"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {VIBES.map((v) => (
            <article key={v.vibe} className="group relative overflow-hidden border border-stone/60 bg-paper">
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={v.image}
                  alt={`${v.title} mood — ${v.tagline}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                <div className="absolute top-4 left-4 right-4 flex items-start justify-between text-cream">
                  <div>
                    <h3 className="font-serif text-2xl tracking-wide uppercase">{v.title}</h3>
                    <p className="text-sm italic font-serif mt-1 text-cream/90">{v.tagline}</p>
                  </div>
                  <p className="text-right leading-tight">
                    <span className="block font-serif text-2xl">{counts[v.vibe]}</span>
                    <span className="block text-[10px] uppercase tracking-widest text-cream/80">Styles</span>
                  </p>
                </div>
                <button
                  onClick={() => explore(v.vibe)}
                  className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-5 py-2.5 font-serif text-[16px] text-cream bg-gold min-h-[44px] transition-transform group-hover:translate-x-1"
                  aria-label={`Explore ${v.title} mood`}
                >
                  Explore {v.title} <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
