import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useArtStyles, useProducts } from '../hooks/useCatalog';

/**
 * Art styles index — /styles (the Style door: genre art direction).
 */
export const Styles: React.FC = () => {
  const { data: styles } = useArtStyles();
  const { data: products } = useProducts();

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of products ?? []) {
      if (!p.artStyleSlug) continue;
      c[p.artStyleSlug] = (c[p.artStyleSlug] ?? 0) + 1;
    }
    return c;
  }, [products]);

  return (
    <div className="w-full bg-cream min-h-screen">
      <section className="bg-paper border-b border-stone/50">
        <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-12">
          <nav aria-label="Breadcrumb" className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2">›</span>
            <span>Art Styles</span>
          </nav>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink mt-3 tracking-tight">
            Shop by Art Style
          </h1>
          <p className="text-sm text-ink-muted mt-3 max-w-2xl font-light">
            How the world is drawn — woodblock line, comic burst, court miniature. Stitch craft stays constant.
          </p>
        </div>
      </section>
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {(styles ?? []).map((s) => (
          <Link
            key={s.slug}
            to={`/styles/${s.slug}`}
            className="group bg-paper border border-stone/70 p-6 hover:border-ink transition-colors"
          >
            <h2 className="font-serif text-2xl text-ink group-hover:text-accent transition-colors">{s.name}</h2>
            <p className="font-serif italic text-sm text-ink-muted mt-1">{s.tagline}</p>
            <p className="text-xs text-ink-muted mt-2 font-light">{s.description}</p>
            <span className="inline-flex items-center gap-1.5 mt-4 text-[11px] uppercase tracking-widest text-ink font-medium">
              {counts[s.slug] ?? 0} pieces <span aria-hidden="true">→</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
