import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useProducts } from '../hooks/useCatalog';
import { matchesGender, type Gender } from '../lib/data';
import { ProductGrid } from '../components/shop/ProductGrid';
import { TrustBadgesPreFooter } from '../components/home/TrustBadgesPreFooter';

const CATEGORY_CHIPS = [
  { slug: 'all', label: 'All Fits' },
  { slug: 'hoodie', label: 'Hoodies' },
  { slug: 'tee', label: 'Tees' },
  { slug: 'jacket', label: 'Jackets' },
  { slug: 'shirt', label: 'Shirts' },
  { slug: 'lowers', label: 'Lowers' },
  { slug: 'accessories', label: 'Accessories' },
];

export const GenderPage: React.FC = () => {
  const location = useLocation();
  const gender: Gender = location.pathname.startsWith('/women') ? 'women' : 'men';
  const { data: allProducts } = useProducts();
  const [selectedSilhouette, setSelectedSilhouette] = useState('all');

  const baseProducts = useMemo(
    () => (allProducts ?? []).filter((p) => matchesGender(p, gender)),
    [allProducts, gender],
  );

  const products = useMemo(() => {
    if (selectedSilhouette === 'all') return baseProducts;
    return baseProducts.filter((p) => p.garmentType === selectedSilhouette);
  }, [baseProducts, selectedSilhouette]);

  const title = gender === 'women' ? "Women's Collection" : "Men's Collection";
  const kicker = gender === 'women' ? 'FOR HER · UNISEX FITS' : 'FOR HIM · UNISEX FITS';
  const copy =
    gender === 'women'
      ? 'Embroidered streetwear universes cut with tailored proportion and relaxed drape — plus every unisex piece in the atelier.'
      : 'Heavyweight streetwear drops, boxy drop-shoulder hoodies, and structured twill outerwear — plus every unisex piece in the atelier.';

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900">
      {/* ── Gender Masthead ── */}
      <section className="border-b border-neutral-200 bg-white pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <span className="text-black">{gender === 'women' ? 'Women' : 'Men'}</span>
          </nav>

          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-xs bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-900 mb-2">
                <span>✦</span>
                <span>{kicker}</span>
              </div>
              <h1 className="font-display text-3xl font-black uppercase tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-neutral-500 leading-relaxed">
                {copy}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="rounded-full bg-black px-3.5 py-1.5 text-xs font-bold text-white">
                {products.length} Pieces
              </span>
            </div>
          </div>

          {/* Silhouette Quick Filter Pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            {CATEGORY_CHIPS.map((cat) => {
              const count = cat.slug === 'all'
                ? baseProducts.length
                : baseProducts.filter((p) => p.garmentType === cat.slug).length;
              if (count === 0 && cat.slug !== 'all') return null;

              const isSelected = selectedSilhouette === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setSelectedSilhouette(cat.slug)}
                  className={`min-h-[38px] rounded-xs px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-black text-white shadow-xs'
                      : 'border border-neutral-200 bg-white text-neutral-700 hover:border-black'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Product Grid ── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductGrid products={products} cardType="quick" />
      </section>

      {/* Trust Badges */}
      <TrustBadgesPreFooter />
    </div>
  );
};
