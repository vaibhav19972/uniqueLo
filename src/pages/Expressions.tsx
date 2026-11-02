import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useExpressions, useProducts } from '../hooks/useCatalog';
import { getExpressionScore } from '../lib/data';
import { hasLicensedMark } from '../lib/licensed-marks';

/**
 * HOW LOUDLY IT WEARS — /styles
 *
 * Was a card grid: an accent kicker reading "The Signature Discovery Axis"
 * above a serif heading, six cards with a resting border that added a shadow
 * on hover, a bottom scrim and an accent bar over each photograph, and copy
 * promising "couture 40-hour relief" — a figure the technique registry
 * contradicts (it runs 6–34 hours).
 *
 * Now: the same five-column ruled index the home page uses, one row per level,
 * with the live count computed from the catalogue and one piece named as an
 * example. No cards, no shadow, no scrim, no invented hours.
 */
export const Expressions: React.FC = () => {
  const { data: expressions } = useExpressions();
  const { data: products } = useProducts();

  const levels = useMemo(() => {
    const list = (products ?? []).filter((p) => !hasLicensedMark(p));
    return (expressions ?? [])
      .slice()
      .sort((a, b) => a.score - b.score)
      .map((exp) => {
        const matching = list.filter((p) => getExpressionScore(p) === exp.score);
        return { exp, count: matching.length, sample: matching[0] ?? null };
      });
  }, [expressions, products]);

  const totalPieces = levels.reduce((n, l) => n + l.count, 0);

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
            <span className="text-ink">Presence</span>
          </nav>

          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="loom-display text-ink" style={{ fontSize: 'var(--text-display)' }}>
                How loudly it wears
              </h1>
              <p className="mt-2 max-w-[56ch] font-sans text-[15px] leading-relaxed text-ink-muted">
                One question, five answers: how much of the garment the
                embroidery takes. Every piece in the catalogue sits on exactly
                one of these levels, whatever world it belongs to.
              </p>
            </div>
            <p className="shrink-0 font-sans text-[12px] text-ink-muted">
              <span className="loom-price text-[15px] text-ink">{totalPieces}</span> pieces
              placed across five levels
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--container-max)] px-4 py-10 sm:px-6 lg:px-12">
        <ol className="border-t border-stone">
          {levels.map(({ exp, count, sample }) => (
            <li key={exp.slug} className="border-b border-stone">
              <div className="grid grid-cols-1 items-start gap-x-6 gap-y-3 py-6 sm:grid-cols-[2rem_minmax(0,12rem)_minmax(0,1fr)_minmax(0,16rem)_auto]">
                <span className="loom-price pt-1 text-[11px] text-ink-muted">
                  {String(exp.score).padStart(2, '0')}
                </span>

                <div>
                  <h2 className="loom-display text-ink" style={{ fontSize: '1.5rem' }}>
                    <Link to={`/styles/${exp.slug}`} className="transition-colors hover:text-accent">
                      {exp.name}
                    </Link>
                  </h2>
                  <p className="loom-label mt-1 text-ink-muted">
                    {count} {count === 1 ? 'piece' : 'pieces'}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="font-sans text-[14px] leading-snug text-ink">{exp.tagline}</p>
                  <p className="mt-1.5 max-w-[62ch] font-sans text-[12.5px] leading-relaxed text-ink-muted">
                    {exp.description}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="loom-label text-ink-muted">Reads as</p>
                  <p className="mt-1 font-sans text-[12.5px] leading-relaxed text-ink">
                    {exp.characteristics}
                  </p>
                  {sample && (
                    <p className="mt-2 font-sans text-[12px] text-ink-muted">
                      eg.{' '}
                      <Link
                        to={`/product/${sample.slug}`}
                        className="text-ink transition-colors hover:text-accent"
                      >
                        {sample.name}
                      </Link>
                    </p>
                  )}
                </div>

                <Link
                  to={`/styles/${exp.slug}`}
                  className="inline-flex items-center gap-1.5 self-start font-sans text-[12px] font-medium text-ink underline decoration-stone-strong underline-offset-4 transition-colors hover:decoration-ink"
                >
                  {count > 0 ? `See ${count === 1 ? 'it' : 'them'}` : 'Nothing in stock'}
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-6 max-w-[70ch] font-sans text-[12.5px] leading-relaxed text-ink-muted">
          Presence is independent of world: an Animeverse piece can be Minimal
          and an Atelier piece can be Maximalist. Use it when you know how much
          you want the garment to say, but not yet which world it should come from.
        </p>
      </section>
    </div>
  );
};

export const Styles = Expressions;
