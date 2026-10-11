import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useProducts, useUniverses } from '../../hooks/useCatalog';
import { useHorizontalRailGuard, RAIL_PREVENT_ATTR } from '../../hooks/useHorizontalRailGuard';
import { MarketingHeader } from '../ui/MarketingHeader';
import { BestsellerCard } from './BestsellerCard';

/**
 * Render target 05: Community Favourites.
 * Tabs + counts from live catalog; ribbon marks `featured` pieces.
 */
const TRUST = [
  { title: 'Free shipping', detail: 'on all orders above ₹29,050' },
  { title: '14-day home inspection', detail: 'Try it at home. Easy returns.' },
  { title: 'Secure payments', detail: 'UPI, Cards, Net Banking & more.' },
];

export const Bestsellers: React.FC = () => {
  const { data: products } = useProducts();
  const { data: universes } = useUniverses();
  const [tab, setTab] = useState<string>('all');
  const rowRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  // Gesture custody: trackpad swipes over the rail scroll only the rail
  // (Lenis stands down via data-lenis-prevent; diagonal intent is resolved
  // by dominant axis in the guard, with snap + smooth-scroll suspended for
  // the gesture's duration). Vertical-dominant swipes hand back untouched.
  useHorizontalRailGuard(rowRef);

  const visible = useMemo(
    () => (products ?? []).filter((p) => tab === 'all' || p.universeSlug === tab),
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
    const gap = 20; // gap-5
    const step = firstCard ? firstCard.offsetWidth + gap : Math.round(el.clientWidth * 0.8);
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <section aria-labelledby="best-heading" className="bg-cream py-16 lg:py-24 overflow-x-clip">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          eyebrow="Bestsellers"
          title="Community Favourites"
          titleId="best-heading"
          sub="Most-loved pieces from across our universes."
          linkTo="/shop"
          linkLabel="View all bestsellers"
        />

        {/* Universe tabs + arrows — pipe-separated, selected = gold + underline (render 05) */}
        <div className="flex items-center justify-between gap-4 mb-2">
          <div role="tablist" aria-label="Filter bestsellers by universe" className="flex items-center">
            {[{ slug: 'all', name: 'All' }, ...(universes ?? []).map((u) => ({ slug: u.slug, name: u.name }))].map(
              (t, i) => (
                <React.Fragment key={t.slug}>
                  {i > 0 && <span aria-hidden="true" className="text-stone mx-3 font-light select-none">|</span>}
                  <button
                    role="tab"
                    aria-selected={tab === t.slug}
                    onClick={() => setTab(t.slug)}
                    className={`relative pb-2 text-[16px] font-serif min-h-[44px] transition-colors ${
                      tab === t.slug ? 'text-gold-deep font-medium' : 'text-ink-muted hover:text-gold-deep'
                    }`}
                  >
                    {t.name}
                    {tab === t.slug && (
                      <span aria-hidden="true" className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold-deep" />
                    )}
                  </button>
                </React.Fragment>
              ),
            )}
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={() => scrollBy(-1)} disabled={!canPrev} aria-label="Scroll bestsellers back" className="w-11 h-11 rounded-full border border-stone flex items-center justify-center text-ink hover:border-ink transition-all disabled:opacity-30 disabled:pointer-events-none">
              <span aria-hidden="true">←</span>
            </button>
            <button onClick={() => scrollBy(1)} disabled={!canNext} aria-label="Scroll bestsellers forward" className="w-11 h-11 rounded-full bg-gold text-on-gold flex items-center justify-center hover:bg-gold-hover transition-all disabled:opacity-30 disabled:pointer-events-none">
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>

        {/* Rail is full-bleed with its own container-matching padding. Previously it
            sat inside the padded container with no inner padding, so the first /
            last card's hover ring + shadow were sliced at the scroller edge.
            Extra vertical padding keeps the hover lift unclipped (overflow-x:auto
            forces overflow-y to clip). snap-proximity + card-width stepping
            replaces snap-mandatory + fixed 640px which landed mid-card. */}
        <div ref={rowRef} {...RAIL_PREVENT_ATTR} className="flex gap-5 overflow-x-auto overscroll-x-contain snap-x snap-proximity scroll-px-4 sm:scroll-px-6 lg:scroll-px-12 scroll-smooth w-full max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 pt-4 pb-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {visible.map((p) => (
            <BestsellerCard key={p.slug} product={p} universeName={universeName(p.universeSlug)} />
          ))}
        </div>

        {/* Trust strip — gold line-icon in beige circle, serif title (render 05) */}
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-2 pt-8 border-t border-stone/60">
          {TRUST.map((t, i) => (
            <div
              key={t.title}
              className={`flex items-center gap-4 ${i > 0 ? 'sm:justify-center lg:justify-start' : ''}`}
            >
              <span className="w-12 h-12 rounded-full bg-stone/40 flex items-center justify-center shrink-0 text-ink" aria-hidden="true">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {i === 0 && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 7h11v10H3zM14 10h4l3 3v4h-7zM7 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm11 0a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  )}
                  {i === 1 && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 3h6v3a3 3 0 11-6 0V3zM12 9v10m-4-3h8m-8-4h8" />
                  )}
                  {i === 2 && (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3l8 3v6c0 4.5-3.5 7.5-8 9-4.5-1.5-8-4.5-8-9V6l8-3zm-2.5 8.5l2 2 4-4" />
                  )}
                </svg>
              </span>
              <div>
                <p className="font-serif text-lg text-ink">{t.title}</p>
                <p className="font-serif text-[13px] text-ink-muted">{t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
