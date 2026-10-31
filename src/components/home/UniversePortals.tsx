import React, { useMemo, useState } from 'react';
import { useReveal } from '../../hooks/useReveal';
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
  const revealRef = useReveal<HTMLElement>();

  const { data: universes } = useUniverses();
  const { data: products } = useProducts();
  const setUniverse = useFiltersStore((state) => state.setUniverse);
  const navigate = useNavigate();
  const [active, setActive] = useState<string | null>(null);

  const atelierCount = useMemo(
    () => (products ?? []).filter((p) => !p.universeSlug).length,
    [products],
  );

  const enterAtelier = React.useCallback(() => {
    setUniverse('atelier');
    navigate('/shop');
  }, [setUniverse, navigate]);

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
  }, [universes, counts, atelierCount, enterAtelier]);

  return (
    <section aria-labelledby="universes-heading" ref={revealRef} className="reveal relative overflow-hidden bg-cream py-16 lg:py-24">
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
          className="grid grid-cols-2 gap-3 sm:gap-5 md:gap-6 py-4"
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
                className={`group relative flex flex-col overflow-hidden rounded-[16px] sm:rounded-[20px] border border-stone/60 bg-paper transition-all motion-reduce:transform-none ${
                  isActive
                    ? 'z-10 -translate-y-2 scale-[1.03] ring-2 ring-ink shadow-float'
                    : isDimmed
                      ? 'md:scale-[0.97] opacity-75 duration-500'
                      : 'hover:-translate-y-1 duration-500'
                }`}
              >
                {/* Artwork media preview */}
                {item.image && (
                  <div className="relative h-28 sm:h-44 w-full overflow-hidden border-b border-stone/40 bg-stone/20">
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
                <div className="relative z-10 flex flex-1 flex-col p-3.5 sm:p-6 min-h-[170px] sm:min-h-[300px]">
                  <div className="max-w-[96%] sm:max-w-[92%]">
                    <h3 className="font-serif text-base sm:text-2xl lg:text-3xl leading-tight text-ink transition-transform duration-500 group-hover:font-medium">
                      {item.name}
                    </h3>
                    <p className="font-sans text-xs sm:text-xs uppercase tracking-label text-ink-muted mt-1 sm:mt-2 line-clamp-1">
                      {item.tagline}
                    </p>
                    <span aria-hidden="true" className="mt-2 sm:mt-3.5 block h-px w-6 sm:w-8 bg-panel-raised/25" />
                    <p className="font-serif text-xs sm:text-sm text-ink/85 mt-2 sm:mt-3 leading-relaxed line-clamp-2 sm:line-clamp-3 hidden sm:block">
                      {item.lore}
                    </p>
                  </div>

                  <div className="mt-auto pt-3 sm:pt-6">
                    <p className="leading-none">
                      <span className="font-serif font-semibold text-base sm:text-2xl text-ink">{item.count}+ </span>
                      <span className="font-sans text-xs sm:text-xs uppercase tracking-widest text-ink-muted ml-0.5 sm:ml-1">
                        Styles
                      </span>
                    </p>
                    {item.to ? (
                      <Link
                        to={item.to}
                        className="mt-2.5 sm:mt-3.5 inline-flex w-full sm:w-fit items-center justify-center gap-1.5 sm:gap-2 rounded-md px-3 sm:px-7 py-2 sm:py-3 font-serif text-xs sm:text-base bg-panel-raised text-white hover:bg-panel-raised/90 min-h-[38px] sm:min-h-[44px] transition-all group-hover:gap-3"
                        aria-label={`Enter ${item.name}`}
                      >
                        Enter {item.name} <span aria-hidden="true">→</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={item.onEnter}
                        className="mt-2.5 sm:mt-3.5 inline-flex w-full sm:w-fit items-center justify-center gap-1.5 sm:gap-2 rounded-md px-3 sm:px-7 py-2 sm:py-3 font-serif text-xs sm:text-base bg-panel-raised text-white hover:bg-panel-raised/90 min-h-[38px] sm:min-h-[44px] transition-all group-hover:gap-3 cursor-pointer"
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
