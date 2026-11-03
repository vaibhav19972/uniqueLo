import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useCollections, useProducts } from '../hooks/useCatalog';
import { TrustBadgesPreFooter } from '../components/home/TrustBadgesPreFooter';

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
    <div className="min-h-screen w-full bg-white text-neutral-900">
      {/* ── Masthead ── */}
      <section className="border-b border-neutral-200 bg-white pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <span className="text-black">Collections &amp; Drops</span>
          </nav>

          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-xs bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-900 mb-2">
                <span>✦</span>
                <span>LIMITED RUN CAPSULES</span>
              </div>
              <h1 className="font-display text-3xl font-black uppercase tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                Curated Drops &amp; Capsules
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-neutral-500 leading-relaxed">
                Transversal aesthetic drops and seasonal capsules uniting hoodies, tees, jackets, and accessories under a shared narrative.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="rounded-full bg-black px-3.5 py-1.5 text-xs font-bold text-white">
                {(collections ?? []).length} Active Capsules
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Drop Cards Showcase ── */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {(collections ?? []).map((col) => {
            const count = counts[col.slug] ?? 0;
            return (
              <Link
                key={col.slug}
                to={`/collections/${col.slug}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xs transition-all duration-300 hover:shadow-xl hover:border-black"
              >
                {/* Visual Banner */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
                  {col.image ? (
                    <img
                      src={col.image}
                      alt={col.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-85"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/placeholders/hero.jpg';
                      }}
                    />
                  ) : (
                    <div className="h-full w-full bg-neutral-900" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <span className="rounded-xs bg-black/80 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-white backdrop-blur-xs">
                      {col.universeSlug ? `${col.universeSlug.toUpperCase()} CAPSULE` : 'ATELIER RELEASE'}
                    </span>
                    {col.featured && (
                      <span className="rounded-xs bg-red-600 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-white">
                        ACTIVE DROP
                      </span>
                    )}
                  </div>

                  {/* Title & Tagline on banner */}
                  <div className="absolute bottom-3 inset-x-4">
                    <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white drop-shadow-sm">
                      {col.name}
                    </h2>
                    <p className="mt-0.5 text-xs text-neutral-300 line-clamp-1">
                      {col.tagline}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="flex flex-1 flex-col justify-between p-4 bg-white">
                  <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">
                    {col.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      {count} {count === 1 ? 'Garment' : 'Garments'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black group-hover:text-red-600 transition-colors">
                      <span>Explore Drop</span>
                      <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadgesPreFooter />
    </div>
  );
};
