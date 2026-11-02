import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { useCraftTechnique, useProducts } from '../hooks/useCatalog';
import { formatPrice, getDefaultVariant } from '../lib/data';
import { piecesInTechnique } from '../lib/techniques';
import { firstRealImage } from '../lib/imagery';

/**
 * ONE TECHNIQUE — /our-craft/:techniqueSlug
 *
 * Was a pair of bordered cards: a serif title announcing "Generations of Needle
 * Tension", and a four-step process panel — Grid & Pattern Pinning, Wooden
 * Frame Tension, Needle Anchoring, Inspection & Soft Wash — presented as though
 * every tradition in the registry worked that way. Sashiko is a running stitch
 * worked flat; zardozi is aari-hook wirework on a frame; the monogram is a
 * satin initial worked on a hoop. One four-step process for all nine was
 * invented in the telling, so it is gone rather than restyled.
 *
 * What it carries now is what the record actually holds: the region and the
 * cluster the technique is named for, the stitch mechanism, the registry's own
 * pace range, its historical note, and — for every piece in stock — the thread,
 * the placement and the motif story that piece's own entry records.
 */
export const AtelierTechnique: React.FC = () => {
  const { techniqueSlug } = useParams<{ techniqueSlug: string }>();
  const { data: craft, isPending } = useCraftTechnique(techniqueSlug);
  const { data: products } = useProducts();

  const matching = useMemo(
    () => (techniqueSlug ? piecesInTechnique(products, techniqueSlug) : []),
    [products, techniqueSlug],
  );

  const heroSample = matching[0];
  const heroPlate = firstRealImage(
    heroSample?.embroidery?.macroImage?.src,
    heroSample?.images?.[1]?.src,
    heroSample?.images?.[0]?.src,
  );
  const heroPlateAlt =
    heroSample?.embroidery?.macroImage?.alt || heroSample?.images?.[1]?.alt || heroSample?.name || '';

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="loom-label text-ink-muted">Reading the technique record…</p>
      </div>
    );
  }

  if (!craft) {
    return (
      <div className="flex min-h-screen flex-col items-start justify-center bg-cream px-4 sm:px-6 lg:px-12">
        <p className="loom-label text-ink-muted">Not in the registry</p>
        <h1 className="loom-display mt-2 text-ink" style={{ fontSize: 'var(--text-display)' }}>
          No technique by that name
        </h1>
        <p className="mt-2 max-w-[44ch] font-sans text-[15px] leading-relaxed text-ink-muted">
          The taxonomy holds nine traditions. One of them may be what you meant.
        </p>
        <Link
          to="/our-craft"
          className="mt-6 inline-flex min-h-[48px] items-center gap-2 bg-ink px-5 font-sans text-[12px] font-medium uppercase tracking-[0.12em] text-cream transition-colors hover:bg-accent"
        >
          Back to the taxonomy
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    );
  }

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
            <Link to="/our-craft" className="transition-colors hover:text-ink">
              The craft
            </Link>
            <span aria-hidden="true" className="mx-2">
              /
            </span>
            <span className="text-ink">{craft.name}</span>
          </nav>

          <div
            className={`mt-4 grid grid-cols-1 gap-6 ${
              heroPlate ? 'lg:grid-cols-[minmax(0,1fr)_20rem]' : ''
            }`}
          >
            <div>
              <h1 className="loom-display text-ink" style={{ fontSize: 'var(--text-display)' }}>
                {craft.name}
              </h1>
              <p className="mt-2 max-w-[58ch] font-sans text-[15px] leading-relaxed text-ink-muted">
                {craft.description}
              </p>
            </div>

            {/* The registry's own `image` is a gradient placeholder on seven of
                nine techniques, so the plate is only shown when a piece worked
                in this technique supplies a real photograph. Empty plate omitted
                rather than filled with a gradient captioned as cloth. */}
            {heroPlate && (
              <div className="border border-stone bg-paper p-3">
                <img
                  src={heroPlate}
                  alt={`${heroPlateAlt} — worked in ${craft.name}`}
                  loading="lazy"
                  className="block aspect-[4/3] w-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--container-max)] px-4 py-10 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <div>
            <h2 className="loom-label text-ink-muted">The record</h2>
            <dl className="mt-3 border-t border-stone font-sans text-[13px]">
              {[
                ['Stitch', craft.stitchType],
                ['Working time', craft.artisanPace],
                ['Region', craft.region],
                ['Cluster', craft.cluster],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-stone py-2.5"
                >
                  <dt className="shrink-0 text-ink-muted">{label}</dt>
                  <dd className="text-right text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <h2 className="loom-label text-ink-muted">Provenance</h2>
            <p className="mt-3 max-w-[72ch] font-sans text-[15px] leading-relaxed text-ink">
              {craft.historicalContext}
            </p>
            <p className="mt-4 max-w-[72ch] font-sans text-[12.5px] leading-relaxed text-ink-muted">
              Working time is the range this registry records for the technique
              across the pieces it is worked on — not a guarantee for any single
              garment. Individual pieces carry their own figure on the product page.
            </p>
          </div>
        </div>

        <div className="mt-10 border-t border-stone pt-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="loom-display text-ink" style={{ fontSize: '1.75rem' }}>
                Worked in {craft.name}
              </h2>
              <p className="loom-label mt-1.5 text-ink-muted">
                {matching.length === 0
                  ? 'Nothing in stock'
                  : `${matching.length} ${matching.length === 1 ? 'piece' : 'pieces'} in stock`}
              </p>
            </div>
            {matching.length > 0 && (
              <Link
                to={`/shop?technique=${craft.slug}`}
                className="font-sans text-[12px] font-medium text-ink underline decoration-stone-strong underline-offset-4 transition-colors hover:decoration-ink"
              >
                Filter the shop to this technique →
              </Link>
            )}
          </div>

          {matching.length > 0 ? (
            // One ruled list, not a table plus a card grid of the same eight
            // pieces. Each row is the piece's own record — cloth, thread,
            // placement, hours, price — with the photograph as a plate.
            <ol className="mt-5 border-t border-stone">
              {matching.slice(0, 8).map((p) => {
                const variant = getDefaultVariant(p);
                const plate = firstRealImage(
                  p.embroidery?.macroImage?.src,
                  p.images?.[1]?.src,
                  p.images?.[0]?.src,
                );
                return (
                  <li key={p.slug} className="border-b border-stone">
                    <div className="grid grid-cols-1 items-start gap-x-5 gap-y-3 py-4 sm:grid-cols-[4.5rem_minmax(0,15rem)_minmax(0,1fr)_auto]">
                      <Link
                        to={`/product/${p.slug}`}
                        className="block w-[4.5rem] overflow-hidden border border-stone bg-paper"
                        tabIndex={-1}
                        aria-hidden="true"
                      >
                        {plate ? (
                          <img
                            src={plate}
                            alt=""
                            loading="lazy"
                            className="block h-[6rem] w-full object-cover"
                          />
                        ) : (
                          <span className="loom-label flex h-[6rem] w-full items-center justify-center bg-cream px-1 text-center text-[8px] text-ink-muted">
                            No photo
                          </span>
                        )}
                      </Link>

                      <div>
                        <h3 className="font-sans text-[14.5px] leading-snug text-ink">
                          <Link
                            to={`/product/${p.slug}`}
                            className="transition-colors hover:text-accent"
                          >
                            {p.name}
                          </Link>
                        </h3>
                        <p className="loom-price mt-1 text-[13px] text-ink">
                          {variant ? formatPrice(variant.priceCents) : '—'}
                        </p>
                        {p.embroidery?.placement?.length ? (
                          <p className="loom-label mt-1.5 text-ink-muted">
                            {p.embroidery.placement.join(' · ')}
                          </p>
                        ) : null}
                      </div>

                      <div className="min-w-0 font-sans text-[12.5px] leading-relaxed text-ink-muted">
                        <p>{p.embroidery?.motifStory || p.subtitle}</p>
                        <p className="mt-1 text-ink">
                          {p.embroidery?.threadComposition || p.material || ''}
                        </p>
                      </div>

                      <div className="shrink-0 font-sans text-[12px] text-ink-muted sm:text-right">
                        {p.embroidery?.artisanHours != null && p.embroidery.artisanHours > 0 && (
                          <span className="loom-price block text-ink">
                            {p.embroidery.artisanHours} h
                          </span>
                        )}
                        {p.fabricGsm != null && (
                          <span className="loom-price block">{p.fabricGsm} GSM</span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="mt-5 max-w-[52ch] font-sans text-[13.5px] leading-relaxed text-ink-muted">
              No piece is currently filed under this technique in the shop. The
              method is documented above so it is on the record whether or not
              there is stock behind it.
            </p>
          )}
          {matching.length > 8 && (
            <p className="mt-4 font-sans text-[12.5px] text-ink-muted">
              Eight of {matching.length} shown.{' '}
              <Link
                to={`/shop?technique=${craft.slug}`}
                className="text-ink underline decoration-stone-strong underline-offset-4 transition-colors hover:decoration-ink"
              >
                See all in the shop
              </Link>
              .
            </p>
          )}
        </div>
      </section>
    </div>
  );
};
