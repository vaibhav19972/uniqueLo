import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useProducts, useGarments } from '../../hooks/useCatalog';
import { formatPrice, getDefaultVariant } from '../../lib/data';
import { isMerchandisable } from '../../lib/licensed-marks';
import { useReveal } from '../../hooks/useReveal';
import { useHorizontalRailGuard, RAIL_PREVENT_ATTR } from '../../hooks/useHorizontalRailGuard';

interface GarmentDoor {
  slug: string;
  name: string;
  description: string;
  image: string;
  count: number;
  from: number | null;
}

/**
 * SHOP BY GARMENT (Silhouettes Gateway)
 *
 * Positioned right after New Arrivals to provide a direct silhouette-first discovery axis.
 * Immersive horizontal swipe rail featuring high-resolution photography,
 * real piece counts, starting prices, and smooth touch/arrow controls.
 */
export const ShopByGarment: React.FC = () => {
  const revealRef = useReveal<HTMLElement>();
  const rowRef = useRef<HTMLDivElement>(null);
  const { data: allProducts } = useProducts();
  const { data: garments } = useGarments();

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useHorizontalRailGuard(rowRef);

  const doors: GarmentDoor[] = useMemo(() => {
    const list = (allProducts ?? []).filter(isMerchandisable);
    if (list.length === 0) return [];

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
  }, [allProducts, garments]);

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
  }, [updateEdges, doors.length]);

  const scrollBy = (dir: 1 | -1) => {
    const el = rowRef.current;
    if (!el) return;
    const firstCard = el.querySelector<HTMLElement>(':scope > *');
    const gap = 16;
    const step = firstCard ? firstCard.offsetWidth + gap : Math.round(el.clientWidth * 0.8);
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  if (doors.length === 0) return null;

  const progressPercent = Math.max(15, Math.min(100, (1 / (doors.length || 1)) * 100));

  return (
    <section
      ref={revealRef}
      className="reveal border-b border-stone bg-cream py-12 lg:py-16"
      aria-labelledby="garments-gateway-heading"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
        {/* ── Section Header ────────────────────────────────────────── */}
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 border-b border-stone pb-5">
          <div className="max-w-[62ch]">
            <div className="flex items-center gap-2.5">
              <span className="loom-label text-[11px] font-medium uppercase tracking-wider text-ink-muted">
                Silhouettes
              </span>
              <span className="text-stone">/</span>
              <span className="loom-price text-[11px] text-ink-muted">
                {doors.length} shapes available
              </span>
            </div>
            <h2
              id="garments-gateway-heading"
              className="loom-display mt-1 text-ink"
              style={{ fontSize: 'var(--text-display-lg)' }}
            >
              Shop by Garment
            </h2>
            <p className="mt-2 font-sans text-[14px] leading-relaxed text-ink-muted sm:text-[15px]">
              Start from the shape you wear: each silhouette cut from raw cloth and worked with distinct atelier embroidery.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/clothing"
              className="inline-flex items-center gap-1.5 font-sans text-[12px] font-medium text-ink underline underline-offset-4 transition-colors hover:text-accent"
            >
              All silhouettes
              <span aria-hidden="true">→</span>
            </Link>

            {/* Desktop & Tablet Arrow Navigation */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                disabled={!canPrev}
                aria-label="Scroll silhouettes back"
                className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center border border-stone bg-paper text-ink transition-colors hover:border-ink hover:bg-cream disabled:pointer-events-none disabled:opacity-30"
              >
                <span aria-hidden="true">←</span>
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                disabled={!canNext}
                aria-label="Scroll silhouettes forward"
                className="grid h-10 w-10 sm:h-11 sm:w-11 place-items-center border border-stone bg-paper text-ink transition-colors hover:border-ink hover:bg-cream disabled:pointer-events-none disabled:opacity-30"
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Swipable Horizontal Rail ─────────────────────────────────── */}
      <div className="mt-6 overflow-x-clip">
        <div
          ref={rowRef}
          {...RAIL_PREVENT_ATTR}
          className="mx-auto flex w-full max-w-[var(--container-max)] gap-4 overflow-x-auto overscroll-x-contain px-4 pb-3 pt-1 sm:gap-5 sm:px-6 lg:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {doors.map((door, i) => (
            <Link
              key={door.slug}
              to={`/clothing/${door.slug}`}
              className="group relative flex aspect-[3/4] w-[260px] xs:w-[280px] sm:w-[300px] lg:w-[320px] shrink-0 flex-col justify-between overflow-hidden border border-stone bg-paper text-left transition-all duration-500 hover:-translate-y-1 hover:border-ink hover:shadow-xl focus-visible:outline-2 focus-visible:outline-accent"
            >
              {/* Photographic Canvas */}
              <img
                src={door.image}
                alt={door.name}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[var(--ease-base)] group-hover:scale-105"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />

              {/* Scrim Layers: Preserves Vivid Photography in Center */}
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
                    {String(doors.length).padStart(2, '0')}
                  </span>
                </span>
                <span className="loom-label border border-cream/20 bg-ink/65 px-2.5 py-1 text-[10.5px] uppercase tracking-wider text-cream/90 backdrop-blur-md">
                  {door.count} {door.count === 1 ? 'piece' : 'pieces'}
                </span>
              </div>

              {/* Bottom Bar: Title, Description, Price & Explore */}
              <div className="relative z-10 flex flex-col justify-end p-4 sm:p-5">
                <h3 className="loom-display text-2xl text-cream capitalize leading-tight transition-colors duration-300 group-hover:text-accent sm:text-[1.65rem]">
                  {door.name}
                </h3>
                {door.description && (
                  <p className="mt-1.5 line-clamp-2 font-sans text-[12.5px] leading-relaxed text-cream/80 sm:text-[13px]">
                    {door.description}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-cream/20 pt-3">
                  {door.from != null ? (
                    <span className="loom-price text-[12px] font-medium text-cream/90">
                      from {formatPrice(door.from)}
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
        </div>
      </div>

      {/* ── Progress Bar & Mobile Touch Cue ──────────────────────────── */}
      <div className="mx-auto mt-4 max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
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
            Swipe silhouettes ⟷
          </span>
        </div>
      </div>
    </section>
  );
};
