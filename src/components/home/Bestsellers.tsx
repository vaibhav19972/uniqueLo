import React, { useMemo, useRef, useState } from 'react';
import { useProducts, useUniverses } from '../../hooks/useCatalog';
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

  const visible = useMemo(
    () => (products ?? []).filter((p) => tab === 'all' || p.universeSlug === tab),
    [products, tab],
  );

  const universeName = (slug?: string) => universes?.find((u) => u.slug === slug)?.name;

  const scrollBy = (dir: 1 | -1) => {
    rowRef.current?.scrollBy({ left: dir * 640, behavior: 'smooth' });
  };

  return (
    <section aria-labelledby="best-heading" className="bg-cream py-16 lg:py-24 border-t border-stone/60">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          eyebrow="Bestsellers"
          title="Community Favourites"
          titleId="best-heading"
          sub="Most-loved pieces from across our universes."
          linkTo="/shop"
          linkLabel="View all bestsellers"
        />

        {/* Universe tabs + arrows */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div role="tablist" aria-label="Filter bestsellers by universe" className="flex items-center gap-5 border-b border-stone/70">
            <button
              role="tab"
              aria-selected={tab === 'all'}
              onClick={() => setTab('all')}
              className={`pb-2 text-sm font-serif tracking-wide min-h-[44px] transition-colors ${tab === 'all' ? 'text-gold font-semibold' : 'text-ink-muted hover:text-ink'}`}
            >
              All
            </button>
            {(universes ?? []).map((u) => (
              <button
                key={u.slug}
                role="tab"
                aria-selected={tab === u.slug}
                onClick={() => setTab(u.slug)}
                className={`pb-2 text-sm font-serif tracking-wide min-h-[44px] transition-colors ${tab === u.slug ? 'text-gold font-semibold' : 'text-ink-muted hover:text-ink'}`}
              >
                {u.name}
              </button>
            ))}
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={() => scrollBy(-1)} aria-label="Scroll bestsellers back" className="w-11 h-11 rounded-full border border-stone flex items-center justify-center text-ink hover:border-ink transition-colors">
              <span aria-hidden="true">←</span>
            </button>
            <button onClick={() => scrollBy(1)} aria-label="Scroll bestsellers forward" className="w-11 h-11 rounded-full bg-gold text-cream flex items-center justify-center hover:bg-gold-hover transition-colors">
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div ref={rowRef} className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth">
          {visible.map((p) => (
            <BestsellerCard key={p.slug} product={p} universeName={universeName(p.universeSlug)} />
          ))}
        </div>

        {/* Trust strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-8 border-t border-stone/60">
          {TRUST.map((t) => (
            <div key={t.title} className="flex items-center gap-4">
              <span className="text-gold font-serif text-2xl" aria-hidden="true">✦</span>
              <div>
                <p className="font-serif text-lg text-ink">{t.title}</p>
                <p className="text-[13px] text-ink-muted">{t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
