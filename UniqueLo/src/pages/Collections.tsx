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
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(collections ?? []).map((col) => (
          <Link
            key={col.slug}
            to={`/collections/${col.slug}`}
            className="group bg-paper border border-stone/70 p-6 sm:p-8 hover:border-ink transition-all flex flex-col justify-between shadow-xs hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between text-[10px] uppercase font-sans tracking-[0.2em] text-accent font-medium mb-3">
                <span>{col.universeSlug ? `${col.universeSlug} Capsule` : 'Atelier Release'}</span>
                {col.featured && (
                  <span className="bg-gold/10 text-gold-deep px-2 py-0.5 border border-gold/20">
                    Active Drop
                  </span>
                )}
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl text-ink group-hover:text-accent transition-colors">
                {col.name}
              </h2>
              <p className="font-serif italic text-sm text-ink-muted mt-1.5">
                {col.tagline}
              </p>
              <p className="text-xs text-ink-muted mt-3 font-light leading-relaxed">
                {col.description}
              </p>
            </div>
            <div className="pt-6 border-t border-stone/40 mt-6 flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-widest text-ink font-medium">
                {counts[col.slug] ?? 0} {counts[col.slug] === 1 ? 'Garment' : 'Garments'}
              </span>
              <span className="text-xs text-ink group-hover:translate-x-1 transition-transform" aria-hidden="true">
                Explore Drop →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
