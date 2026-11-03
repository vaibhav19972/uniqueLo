import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { useProducts, useCollections } from '../hooks/useCatalog';
import { ProductGrid } from '../components/shop/ProductGrid';
import { hasLicensedMark } from '../lib/licensed-marks';
import { TrustBadgesPreFooter } from '../components/home/TrustBadgesPreFooter';

type TabKey = 'all' | 'new-arrivals' | 'hand-worked' | 'collector-edit' | 'collections';

interface TabMeta {
  key: TabKey;
  slug: string;
  name: string;
  basis: string;
}

const TABS: TabMeta[] = [
  {
    key: 'all',
    slug: 'all',
    name: 'All Featured',
    basis: 'Curated statement drops and house highlights.',
  },
  {
    key: 'new-arrivals',
    slug: 'new-arrivals',
    name: 'New Arrivals',
    basis: 'Fresh drops straight from the cutting and needlework floor.',
  },
  {
    key: 'hand-worked',
    slug: 'hand-worked',
    name: 'Hand-Worked Atelier',
    basis: 'Artisan editions with genuine hand needle embroidery.',
  },
  {
    key: 'collector-edit',
    slug: 'limited-editions',
    name: 'Collector Edit',
    basis: 'Limited runs and rare archival embroidery editions.',
  },
  {
    key: 'collections',
    slug: 'collections',
    name: 'Capsules',
    basis: 'Seasonal drops unified under an aesthetic universe.',
  },
];

export const NewFeatured: React.FC = () => {
  const { tabSlug } = useParams<{ tabSlug?: string }>();
  const { data: allProducts } = useProducts();
  const { data: collections } = useCollections();

  const activeTab: TabMeta = useMemo(() => {
    if (!tabSlug) return TABS[0];
    return TABS.find((t) => t.slug === tabSlug) ?? TABS[0];
  }, [tabSlug]);

  const filteredProducts = useMemo(() => {
    const list = (allProducts ?? []).filter((p) => !hasLicensedMark(p));
    switch (activeTab.key) {
      case 'new-arrivals':
        return [...list].sort((a, b) => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          if (b.createdAt) return 1;
          if (a.createdAt) return -1;
          return 0;
        });
      case 'hand-worked':
        return list.filter((p) => p.handcrafted);
      case 'collector-edit':
        return list.filter((p) => p.edits?.includes('collector'));
      case 'collections':
        return list.filter((p) => Boolean(p.collectionSlug));
      case 'all':
      default:
        return list.filter((p) => p.featured);
    }
  }, [allProducts, activeTab.key]);

  return (
    <div className="min-h-screen w-full bg-white text-neutral-900">
      {/* ── Streetwear Masthead ── */}
      <section className="border-b border-neutral-200 bg-white pt-10 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <span>/</span>
            <span className="text-black">New &amp; Featured</span>
            {activeTab.key !== 'all' && (
              <>
                <span>/</span>
                <span className="text-black">{activeTab.name}</span>
              </>
            )}
          </nav>

          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-xs bg-neutral-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-neutral-900 mb-2">
                <span>✦</span>
                <span>CURATED HIGHLIGHTS</span>
              </div>
              <h1 className="font-display text-3xl font-black uppercase tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
                {activeTab.name}
              </h1>
              <p className="mt-2 max-w-2xl text-xs sm:text-sm text-neutral-500 leading-relaxed">
                {activeTab.basis}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="rounded-full bg-black px-3.5 py-1.5 text-xs font-bold text-white">
                {filteredProducts.length} Pieces
              </span>
            </div>
          </div>

          {/* Modern Pill Tabs */}
          <div className="mt-6 flex flex-wrap gap-2">
            {TABS.map((t) => {
              const isActive = t.key === activeTab.key;
              const to = t.slug === 'all' ? '/new-featured' : `/new-featured/${t.slug}`;
              return (
                <Link
                  key={t.key}
                  to={to}
                  className={`min-h-[40px] rounded-xs px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center ${
                    isActive
                      ? 'bg-black text-white shadow-xs'
                      : 'border border-neutral-200 bg-white text-neutral-700 hover:border-black'
                  }`}
                >
                  {t.name}
                </Link>
              );
            })}
          </div>

          {activeTab.key === 'collections' && (collections ?? []).length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-neutral-100 pt-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                Explore Capsules:
              </span>
              {(collections ?? []).map((col) => (
                <Link
                  key={col.slug}
                  to={`/collections/${col.slug}`}
                  className="rounded-xs bg-neutral-100 px-2.5 py-1 text-xs font-bold text-neutral-800 hover:bg-black hover:text-white transition-colors"
                >
                  {col.name} →
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Product Grid ── */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ProductGrid products={filteredProducts} cardType="quick" />
      </section>

      {/* Trust Badges */}
      <TrustBadgesPreFooter />
    </div>
  );
};
