import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router';
import { useProducts, useCollections } from '../hooks/useCatalog';
import { ProductGrid } from '../components/shop/ProductGrid';
import { hasLicensedMark } from '../lib/licensed-marks';

/**
 * NEW & FEATURED — /new-featured
 *
 * Was five tabs of card-grid under a gold "Curated Highlights" kicker, an
 * italic serif tagline and a third paragraph of marketing prose. Two of its
 * five tabs were dishonest:
 *
 *  · "Limited Editions — strictly numbered runs with zero mass reproduction"
 *    filtered on `edits.includes('collector') || handcrafted`. Nothing in the
 *    catalogue is numbered, and `handcrafted` is true on nearly every piece.
 *  · "Bestsellers — ranked by collector adoption and sales performance" sorted
 *    by `tags.includes('bestseller') || rating >= 4.7` — a rating the catalogue
 *    does not have for most products, so the tab mostly rendered tag order.
 *
 * Both are renamed to what they actually select, and the prose is replaced by
 * a count. The tabs are the same ruled segmented cells the rest of the site
 * uses; the grid is the same ProductGrid as the shop.
 */
type TabKey = 'all' | 'new-arrivals' | 'hand-worked' | 'collector-edit' | 'collections';

interface TabMeta {
  key: TabKey;
  slug: string;
  name: string;
  /** What this tab actually selects, in the buyer's words. */
  basis: string;
}

const TABS: TabMeta[] = [
  {
    key: 'all',
    slug: 'all',
    name: 'All featured',
    basis: 'Pieces the house has chosen to lead with.',
  },
  {
    key: 'new-arrivals',
    slug: 'new-arrivals',
    name: 'New arrivals',
    basis: 'Newest listings first, by publication date.',
  },
  {
    key: 'hand-worked',
    slug: 'hand-worked',
    name: 'Hand-worked',
    basis: 'Pieces whose record names hand embroidery as the method.',
  },
  {
    key: 'collector-edit',
    slug: 'limited-editions',
    name: 'Collector edit',
    basis: 'The pieces the catalogue files under its collector edit.',
  },
  {
    key: 'collections',
    slug: 'collections',
    name: 'Collections',
    basis: 'Pieces that belong to a named seasonal capsule.',
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
    // A curated rail presents pieces as the brand's own work.
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
    <div className="min-h-screen w-full bg-cream">
      <section className="border-b border-stone bg-cream pb-6 pt-10">
        <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
          <nav aria-label="Breadcrumb" className="loom-label text-ink-muted">
            <Link to="/" className="transition-colors hover:text-ink">
              Home
            </Link>
            <span aria-hidden="true" className="mx-2">
              /
            </span>
            <span className="text-ink">New &amp; featured</span>
            {activeTab.key !== 'all' && (
              <>
                <span aria-hidden="true" className="mx-2">
                  /
                </span>
                <span>{activeTab.name}</span>
              </>
            )}
          </nav>

          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="loom-display text-ink" style={{ fontSize: 'var(--text-display)' }}>
                {activeTab.name}
              </h1>
              <p className="mt-2 max-w-[54ch] font-sans text-[15px] leading-relaxed text-ink-muted">
                {activeTab.basis}
              </p>
            </div>
            <p className="shrink-0 font-sans text-[12px] text-ink-muted">
              <span className="loom-price text-[15px] text-ink">{filteredProducts.length}</span>{' '}
              {filteredProducts.length === 1 ? 'piece' : 'pieces'}
            </p>
          </div>

          {/* Segmented cells: adjacent square tabs sharing borders, the selected
              one filled with ink. Same control as the shop's category row. */}
          <div className="mt-7 flex w-fit flex-wrap border border-stone">
            {TABS.map((t, i) => {
              const isActive = t.key === activeTab.key;
              const to = t.slug === 'all' ? '/new-featured' : `/new-featured/${t.slug}`;
              return (
                <Link
                  key={t.key}
                  to={to}
                  aria-current={isActive ? 'page' : undefined}
                  className={`min-h-[44px] px-4 font-sans text-[11px] uppercase tracking-[0.12em] transition-colors ${
                    i > 0 ? 'border-l border-stone' : ''
                  } ${
                    isActive
                      ? 'bg-ink text-cream'
                      : 'bg-transparent text-ink-muted hover:text-ink'
                  }`}
                  style={{ display: 'inline-flex', alignItems: 'center' }}
                >
                  {t.name}
                </Link>
              );
            })}
          </div>

          {activeTab.key === 'collections' && (collections ?? []).length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-stone pt-4">
              <span className="loom-label text-ink-muted">Capsules</span>
              {(collections ?? []).map((col) => (
                <Link
                  key={col.slug}
                  to={`/collections/${col.slug}`}
                  className="font-sans text-[12.5px] text-ink underline decoration-stone-strong underline-offset-4 transition-colors hover:decoration-ink"
                >
                  {col.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-[var(--container-max)] px-4 py-8 pb-24 sm:px-6 lg:px-12">
        {filteredProducts.length === 0 ? (
          <p className="max-w-[54ch] py-10 font-sans text-[14px] leading-relaxed text-ink-muted">
            Nothing is filed under this heading right now.{' '}
            <Link
              to="/shop"
              className="text-ink underline decoration-stone-strong underline-offset-4 hover:decoration-ink"
            >
              The whole catalogue
            </Link>{' '}
            is the safe place to start.
          </p>
        ) : (
          <ProductGrid products={filteredProducts} />
        )}
      </div>
    </div>
  );
};
