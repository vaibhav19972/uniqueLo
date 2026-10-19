import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useUniverses, useProducts } from '../../hooks/useCatalog';
import { useFiltersStore } from '../../stores/filters';
import { MarketingHeader } from '../ui/MarketingHeader';

/**
 * Worlds to Wear — portal cards unified under The Atelier design system.
 * All 4 doors (Animeverse, Heroverse, Itihaas, The Atelier) share the same
 * crisp paper surface, obsidian typography, hairline divider, and refined
 * quiet-luxury hover response.
 */
interface PortalItem {
  id: string;
  name: string;
  tagline: string;
  lore: string;
  image?: string;
  count: number;
  to?: string;
  onEnter?: () => void;
}

export const UniversePortals: React.FC = () => {
  const { data: universes } = useUniverses();
  const { data: products } = useProducts();
  const setUniverse = useFiltersStore((state) => state.setUniverse);
  const navigate = useNavigate();
  const [active, setActive] = useState<string | null>(null);

  const atelierCount = useMemo(
    () => (products ?? []).filter((p) => !p.universeSlug).length,
    [products],
  );

  const enterAtelier = () => {
    setUniverse('atelier');
    navigate('/shop');
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of products ?? []) {
      if (!p.universeSlug) continue;
      c[p.universeSlug] = (c[p.universeSlug] ?? 0) + 1;
    }
    return c;
  }, [products]);

  const portals: PortalItem[] = useMemo(() => {
    const list: PortalItem[] = (universes ?? []).map((u) => ({
      id: u.slug,
      name: u.name,
      tagline: u.tagline,
      lore: u.lore,
      image: u.emblem_src || u.hero_image,
      count: counts[u.slug] ?? 0,
      to: `/universes/${u.slug}`,
    }));

    list.push({
      id: 'atelier',
      name: 'The Atelier',
      tagline: 'Pure craftsmanship, no theme',
      lore: 'The base line of the house: artisanal embroidery for its own sake — technique, textile, and construction above every story.',
      image: '/images/campaigns/atelier-craft.jpg',
      count: atelierCount,
      onEnter: enterAtelier,
    });

    return list;
  }, [universes, counts, atelierCount]);

  return (
    <section aria-labelledby="universes-heading" className="relative overflow-hidden bg-cream py-16 lg:py-24">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          eyebrow="Universes"
          title="Worlds to Wear"
          titleId="universes-heading"
          sub="Stories, characters and legacies — embroidered for your everyday."
          linkTo="/universes"
          linkLabel="Explore all universes"
        />

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 py-4"
          onMouseLeave={() => setActive(null)}
        >
          {portals.map((item) => {
            const isActive = active === item.id;
            const isDimmed = active !== null && !isActive;

            return (
              <article
                key={item.id}
                onMouseEnter={() => setActive(item.id)}
                onFocus={() => setActive(item.id)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) setActive(null);
                }}
                className={`group relative flex flex-col overflow-hidden rounded-[20px] border border-stone/60 bg-paper transition-all motion-reduce:transform-none ${
                  isActive
                    ? 'z-10 -translate-y-2 scale-[1.03] ring-2 ring-ink shadow-float'
                    : isDimmed
                      ? 'md:scale-[0.97] opacity-75 duration-500'
                      : 'hover:-translate-y-1 duration-500'
                }`}
              >
                {/* Artwork media preview */}
                {item.image && (
                  <div className="relative h-44 w-full overflow-hidden border-b border-stone/40 bg-stone/20">
                    <img
                      src={item.image}
                      alt={`${item.name} artwork`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-paper/30 to-transparent" />
                  </div>
                )}

                {/* Editorial text stack */}
                <div className="relative z-10 flex flex-1 flex-col p-6 min-h-[300px]">
                  <div className="max-w-[92%]">
                    <h3 className="font-serif text-2xl sm:text-3xl leading-[1.1] text-ink transition-transform duration-500 group-hover:italic">
                      {item.name}
                    </h3>
                    <p className="font-sans text-[11px] uppercase tracking-label text-ink-muted mt-2">
                      {item.tagline}
                    </p>
                    <span aria-hidden="true" className="mt-3.5 block h-px w-8 bg-ink/25" />
                    <p className="font-serif text-[14px] text-ink/85 mt-3 leading-relaxed line-clamp-3">
                      {item.lore}
                    </p>
                  </div>

                  <div className="mt-auto pt-6">
                    <p className="leading-none">
                      <span className="font-serif font-semibold text-2xl text-ink">{item.count}+ </span>
                      <span className="font-sans text-[10px] uppercase tracking-widest text-ink-muted ml-1">
                        Styles
                      </span>
                    </p>
                    {item.to ? (
                      <Link
                        to={item.to}
                        className="mt-3.5 inline-flex w-fit items-center gap-2 rounded-md px-7 py-3 font-serif text-[15px] sm:text-[16px] bg-ink text-cream hover:bg-ink/90 min-h-[44px] transition-all group-hover:gap-3"
                        aria-label={`Enter ${item.name}`}
                      >
                        Enter {item.name} <span aria-hidden="true">→</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={item.onEnter}
                        className="mt-3.5 inline-flex w-fit items-center gap-2 rounded-md px-7 py-3 font-serif text-[15px] sm:text-[16px] bg-ink text-cream hover:bg-ink/90 min-h-[44px] transition-all group-hover:gap-3 cursor-pointer"
                        aria-label={`Enter ${item.name}`}
                      >
                        Enter {item.name} <span aria-hidden="true">→</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
