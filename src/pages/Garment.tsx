import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useGarments, useProducts, useUniverses } from '../hooks/useCatalog';
import {
  filterProducts,
  EXPRESSION_LEVELS,
  type FilterState,
  type ExpressionScore,
} from '../lib/data';
import { ProductGrid } from '../components/shop/ProductGrid';

/**
 * Single garment door — /clothing/:garmentSlug or /garments/:garmentSlug.
 * Cross-world: every universe + expression level that ships this garment.
 */
export const Garment: React.FC = () => {
  const { garmentSlug } = useParams<{ garmentSlug: string }>();
  const { data: garments } = useGarments();
  const { data: allProducts } = useProducts();
  const { data: universes } = useUniverses();

  const [universeFilter, setUniverseFilter] = useState<string | 'all'>('all');
  const [expressionFilter, setExpressionFilter] = useState<ExpressionScore | 'all'>('all');

  const garment = (garments ?? []).find((g) => g.slug === garmentSlug);

  const availableUniverses = useMemo(() => {
    const list = (allProducts ?? []).filter((p) => p.garmentType === garmentSlug);
    const uSlugs = new Set(list.map((p) => p.universeSlug).filter(Boolean));
    return (universes ?? []).filter((u) => uSlugs.has(u.slug));
  }, [allProducts, garmentSlug, universes]);

  const filtered = useMemo(() => {
    const f: FilterState = {
      categorySlug: 'all',
      garmentTypes: garmentSlug ? [garmentSlug] : [],
      universeSlug: universeFilter === 'all' ? undefined : universeFilter,
      expressionScore: expressionFilter === 'all' ? undefined : expressionFilter,
      colors: [],
      sizes: [],
      sort: 'newest',
    };
    return filterProducts(allProducts ?? [], f);
  }, [allProducts, garmentSlug, universeFilter, expressionFilter]);

  if (garments !== undefined && !garment) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4">
        <h1 className="font-serif text-3xl text-ink">Garment not found</h1>
        <p className="text-sm text-ink-muted mt-2">This thread leads nowhere — yet.</p>
        <Link to="/clothing" className="inline-block mt-6 text-sm underline underline-offset-4">
          All garments
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-cream min-h-screen">
      <section className="bg-paper border-b border-stone/50">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-12">
          <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/clothing" className="hover:underline">Clothing</Link>
            <span className="mx-2">›</span>
            <span>{garment?.name ?? '…'}</span>
          </nav>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink mt-3 tracking-tight">
            {garment?.name ?? 'Garment'}
          </h1>
          <p className="text-sm text-ink-muted mt-3 max-w-2xl font-light">{garment?.description}</p>

          {/* Context-Sensitive Filter Chips: World & Expression */}
          <div className="mt-8 flex flex-wrap items-center gap-2 pt-6 border-t border-stone/40">
            <span className="text-[10px] uppercase font-sans tracking-widest text-ink-muted font-semibold mr-1">
              Filter By:
            </span>

            {/* Reset All */}
            <button
              onClick={() => {
                setUniverseFilter('all');
                setExpressionFilter('all');
              }}
              aria-pressed={universeFilter === 'all' && expressionFilter === 'all'}
              className={`rounded-full px-4 py-2 text-xs uppercase tracking-widest font-sans min-h-[44px] transition-colors cursor-pointer ${
                universeFilter === 'all' && expressionFilter === 'all'
                  ? 'bg-ink text-cream border border-transparent font-medium'
                  : 'text-ink border border-stone bg-paper hover:border-ink'
              }`}
            >
              All
            </button>

            {/* Universes */}
            {availableUniverses.map((u) => (
              <button
                key={u.slug}
                onClick={() => setUniverseFilter(u.slug === universeFilter ? 'all' : u.slug)}
                aria-pressed={universeFilter === u.slug}
                className={`rounded-full px-4 py-2 text-xs uppercase tracking-widest font-sans min-h-[44px] transition-colors cursor-pointer ${
                  universeFilter === u.slug
                    ? 'bg-ink text-cream border border-transparent font-medium'
                    : 'text-ink-muted border border-stone bg-paper hover:border-ink hover:text-ink'
                }`}
              >
                {u.name}
              </button>
            ))}

            <span className="mx-2 h-5 w-px bg-stone/70 hidden sm:block" aria-hidden="true" />

            {/* Expression Tiers */}
            {EXPRESSION_LEVELS.map((e) => (
              <button
                key={e.score}
                onClick={() => setExpressionFilter(e.score === expressionFilter ? 'all' : e.score)}
                aria-pressed={expressionFilter === e.score}
                title={e.tagline}
                className={`rounded-full px-3.5 py-1.5 text-xs font-sans min-h-[44px] transition-colors cursor-pointer ${
                  expressionFilter === e.score
                    ? 'bg-accent text-cream border border-transparent font-medium shadow-sm'
                    : 'text-ink-muted border border-stone bg-paper hover:border-ink hover:text-ink'
                }`}
              >
                ✦ L{e.score} {e.name}
              </button>
            ))}
          </div>

          <p className="text-xs text-ink-muted mt-5 uppercase tracking-widest">
            {filtered.length} piece{filtered.length === 1 ? '' : 's'} available
          </p>
        </div>
      </section>
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-12 pb-24">
        <ProductGrid products={filtered} />
      </div>
    </div>
  );
};
