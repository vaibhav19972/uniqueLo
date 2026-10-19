import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { useExpressions, useProducts } from '../hooks/useCatalog';
import { filterProducts, type FilterState, type ExpressionSlug } from '../lib/data';
import { ProductGrid } from '../components/shop/ProductGrid';

/**
 * Single expression door — /expression/:expressionSlug.
 * Cross-world: every universe + garment matching this embroidery intensity tier.
 */
export const Expression: React.FC = () => {
  const { expressionSlug } = useParams<{ expressionSlug: string }>();
  const { data: expressions } = useExpressions();
  const { data: allProducts } = useProducts();

  const currentExp = (expressions ?? []).find((e) => e.slug === expressionSlug);

  const filtered = useMemo(() => {
    if (!currentExp) return [];
    const f: FilterState = {
      categorySlug: 'all',
      expressionSlug: expressionSlug as ExpressionSlug,
      colors: [],
      sizes: [],
      sort: 'newest',
    };
    return filterProducts(allProducts ?? [], f);
  }, [allProducts, expressionSlug, currentExp]);

  if (expressions !== undefined && !currentExp) {
    return (
      <div className="py-24 text-center max-w-md mx-auto px-4">
        <h1 className="font-serif text-3xl text-ink">Expression not found</h1>
        <p className="text-sm text-ink-muted mt-2">This intensity level does not exist.</p>
        <Link to="/expression" className="inline-block mt-6 text-sm underline underline-offset-4">
          All expressions
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-cream min-h-screen">
      {/* Editorial Header */}
      <section className="bg-paper border-b border-stone/50">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-12">
          <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/expression" className="hover:underline">Expression</Link>
            <span className="mx-2">›</span>
            <span>{currentExp?.name ?? '…'}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mt-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-sans tracking-[0.25em] text-accent uppercase font-medium">
                  Intensity Level {currentExp?.score} of 5
                </span>
                <span className="h-3 w-px bg-stone" />
                <span className="text-[11px] font-sans text-ink-muted tracking-wide">
                  {currentExp?.characteristics}
                </span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink mt-2 tracking-tight">
                {currentExp?.name ?? 'Expression'}
              </h1>
              <p className="font-serif italic text-lg sm:text-xl text-ink-muted mt-2">{currentExp?.tagline}</p>
              <p className="text-xs sm:text-sm text-ink-muted mt-3 max-w-2xl font-light leading-relaxed">
                {currentExp?.description}
              </p>
            </div>

            {/* Intensity Level Pill Selector */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-cream border border-stone/80 self-start lg:self-end">
              <span className="text-[9px] uppercase tracking-widest text-ink-muted font-medium px-2">
                Levels:
              </span>
              {(expressions ?? []).map((exp) => {
                const isActive = exp.slug === expressionSlug;
                return (
                  <Link
                    key={exp.slug}
                    to={`/expression/${exp.slug}`}
                    aria-current={isActive ? 'page' : undefined}
                    className={`px-3 py-1.5 text-xs font-sans border transition-all ${
                      isActive
                        ? 'border-ink bg-ink text-cream font-medium shadow-xs'
                        : 'border-transparent bg-paper text-ink hover:border-stone'
                    }`}
                  >
                    {exp.score}. {exp.name}
                  </Link>
                );
              })}
            </div>
          </div>

          <p className="text-xs text-ink-muted mt-6 uppercase tracking-widest">
            {filtered.length} product{filtered.length === 1 ? '' : 's'} matching Level {currentExp?.score}
          </p>
        </div>
      </section>

      {/* Grid */}
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-10 pb-24">
        <ProductGrid products={filtered} />
      </div>
    </div>
  );
};
