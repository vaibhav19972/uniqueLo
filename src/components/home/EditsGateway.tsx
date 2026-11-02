import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { useProducts } from '../../hooks/useCatalog';
import { useFiltersStore } from '../../stores/filters';
import { EDITS, type EditSlug } from '../../lib/data';
import { MarketingHeader } from '../ui/MarketingHeader';
import { useReveal } from '../../hooks/useReveal';

/**
 * Explore by Edit — curated shoppable collections (buyer intent promoted).
 * Registry-driven from src/data/edits.json; counts computed from the catalog.
 */
const EDIT_IMAGE: Record<EditSlug, string> = {
  everyday: '/images/edits/everyday.jpg',
  statement: '/images/edits/statement.jpg',
  heritage: '/images/edits/heritage.jpg',
  'festive-gifting': '/images/edits/festive-gifting.jpg',
  comfort: '/images/edits/comfort.jpg',
  collector: '/images/edits/collector.jpg',
};

export const EditsGateway: React.FC = () => {
  const revealRef = useReveal<HTMLElement>();
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
    <section
      ref={revealRef}
      className="reveal border-b border-stone bg-cream py-12 lg:py-16"
      aria-labelledby="edits-heading"
    >
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          title="Explore by Edit"
          titleId="edits-heading"
          sub="Curated collections across every universe — the craft stays constant."
          linkTo="/shop"
          linkLabel="View all edits"
        />

        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:gap-x-6 xl:grid-cols-4">
          {featured.map((e) => (
            <article
              key={e.slug}
              className="group relative overflow-hidden text-left"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-paper">
                <img
                  src={EDIT_IMAGE[e.slug]}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[500ms] ease-[var(--ease-base)] group-hover:scale-[1.03]"
                />
              </div>

              {/* Name and count beneath the photograph, like every other card
                  in this world. The old version printed the title inside a
                  dark scrim on the image, which is the pattern this redesign
                  exists to remove. */}
              <div className="mt-2.5 flex items-baseline justify-between gap-2">
                <h3 className="font-sans text-[13px] font-medium text-ink transition-colors group-hover:text-accent">
                  {e.title}
                </h3>
                <span className="loom-price shrink-0 text-[11px] text-ink-muted">
                  {counts[e.slug] ?? 0}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-1 font-sans text-[12px] text-ink-muted">
                {e.tagline}
              </p>

              {/* Stretched link: whole card clickable, heading stays in flow */}
              <Link
                to="/shop"
                onClick={(ev) => {
                  ev.preventDefault();
                  explore(e.slug);
                }}
                aria-label={`Explore ${e.title} — ${counts[e.slug] ?? 0} pieces`}
                className="absolute inset-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};