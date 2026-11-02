import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { useUniverses, useProducts } from '../hooks/useCatalog';
import { useFiltersStore } from '../stores/filters';

/**
 * ALL WORLDS — /worlds
 *
 * Was a four-card grid: 16–20px rounded cards with a resting shadow, a hover
 * translate, a serif name that italicised on hover, a bottom scrim over the
 * artwork, an accent bar along the image edge, a "15+" badge in serif, and a
 * rounded accent button. That is the anti-reference this system replaced —
 * and worse, the badge said "15+" when the count was exactly 15.
 *
 * Now it is the same ruled strata as the home band: one row per world, numbered
 * in mono, with its name at display size, its own line, the live count, and an
 * arrow. Each row is scoped to the world's accent so the horizon tint and the
 * hover colour come from that world and nowhere else.
 *
 * A world with nothing in stock is not rendered as a door. An "Enter
 * The Atelier — 0 pieces" row was a promise of a shop that does not exist.
 */
export const Universes: React.FC = () => {
  const { data: universes } = useUniverses();
  const { data: products } = useProducts();
  const setUniverse = useFiltersStore((state) => state.setUniverse);
  const navigate = useNavigate();

  const atelierCount = useMemo(
    () => (products ?? []).filter((p) => !p.universeSlug).length,
    [products],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of products ?? []) {
      if (!p.universeSlug) continue;
      c[p.universeSlug] = (c[p.universeSlug] ?? 0) + 1;
    }
    return c;
  }, [products]);

  const worlds = useMemo(() => {
    const list = (universes ?? [])
      .map((u) => ({
        id: u.slug,
        name: u.name,
        tagline: u.tagline,
        lore: u.lore,
        count: counts[u.slug] ?? 0,
        to: `/universes/${u.slug}`,
      }))
      .filter((w) => w.count > 0);

    if (atelierCount > 0) {
      list.push({
        id: 'atelier',
        name: 'The Atelier',
        tagline: 'The base line — craft with no theme',
        lore: 'Artisanal embroidery for its own sake: technique, textile and construction above every story.',
        count: atelierCount,
        to: '',
      });
    }
    return list;
  }, [universes, counts, atelierCount]);

  const enterAtelier = React.useCallback(() => {
    setUniverse('atelier');
    navigate('/shop');
  }, [setUniverse, navigate]);

  const totalPieces = worlds.reduce((n, w) => n + w.count, 0);

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
            <span className="text-ink">Worlds</span>
          </nav>

          <div className="mt-4 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="loom-display text-ink" style={{ fontSize: 'var(--text-display)' }}>
                Worlds to Wear
              </h1>
              <p className="mt-2 max-w-[54ch] font-sans text-[15px] leading-relaxed text-ink-muted">
                Each world is an original set of stories with its own accent,
                characters and capsule. Enter one and the collection narrows to it.
              </p>
            </div>
            <p className="shrink-0 font-sans text-[12px] text-ink-muted">
              <span className="loom-price text-[15px] text-ink">{totalPieces}</span> pieces across{' '}
              <span className="loom-price text-[15px] text-ink">{worlds.length}</span>{' '}
              {worlds.length === 1 ? 'world' : 'worlds'}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[var(--container-max)] px-4 py-10 sm:px-6 lg:px-12">
        <div className="border-t border-stone">
          {worlds.map((world) => (
            <div
              key={world.id}
              data-accent={world.id}
              className="group relative overflow-hidden border-b border-stone"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background: 'color-mix(in srgb, var(--color-accent) 7%, transparent)',
                }}
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px]"
                style={{ background: 'var(--color-accent)' }}
              />

              <Link
                to={world.to || '/shop'}
                onClick={(e) => {
                  if (!world.to) {
                    e.preventDefault();
                    enterAtelier();
                  }
                }}
                className="relative grid grid-cols-1 items-baseline gap-x-6 gap-y-3 px-1 py-6 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto_auto]"
                aria-label={`Enter ${world.name} — ${world.count} pieces`}
              >
                <h2
                  className="loom-display text-ink transition-colors group-hover:text-accent"
                  style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2.25rem)' }}
                >
                  {world.name}
                </h2>

                <div className="min-w-0">
                  <p className="font-sans text-[13px] leading-snug text-ink sm:text-sm">
                    {world.tagline}
                  </p>
                  <p className="mt-1 line-clamp-2 max-w-[64ch] font-sans text-[12.5px] leading-relaxed text-ink-muted">
                    {world.lore}
                  </p>
                </div>

                <span className="loom-label text-ink-muted">
                  {world.count} {world.count === 1 ? 'piece' : 'pieces'}
                </span>

                <span
                  aria-hidden="true"
                  className="font-sans text-lg text-ink transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent"
                >
                  →
                </span>
              </Link>
            </div>
          ))}
        </div>

        <p className="mt-6 font-sans text-[12.5px] text-ink-muted">
          Not sure which world?{' '}
          <Link
            to="/styles"
            className="text-ink underline decoration-stone-strong underline-offset-4 transition-colors hover:decoration-ink"
          >
            Browse by presence
          </Link>{' '}
          — how loudly the embroidery reads, across all of them.
        </p>
      </section>
    </div>
  );
};
