import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useExpressions, useProducts } from '../hooks/useCatalog';
import { getExpressionScore } from '../lib/data';

/**
 * Styles index — /styles (with backward-compatible /expression support).
 * The signature discovery system: discover by embroidery intensity and visual style.
 */
export const Expressions: React.FC = () => {
  const { data: expressions } = useExpressions();
  const { data: products } = useProducts();

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of products ?? []) {
      const score = getExpressionScore(p);
      const matched = (expressions ?? []).find((e) => e.score === score);
      if (matched) {
        c[matched.slug] = (c[matched.slug] ?? 0) + 1;
      }
    }
    return c;
  }, [products, expressions]);

  return (
    <div className="w-full bg-cream min-h-screen">
      <section className="bg-paper border-b border-stone/50">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-12 lg:py-16">
          <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">›</span>
            <span>Styles</span>
          </nav>
          <span className="text-[11px] font-sans tracking-[0.25em] text-accent uppercase font-medium mt-4 block">
            The Signature Discovery Axis
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink mt-2 tracking-tight">
            Discover by Style
          </h1>
          <p className="text-sm sm:text-base text-ink-muted mt-3 max-w-2xl font-light leading-relaxed">
            Choose how prominent, understated, or elaborate you want your needlework to be.
            From discreet tonal crests to couture 40-hour relief, every piece is calibrated across our 5 signature needlework styles.
          </p>
        </div>
      </section>

      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-12 space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(expressions ?? []).map((exp) => (
            <Link
              key={exp.slug}
              to={`/styles/${exp.slug}`}
              className="group flex flex-col justify-between overflow-hidden border border-stone bg-paper transition-all hover:border-accent hover:shadow-lg"
            >
              {exp.image && (
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-stone/20">
                  <img
                    src={exp.image}
                    alt={`${exp.name} — placeholder campaign art`}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="scrim-bottom-soft absolute inset-x-0 bottom-0 h-1/2" aria-hidden="true" />
                  <span className="absolute inset-x-0 bottom-0 h-1 bg-accent" aria-hidden="true" />
                </div>
              )}
              <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-7">
                <div>
                  <div className="mb-2 flex items-center justify-between gap-1 sm:mb-4">
                    <span className="truncate font-sans text-[9px] font-semibold uppercase tracking-[0.15em] text-accent sm:text-[11px] sm:tracking-[0.2em]">
                      Level {exp.score} of 5
                    </span>
                    <span className="shrink-0 font-sans text-[9px] uppercase tracking-widest text-ink-muted sm:text-[10px]">
                      {counts[exp.slug] ?? 0} pieces
                    </span>
                  </div>
                  <h2 className="line-clamp-1 font-serif text-base text-ink transition-colors group-hover:text-accent sm:text-2xl lg:text-3xl">
                    {exp.name}
                  </h2>
                  <p className="mt-1 line-clamp-1 font-sans text-xs text-ink-muted sm:mt-1.5 sm:text-sm">{exp.tagline}</p>
                  <p className="mt-2 line-clamp-2 font-sans text-[11px] leading-relaxed text-ink-muted sm:mt-3 sm:line-clamp-none sm:text-xs">{exp.description}</p>
                </div>

                <div className="mt-3 flex items-center justify-between gap-1 border-t border-stone/40 pt-3 text-xs text-ink sm:mt-6 sm:pt-4">
                  <span className="truncate font-sans text-[10px] text-ink-muted sm:text-[11px]">{exp.characteristics}</span>
                  <span className="inline-flex shrink-0 items-center gap-1 font-sans text-[10px] font-medium uppercase tracking-widest transition-transform group-hover:translate-x-1 sm:text-[11px]">
                    Explore <span aria-hidden="true">→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Styles = Expressions;
