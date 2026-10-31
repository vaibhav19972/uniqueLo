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
          <nav aria-label="Breadcrumb" className="text-xs uppercase tracking-eyebrow text-ink-muted">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">›</span>
            <span>Styles</span>
          </nav>
          <span className="text-xs font-sans tracking-eyebrow text-accent uppercase font-medium mt-4 block">
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
              className="group bg-paper border border-stone/70 p-3.5 sm:p-7 hover:border-ink hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-4 gap-1">
                  <span className="font-sans text-xs sm:text-xs font-semibold tracking-label sm:tracking-eyebrow uppercase text-accent truncate">
                    Level {exp.score} of 5
                  </span>
                  <span className="font-sans text-xs sm:text-xs uppercase tracking-widest text-ink-muted shrink-0">
                    {counts[exp.slug] ?? 0} pieces
                  </span>
                </div>
                <h2 className="font-serif text-base sm:text-2xl lg:text-3xl text-ink group-hover:text-accent transition-colors line-clamp-1">
                  {exp.name}
                </h2>
                <p className="font-serif text-xs sm:text-sm text-ink-muted mt-1 sm:mt-1.5 line-clamp-1">{exp.tagline}</p>
                <p className="text-xs sm:text-xs text-ink-muted mt-2 sm:mt-3 font-light leading-relaxed line-clamp-2 sm:line-clamp-none">{exp.description}</p>
              </div>

              <div className="mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-stone/40 flex items-center justify-between text-xs text-ink gap-1">
                <span className="text-xs sm:text-xs font-sans text-ink-muted truncate">{exp.characteristics}</span>
                <span className="uppercase tracking-widest text-xs sm:text-xs font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 shrink-0">
                  Explore <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Styles = Expressions;
