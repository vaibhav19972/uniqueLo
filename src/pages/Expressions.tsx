import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useExpressions, useProducts } from '../hooks/useCatalog';
import { getExpressionScore } from '../lib/data';

/**
 * Expression index — /expression.
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
            <span>Expression</span>
          </nav>
          <span className="text-[11px] font-sans tracking-[0.25em] text-accent uppercase font-medium mt-4 block">
            The Signature Discovery Axis
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink mt-2 tracking-tight">
            Find Your Expression
          </h1>
          <p className="text-sm sm:text-base text-ink-muted mt-3 max-w-2xl font-light leading-relaxed">
            Choose how prominent, understated, or elaborate you want your needlework to be.
            From discreet tonal crests to couture 40-hour relief, every piece is calibrated on our 5-level embroidery scale.
          </p>
        </div>
      </section>

      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-12 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(expressions ?? []).map((exp) => (
            <Link
              key={exp.slug}
              to={`/expression/${exp.slug}`}
              className="group bg-paper border border-stone/70 p-7 hover:border-ink hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-accent">
                    Level {exp.score} of 5
                  </span>
                  <span className="font-sans text-[10px] uppercase tracking-widest text-ink-muted">
                    {counts[exp.slug] ?? 0} pieces
                  </span>
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl text-ink group-hover:text-accent transition-colors">
                  {exp.name}
                </h2>
                <p className="font-serif italic text-sm text-ink-muted mt-1.5">{exp.tagline}</p>
                <p className="text-xs text-ink-muted mt-3 font-light leading-relaxed">{exp.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-stone/40 flex items-center justify-between text-xs text-ink">
                <span className="text-[11px] font-sans text-ink-muted">{exp.characteristics}</span>
                <span className="uppercase tracking-widest text-[11px] font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
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
