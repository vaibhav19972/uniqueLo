import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useCollections, useProducts } from '../hooks/useCatalog';

/**
 * Collections Hub — /collections (The Curated Drops & Aesthetic Capsules door).
 */
export const Collections: React.FC = () => {
  const { data: collections } = useCollections();
  const { data: products } = useProducts();

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of products ?? []) {
      const slug = p.collectionSlug || p.artStyleSlug;
      if (!slug) continue;
      c[slug] = (c[slug] ?? 0) + 1;
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
            <span>Collections</span>
          </nav>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink mt-3 tracking-tight">
            Curated Collections & Drops
          </h1>
          <p className="text-sm text-ink-muted mt-3 max-w-2xl font-light">
            Transversal aesthetic drops and seasonal capsules uniting hoodies, tees, jackets, and accessories under a shared narrative.
          </p>
        </div>
      </section>
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-10 grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(collections ?? []).map((col) => (
          <Link
            key={col.slug}
            to={`/collections/${col.slug}`}
            className="group flex flex-col justify-between overflow-hidden border border-stone bg-paper shadow-xs transition-all hover:border-accent hover:shadow-md"
          >
            {col.image && (
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone/20">
                <img
                  src={col.image}
                  alt={`${col.name} — placeholder campaign art`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="scrim-bottom-soft absolute inset-x-0 bottom-0 h-1/2" aria-hidden="true" />
                <span className="absolute inset-x-0 bottom-0 h-1 bg-accent" aria-hidden="true" />
              </div>
            )}
            <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-8">
            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-1 font-sans text-[8px] font-medium uppercase tracking-[0.15em] text-accent sm:mb-3 sm:text-[10px] sm:tracking-[0.2em]">
                <span className="truncate">{col.universeSlug ? `${col.universeSlug} Capsule` : 'Atelier Release'}</span>
                {col.featured && (
                  <span className="shrink-0 border border-accent-border bg-accent-soft px-1.5 py-0.5 text-accent sm:px-2">
                    Active Drop
                  </span>
                )}
              </div>
              <h2 className="line-clamp-1 font-serif text-base text-ink transition-colors group-hover:text-accent sm:text-2xl lg:text-3xl">
                {col.name}
              </h2>
              <p className="mt-1 line-clamp-1 font-sans text-xs text-ink-muted sm:mt-1.5 sm:text-sm">
                {col.tagline}
              </p>
              <p className="mt-2 line-clamp-2 font-sans text-[11px] leading-relaxed text-ink-muted sm:mt-3 sm:line-clamp-none sm:text-xs">
                {col.description}
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-stone/40 pt-3 sm:mt-6 sm:pt-6">
              <span className="font-sans text-[10px] font-medium uppercase tracking-widest text-ink sm:text-[11px]">
                {counts[col.slug] ?? 0} {counts[col.slug] === 1 ? 'Garment' : 'Garments'}
              </span>
              <span className="font-sans text-[10px] text-ink transition-transform group-hover:translate-x-1 sm:text-xs" aria-hidden="true">
                Explore →
              </span>
            </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
