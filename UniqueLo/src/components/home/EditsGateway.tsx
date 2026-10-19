import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { useProducts } from '../../hooks/useCatalog';
import { useFiltersStore } from '../../stores/filters';
import { EDITS, type EditSlug } from '../../lib/data';
import { MarketingHeader } from '../ui/MarketingHeader';

/**
 * Explore by Edit — curated shoppable collections (buyer intent promoted).
 * Registry-driven from src/data/edits.json; counts computed from the catalog.
 */
const EDIT_IMAGE: Record<EditSlug, string> = {
  everyday: '/images/campaigns/editorial-split.jpg',
  statement: '/images/campaigns/hero.jpg',
  heritage: '/images/campaigns/atelier-craft.jpg',
  'festive-gifting': '/images/campaigns/lookbook-01.jpg',
  comfort: '/images/campaigns/lookbook-02.jpg',
  collector: '/images/campaigns/lookbook-03.jpg',
};

export const EditsGateway: React.FC = () => {
  const { data: products } = useProducts();
  const setEdit = useFiltersStore((state) => state.setEdit);
  const navigate = useNavigate();

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of products ?? []) {
      for (const e of p.edits ?? []) c[e] = (c[e] ?? 0) + 1;
    }
    return c;
  }, [products]);

  const explore = (edit: EditSlug) => {
    setEdit(edit);
    navigate('/shop');
  };

  const featured = EDITS.filter((e) => e.featured);

  return (
    <section aria-labelledby="edits-heading" className="bg-cream py-16 lg:py-24">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          eyebrow="Shop by intent"
          title="Explore by Edit"
          titleId="edits-heading"
          sub="Curated collections across every universe — the craft stays constant."
          linkTo="/shop"
          linkLabel="View all edits"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 py-4">
          {featured.map((e) => (
            <article
              key={e.slug}
              className="group relative rounded-2xl overflow-hidden text-left transition-all duration-300 hover:z-10 hover:scale-[1.03] hover:ring-2 hover:ring-gold"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-stone/30">
                <img
                  src={EDIT_IMAGE[e.slug]}
                  alt={`${e.title} — ${e.tagline}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-cream">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-[22px] leading-tight">{e.title}</h3>
                      <p className="font-serif italic text-[15px] text-cream/85 mt-1">{e.tagline}</p>
                    </div>
                    <span className="text-right leading-none shrink-0">
                      <span className="block font-serif text-xl">{counts[e.slug] ?? 0}</span>
                      <span className="block font-sans text-[9px] uppercase tracking-widest text-cream/80 mt-1">
                        Styles
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              {/* Stretched link: whole card clickable, heading stays in flow */}
              <Link
                to="/shop"
                onClick={(ev) => {
                  ev.preventDefault();
                  explore(e.slug);
                }}
                aria-label={`Explore ${e.title}`}
                className="absolute inset-0 rounded-2xl focus-visible:outline focus-visible:outline-accent"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};