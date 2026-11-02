import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useProducts, useGarments } from '../../hooks/useCatalog';
import { MarketingHeader } from '../ui/MarketingHeader';
import { useReveal } from '../../hooks/useReveal';

/**
 * BROWSE BY GARMENT
 *
 * The old band hard-coded six silhouette doors, two of which pointed at
 * catalogues that do not exist: "Atelier Jackets — 0 DESIGNS" and
 * "Knitwear & Cardigans — 0 DESIGNS", rendered as full-size cards with
 * photography and a call to action. Two dead ends in the middle of a
 * storefront is the most expensive kind of honesty failure — it is not a
 * broken link, it is a promise with nothing behind it.
 *
 * This version reads the live catalogue. A garment type appears only if it
 * has stock, and the row is ordered by how much of it there is, so the doors
 * a buyer can actually walk through come first and none of them is empty.
 */
export const ShopByGarment: React.FC = () => {
  const revealRef = useReveal<HTMLElement>();
  const { data: allProducts } = useProducts();
  const { data: garments } = useGarments();

  const doors = useMemo(() => {
    const products = allProducts ?? [];
    if (products.length === 0) return [];

    // Group the live catalogue by garment type.
    const counts = new Map<string, number>();
    for (const p of products) {
      if (!p.garmentType) continue;
      counts.set(p.garmentType, (counts.get(p.garmentType) ?? 0) + 1);
    }

    // Resolve names and artwork from the registry where it exists, and fall
    // back to the catalogue's own label so an unregistered type still shows.
    const registry = new Map((garments ?? []).map((g) => [g.slug, g]));

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([slug, count]) => {
        const reg = registry.get(slug);
        return {
          slug,
          name: reg?.name ?? slug.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
          count,
          image: reg?.image ?? `/images/garments/${slug}.jpg`,
        };
      });
  }, [allProducts, garments]);

  if (doors.length === 0) return null;

  return (
    <section
      ref={revealRef}
      className="reveal border-b border-stone bg-cream py-12 lg:py-16"
      aria-labelledby="garments-gateway-heading"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          title="Shop by Garment"
          titleId="garments-gateway-heading"
          sub="Start from the shape you already wear, then choose the world it belongs to."
          linkTo="/clothing"
          linkLabel="All silhouettes"
        />

        {/* A ruled index, not a card wall. Each door is a photograph at a
            fixed 4:5 crop with its name and live count beneath it — the same
            grammar as a product card, so the page has one card idea. */}
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-6">
          {doors.map((door) => (
            <Link
              key={door.slug}
              to={`/clothing/${door.slug}`}
              className="group flex flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-paper">
                <img
                  src={door.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[500ms] ease-[var(--ease-base)] group-hover:scale-[1.03]"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
                  }}
                />
              </div>
              <div className="mt-2.5 flex items-baseline justify-between gap-2">
                <h3 className="font-sans text-[13px] font-medium capitalize leading-snug text-ink transition-colors group-hover:text-accent">
                  {door.name}
                </h3>
                <span className="loom-price shrink-0 text-[11px] text-ink-muted">
                  {door.count}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
