import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useCraftTechniques, useProducts } from '../hooks/useCatalog';
import { piecesInTechnique, distinctPiecesInTechniques } from '../lib/techniques';
import { TrustBadgesPreFooter } from '../components/home/TrustBadgesPreFooter';

export const Atelier: React.FC = () => {
  const { data: techniques } = useCraftTechniques();
  const { data: products } = useProducts();

  const rows = useMemo(
    () =>
      (techniques ?? []).map((craft) => {
        const matching = piecesInTechnique(products, craft.slug);
        return {
          craft,
          count: matching.length,
          sample: matching[0] ?? null,
          image: craft.image || matching[0]?.images?.[1]?.src || matching[0]?.images?.[0]?.src || '/images/placeholders/hero.jpg',
        };
      }),
    [techniques, products],
  );

  const inProduction = rows.filter((r) => r.count > 0).length;
  const placedPieces = useMemo(() => distinctPiecesInTechniques(products), [products]);

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900">
      {/* ── Streetwear Craft Masthead ── */}
      <section className="border-b border-neutral-200 bg-white pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <span className="text-black">The Craft</span>
          </nav>

          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-xs bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-900 mb-2">
                <span>✦</span>
                <span>AUTHENTIC ARTISAN NEEDLECRAFT</span>
              </div>
              <h1 className="font-display text-3xl font-black uppercase tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                The Indian Craft Taxonomy
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-neutral-500 leading-relaxed">
                Nine living needlework traditions, rooted in their regional clusters and authentic stitch mechanisms. Every garment is priced transparently by its artisan hours and threadwork density.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="rounded-full bg-black px-3.5 py-1.5 text-xs font-bold text-white">
                {inProduction} Traditions in Production
              </span>
              <span className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-bold text-neutral-700">
                {placedPieces} Pieces Placed
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Technique Cards Grid ── */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ craft, count, image }) => (
            <Link
              key={craft.slug}
              to={`/our-craft/${craft.slug}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xs transition-all duration-300 hover:shadow-xl hover:border-black"
            >
              {/* Macro Stitch Image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                <img
                  src={image}
                  alt={craft.name}
                  loading="lazy"
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/placeholders/hero.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                  <span className="rounded-xs bg-black/80 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-white backdrop-blur-xs">
                    {craft.region}
                  </span>
                  <span className="rounded-xs bg-white/90 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-neutral-900 backdrop-blur-xs">
                    {count} {count === 1 ? 'Piece' : 'Pieces'}
                  </span>
                </div>

                {/* Bottom Overlay Title on Image */}
                <div className="absolute bottom-3 inset-x-4">
                  <h2 className="font-display text-xl sm:text-2xl font-black uppercase tracking-tight text-white drop-shadow-sm">
                    {craft.name}
                  </h2>
                  <p className="mt-0.5 text-xs font-bold text-red-400">
                    ⏱ {craft.artisanPace}
                  </p>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between p-4 bg-white">
                <div>
                  <div className="mb-2 flex items-center gap-1.5">
                    <span className="rounded-xs bg-neutral-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-neutral-700">
                      {craft.stitchType}
                    </span>
                    <span className="text-[10px] text-neutral-400">·</span>
                    <span className="text-[10px] text-neutral-500 truncate">
                      {craft.cluster}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">
                    {craft.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Heritage Method
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black group-hover:text-red-600 transition-colors">
                    <span>Explore Craft</span>
                    <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadgesPreFooter />
    </div>
  );
};
