import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { useExpressions, useProducts } from '../hooks/useCatalog';
import { filterProducts, type FilterState, type ExpressionSlug, normalizeStyleSlug } from '../lib/data';
import { ProductGrid } from '../components/shop/ProductGrid';

/**
 * Single style door — /styles/:styleSlug (and backward-compatible /expression/:expressionSlug).
 * Cross-world: every universe + garment matching this embroidery intensity tier.
 */
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
      <div className="py-24 text-center max-w-md mx-auto px-4">
        <h1 className="font-serif text-3xl text-ink">Style not found</h1>
        <p className="text-sm text-ink-muted mt-2">This embroidery style tier does not exist.</p>
        <Link to="/styles" className="inline-block mt-6 text-sm underline underline-offset-4">
          All Styles
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-cream min-h-screen">
      {/* Editorial Header */}
      <section className="bg-paper border-b border-stone/50">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-12">
          <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-eyebrow text-ink-muted">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">›</span>
            <Link to="/styles" className="hover:underline">Styles</Link>
            <span className="mx-2">›</span>
            <span>{currentExp?.name ?? '…'}</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mt-4">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-sans tracking-eyebrow text-accent uppercase font-medium">
                  Intensity Level {currentExp?.score} of 5
                </span>
                <span className="h-3 w-px bg-stone" />
                <span className="text-xs font-sans text-ink-muted tracking-wide">
                  {currentExp?.characteristics}
                </span>
              </div>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink mt-2 tracking-tight">
                {currentExp?.name ?? 'Style'}
              </h1>
              <p className="font-serif text-lg sm:text-xl text-ink-muted mt-2">{currentExp?.tagline}</p>
              <p className="text-xs sm:text-sm text-ink-muted mt-3 max-w-2xl font-light leading-relaxed">
                {currentExp?.description}
              </p>
            </div>

            {/* Intensity Level Pill Selector */}
            <div className="flex flex-wrap items-center gap-1.5 p-2 bg-cream border border-stone/80 self-start lg:self-end">
              <span className="text-xs uppercase tracking-widest text-ink-muted font-medium px-2">
                Levels:
              </span>
              {(expressions ?? []).map((exp) => {
                const isActive = exp.slug === normalizedSlug || exp.slug === activeSlug;
                return (
                  <Link
                    key={exp.slug}
                    to={`/styles/${exp.slug}`}
                    aria-current={isActive ? 'page' : undefined}
                    className={`px-3 py-1.5 text-xs font-sans border transition-all ${
                      isActive
                        ? 'border-ink bg-panel-raised text-white font-medium shadow-xs'
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

export const Style = Expression;
