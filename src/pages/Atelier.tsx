import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useCraftTechniques, useProducts } from '../hooks/useCatalog';
import { piecesInTechnique, distinctPiecesInTechniques } from '../lib/techniques';


/**
 * THE CRAFT — /our-craft
 *
 * Was the retired world in its most confident form: an archetype="statement"
 * header, a serif title, three `rounded-full` accent-dot bullets, and then nine
 * rows whose photograph sat under a `bg-gradient-to-t from-ink/70` scrim with an
 * "EXPLORE GUILD →" chip pinned to it, a `shadow-sm` plate that grew a
 * `shadow-lg` on hover, and a serif name that turned accent on hover.
 *
 * The bullets also carried three claims this catalogue cannot support:
 *
 *  · "6 Verifiable Craft Guilds" — the registry holds nine techniques.
 *  · "14 to 34 Hand Needle Hours Per Piece" — the registry's own pace figures
 *    run 6–34 hours, and the product records run lower still.
 *  · "100% Natural Yarns (Mulberry Silk, Zari, Ringspun Cotton)" — true of some
 *    pieces, not of the range; zari is metallic, not a natural yarn.
 *
 * Now: the same ruled index as /worlds and /styles — a mono numeral, the name
 * at display size, the stitch mechanism, the region and cluster, the registry's
 * own pace for that technique, and the live count of pieces in the shop. No
 * card, no scrim, no chip, no hover shadow. The photograph is a small plate on
 * paper, framed by a hairline, the way every other raster in this world sits.
 */
export const Atelier: React.FC = () => {
  const { data: techniques } = useCraftTechniques();
  const { data: products } = useProducts();

  const rows = useMemo(
    () =>
      (techniques ?? []).map((craft) => {
        const matching = piecesInTechnique(products, craft.slug);
        return { craft, count: matching.length, sample: matching[0] ?? null };
      }),
    [techniques, products],
  );

  const inProduction = rows.filter((r) => r.count > 0).length;
  // A piece can carry more than one technique, so the row counts add up to more
  // than the catalogue. The head states distinct pieces.
  const placedPieces = useMemo(() => distinctPiecesInTechniques(products), [products]);

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
            <span className="text-ink">The craft</span>
          </nav>

          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="loom-display text-ink" style={{ fontSize: 'var(--text-display)' }}>
                The Indian craft taxonomy
              </h1>
              <p className="mt-2 max-w-[58ch] font-sans text-[15px] leading-relaxed text-ink-muted">
                Nine needlecraft traditions, named for the region they come from
                and the stitch that carries them. Each piece in the shop is filed
                under the technique it was actually worked in — the record, not a
                mood.
              </p>
            </div>
            <p className="shrink-0 font-sans text-[12px] text-ink-muted">
              <span className="loom-price text-[15px] text-ink">{inProduction}</span> techniques in
              production, <span className="loom-price text-[15px] text-ink">{placedPieces}</span>{' '}
              pieces placed
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--container-max)] px-4 py-10 sm:px-6 lg:px-12">
        <ol className="border-t border-stone">
          {rows.map(({ craft, count, sample }, i) => (
            // No plate on these rows. The registry's `image` is a gradient on
            // seven of nine techniques, and the catalogue photography it would
            // fall back to is garment-on-cream — cropped to a 3.5rem square it
            // reads as an empty cell, not as cloth. /worlds and /styles are
            // type-only indexes for the same reason; the photograph of a
            // technique belongs at the scale the detail page gives it.
            <li key={craft.slug} className="border-b border-stone">
              <div className="grid grid-cols-[2rem_minmax(0,1fr)] items-start gap-x-4 gap-y-3 py-6 sm:grid-cols-[2rem_minmax(0,15rem)_minmax(0,1fr)_auto] sm:gap-x-6 sm:gap-y-4">
                <span className="loom-price pt-1 text-[11px] text-ink-muted">
                  {String(i + 1).padStart(2, '0')}
                </span>

                <div>
                  <h2 className="loom-display text-ink" style={{ fontSize: '1.5rem' }}>
                    <Link
                      to={`/our-craft/${craft.slug}`}
                      className="transition-colors hover:text-accent"
                    >
                      {craft.name}
                    </Link>
                  </h2>
                  <p className="loom-label mt-1.5 text-ink-muted">{craft.region}</p>
                  <p className="mt-0.5 font-sans text-[12px] text-ink-muted">{craft.cluster}</p>
                </div>

                <div className="col-span-2 min-w-0 sm:col-span-1">
                  <p className="font-sans text-[14px] leading-snug text-ink">{craft.stitchType}</p>
                  <p className="mt-1 max-w-[62ch] font-sans text-[12.5px] leading-relaxed text-ink-muted">
                    {craft.description}
                  </p>
                </div>

                <div className="col-span-2 flex shrink-0 flex-col gap-1.5 sm:col-span-1 sm:items-end sm:text-right">
                  <span className="loom-price text-[12px] text-ink">{craft.artisanPace}</span>
                  <span className="loom-label text-ink-muted">
                    {count === 0 ? 'Not in stock' : `${count} ${count === 1 ? 'piece' : 'pieces'}`}
                  </span>
                  {sample && count > 0 ? (
                    <Link
                      to={`/product/${sample.slug}`}
                      className="font-sans text-[12px] text-ink-muted transition-colors hover:text-ink"
                    >
                      eg. {sample.name}
                    </Link>
                  ) : (
                    <Link
                      to={`/our-craft/${craft.slug}`}
                      className="font-sans text-[12px] text-ink underline decoration-stone-strong underline-offset-4 transition-colors hover:decoration-ink"
                    >
                      Read the method →
                    </Link>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-6 max-w-[70ch] font-sans text-[12.5px] leading-relaxed text-ink-muted">
          Working time is the registry's range for that technique, not a promise
          about any single garment. A piece that is not in stock is still
          documented — the method does not change with the season.
        </p>
      </section>
    </div>
  );
};
