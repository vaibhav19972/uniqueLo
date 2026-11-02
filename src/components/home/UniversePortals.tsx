import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router';
import { useUniverses, useProducts } from '../../hooks/useCatalog';
import { useFiltersStore } from '../../stores/filters';
import { MarketingHeader } from '../ui/MarketingHeader';
import { useReveal } from '../../hooks/useReveal';

/**
 * WORLD SYSTEMS AS WORLDS
 *
 * A universe used to be a card that changed its button colour. That is a
 * sticker, not a place. This band renders each world as a *stratum*: a
 * full-width band whose ground is derived from its own accent — a field you
 * stand in, not a chip you click.
 *
 * The cyclorama discipline transferred here is the one that matters: every
 * world carries a named state in text as well as its colour, because colour
 * is never the only signal — four worlds, and a colour-blind buyer must
 * still be able to read the difference. That is the entire job of the
 * product-count and the tagline line.
 */
export const UniversePortals: React.FC = () => {
  const revealRef = useReveal<HTMLElement>();
  const { data: universes } = useUniverses();
  const { data: products } = useProducts();
  const setUniverse = useFiltersStore((state) => state.setUniverse);
  const navigate = useNavigate();

  const atelierCount = useMemo(
    () => (products ?? []).filter((p) => !p.universeSlug).length,
    [products],
  );

  const enterAtelier = React.useCallback(() => {
    setUniverse('atelier');
    navigate('/shop');
  }, [setUniverse, navigate]);

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
        count: counts[u.slug] ?? 0,
        to: `/universes/${u.slug}`,
      }))
      // A world with nothing in it is not a door. The row used to render
      // "The Atelier — 0 pieces", a live link into an empty shop.
      .filter((w) => w.count > 0);

    if (atelierCount > 0) {
      list.push({
        id: 'atelier',
        name: 'The Atelier',
        tagline: 'The base line. Pure craftsmanship, no theme.',
        count: atelierCount,
        to: '',
      });
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [universes, counts, atelierCount]);

  return (
    <section
      ref={revealRef}
      className="reveal border-b border-stone bg-cream py-12 lg:py-16"
      aria-labelledby="universes-heading"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          title="Worlds to Wear"
          titleId="universes-heading"
          sub="Each world is an original set of stories with its own palette and capsule. Enter one and the catalogue narrows to it."
          linkTo="/worlds"
          linkLabel="All worlds"
        />

        {/* The strata. Each band is its own accent scope, so the ground, the
            rule and the action all resolve from that world's hue without a
            second palette being declared anywhere. */}
        <div className="mt-6 border-t border-stone">
          {worlds.map((world) => (
            <div
              key={world.id}
              data-accent={world.id}
              className="group relative overflow-hidden border-b border-stone"
            >
              {/* The horizon: one 3px rule at full strength along the row's
                  bottom edge, plus a flat 7% tint of the world's own hue over
                  the whole row. There was also a 3px bar at the row's left
                  edge; it was removed because a coloured left border on a list
                  item is a refused pattern, and the bottom rule plus the
                  world's name in words already carry the same information.
                  The full-height 22% gradient this replaced turned all three
                  wine-family universes into the same pink slab, so the colour
                  distinguished nothing. At full strength on a 3px line, sakura
                  rose, courage crimson and darbar wine are three different
                  colours, and the name in words beside them carries the meaning
                  for anyone who cannot see the hue. */}
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
                className="relative flex flex-wrap items-center gap-x-6 gap-y-2 px-1 py-5 transition-colors sm:flex-nowrap sm:py-6"
                aria-label={`Enter ${world.name} — ${world.count} pieces`}
              >
                <h3 className="loom-display shrink-0 text-ink transition-colors group-hover:text-accent" style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2.25rem)' }}>
                  {world.name}
                </h3>

                <p className="min-w-0 flex-1 font-sans text-[13px] leading-snug text-ink-muted sm:text-sm">
                  {world.tagline}
                </p>

                <span className="loom-label shrink-0 text-ink-muted">
                  {world.count} {world.count === 1 ? 'piece' : 'pieces'}
                </span>

                <span
                  aria-hidden="true"
                  className="shrink-0 font-sans text-lg text-ink transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accent"
                >
                  →
                </span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
