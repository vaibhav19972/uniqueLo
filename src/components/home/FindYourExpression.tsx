import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useProducts } from '../../hooks/useCatalog';
import { EXPRESSION_LEVELS, getExpressionScore, type Product } from '../../lib/data';
import { hasLicensedMark } from '../../lib/licensed-marks';
import { MarketingHeader } from '../ui/MarketingHeader';
import { useReveal } from '../../hooks/useReveal';

/**
 * THE FIVE STEPS OF PRESENCE
 *
 * Was five heavy cards: a photograph behind a bottom scrim, a red ring on the
 * selected one, an "● Active" badge, a red bar across the image, a "Shop Style
 * (11) →" solid button, and a card that only seemed to do something because it
 * moved up 4px when clicked. Clicking selected a card that linked nowhere in
 * particular; the whole interaction was decoration standing in for navigation.
 *
 * Now it is a five-column ruled index — the same row language as the worlds and
 * the technique table. Each column is a number, a name, what it means, the count
 * in stock, and one link to the filtered page. No selection state, because the
 * card's only real job is to be a door.
 *
 * The featured garment per level is drawn from the live catalogue with the
 * licensed-mark filter applied, so this rail cannot surface the one product
 * whose photograph carries a third-party mark.
 */
export const FindYourExpression: React.FC = () => {
  const revealRef = useReveal<HTMLElement>();
  const { data: products } = useProducts();

  const levels = useMemo(() => {
    const list = products ?? [];
    return EXPRESSION_LEVELS.map((level) => {
      const matching = list.filter(
        (p) => getExpressionScore(p) === level.score && !hasLicensedMark(p),
      );
      return {
        level,
        count: matching.length,
        sample: (matching[0] as Product | undefined) ?? null,
      };
    });
  }, [products]);

  if (!products) return null;

  return (
    <section
      ref={revealRef}
      className="reveal border-b border-stone bg-cream py-12 lg:py-16"
      aria-labelledby="presence-heading"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          title="How loudly it wears"
          titleId="presence-heading"
          sub="One question, five answers: quiet tonal stitch through to a fully worked panel. Every piece in the catalogue sits on exactly one of these."
          linkTo="/styles"
          linkLabel="All five levels"
        />

        <ol className="mt-8 grid grid-cols-1 border-t border-stone sm:grid-cols-2 lg:grid-cols-5 lg:border-t-0">
          {levels.map(({ level, count, sample }, i) => (
            <li
              key={level.slug}
              className={`border-b border-stone py-5 sm:px-0 lg:border-b-0 lg:border-t ${
                i > 0 ? 'lg:border-l lg:pl-5' : ''
              } ${i < levels.length - 1 ? 'lg:pr-5' : ''}`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="loom-price text-[11px] text-ink-muted">
                  {String(level.score).padStart(2, '0')}
                </span>
                <span className="loom-price text-[11px] text-ink-muted">
                  {count} {count === 1 ? 'piece' : 'pieces'}
                </span>
              </div>

              <h3 className="loom-display mt-2 text-xl text-ink">
                <Link to={`/styles/${level.slug}`} className="transition-colors hover:text-accent">
                  {level.name}
                </Link>
              </h3>

              <p className="mt-1.5 font-sans text-[12.5px] leading-relaxed text-ink-muted">
                {level.tagline}
              </p>

              {sample && (
                <p className="mt-3 font-sans text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                  <span className="text-ink-muted">eg. </span>
                  <Link
                    to={`/product/${sample.slug}`}
                    className="text-ink transition-colors hover:text-accent"
                  >
                    {sample.name}
                  </Link>
                </p>
              )}

              <Link
                to={`/styles/${level.slug}`}
                className="mt-3 inline-flex items-center gap-1 font-sans text-[11px] uppercase tracking-[0.12em] text-ink underline decoration-stone-strong underline-offset-4 transition-colors hover:decoration-ink"
              >
                {count > 0 ? `See ${count === 1 ? 'it' : 'them'}` : 'Nothing in stock'}
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
