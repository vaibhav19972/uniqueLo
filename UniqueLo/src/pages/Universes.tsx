import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { useUniverses, useProducts } from '../hooks/useCatalog';
import { useFiltersStore } from '../stores/filters';

/**
 * Universes index — /universes.
 * Unified Atelier design system matching "Worlds to Wear".
 * Shows each universe and The Atelier portal in quiet-luxury aesthetic.
 */
export const Universes: React.FC = () => {
  const { data: universes } = useUniverses();
  const { data: products } = useProducts();
  const setUniverse = useFiltersStore((state) => state.setUniverse);
  const navigate = useNavigate();

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

  return (
    <div className="w-full bg-cream min-h-screen">
      <section className="bg-paper border-b border-stone/50">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-12 lg:py-14">
          <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">›</span>
            <span>Universes</span>
          </nav>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink mt-3 tracking-tight font-medium">
            Worlds to Wear
          </h1>
          <p className="text-sm sm:text-base text-ink-muted mt-3 max-w-2xl font-light">
            Stories, characters and legacies — embroidered for your everyday. Pick a world, then a character.
          </p>
        </div>
      </section>

      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-10">
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:gap-6 lg:grid-cols-4">
          {(universes ?? []).map((u) => {
            const count = counts[u.slug] ?? 0;
            return (
              <article
                key={u.slug}
                className="group relative flex flex-col overflow-hidden rounded-[16px] sm:rounded-[20px] border border-stone/60 bg-paper transition-all motion-reduce:transform-none hover:-translate-y-1 duration-500 shadow-sm hover:shadow-md"
              >
                {/* Artwork media preview */}
                {u.emblem_src && (
                  <div className="relative h-28 sm:h-48 w-full overflow-hidden border-b border-stone/40 bg-stone/20">
                    <img
                      src={u.emblem_src}
                      alt={`${u.name} universe artwork`}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-paper/30 to-transparent" />
                  </div>
                )}

                {/* Editorial text stack */}
                <div className="relative z-10 flex flex-1 flex-col p-3 sm:p-6 min-h-[190px] sm:min-h-[280px]">
                  <div className="max-w-[92%]">
                    <h2 className="font-serif text-base sm:text-2xl lg:text-3xl leading-[1.1] text-ink transition-transform duration-500 group-hover:italic font-medium truncate">
                      {u.name}
                    </h2>
                    <p className="font-sans text-[9px] sm:text-[11px] uppercase tracking-label text-ink-muted mt-1 sm:mt-2 truncate">
                      {u.tagline}
                    </p>
                    <span aria-hidden="true" className="mt-2 sm:mt-3.5 block h-px w-6 sm:w-8 bg-ink/25" />
                    <p className="font-serif text-xs sm:text-[14px] text-ink/85 mt-2 sm:mt-3 leading-relaxed line-clamp-2 sm:line-clamp-3">
                      {u.lore}
                    </p>
                  </div>

                  <div className="mt-auto pt-3 sm:pt-6">
                    <p className="leading-none">
                      <span className="font-serif font-semibold text-lg sm:text-2xl text-ink">{count}+ </span>
                      <span className="font-sans text-[9px] sm:text-[10px] uppercase tracking-widest text-ink-muted ml-0.5 sm:ml-1">
                        Styles
                      </span>
                    </p>
                    <Link
                      to={`/universes/${u.slug}`}
                      className="mt-2 sm:mt-3.5 inline-flex w-full sm:w-fit items-center justify-center gap-1.5 sm:gap-2 rounded-md px-3 sm:px-7 py-2 sm:py-3 font-serif text-xs sm:text-[15px] sm:text-[16px] bg-ink text-cream hover:bg-ink/90 min-h-[36px] sm:min-h-[44px] transition-all group-hover:gap-3 cursor-pointer"
                      aria-label={`Enter ${u.name}`}
                    >
                      Enter {u.name} <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}

          {/* 4th Card — The Atelier portal */}
          <article
            className="group relative flex flex-col overflow-hidden rounded-[16px] sm:rounded-[20px] border border-stone/60 bg-paper transition-all motion-reduce:transform-none hover:-translate-y-1 duration-500 shadow-sm hover:shadow-md"
          >
            <div className="relative h-28 sm:h-48 w-full overflow-hidden border-b border-stone/40 bg-stone/20">
              <img
                src="/images/campaigns/atelier-craft.jpg"
                alt="The Atelier artwork"
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-paper/30 to-transparent" />
            </div>
            <div className="relative z-10 flex flex-1 flex-col p-3 sm:p-6 min-h-[190px] sm:min-h-[280px]">
              <div className="max-w-[92%]">
                <h2 className="font-serif text-base sm:text-2xl lg:text-3xl leading-[1.1] text-ink transition-transform duration-500 group-hover:italic font-medium truncate">
                  The Atelier
                </h2>
                <p className="font-sans text-[9px] sm:text-[11px] uppercase tracking-label text-ink-muted mt-1 sm:mt-2 truncate">
                  Pure craftsmanship, no theme
                </p>
                <span aria-hidden="true" className="mt-2 sm:mt-3.5 block h-px w-6 sm:w-8 bg-ink/25" />
                <p className="font-serif text-xs sm:text-[14px] text-ink/85 mt-2 sm:mt-3 leading-relaxed line-clamp-2 sm:line-clamp-3">
                  The base line of the house: artisanal embroidery for its own sake — technique, textile, and construction above every story.
                </p>
              </div>

              <div className="mt-auto pt-3 sm:pt-6">
                <p className="leading-none">
                  <span className="font-serif font-semibold text-lg sm:text-2xl text-ink">{atelierCount}+ </span>
                  <span className="font-sans text-[9px] sm:text-[10px] uppercase tracking-widest text-ink-muted ml-0.5 sm:ml-1">
                    Styles
                  </span>
                </p>
                <button
                  type="button"
                  onClick={enterAtelier}
                  className="mt-2 sm:mt-3.5 inline-flex w-full sm:w-fit items-center justify-center gap-1.5 sm:gap-2 rounded-md px-3 sm:px-7 py-2 sm:py-3 font-serif text-xs sm:text-[15px] sm:text-[16px] bg-ink text-cream hover:bg-ink/90 min-h-[36px] sm:min-h-[44px] transition-all group-hover:gap-3 cursor-pointer"
                  aria-label="Enter The Atelier"
                >
                  Enter The Atelier <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};
