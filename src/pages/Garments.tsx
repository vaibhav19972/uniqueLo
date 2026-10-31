import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useGarments, useProducts } from '../hooks/useCatalog';

/**
 * Garments index — /garments (the Merchandise door).
 * Specific garment types grouped by category, with live counts.
 */
export const Garments: React.FC = () => {
  const { data: garments } = useGarments();
  const { data: products } = useProducts();

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of products ?? []) {
      if (!p.garmentType) continue;
      c[p.garmentType] = (c[p.garmentType] ?? 0) + 1;
    }
    return c;
  }, [products]);

  return (
    <div className="w-full bg-cream min-h-screen">
      <section className="bg-paper border-b border-stone/50">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-12">
          <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">›</span>
            <span>Garments</span>
          </nav>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink mt-3 tracking-tight">
            Shop by Garment
          </h1>
          <p className="text-sm text-ink-muted mt-3 max-w-2xl font-light">
            The merchandise door — what the thing is. Every garment, in every world and style.
          </p>
        </div>
      </section>
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-10 grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {(garments ?? []).map((g) => (
          <Link
            key={g.slug}
            to={`/garments/${g.slug}`}
            className="group flex flex-col justify-between overflow-hidden border border-stone bg-paper transition-colors hover:border-accent"
          >
            {g.image && (
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone/20">
                <img
                  src={g.image}
                  alt={`${g.name} — placeholder campaign art`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="scrim-bottom-soft absolute inset-x-0 bottom-0 h-1/2" aria-hidden="true" />
                <span className="absolute inset-x-0 bottom-0 h-1 bg-accent" aria-hidden="true" />
              </div>
            )}
            <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-6">
              <div>
                <h2 className="font-serif text-base text-ink transition-colors group-hover:text-accent sm:text-2xl">{g.name}</h2>
                <p className="mt-1 font-sans text-[11px] text-ink-muted line-clamp-2 sm:text-xs">{g.description}</p>
              </div>
              <span className="mt-2.5 inline-flex items-center gap-1 font-sans text-[10px] font-medium uppercase tracking-widest text-ink sm:mt-4 sm:text-[11px]">
                {counts[g.slug] ?? 0} pieces <span aria-hidden="true">→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
