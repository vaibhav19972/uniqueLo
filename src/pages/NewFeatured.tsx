import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { useProducts, useCollections } from '../hooks/useCatalog';
import { ProductGrid } from '../components/shop/ProductGrid';

type TabKey = 'all' | 'new-arrivals' | 'bestsellers' | 'limited-editions' | 'collections';

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
  {
    key: 'collections',
    slug: 'collections',
    name: 'Collections',
    tagline: 'Thematic seasonal drops curated across worlds & silhouettes.',
    description: 'Explore our curated thematic drops where singular embroidery stories unite diverse apparel silhouettes into unified aesthetic capsules.',
  },
];

export const NewFeatured: React.FC = () => {
  const { tabSlug } = useParams<{ tabSlug?: string }>();
  const { data: allProducts } = useProducts();
  const { data: collections } = useCollections();

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
        // Sort by newest createdAt timestamp descending, including all newly landed products
        return [...list]
          .sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            if (b.createdAt) return 1;
            if (a.createdAt) return -1;
            return 0;
          })
          .filter((p) => p.featured || p.tags.includes('new') || Boolean(p.createdAt));
      case 'bestsellers':
        return list.filter((p) => p.tags.includes('bestseller') || (p.rating && p.rating >= 4.7));
      case 'limited-editions':
        return list.filter((p) => p.edits?.includes('collector') || p.handcrafted);
      case 'collections':
        return list.filter((p) => Boolean(p.collectionSlug));
      case 'all':
      default:
        return list.filter((p) => p.featured || p.tags.includes('bestseller'));
    }
  }, [allProducts, activeTabKey]);

  return (
    <div className="w-full bg-cream min-h-screen">
      {/* Header */}
      <section className="bg-paper border-b border-stone/50">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-12 lg:py-16">
          <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-eyebrow text-ink-muted">
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
          <span className="text-xs font-sans tracking-eyebrow text-accent uppercase font-medium mt-4 block">
            Curated Highlights
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink mt-2 tracking-tight">
            {activeTabMeta.name}
          </h1>
          <p className="font-serif text-lg sm:text-xl text-ink-muted mt-2">
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
                  className={`px-4 py-2 text-xs uppercase tracking-widest font-sans border transition-colors ${isActive
                    ? 'bg-panel-raised text-white border-transparent font-medium shadow-xs'
                    : 'bg-paper text-ink border-stone hover:border-ink'
                    }`}
                >
                  {t.name}
                </Link>
              );
            })}
          </div>

          {/* Collection Hub Callout */}
          {activeTabKey === 'collections' && (
            <div className="mt-6 p-4 sm:p-5 bg-cream/70 border border-stone/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="font-serif text-base text-ink font-medium">Looking for complete collection stories & lookbooks?</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {(collections ?? []).map((col) => (
                    <Link
                      key={col.slug}
                      to={`/collections/${col.slug}`}
                      className="px-2.5 py-1 text-xs font-sans uppercase tracking-wider bg-paper border border-stone/60 hover:border-accent text-ink hover:text-accent transition-colors"
                    >
                      {col.name} →
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                to="/collections"
                className="px-4 py-2 bg-panel-raised text-white hover:bg-accent text-xs uppercase font-sans tracking-widest font-semibold whitespace-nowrap transition-colors shrink-0"
              >
                All Collections Hub →
              </Link>
            </div>
          )}
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
