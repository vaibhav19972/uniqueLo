import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { useExpressions, useProducts } from '../hooks/useCatalog';
import { filterProducts, type FilterState, type ExpressionSlug, normalizeStyleSlug } from '../lib/data';
import { ProductGrid } from '../components/shop/ProductGrid';
import { TrustBadgesPreFooter } from '../components/home/TrustBadgesPreFooter';

export const Expression: React.FC = () => {
  const { styleSlug, expressionSlug } = useParams<{ styleSlug?: string; expressionSlug?: string }>();
  const activeSlug = styleSlug || expressionSlug;
  const normalizedSlug = normalizeStyleSlug(activeSlug);

  const { data: expressions } = useExpressions();
  const { data: allProducts } = useProducts();

  const currentExp = (expressions ?? []).find(
    (e) => e.slug === normalizedSlug || e.slug === activeSlug
  );

  const filtered = useMemo(() => {
    if (!currentExp) return [];
    const f: FilterState = {
      categorySlug: 'all',
      expressionSlug: (normalizedSlug || activeSlug) as ExpressionSlug,
      colors: [],
      sizes: [],
      sort: 'newest',
    };
    return filterProducts(allProducts ?? [], f);
  }, [allProducts, activeSlug, normalizedSlug, currentExp]);

  if (expressions !== undefined && !currentExp) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center bg-white">
        <h1 className="font-display text-3xl font-black uppercase tracking-tight text-neutral-900">Style Not Found</h1>
        <p className="mt-2 text-xs text-neutral-500">This embroidery presence tier does not exist.</p>
        <Link to="/styles" className="mt-6 inline-flex min-h-[44px] items-center rounded-xs bg-black px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white">
          All Styles &amp; Presence
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900">
      {/* ── Streetwear Style Hero ── */}
      <section className="border-b border-neutral-200 bg-white pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <Link to="/styles" className="hover:text-black transition-colors">Styles</Link>
            <span>/</span>
            <span className="text-black">{currentExp?.name ?? '…'}</span>
          </nav>

          <div className="mt-6 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-xs bg-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                  Level {currentExp?.score} of 5
                </span>
                <span className="rounded-xs bg-neutral-100 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                  {currentExp?.characteristics}
                </span>
              </div>

              <h1 className="font-display text-3xl font-black uppercase tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                {currentExp?.name}
              </h1>
              <p className="mt-2 text-sm sm:text-base font-bold text-neutral-600">
                {currentExp?.tagline}
              </p>
              <p className="mt-2 text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-xl">
                {currentExp?.description}
              </p>
            </div>

            {/* Level Switcher Strip */}
            <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-50 p-2 self-start lg:self-end">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2">
                Tiers:
              </span>
              {(expressions ?? []).map((exp) => {
                const isActive = exp.slug === normalizedSlug || exp.slug === activeSlug;
                return (
                  <Link
                    key={exp.slug}
                    to={`/styles/${exp.slug}`}
                    className={`min-h-[36px] rounded-xs px-3 py-1.5 text-xs font-bold uppercase transition-all ${
                      isActive
                        ? 'bg-black text-white shadow-xs'
                        : 'border border-neutral-200 bg-white text-neutral-700 hover:border-black'
                    }`}
                  >
                    {exp.score}. {exp.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Products Grid ── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductGrid products={filtered} cardType="quick" />
      </section>

      {/* Trust Badges */}
      <TrustBadgesPreFooter />
    </div>
  );
};

export const Style = Expression;
