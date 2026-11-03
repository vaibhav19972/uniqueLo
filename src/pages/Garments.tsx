import React, { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useGarments, useProducts } from '../hooks/useCatalog';
import { hasLicensedMark } from '../lib/licensed-marks';
import { formatPrice, getDefaultVariant } from '../lib/data';
import { TrustBadgesPreFooter } from '../components/home/TrustBadgesPreFooter';

export const Garments: React.FC = () => {
  const { data: garments } = useGarments();
  const { data: products } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const rows = useMemo(() => {
    const list = (products ?? []).filter((p) => !hasLicensedMark(p));
    return (garments ?? [])
      .map((g) => {
        const matching = list.filter((p) => p.garmentType === g.slug);
        const prices = matching
          .map((p) => getDefaultVariant(p)?.priceCents ?? 0)
          .filter((price) => price > 0)
          .sort((a, b) => a - b);
        const sampleImage = matching[0]?.images?.[0]?.src;

        return {
          ...g,
          count: matching.length,
          startingPrice: prices[0] ?? null,
          image: sampleImage || g.image || '/images/placeholders/hoodie.jpg',
        };
      })
      .filter((g) => g.count > 0)
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [garments, products]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      if (r.categorySlug) set.add(r.categorySlug);
    }
    return ['all', ...Array.from(set)];
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (selectedCategory === 'all') return rows;
    return rows.filter((r) => r.categorySlug === selectedCategory);
  }, [rows, selectedCategory]);

  const totalPieces = rows.reduce((n, r) => n + r.count, 0);

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900">
      {/* ── Streetwear Masthead ── */}
      <section className="border-b border-neutral-200 bg-white pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <span className="text-black">Clothing</span>
          </nav>

          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-xs bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-900 mb-2">
                <span>✦</span>
                <span>SIGNATURE STREETWEAR CUTS</span>
              </div>
              <h1 className="font-display text-3xl font-black uppercase tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                Shop by Silhouette
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-neutral-500 leading-relaxed">
                What the piece is, across every universe. Premium heavyweight cotton, boxy drop-shoulder hoodies, tailored twill jackets, and fine needlework accessories.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="rounded-full bg-black px-3.5 py-1.5 text-xs font-bold text-white">
                {totalPieces} Pieces
              </span>
              <span className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-bold text-neutral-700">
                {rows.length} Silhouettes
              </span>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[38px] rounded-xs px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-black text-white'
                    : 'border border-neutral-200 bg-white text-neutral-700 hover:border-black'
                }`}
              >
                {cat === 'all' ? 'All Silhouettes' : cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Visual Silhouettes Grid ── */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRows.map((garment) => (
            <Link
              key={garment.slug}
              to={`/clothing/${garment.slug}`}
              className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xs transition-all duration-300 hover:shadow-xl hover:border-black"
            >
              {/* Silhouette Image Container */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
                <img
                  src={garment.image}
                  alt={garment.name}
                  loading="lazy"
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/placeholders/hoodie.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                {/* Top Badge */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                  <span className="rounded-xs bg-white/90 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-neutral-900 backdrop-blur-xs">
                    {garment.categorySlug || 'APPAREL'}
                  </span>
                  <span className="rounded-xs bg-black/80 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-white">
                    {garment.count} {garment.count === 1 ? 'Piece' : 'Pieces'}
                  </span>
                </div>

                {/* Bottom Title on Image */}
                <div className="absolute bottom-3 inset-x-4">
                  <h2 className="font-display text-2xl font-black uppercase tracking-tight text-white drop-shadow-sm">
                    {garment.name}
                  </h2>
                  {garment.startingPrice && (
                    <p className="mt-0.5 text-xs font-bold text-red-400">
                      Starting {formatPrice(garment.startingPrice)}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col justify-between p-4 bg-white">
                <p className="text-xs text-neutral-600 leading-relaxed line-clamp-2">
                  {garment.description}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    Explore Fits
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-black group-hover:text-red-600 transition-colors">
                    <span>Shop {garment.name}</span>
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
