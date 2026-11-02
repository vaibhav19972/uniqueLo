import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useProducts, useGarments } from '../../hooks/useCatalog';
import { EDITS, formatPrice, getDefaultVariant, type EditSlug } from '../../lib/data';
import { isMerchandisable } from '../../lib/licensed-marks';
import { useFiltersStore } from '../../stores/filters';
import { useReveal } from '../../hooks/useReveal';
import { useHorizontalRailGuard, RAIL_PREVENT_ATTR } from '../../hooks/useHorizontalRailGuard';

interface GarmentCardData {
  slug: string;
  name: string;
  description: string;
  image: string;
  count: number;
  from: number | null;
}

interface EditCardData {
  slug: string;
  title: string;
  tagline: string;
  image: string;
  count: number;
  from: number | null;
}

interface MenuRailProps {
  menuNumber: string;
  title: string;
  subtitle: string;
  countLabel: string;
  itemCount: number;
  swipeLabel: string;
  children: React.ReactNode;
}

const MenuRail: React.FC<MenuRailProps> = ({
  menuNumber,
  title,
  subtitle,
  countLabel,
  itemCount,
  swipeLabel,
  children,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useHorizontalRailGuard(rowRef);

  const updateEdges = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    const tolerance = 4;
    setCanPrev(el.scrollLeft > tolerance);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - tolerance);
    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(Math.min(1, Math.max(0, el.scrollLeft / maxScroll)));
    } else {
      setScrollProgress(0);
    }
  }, []);

  useEffect(() => {
    updateEdges();
    const el = rowRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateEdges, { passive: true });
    window.addEventListener('resize', updateEdges);
    return () => {
      el.removeEventListener('scroll', updateEdges);
      window.removeEventListener('resize', updateEdges);
    };
  }, [updateEdges, itemCount]);

  const scrollBy = (dir: 1 | -1) => {
    const el = rowRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>(':scope > *');
    const gap = 16;
    const step = firstCard ? firstCard.offsetWidth + gap : Math.round(el.clientWidth * 0.8);
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const progressPercent = Math.max(15, Math.min(100, (1 / (itemCount || 1)) * 100));

  return (
    <div className="w-full">
      {/* ── Menu Header Bar ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-stone pb-3.5">
          <div className="max-w-[60ch]">
            <div className="flex items-center gap-2.5">
              <span className="loom-label text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                {menuNumber}
              </span>
              <span className="text-stone">/</span>
              <span className="loom-price text-[11px] text-ink-muted">
                {countLabel}
              </span>
            </div>
            <h3 className="loom-display mt-1 text-2xl text-ink sm:text-[1.75rem]">
              {title}
            </h3>
            <p className="mt-1 font-sans text-[13px] leading-relaxed text-ink-muted sm:text-[14px]">
              {subtitle}
            </p>
          </div>

          {/* Navigation Controls: Touch & Desktop Compatible */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              disabled={!canPrev}
              aria-label={`Scroll ${title} back`}
              className="grid h-10 w-10 place-items-center border border-stone bg-paper text-ink transition-colors hover:border-ink hover:bg-cream disabled:pointer-events-none disabled:opacity-30 sm:h-11 sm:w-11"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              disabled={!canNext}
              aria-label={`Scroll ${title} forward`}
              className="grid h-10 w-10 place-items-center border border-stone bg-paper text-ink transition-colors hover:border-ink hover:bg-cream disabled:pointer-events-none disabled:opacity-30 sm:h-11 sm:w-11"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Swipable Horizontal Rail ─────────────────────────────────── */}
      <div className="mt-5 overflow-x-clip">
        <div
          ref={rowRef}
          {...RAIL_PREVENT_ATTR}
          className="mx-auto flex w-full max-w-[var(--container-max)] gap-4 overflow-x-auto overscroll-x-contain px-4 pb-3 pt-1 sm:gap-5 sm:px-6 lg:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {children}
        </div>
      </div>

      {/* ── Progress Bar & Mobile Interaction Cue ────────────────────── */}
      <div className="mx-auto mt-3 max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
        <div className="flex items-center justify-between gap-4">
          <div className="relative h-[2px] flex-1 overflow-hidden bg-stone/40">
            <div
              className="h-full bg-ink/70 transition-[margin-left] duration-150 ease-out"
              style={{
                width: `${progressPercent}%`,
                marginLeft: `${scrollProgress * (100 - progressPercent)}%`,
              }}
            />
          </div>
          <span className="loom-label shrink-0 text-[10px] uppercase tracking-wider text-ink-muted/80">
            {swipeLabel}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * THE MENU (Browse Index) — the comprehensive catalog spread before the ask.
 *
 * Immersive, full-bleed horizontal rails for silhouettes (Menu 01) and curated edits (Menu 02).
 * Each card features high-resolution photography with balanced cinematic scrims,
 * verified live counts, starting prices, and smooth touch-swipe / arrow navigation.
 */
export const BrowseIndex: React.FC = () => {
  const revealRef = useReveal<HTMLElement>();
  const { data: products } = useProducts();
  const { data: garments } = useGarments();
  const setEdit = useFiltersStore((s) => s.setEdit);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'all' | 'garments' | 'edits'>('all');

  const garmentRows: GarmentCardData[] = useMemo(() => {
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
      .map(([slug, count]) => {
        const reg = registry.get(slug);
        return {
          slug,
          name: reg?.name ?? slug.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
          description: reg?.description ?? 'Artisanal silhouette cut and tailored for everyday wear.',
          image: reg?.image ?? `/images/garments/${slug}.jpg`,
          count,
          from: froms.get(slug) ?? null,
        };
      });
  }, [products, garments]);

  const editRows: EditCardData[] = useMemo(() => {
    const counts = new Map<string, number>();
    const froms = new Map<string, number>();
    for (const p of products ?? []) {
      const price = getDefaultVariant(p)?.priceCents ?? 0;
      for (const e of p.edits ?? []) {
        counts.set(e, (counts.get(e) ?? 0) + 1);
        if (price > 0) {
          const prev = froms.get(e);
          if (prev == null || price < prev) froms.set(e, price);
        }
      }
    }
    return EDITS.map((e) => ({
      ...e,
      image: `/images/edits/${e.slug}.jpg`,
      count: counts.get(e.slug) ?? 0,
      from: froms.get(e.slug) ?? null,
    }))
      .filter((e) => e.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const openEdit = (slug: EditSlug) => {
    setEdit(slug);
    navigate(`/shop?edit=${slug}`);
  };

  if (garmentRows.length === 0 && editRows.length === 0) return null;

  return (
    <section
      ref={revealRef}
      className="reveal border-b border-stone bg-cream py-12 lg:py-16"
      aria-labelledby="browse-heading"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
        {/* ── Section Header ────────────────────────────────────────── */}
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
            <p className="mt-2 max-w-[56ch] font-sans text-[14px] leading-relaxed text-ink-muted sm:text-[15px]">
              Everything we make, laid out plain. Pick your cut by silhouette, or explore curated capsules crafted for every mood.
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

        {/* ── Filter / View Switcher (Segmented Controls) ────────────── */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-stone pb-5">
          <div role="tablist" aria-label="Menu category selector" className="flex items-center">
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'all'}
              onClick={() => setViewMode('all')}
              className={`min-h-[40px] border border-r-0 border-stone px-4 font-sans text-[11px] uppercase tracking-[0.12em] transition-colors ${
                viewMode === 'all'
                  ? 'bg-ink text-cream'
                  : 'text-ink-muted hover:bg-paper hover:text-ink'
              }`}
            >
              All Menus
              <span className="ml-1.5 opacity-60">({garmentRows.length + editRows.length})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'garments'}
              onClick={() => setViewMode('garments')}
              className={`min-h-[40px] border border-r-0 border-stone px-4 font-sans text-[11px] uppercase tracking-[0.12em] transition-colors ${
                viewMode === 'garments'
                  ? 'bg-ink text-cream'
                  : 'text-ink-muted hover:bg-paper hover:text-ink'
              }`}
            >
              01 · Silhouettes
              <span className="ml-1.5 opacity-60">({garmentRows.length})</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={viewMode === 'edits'}
              onClick={() => setViewMode('edits')}
              className={`min-h-[40px] border border-stone px-4 font-sans text-[11px] uppercase tracking-[0.12em] transition-colors ${
                viewMode === 'edits'
                  ? 'bg-ink text-cream'
                  : 'text-ink-muted hover:bg-paper hover:text-ink'
              }`}
            >
              02 · Curated Edits
              <span className="ml-1.5 opacity-60">({editRows.length})</span>
            </button>
          </div>

          <span className="hidden font-sans text-[12px] text-ink-muted md:inline-block">
            Swipe or use arrows to discover pieces
          </span>
        </div>
      </div>

      {/* ── Menus Container ─────────────────────────────────────────── */}
      <div className="mt-8 space-y-12 sm:space-y-16">
        {/* ── Menu 01: By Garment (Silhouettes) ───────────────────────── */}
        {(viewMode === 'all' || viewMode === 'garments') && garmentRows.length > 0 && (
          <MenuRail
            menuNumber="Menu 01"
            title="By Garment"
            subtitle="Start from the shape you wear: each silhouette cut from raw cloth and worked with embroidery."
            countLabel={`${garmentRows.length} silhouettes`}
            itemCount={garmentRows.length}
            swipeLabel="Swipe silhouettes ⟷"
          >
            {garmentRows.map((g, i) => (
              <Link
                key={g.slug}
                to={`/shop?garment=${g.slug}`}
                className="group relative flex aspect-[3/4] w-[260px] xs:w-[280px] sm:w-[300px] lg:w-[320px] shrink-0 flex-col justify-between overflow-hidden border border-stone bg-paper text-left transition-all duration-500 hover:-translate-y-1 hover:border-ink hover:shadow-xl focus-visible:outline-2 focus-visible:outline-accent"
              >
                {/* Photographic Canvas */}
                <img
                  src={g.image}
                  alt={g.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-base)] group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />

                {/* Scrim Layers: Crisp Contrast + Visible Photo Center */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/80 via-ink/25 to-transparent"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-ink/95 via-ink/60 via-50% to-transparent transition-opacity duration-300 group-hover:from-ink/90 group-hover:via-ink/50"
                />

                {/* Top Bar: Plate Badge & Piece Count */}
                <div className="relative z-10 flex items-center justify-between p-4 sm:p-5">
                  <span className="inline-flex items-center gap-1.5 border border-cream/20 bg-ink/75 px-2.5 py-1 backdrop-blur-md">
                    <span className="loom-price text-[11px] font-medium text-cream">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-cream/40 font-mono">/</span>
                    <span className="loom-price text-[10px] text-cream/60">
                      {String(garmentRows.length).padStart(2, '0')}
                    </span>
                  </span>
                  <span className="loom-label border border-cream/20 bg-ink/65 px-2.5 py-1 text-[10.5px] uppercase tracking-wider text-cream/90 backdrop-blur-md">
                    {g.count} {g.count === 1 ? 'piece' : 'pieces'}
                  </span>
                </div>

                {/* Bottom Bar: Title, Description, Price & Explore */}
                <div className="relative z-10 flex flex-col justify-end p-4 sm:p-5">
                  <h4 className="loom-display text-2xl text-cream capitalize leading-tight transition-colors duration-300 group-hover:text-accent sm:text-[1.65rem]">
                    {g.name}
                  </h4>
                  {g.description && (
                    <p className="mt-1.5 line-clamp-2 font-sans text-[12.5px] leading-relaxed text-cream/80 sm:text-[13px]">
                      {g.description}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-cream/20 pt-3">
                    {g.from != null ? (
                      <span className="loom-price text-[12px] font-medium text-cream/90">
                        from {formatPrice(g.from)}
                      </span>
                    ) : (
                      <span className="loom-label text-[10.5px] uppercase tracking-wider text-cream/70">
                        Explore cut
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 font-sans text-[12px] font-medium text-cream transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent">
                      <span>View</span>
                      <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </MenuRail>
        )}

        {/* ── Menu 02: By What You Need It For (Edits) ─────────────────── */}
        {(viewMode === 'all' || viewMode === 'edits') && editRows.length > 0 && (
          <MenuRail
            menuNumber="Menu 02"
            title="By What You Need It For"
            subtitle="Curated collections across every universe — from quiet daily wear to procession-scale showpieces."
            countLabel={`${editRows.length} curated edits`}
            itemCount={editRows.length}
            swipeLabel="Swipe edits ⟷"
          >
            {editRows.map((e, i) => (
              <Link
                key={e.slug}
                to={`/shop?edit=${e.slug}`}
                onClick={(ev) => {
                  ev.preventDefault();
                  openEdit(e.slug as EditSlug);
                }}
                className="group relative flex aspect-[3/4] w-[260px] xs:w-[280px] sm:w-[300px] lg:w-[320px] shrink-0 flex-col justify-between overflow-hidden border border-stone bg-paper text-left transition-all duration-500 hover:-translate-y-1 hover:border-ink hover:shadow-xl focus-visible:outline-2 focus-visible:outline-accent"
              >
                {/* Photographic Canvas */}
                <img
                  src={e.image}
                  alt={e.title}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-base)] group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />

                {/* Scrim Layers: Crisp Contrast + Visible Photo Center */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/80 via-ink/25 to-transparent"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-ink/95 via-ink/60 via-50% to-transparent transition-opacity duration-300 group-hover:from-ink/90 group-hover:via-ink/50"
                />

                {/* Top Bar: Plate Badge & Capsule Tag */}
                <div className="relative z-10 flex items-center justify-between p-4 sm:p-5">
                  <span className="inline-flex items-center gap-1.5 border border-cream/20 bg-ink/75 px-2.5 py-1 backdrop-blur-md">
                    <span className="loom-price text-[11px] font-medium text-cream">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] text-cream/40 font-mono">/</span>
                    <span className="loom-price text-[10px] text-cream/60">
                      {String(editRows.length).padStart(2, '0')}
                    </span>
                  </span>
                  <span className="loom-label border border-cream/20 bg-ink/65 px-2.5 py-1 text-[10.5px] uppercase tracking-wider text-cream/90 backdrop-blur-md">
                    {e.count} {e.count === 1 ? 'piece' : 'pieces'}
                  </span>
                </div>

                {/* Bottom Bar: Title, Tagline & Explore */}
                <div className="relative z-10 flex flex-col justify-end p-4 sm:p-5">
                  <span className="loom-label text-[10px] uppercase tracking-widest text-cream/70">
                    Curated Edit
                  </span>
                  <h4 className="loom-display mt-0.5 text-2xl text-cream leading-tight transition-colors duration-300 group-hover:text-accent sm:text-[1.65rem]">
                    {e.title}
                  </h4>
                  {e.tagline && (
                    <p className="mt-1.5 line-clamp-2 font-sans text-[12.5px] leading-relaxed text-cream/80 sm:text-[13px]">
                      {e.tagline}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-cream/20 pt-3">
                    {e.from != null ? (
                      <span className="loom-price text-[12px] font-medium text-cream/90">
                        from {formatPrice(e.from)}
                      </span>
                    ) : (
                      <span className="loom-label text-[10.5px] uppercase tracking-wider text-cream/70">
                        Explore capsule
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 font-sans text-[12px] font-medium text-cream transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent">
                      <span>Explore</span>
                      <span aria-hidden="true">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </MenuRail>
        )}
      </div>
    </section>
  );
};
