import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useProducts } from '../../hooks/useCatalog';
import { formatPrice, getDefaultVariant, getIntensity } from '../../lib/data';
import { isMerchandisable } from '../../lib/licensed-marks';
import { MarketingHeader } from '../ui/MarketingHeader';
import { useReveal } from '../../hooks/useReveal';

/**
 * PRESENCE — how loudly a garment wears, as three pictures.
 *
 * There are five presence levels in the registry (Minimal → Maximal), and the
 * previous band listed all five as a ruled five-column index with a live count
 * on each. That was the right *index* and the wrong *shop*: five equal columns
 * say all five are equally worth your attention, and they read as taxonomy when
 * a buyer is actually asking a two-sided question — do I want to be quiet today
 * or loud?
 *
 * Home shows the two poles and the middle. Three photographs answer the
 * question in one glance, which five rows of type cannot. The full five-level
 * registry still exists at /styles and is linked from the header.
 *
 * The middle photograph is the one the reference set would have put a discount
 * badge on. Ours carries the real price of a real piece at that level instead —
 * a figure the buyer can act on, not a pressure device.
 */

const POLE = [
  {
    score: 1,
    key: 'quiet',
    label: 'Quiet',
    line: 'Tonal stitch. Noticed at arm’s length, not across a room.',
    image: 'edit-quiet',
  },
  {
    score: 3,
    key: 'balanced',
    label: 'Balanced',
    line: 'A clear story, held in measure. The centre of the catalogue.',
    image: 'edit-balanced',
  },
  {
    score: 5,
    key: 'loud',
    label: 'Loud',
    line: 'A fully worked panel. The piece you plan the outfit around.',
    image: 'edit-loud',
  },
] as const;

/**
 * Intensity is a 3-valued field on the product (`quiet | balanced | loud`);
 * presence is a 5-valued score. The counts here are read from intensity, which
 * is the field every product actually carries, so the number a buyer taps is
 * the number /shop will show them.
 */
export const PresenceTriptych: React.FC = () => {
  const revealRef = useReveal<HTMLElement>();
  const { data: products } = useProducts();

  const panes = useMemo(() => {
    const list = (products ?? []).filter(isMerchandisable);
    return POLE.map((pole) => {
      const bucket = list.filter((p) => getIntensity(p) === pole.key);
      const priced = bucket
        .map((p) => ({ p, v: getDefaultVariant(p) }))
        .filter((x) => x.v && x.v.status !== 'out-of-stock')
        .sort((a, b) => a.v!.priceCents - b.v!.priceCents);
      return {
        ...pole,
        count: bucket.length,
        from: priced[0]?.v?.priceCents ?? null,
      };
    });
  }, [products]);

  if (!products || panes.every((p) => p.count === 0)) return null;

  return (
    <section
      ref={revealRef}
      className="reveal border-b border-stone bg-cream py-12 lg:py-16"
      aria-labelledby="presence-heading"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          title="How loudly do you wear it"
          titleId="presence-heading"
          sub="Every piece sits on one of five presence levels, from a tonal crest to a fully worked panel. These are the two poles and the middle."
          linkTo="/styles"
          linkLabel="All five levels"
        />

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3 lg:gap-4">
          {panes.map((pane, i) => (
            <Link
              key={pane.key}
              to={`/shop?intensity=${pane.key}`}
              className="group relative flex flex-col overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-panel">
                <img
                  src={`/images/home/${pane.image}.jpg`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-base)] group-hover:scale-[1.035]"
                />
                {/* The level number, set in mono on a solid plate. This is the
                    one place on the page where a numeral carries the idea: the
                    scale itself is the story. */}
                <span className="absolute left-0 top-0 grid h-9 w-9 place-items-center bg-ink">
                  <span className="loom-price text-[12px] text-cream">
                    {String(i === 0 ? 1 : i === 1 ? 3 : 5).padStart(2, '0')}
                  </span>
                </span>
              </div>

              <div className="flex flex-1 items-start justify-between gap-3 pt-3">
                <div className="min-w-0">
                  <h3 className="loom-display text-[1.125rem] text-ink transition-colors group-hover:text-accent">
                    {pane.label}
                  </h3>
                  <p className="mt-1 max-w-[34ch] font-sans text-[12.5px] leading-snug text-ink-muted">
                    {pane.line}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="loom-price text-[11px] text-ink-muted">
                    {pane.count} {pane.count === 1 ? 'piece' : 'pieces'}
                  </p>
                  {pane.from != null && (
                    <p className="loom-price mt-0.5 text-[11px] text-ink">
                      from {formatPrice(pane.from)}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
