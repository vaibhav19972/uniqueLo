import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useUniverses, useProducts } from '../../hooks/useCatalog';
import { useFiltersStore } from '../../stores/filters';
import { MarketingHeader } from '../ui/MarketingHeader';
import { useReveal } from '../../hooks/useReveal';
import { AmbientBackdrop } from '../ui/AmbientBackdrop';

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
      // Portrait-ish card slot: the emblem flat-lay reads better at this crop
      // than the wide campaign hero, so it leads.
      image: u.emblem_src || u.hero_image,
      count: counts[u.slug] ?? 0,
      to: `/universes/${u.slug}`,
    }));

    list.push({
      id: 'atelier',
      name: 'The Atelier',
      tagline: 'Pure craftsmanship, no theme',
      lore: 'The base line of the house: artisanal embroidery for its own sake — technique, textile, and construction above every story.',
      image: '/images/universes/emblem-atelier.jpg',
      count: atelierCount,
      onEnter: enterAtelier,
    });

    return list;
  }, [universes, counts, atelierCount, enterAtelier]);

  return (
    <section
      ref={revealRef}
      className="reveal relative overflow-hidden bg-cream py-16 lg:py-16"
      aria-labelledby="universes-heading"
    >
      {/* Each portal card carries its own accent; the ambient field behind the
          band picks up the page accent so the section has a colour temperature
          instead of a flat canvas. */}
      <AmbientBackdrop variant="band" className="opacity-70" />

      <div className="relative mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
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
                data-accent={item.id}
                className={`group relative flex flex-col overflow-hidden rounded-xl border border-stone bg-paper transition-all duration-500 ease-base motion-reduce:transform-none ${
                  isActive
                    ? 'z-10 -translate-y-2 scale-[1.02] ring-2 ring-accent shadow-float'
                    : isDimmed
                      ? 'opacity-70 md:scale-[0.98]'
                      : 'hover:-translate-y-1 hover:border-accent'
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
                    <div className="scrim-bottom-soft absolute inset-x-0 bottom-0 h-1/2" aria-hidden="true" />
                    {/* Universe accent bar — the card's identity, not a second palette. */}
                    <span className="absolute inset-x-0 bottom-0 h-1 bg-accent" aria-hidden="true" />
                  </div>
                )}

                {/* Editorial text stack */}
                <div className="relative z-10 flex flex-1 flex-col p-3.5 sm:p-6 min-h-[170px] sm:min-h-[300px]">
                  <div className="max-w-[96%] sm:max-w-[92%]">
                    <h3 className="font-serif text-xl font-medium leading-[1.1] text-ink transition-colors duration-300 group-hover:text-accent sm:text-2xl lg:text-3xl">
                      {item.name}
                    </h3>
                    <p className="font-sans text-[9px] sm:text-[11px] uppercase tracking-label text-ink-muted mt-1 sm:mt-2 line-clamp-1">
                      {item.tagline}
                    </p>
                    <span aria-hidden="true" className="mt-2 block h-px w-6 bg-accent sm:mt-3.5 sm:w-8" />
                    <p className="mt-2 hidden font-sans text-xs leading-relaxed text-ink-muted line-clamp-2 sm:mt-3 sm:block sm:line-clamp-3 sm:text-[14px]">
                      {item.lore}
                    </p>
                  </div>

                  <div className="mt-auto pt-3 sm:pt-6">
                    <p className="leading-none">
                      <span className="font-serif text-xl font-semibold text-ink sm:text-2xl">{item.count}+ </span>
                      <span className="font-sans text-[9px] sm:text-[10px] uppercase tracking-widest text-ink-muted ml-0.5 sm:ml-1">
                        Styles
                      </span>
                    </p>
                    {item.to ? (
                      <Link
                        to={item.to}
                        className="mt-2.5 inline-flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-md bg-accent px-3 py-2 font-sans text-xs font-semibold tracking-wide text-on-accent transition-all duration-300 hover:bg-accent-hover group-hover:gap-2.5 sm:mt-3.5 sm:min-h-[44px] sm:w-fit sm:px-7 sm:py-3 sm:text-sm"
                        aria-label={`Enter ${item.name}`}
                      >
                        Enter {item.name} <span aria-hidden="true">→</span>
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={item.onEnter}
                        className="mt-2.5 inline-flex min-h-[38px] w-full cursor-pointer items-center justify-center gap-1.5 rounded-md bg-accent px-3 py-2 font-sans text-xs font-semibold tracking-wide text-on-accent transition-all duration-300 hover:bg-accent-hover group-hover:gap-2.5 sm:mt-3.5 sm:min-h-[44px] sm:w-fit sm:px-7 sm:py-3 sm:text-sm"
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
