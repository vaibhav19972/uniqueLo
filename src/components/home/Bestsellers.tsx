import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useProducts, useUniverses } from '../../hooks/useCatalog';
import { useHorizontalRailGuard, RAIL_PREVENT_ATTR } from '../../hooks/useHorizontalRailGuard';
import { MarketingHeader } from '../ui/MarketingHeader';
import { isMerchandisable } from '../../lib/licensed-marks';
import { BestsellerCard } from './BestsellerCard';
import { useReveal } from '../../hooks/useReveal';

/**
 * COMMUNITY FAVOURITES
 *
 * The catalogue, surfaced as its own evidence: a rail grouped by world, with
 * the count of what is actually in each. Nothing here is a claim the data
 * doesn't make — the previous build printed "Free shipping on all orders
 * above ₹29,050" in the trust row, a threshold no table backs, next to a
 * ₹899 tee. That is the exact failure PRODUCT.md's honesty principle names,
 * so it is removed rather than reworded: the shipping promise lives where it
 * is true and checkable, in the bag's own milestone tracker.
 */
export const Bestsellers: React.FC = () => {
  const revealRef = useReveal<HTMLElement>();
  const { data: products } = useProducts();
  const { data: universes } = useUniverses();
  const [tab, setTab] = useState<string>('all');
  const rowRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Gesture custody: trackpad swipes over the rail scroll only the rail
  // (Lenis stands down via data-lenis-prevent-horizontal; diagonal intent is resolved
  // by dominant axis in the guard, with snap + smooth-scroll suspended for
  // the gesture's duration). Vertical-dominant swipes hand back untouched to Lenis.
  useHorizontalRailGuard(rowRef);

  // Four pieces carry a real Nike swoosh in their photography (see
  // lib/licensed-marks.ts). They are shoppable if someone searches for them, but
  // they do not get promoted on a curated rail — PRODUCT.md's legal constraint
  // is absolute, and a curated surface is the storefront endorsing the image.
  const visible = useMemo(
    () =>
      (products ?? [])
        .filter(isMerchandisable)
        .filter((p) => tab === 'all' || p.universeSlug === tab),
    [products, tab],
  );

  const universeName = (slug?: string) => universes?.find((u) => u.slug === slug)?.name;

  const updateEdges = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    const tolerance = 4;
    setCanPrev(el.scrollLeft > tolerance);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - tolerance);
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
  }, [updateEdges, visible.length]);

  // Reset scroll position when the universe tab changes so the new list
  // always starts aligned — otherwise a mid-list offset looks broken.
  useEffect(() => {
    rowRef.current?.scrollTo({ left: 0, behavior: 'auto' });
    // Re-evaluate arrows after the list re-renders.
    requestAnimationFrame(updateEdges);
  }, [tab, updateEdges]);

  const scrollBy = (dir: 1 | -1) => {
    const el = rowRef.current;
    if (!el) return;
    // Step by exactly one card + gap so arrows always land on a card edge
    // instead of mid-card (fixed 640px ignored responsive card widths and
    // fought with scroll-snap, causing the "janky" feel).
    const firstCard = el.querySelector<HTMLElement>(':scope > *');
    const gap = 16;
    const step = firstCard ? firstCard.offsetWidth + gap : Math.round(el.clientWidth * 0.8);
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const shown = (products ?? []).filter(isMerchandisable);
  const tabs = [{ slug: 'all', name: 'All', count: shown.length }]
    .concat(
      (universes ?? []).map((u) => ({
        slug: u.slug,
        name: u.name,
        count: shown.filter((p) => p.universeSlug === u.slug).length,
      })),
    )
    // Never offer a door that opens onto nothing.
    .filter((t) => t.count > 0);

  return (
    <section
      ref={revealRef}
      className="reveal overflow-x-clip border-b border-stone bg-cream py-12 lg:py-16"
      aria-labelledby="best-heading"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          title="The Catalogue"
          titleId="best-heading"
          sub={`One rail per world: ${shown.length} of ${(products ?? []).length} pieces. The other ${(products ?? []).length - shown.length} carry a third-party mark in their photography, so they are not promoted here — the shop and the world pages carry all ${(products ?? []).length}.`}
          linkTo="/shop"
          linkLabel="Open the shop"
        />

        {/* Universe tabs + arrows — square segment controls, one row. */}
        <div className="mt-5 flex items-center justify-between gap-4">
          <div role="tablist" aria-label="Filter by universe" className="flex flex-wrap items-center gap-0">
            {tabs.map((t) => (
              <button
                key={t.slug}
                role="tab"
                aria-selected={tab === t.slug}
                onClick={() => setTab(t.slug)}
                className={`min-h-[44px] border border-r-0 border-stone px-3.5 font-sans text-[11px] uppercase tracking-[0.12em] transition-colors last:border-r ${
                  tab === t.slug
                    ? 'bg-ink text-cream'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                {t.name}
                <span className="ml-1.5 opacity-60">{t.count}</span>
              </button>
            ))}
          </div>
          <div className="hidden shrink-0 items-center gap-2 sm:flex">
            <button
              onClick={() => scrollBy(-1)}
              disabled={!canPrev}
              aria-label="Scroll back"
              className="grid h-11 w-11 place-items-center border border-stone text-ink transition-colors hover:border-ink disabled:pointer-events-none disabled:opacity-30"
            >
              <span aria-hidden="true">←</span>
            </button>
            <button
              onClick={() => scrollBy(1)}
              disabled={!canNext}
              aria-label="Scroll forward"
              className="grid h-11 w-11 place-items-center border border-stone text-ink transition-colors hover:border-ink disabled:pointer-events-none disabled:opacity-30"
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rail is full-bleed with its own container-matching padding so the
          first/last card's hover state is not sliced at the scroller edge.
          No scroll-snap: snapping fought the padded scrollport and parked the
          first card 48px left of the container, clipped at the section edge. */}
      <div className="mt-5 overflow-x-clip">
        <div
          ref={rowRef}
          {...RAIL_PREVENT_ATTR}
          className="mx-auto flex w-full max-w-[var(--container-max)] gap-4 overflow-x-auto overscroll-x-contain px-4 pb-2 sm:px-6 lg:px-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {visible.map((p) => (
            <BestsellerCard key={p.slug} product={p} universeName={universeName(p.universeSlug)} />
          ))}
        </div>
      </div>
    </section>
  );
};
