import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useProducts, useCraftTechniques } from '../../hooks/useCatalog';
import { MarketingHeader } from '../ui/MarketingHeader';
import { useReveal } from '../../hooks/useReveal';
import { piecesInTechnique, distinctPiecesInTechniques } from '../../lib/techniques';

/**
 * PROOF — and only proof the business actually holds.
 *
 * This band used to be a testimonial wall: six quotes attributed to named
 * people ("Rhea Sharma, Student, Delhi") with a gold "verified" tick, plus a
 * stats bar reading "10,000+ happy customers" and "4.8/5 average rating".
 * Every one of those is invented. On a live storefront that is not a design
 * problem, it is a false claim about real-sounding people, and it is the one
 * thing PRODUCT.md rules out in absolute terms.
 *
 * What the business does hold is the catalogue itself: nine registered craft
 * techniques, each with a real region, a real cluster, a measured working
 * pace, and a count of how many pieces in stock are made with it. That is
 * more persuasive than a quote, and it is true. So the wall becomes the
 * technique index — the receipt for the price.
 */
export const UGCWall: React.FC = () => {
  const revealRef = useReveal<HTMLElement>();
  const { data: products } = useProducts();
  const { data: techniques } = useCraftTechniques();

  const rows = useMemo(() => {
    const list = techniques ?? [];
    if (list.length === 0) return [];

    return list
      .map((t) => ({ ...t, count: piecesInTechnique(products, t.slug).length }))
      // A technique with nothing in stock is provenance, not an offer.
      .filter((t) => t.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [techniques, products]);

  const placed = distinctPiecesInTechniques(products);

  if (rows.length === 0) return null;

  return (
    <section
      ref={revealRef}
      className="reveal border-b border-stone bg-cream py-12 lg:py-16"
      aria-labelledby="ugc-heading"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          title="Where the stitches come from"
          titleId="ugc-heading"
          sub={`${rows.length} techniques, worked in named clusters across India. ${placed} pieces are tagged with the one they were made in — a piece can carry more than one, so the column adds to more than ${placed}.`}
          linkTo="/our-craft"
          linkLabel="Read the technique notes"
        />

        {/* A catalogue table, because this is catalogue data. Technique,
            region, stitch, pace, and how many pieces are in stock — the
            buyer can price the labour against the garment. */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <caption className="sr-only">
              Registered embroidery techniques, with region, stitch type, working
              pace and number of pieces currently in stock
            </caption>
            <thead>
              <tr className="border-b border-stone-strong">
                {['Technique', 'Region', 'Stitch', 'Pace', 'In stock'].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="py-2.5 pr-6 font-sans text-[10px] font-medium uppercase tracking-[0.16em] text-ink-muted last:pr-0 last:text-right"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.slug} className="group border-b border-stone">
                  <th scope="row" className="py-4 pr-6 font-normal">
                    <Link
                      to={`/our-craft/${t.slug}`}
                      className="font-sans text-[14px] font-medium text-ink transition-colors group-hover:text-accent"
                    >
                      {t.name}
                    </Link>
                  </th>
                  <td className="py-4 pr-6 font-sans text-[13px] text-ink-muted">
                    {t.region}
                  </td>
                  <td className="py-4 pr-6 font-sans text-[13px] text-ink-muted">
                    {t.stitchType}
                  </td>
                  <td className="loom-price py-4 pr-6 text-[13px] text-ink-muted">
                    {t.artisanPace.replace(' per garment', '')}
                  </td>
                  <td className="loom-price py-4 text-right text-[13px] text-ink">
                    {t.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
