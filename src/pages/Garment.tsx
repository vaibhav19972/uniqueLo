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
import { TrustBadgesPreFooter } from '../components/home/TrustBadgesPreFooter';

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
      <div className="mx-auto max-w-md px-4 py-20 text-center bg-white">
        <h1 className="font-display text-3xl font-black uppercase tracking-tight text-neutral-900">Garment Not Found</h1>
        <p className="mt-2 text-xs text-neutral-500">This silhouette thread leads nowhere yet.</p>
        <Link to="/clothing" className="mt-6 inline-flex min-h-[44px] items-center rounded-xs bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white">
          All Silhouettes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900">
      {/* ── Silhouette Hero ── */}
      <section className="border-b border-neutral-200 bg-white pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <Link to="/clothing" className="hover:text-black transition-colors">Clothing</Link>
            <span>/</span>
            <span className="text-black">{garment?.name ?? '…'}</span>
          </nav>

          <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-xs bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-900 mb-2">
                <span>✦</span>
                <span>{garment?.categorySlug?.toUpperCase() || 'SILHOUETTE'} ARCHIVE</span>
              </div>
              <h1 className="font-display text-3xl font-black uppercase tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                {garment?.name ?? 'Garment'}
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-neutral-500 leading-relaxed">
                {garment?.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="rounded-full bg-black px-3.5 py-1.5 text-xs font-bold text-white">
                {filtered.length} In Stock
              </span>
            </div>
          </div>

          {/* Cross-World & Expression Filter Chips */}
          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-4">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Universe:
            </span>

            <button
              type="button"
              onClick={() => {
                setUniverseFilter('all');
                setExpressionFilter('all');
              }}
              className={`min-h-[36px] rounded-xs px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                universeFilter === 'all' && expressionFilter === 'all'
                  ? 'bg-black text-white'
                  : 'border border-neutral-200 bg-white text-neutral-700 hover:border-black'
              }`}
            >
              All Worlds
            </button>

            {availableUniverses.map((u) => (
              <button
                key={u.slug}
                type="button"
                onClick={() => setUniverseFilter(u.slug === universeFilter ? 'all' : u.slug)}
                className={`min-h-[36px] rounded-xs px-3 py-1 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  universeFilter === u.slug
                    ? 'bg-black text-white'
                    : 'border border-neutral-200 bg-white text-neutral-700 hover:border-black'
                }`}
              >
                {u.name}
              </button>
            ))}

            <span className="mx-1 hidden h-5 w-px bg-neutral-200 sm:block" />

            <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
              Style:
            </span>

            {EXPRESSION_LEVELS.map((e) => (
              <button
                key={e.score}
                type="button"
                onClick={() => setExpressionFilter(e.score === expressionFilter ? 'all' : e.score)}
                title={e.tagline}
                className={`min-h-[36px] rounded-xs px-2.5 py-1 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  expressionFilter === e.score
                    ? 'bg-red-600 text-white'
                    : 'border border-neutral-200 bg-white text-neutral-600 hover:border-black'
                }`}
              >
                L{e.score} {e.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Product Grid ── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductGrid products={filtered} cardType="quick" />
      </section>

      {/* Trust Badges */}
      <TrustBadgesPreFooter />
    </div>
  );
};
