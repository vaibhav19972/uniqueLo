import React, { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useProducts } from '../../hooks/useCatalog';
import { useFiltersStore } from '../../stores/filters';
import { MarketingHeader } from '../ui/MarketingHeader';
import { MOODS, type MoodSlug } from '../../lib/data';

/**
 * Explore by Mood — buyer-intent gateway, data-driven from src/data/moods.json
 * (featured moods as cards; the rest in a quiet chip row). Distinct from
 * VibeGateway (style/render axis): moods answer "why am I shopping", vibes
 * answer "how loud should the page be". Counts from `moods[]` tags — never
 * hardcoded. Mood photos are placeholders until the P5 campaign shoots.
 */
const MOOD_IMAGE: Record<MoodSlug, string> = {
  everyday: '/images/categories/tops.jpg',
  statement: '/images/categories/outerwear.jpg',
  heritage: '/images/categories/knitwear.jpg',
  'festive-gifting': '/images/categories/outerwear.jpg',
  comfort: '/images/categories/knitwear.jpg',
  collector: '/images/categories/accessories.jpg',
};

export const MoodGateway: React.FC = () => {
  const { data: products } = useProducts();
  const setMood = useFiltersStore((state) => state.setMood);
  const navigate = useNavigate();

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of products ?? []) {
      for (const m of p.moods ?? []) c[m] = (c[m] ?? 0) + 1;
    }
    return c;
  }, [products]);

  const explore = (mood: MoodSlug) => {
    setMood(mood);
    navigate('/shop');
  };

  const featured = MOODS.filter((m) => m.featured);
  const more = MOODS.filter((m) => !m.featured);

  return (
    <section aria-labelledby="mood-heading" className="bg-cream py-16 lg:py-24">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          eyebrow="Shop by intent"
          title="Explore by Mood"
          titleId="mood-heading"
          sub="Why you're here today — the craft stays constant."
          linkTo="/shop"
          linkLabel="View all collections"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 py-4">
          {featured.map((m) => (
            <article
              key={m.slug}
              className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:z-10 hover:scale-[1.03] hover:ring-2 hover:ring-gold"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-stone/30">
                <img
                  src={MOOD_IMAGE[m.slug]}
                  alt={`${m.title} mood — ${m.tagline}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-cream">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-[22px] leading-tight">{m.title}</h3>
                      <p className="font-serif italic text-[15px] text-cream/85 mt-1">{m.tagline}</p>
                    </div>
                    <span className="text-right leading-none shrink-0">
                      <span className="block font-serif text-xl">{counts[m.slug] ?? 0}</span>
                      <span className="block font-sans text-[9px] uppercase tracking-widest text-cream/80 mt-1">
                        Styles
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={() => explore(m.slug)}
                    aria-label={`Explore ${m.title} mood`}
                    className="mt-3 inline-flex items-center gap-2 rounded-md px-4 py-2 min-h-[40px] font-sans text-[13px] font-medium text-cream transition-all duration-300 group-hover:bg-gold group-hover:text-on-gold hover:bg-gold hover:text-on-gold"
                  >
                    Explore <span aria-hidden="true">→</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {more.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <span className="font-sans text-[11px] uppercase tracking-widest text-ink-muted mr-1">More moods</span>
            {more.map((m) => (
              <button
                key={m.slug}
                onClick={() => explore(m.slug)}
                className="rounded-full border border-stone bg-paper px-4 py-2.5 text-xs uppercase tracking-widest font-sans text-ink hover:border-ink transition-colors min-h-[44px]"
                aria-label={`Explore ${m.title} mood`}
              >
                {m.title}
                <span className="ml-1.5 text-ink-muted normal-case tracking-normal">({counts[m.slug] ?? 0})</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};