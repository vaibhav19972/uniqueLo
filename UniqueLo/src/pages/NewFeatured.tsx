import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { useProducts } from '../hooks/useCatalog';
import { ProductGrid } from '../components/shop/ProductGrid';

type TabKey = 'all' | 'new-arrivals' | 'bestsellers' | 'limited-editions';

interface TabMeta {
  key: TabKey;
  slug: string;
  name: string;
  tagline: string;
  description: string;
}

const TABS: TabMeta[] = [
  {
    key: 'all',
    slug: 'all',
    name: 'All Featured',
    tagline: 'Curated highlights across every universe and craft.',
    description: 'Fresh releases, archival bestsellers, and limited-run pieces brought together in one curated edit.',
  },
  {
    key: 'new-arrivals',
    slug: 'new-arrivals',
    name: 'New Arrivals',
    tagline: 'The freshest needlework straight from our artisan clusters.',
    description: 'Recent additions to the atelier collection, featuring newly landed motifs and seasonal silhouettes.',
  },
  {
    key: 'bestsellers',
    slug: 'bestsellers',
    name: 'Bestsellers',
    tagline: 'The most coveted garments in the UniqueLo archives.',
    description: 'Ranked by collector adoption and sales performance across India and abroad.',
  },
  {
    key: 'limited-editions',
    slug: 'limited-editions',
    name: 'Limited Editions',
    tagline: 'Small-batch, numbered runs with rare bullion and silk threadwork.',
    description: 'Strictly limited releases featuring high artisan hours, hand-numbered certificates, and non-repeating thread palettes.',
  },
];

export const NewFeatured: React.FC = () => {
  const { tabSlug } = useParams<{ tabSlug?: string }>();
  const { data: allProducts } = useProducts();

  const activeTabKey: TabKey = useMemo(() => {
    if (!tabSlug) return 'all';
    const found = TABS.find((t) => t.slug === tabSlug);
    return found ? found.key : 'all';
  }, [tabSlug]);

  const activeTabMeta = TABS.find((t) => t.key === activeTabKey) || TABS[0];

  const filteredProducts = useMemo(() => {
    const list = allProducts ?? [];
    switch (activeTabKey) {
      case 'new-arrivals':
        // Featured or recent
        return list.filter((p) => p.featured || p.tags.includes('new') || p.tags.includes('animeverse'));
      case 'bestsellers':
        return list.filter((p) => p.tags.includes('bestseller') || (p.rating && p.rating >= 4.7));
      case 'limited-editions':
        return list.filter((p) => p.batchNumber != null || p.edits?.includes('collector') || p.handcrafted);
      case 'all':
      default:
        return list.filter((p) => p.featured || p.tags.includes('bestseller') || p.batchNumber != null);
    }
  }, [allProducts, activeTabKey]);

  return (
    <div className="w-full bg-cream min-h-screen">
      {/* Header */}
      <section className="bg-paper border-b border-stone/50">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-12 lg:py-16">
          <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">›</span>
            <span>New & Featured</span>
            {activeTabKey !== 'all' && (
              <>
                <span className="mx-2">›</span>
                <span>{activeTabMeta.name}</span>
              </>
            )}
          </nav>
          <span className="text-[11px] font-sans tracking-[0.25em] text-accent uppercase font-medium mt-4 block">
            Curated Highlights
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink mt-2 tracking-tight">
            {activeTabMeta.name}
          </h1>
          <p className="font-serif italic text-lg sm:text-xl text-ink-muted mt-2">
            {activeTabMeta.tagline}
          </p>
          <p className="text-sm text-ink-muted mt-3 max-w-2xl font-light leading-relaxed">
            {activeTabMeta.description}
          </p>

          {/* Segmented Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 pt-4 border-t border-stone/40">
            {TABS.map((t) => {
              const isActive = t.key === activeTabKey;
              const to = t.slug === 'all' ? '/new-featured' : `/new-featured/${t.slug}`;
              return (
                <Link
                  key={t.key}
                  to={to}
                  aria-current={isActive ? 'page' : undefined}
                  className={`px-4 py-2 text-xs uppercase tracking-widest font-sans border transition-colors ${
                    isActive
                      ? 'bg-ink text-cream border-transparent font-medium shadow-xs'
                      : 'bg-paper text-ink border-stone hover:border-ink'
                  }`}
                >
                  {t.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-10 pb-24">
        <p className="text-xs text-ink-muted mb-6 uppercase tracking-widest">
          {filteredProducts.length} piece{filteredProducts.length === 1 ? '' : 's'} curated
        </p>
        <ProductGrid products={filteredProducts} />
      </div>
    </div>
  );
};
