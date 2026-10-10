import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useProducts, useUniverses } from '../../hooks/useCatalog';
import { MarketingHeader } from '../ui/MarketingHeader';

/**
 * Render target 03: Worlds to Wear — universe portal cards.
 * Cards, counts, and links all derive from universes + catalog data.
 */
export const UniversePortals: React.FC = () => {
  const { data: universes } = useUniverses();
  const { data: products } = useProducts();

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of products ?? []) {
      if (!p.universeSlug) continue;
      c[p.universeSlug] = (c[p.universeSlug] ?? 0) + 1;
    }
    return c;
  }, [products]);

  return (
    <section aria-labelledby="universes-heading" className="bg-paper py-16 lg:py-24 border-t border-stone/60">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          eyebrow="Universes"
          title="Worlds to Wear"
          titleId="universes-heading"
          sub="Stories, characters and legacies — hand-embroidered for your everyday."
          linkTo="/shop"
          linkLabel="Explore all universes"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {(universes ?? []).map((u, i) => (
            <article
              key={u.slug}
              className={`group relative overflow-hidden border border-stone/60 bg-cream transition-transform duration-500 hover:-translate-y-1.5 ${
                i === 1 ? 'md:-translate-y-3 md:shadow-xl ring-1 ring-gold' : ''
              }`}
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                {u.emblem_src && (
                  <img
                    src={u.emblem_src}
                    alt={`${u.name} universe artwork`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/20 to-transparent" />
                <div className="absolute inset-x-0 top-0 p-5">
                  <h3 className="font-serif text-3xl text-ink">{u.name}</h3>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-ink-muted mt-1">{u.tagline}</p>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-sm text-ink/80 leading-relaxed line-clamp-2">{u.lore}</p>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-ink">
                      <span className="font-serif text-xl">{counts[u.slug] ?? 0}+ </span>
                      <span className="text-xs uppercase tracking-widest text-ink-muted">Styles</span>
                    </p>
                    <Link
                      to={`/universes/${u.slug}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 font-serif text-[16px] text-cream bg-gold min-h-[44px]"
                      aria-label={`Enter ${u.name}`}
                    >
                      Enter {u.slug === 'itihaas' ? 'Itihas' : u.name} <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
