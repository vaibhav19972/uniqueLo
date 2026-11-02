import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useGarments, useProducts } from '../hooks/useCatalog';
import { hasLicensedMark } from '../lib/licensed-marks';

/**
 * CLOTHING — /clothing
 *
 * Was a grid of 4:5 cards, each with a scrimmed photograph, an accent bar along
 * its bottom edge, a zoom-on-hover image, and alt text reading "— placeholder
 * campaign art" on a live storefront. The piece count was printed as a badge
 * and every garment type was rendered whether or not anything was in stock.
 *
 * Now: a catalogue table of the fabric terms the buyer actually shops by —
 * garment, category, what it is, how many are in stock — because this page's
 * job is to answer "do you have a shirt" in one scan, not to be a gallery.
 * Types with nothing in stock are omitted rather than shown as dead doors.
 */
export const Garments: React.FC = () => {
  const { data: garments } = useGarments();
  const { data: products } = useProducts();

  const rows = useMemo(() => {
    const list = (products ?? []).filter((p) => !hasLicensedMark(p));
    return (garments ?? [])
      .map((g) => ({
        ...g,
        count: list.filter((p) => p.garmentType === g.slug).length,
      }))
      .filter((g) => g.count > 0)
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [garments, products]);

  const totalPieces = rows.reduce((n, r) => n + r.count, 0);

  return (
    <div className="min-h-screen w-full bg-cream">
      <section className="border-b border-stone bg-cream pb-8 pt-10">
        <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
          <nav aria-label="Breadcrumb" className="loom-label text-ink-muted">
            <Link to="/" className="transition-colors hover:text-ink">
              Home
            </Link>
            <span aria-hidden="true" className="mx-2">
              /
            </span>
            <span className="text-ink">Clothing</span>
          </nav>

          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="loom-display text-ink" style={{ fontSize: 'var(--text-display)' }}>
                Shop by garment
              </h1>
              <p className="mt-2 max-w-[54ch] font-sans text-[15px] leading-relaxed text-ink-muted">
                What the thing is, rather than which world it comes from. Every
                garment type currently in stock, in every world.
              </p>
            </div>
            <p className="shrink-0 font-sans text-[12px] text-ink-muted">
              <span className="loom-price text-[15px] text-ink">{totalPieces}</span> pieces
              across {rows.length} {rows.length === 1 ? 'type' : 'types'}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--container-max)] px-4 py-10 sm:px-6 lg:px-12">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">
            Garment types in stock, with category, description and number of pieces
          </caption>
          <thead>
            <tr className="border-b border-stone-strong">
              {['Garment', 'Category', 'What it is', 'In stock'].map((h) => (
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
            {rows.map((g) => (
              <tr key={g.slug} className="group border-b border-stone">
                <th scope="row" className="py-4 pr-6 font-normal">
                  <Link
                    to={`/clothing/${g.slug}`}
                    className="loom-display text-ink transition-colors group-hover:text-accent"
                    style={{ fontSize: '1.25rem' }}
                  >
                    {g.name}
                  </Link>
                </th>
                <td className="py-4 pr-6 font-sans text-[13px] uppercase tracking-[0.08em] text-ink-muted">
                  {g.categorySlug}
                </td>
                <td className="max-w-[52ch] py-4 pr-6 font-sans text-[13px] leading-relaxed text-ink-muted">
                  {g.description}
                </td>
                <td className="py-4 text-right">
                  <Link
                    to={`/clothing/${g.slug}`}
                    className="loom-price text-[13px] text-ink transition-colors hover:text-accent"
                    aria-label={`${g.count} ${g.name} in stock`}
                  >
                    {g.count} →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-6 font-sans text-[12.5px] text-ink-muted">
          Prefer to browse by mood?{' '}
          <Link
            to="/styles"
            className="text-ink underline decoration-stone-strong underline-offset-4 transition-colors hover:decoration-ink"
          >
            How loudly it wears
          </Link>{' '}
          sorts the same catalogue by how much of the garment the embroidery takes.
        </p>
      </section>
    </div>
  );
};
