import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { useProducts, useGarments } from '../../hooks/useCatalog';
import { EDITS, formatPrice, getDefaultVariant, type EditSlug } from '../../lib/data';
import { isMerchandisable } from '../../lib/licensed-marks';
import { useFiltersStore } from '../../stores/filters';
import { useReveal } from '../../hooks/useReveal';

/**
 * THE MENU (Browse Index) — the final catalog listing before the ask.
 *
 * Tiled menu boards for silhouettes (cuts) and curated edits.
 * Each tile features the category's garment/edit photography with a rich
 * transparent overlay, live counts, and starting prices.
 */
export const BrowseIndex: React.FC = () => {
  const revealRef = useReveal<HTMLElement>();
  const { data: products } = useProducts();
  const { data: garments } = useGarments();
  const setEdit = useFiltersStore((s) => s.setEdit);
  const navigate = useNavigate();

  const garmentRows = useMemo(() => {
    const list = (products ?? []).filter(isMerchandisable);
    const counts = new Map<string, number>();
    const froms = new Map<string, number>();
    for (const p of list) {
      if (!p.garmentType) continue;
      counts.set(p.garmentType, (counts.get(p.garmentType) ?? 0) + 1);
      const price = getDefaultVariant(p)?.priceCents ?? 0;
      if (price > 0) {
        const prev = froms.get(p.garmentType);
        if (prev == null || price < prev) froms.set(p.garmentType, price);
      }
    }

    const registry = new Map((garments ?? []).map((g) => [g.slug, g]));

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([slug, count]) => {
        const reg = registry.get(slug);
        return {
          slug,
          name: reg?.name ?? slug.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
          image: reg?.image ?? `/images/garments/${slug}.jpg`,
          count,
          from: froms.get(slug) ?? null,
        };
      });
  }, [products, garments]);

  const editRows = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products ?? []) {
      for (const e of p.edits ?? []) counts.set(e, (counts.get(e) ?? 0) + 1);
    }
    return EDITS.map((e) => ({
      ...e,
      image: `/images/edits/${e.slug}.jpg`,
      count: counts.get(e.slug) ?? 0,
    }))
      .filter((e) => e.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [products]);

  const openEdit = (slug: EditSlug) => {
    setEdit(slug);
    navigate('/shop');
  };

  if (garmentRows.length === 0 && editRows.length === 0) return null;

  return (
    <section
      ref={revealRef}
      className="reveal border-b border-stone bg-cream py-12 lg:py-16"
      aria-labelledby="browse-heading"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
        {/* ── Section Header: playful "Here's the menu" ─────────────── */}
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <p className="loom-label text-ink-muted">The Atelier Spread · Ready to Order</p>
            <h2
              id="browse-heading"
              className="loom-display mt-2 text-ink"
              style={{ fontSize: 'var(--text-display-lg)' }}
            >
              Here’s the menu.
            </h2>
            <p className="mt-2 max-w-[54ch] font-sans text-[14px] leading-relaxed text-ink-muted sm:text-[15px]">
              Everything we make, laid out plain. Pick your cut on the left, or order by mood on the right.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 font-sans text-[12px] font-medium text-ink underline underline-offset-4 transition-colors hover:text-accent"
          >
            The full catalogue
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* ── Tiled Menus ────────────────────────────────────────────── */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
          {/* ── Menu 01: By Garment ───────────────────────────────────── */}
          {garmentRows.length > 0 && (
            <div className="border border-stone bg-panel/30 p-5 sm:p-6 lg:p-7">
              <div className="flex items-center justify-between border-b border-stone pb-3.5">
                <div className="flex items-baseline gap-2.5">
                  <span className="loom-label text-ink-muted">Menu 01</span>
                  <h3 className="loom-display text-xl text-ink">By Garment</h3>
                </div>
                <span className="loom-price text-[11px] text-ink-muted">
                  {garmentRows.length} silhouettes
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {garmentRows.map((g, i) => (
                  <Link
                    key={g.slug}
                    to={`/shop?garment=${g.slug}`}
                    className="group relative flex min-h-[148px] flex-col justify-between overflow-hidden border border-stone bg-ink/10 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-ink hover:shadow-md focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    {/* Photographic Background */}
                    <img
                      src={g.image}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-base)] group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
                      }}
                    />

                    {/* Transparent Overlay */}
                    <div className="absolute inset-0 bg-ink/65 backdrop-blur-[1px] transition-colors duration-300 group-hover:bg-ink/50" />

                    {/* Content Layer */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="loom-price text-[11px] font-medium text-cream/70 group-hover:text-cream">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="loom-price text-[11px] text-cream/80">
                        {g.count} {g.count === 1 ? 'piece' : 'pieces'}
                      </span>
                    </div>

                    <div className="relative z-10 my-3">
                      <span className="font-sans text-[16px] font-semibold capitalize text-cream transition-colors group-hover:text-accent">
                        {g.name}
                      </span>
                    </div>

                    <div className="relative z-10 flex items-center justify-between border-t border-cream/20 pt-2.5">
                      {g.from != null ? (
                        <span className="loom-price text-[11px] text-cream/80">
                          from {formatPrice(g.from)}
                        </span>
                      ) : (
                        <span />
                      )}
                      <span
                        className="font-sans text-[13px] text-cream/80 transition-transform group-hover:translate-x-1 group-hover:text-accent"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Menu 02: By What You Need It For ─────────────────────── */}
          {editRows.length > 0 && (
            <div className="border border-stone bg-panel/30 p-5 sm:p-6 lg:p-7">
              <div className="flex items-center justify-between border-b border-stone pb-3.5">
                <div className="flex items-baseline gap-2.5">
                  <span className="loom-label text-ink-muted">Menu 02</span>
                  <h3 className="loom-display text-xl text-ink">By What You Need It For</h3>
                </div>
                <span className="loom-price text-[11px] text-ink-muted">
                  {editRows.length} edits
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {editRows.map((e, i) => (
                  <Link
                    key={e.slug}
                    to="/shop"
                    onClick={(ev) => {
                      ev.preventDefault();
                      openEdit(e.slug as EditSlug);
                    }}
                    className="group relative flex min-h-[148px] flex-col justify-between overflow-hidden border border-stone bg-ink/10 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-ink hover:shadow-md focus-visible:outline-2 focus-visible:outline-accent"
                  >
                    {/* Photographic Background */}
                    <img
                      src={e.image}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-base)] group-hover:scale-105"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
                      }}
                    />

                    {/* Transparent Overlay */}
                    <div className="absolute inset-0 bg-ink/65 backdrop-blur-[1px] transition-colors duration-300 group-hover:bg-ink/50" />

                    {/* Content Layer */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="loom-price text-[11px] font-medium text-cream/70 group-hover:text-cream">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="loom-price text-[11px] text-cream/80">
                        {e.count} {e.count === 1 ? 'piece' : 'pieces'}
                      </span>
                    </div>

                    <div className="relative z-10 my-3">
                      <span className="block font-sans text-[16px] font-semibold text-cream transition-colors group-hover:text-accent">
                        {e.title}
                      </span>
                      <span className="mt-1 block font-sans text-[12px] leading-snug text-cream/80 line-clamp-2">
                        {e.tagline}
                      </span>
                    </div>

                    <div className="relative z-10 flex items-center justify-between border-t border-cream/20 pt-2.5">
                      <span className="loom-label text-[10px] uppercase text-cream/70">
                        Curated edit
                      </span>
                      <span
                        className="font-sans text-[13px] text-cream/80 transition-transform group-hover:translate-x-1 group-hover:text-accent"
                        aria-hidden="true"
                      >
                        →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
