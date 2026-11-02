import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useProducts } from '../../hooks/useCatalog';
import { formatPrice, getDefaultVariant, type Product } from '../../lib/data';
import { catalogMrp } from '../../lib/pricing';
import { hasLicensedMark } from '../../lib/licensed-marks';
import { cutoutFor } from '../../lib/imagery';
import { Image } from '../ui/Image';

/**
 * THE FIRST VIEWPORT
 *
 * One garment, one real price, one action. The old hero was a four-slide
 * campaign carousel: a dark scrim, an overlaid marketing headline, four
 * dots, and no price anywhere in the first two screens. It asked a buyer to
 * be impressed before it told them what anything cost.
 *
 * This one is built as a garment label. The photograph sits directly on the
 * cotton ground — no scrim, no card, no border — and its label runs beneath
 * it like the woven tape inside a collar: name, technique, price with the
 * honest strike-through. The left column carries the brand line and the one
 * sentence that matters (that this is embroidered, that it starts at ₹899).
 *
 * The hero is a single garment chosen from the live catalog, not a curated
 * campaign image, so the price and the photograph can never disagree with
 * the catalog. If the catalog fails to load, the block still renders its
 * words and a link into /shop — it never waits on a fetch to become legible.
 */
export const HeroStage: React.FC = () => {
  const { data: products } = useProducts();

  const hero = useMemo<Product | undefined>(() => {
    const list = products ?? [];
    if (list.length === 0) return undefined;

    // Some in-repo image paths are tonal placeholder blocks, not photography.
    // The hero must be a real garment shot or nothing — a striped gradient in
    // the first viewport reads as a broken site, not as a pending shoot.
    const hasPhoto = (p: Product) => {
      const src = p.images?.[0]?.src ?? '';
      return src.startsWith('http') && !src.includes('placeholder');
    };

    const candidates = list.filter((p) => hasPhoto(p) && !hasLicensedMark(p));
    const pool = candidates.length > 0 ? candidates : list.filter(hasPhoto);

    // A piece with a backdropless cut-out goes first: it is the only kind that
    // can sit directly on the cotton ground, which is what the first viewport
    // promises. Today that is one piece (see lib/imagery.ts); the rest render
    // their photograph in its own plate, backdrop and all.
    const withCutout = pool.filter((p) => cutoutFor(p.slug));
    const preferred = withCutout.length > 0 ? withCutout : pool;

    // Prefer the catalog's median price band so the hero never advertises the
    // ceiling to a buyer whose budget is the entry rung.
    const scored = preferred
      .map((p) => {
        const v = getDefaultVariant(p);
        const price = v?.priceCents ?? 0;
        return { p, price, distance: Math.abs(price - 119900) };
      })
      .filter((x) => x.price > 0)
      .sort((a, b) => a.distance - b.distance);

    return scored[0]?.p ?? preferred[0] ?? pool[0] ?? list[0];
  }, [products]);

  const variant = hero ? getDefaultVariant(hero) : undefined;
  const mrp = variant ? catalogMrp(variant) : null;
  const cutout = hero ? cutoutFor(hero.slug) : null;

  return (
    <section
      aria-labelledby="hero-heading"
      className="border-b border-stone bg-cream"
    >
      <div className="mx-auto grid max-w-[var(--container-max)] grid-cols-1 items-center gap-8 px-4 pb-10 pt-6 sm:px-6 lg:min-h-[calc(100svh-var(--header-height)-2.2rem-8rem)] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14 lg:px-12 lg:pb-10 lg:pt-4">
        {/* ── The words ─────────────────────────────────────────────── */}
        <div className="order-2 lg:order-1">
          <h1
            id="hero-heading"
            className="loom-display text-ink"
            style={{ fontSize: 'clamp(2.5rem, 5.4vw, 5rem)' }}
          >
            Hand-embroidered
            <br />
            <span className="text-accent">in India</span>
          </h1>

          <p className="mt-5 max-w-[46ch] font-sans text-base leading-relaxed text-ink-muted sm:text-[17px]">
            Original embroidery, stitched by hand, on garments built to be worn
            weekly rather than admired once. Every piece is priced on this page
            — nothing is available on request.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              to="/shop"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 bg-ink px-6 font-sans text-[13px] font-medium uppercase tracking-[0.14em] text-cream transition-colors hover:bg-accent"
            >
              Shop the collection
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/our-craft"
              className="inline-flex min-h-[48px] items-center justify-center border border-stone-strong px-5 font-sans text-[13px] font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink"
            >
              How it is made
            </Link>
          </div>

          {/* The price ladder, stated as fact. This is the single most useful
              sentence on the page for a tier-2/3 buyer, so it is not a badge. */}
          <dl className="mt-8 inline-grid grid-cols-3 gap-x-8 border-t border-stone pt-4 sm:gap-x-10">
            {[
              ['Entry', '₹899'],
              ['Most pieces', '₹1,199'],
              ['Showcase', '₹1,899'],
            ].map(([label, price]) => (
              <div key={label}>
                <dt className="font-sans text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                  {label}
                </dt>
                <dd className="loom-price mt-1 text-base text-ink">{price}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ── The garment ───────────────────────────────────────────── */}
        <div className="order-1 flex flex-col lg:order-2 lg:h-[calc(100svh-var(--header-height)-2.2rem-6.5rem)] lg:max-h-[40rem]">
          {hero ? (
            <Link
              to={`/product/${hero.slug}`}
              className="group flex h-full min-h-0 flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              {/* With a cut-out the garment sits ON the ground: a transparent
                  PNG over the cotton, no plate, no frame. Without one, the
                  photograph is shown whole in its own plate on the same ground
                  — the letterbox is cotton rather than a cool studio panel, and
                  the backdrop inside the photograph is the photograph's, which
                  is stated rather than disguised. */}
              {cutout ? (
                <div className="relative min-h-0 flex-1">
                  <img
                    src={cutout}
                    alt={hero.images[0]?.alt || hero.name}
                    className="h-full w-full object-contain transition-transform duration-[600ms] ease-[var(--ease-base)] group-hover:scale-[1.015]"
                    decoding="async"
                  />
                </div>
              ) : (
                <div className="relative min-h-0 flex-1 overflow-hidden bg-cream">
                  <Image
                    src={hero.images[0].src}
                    alt={hero.images[0].alt || hero.name}
                    aspectRatio="4/5"
                    fit="contain"
                    placeholderColor="var(--color-cream)"
                    className="h-full w-full transition-transform duration-[600ms] ease-[var(--ease-base)] group-hover:scale-[1.015]"
                    lazy={false}
                  />
                </div>
              )}

              {/* The label. Reads like the tape inside a garment, and it is
                  the reason this hero can be a product rather than a poster. */}
              <div className="shrink-0 border-t border-stone bg-paper">
                <div className="flex items-baseline justify-between gap-4 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-sans text-sm font-medium text-ink">
                      {hero.name}
                    </p>
                    <p className="mt-0.5 font-sans text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                      {hero.embroidery?.techniqueLabel ?? 'Hand embroidery'}
                      {hero.fabricGsm ? ` · ${hero.fabricGsm} GSM` : ''}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="loom-price text-base font-medium text-ink">
                      {variant ? formatPrice(variant.priceCents) : ''}
                    </p>
                    {mrp?.mrpCents && mrp.mrpCents > (variant?.priceCents ?? 0) && (
                      <p className="loom-price text-[11px] text-ink-muted line-through">
                        {formatPrice(mrp.mrpCents)}
                      </p>
                    )}
                  </div>
                </div>
                <p className="border-t border-stone px-4 py-2 font-sans text-[11px] uppercase tracking-[0.14em] text-ink-muted transition-colors group-hover:text-ink">
                  <span aria-hidden="true">→ </span>View this piece
                </p>
              </div>
            </Link>
          ) : (
            // No catalog yet: the frame holds its shape so nothing shifts when
            // the fetch lands. Never a spinner in the first viewport.
            <div className="aspect-[4/5] w-full bg-panel sm:aspect-[5/6]" aria-hidden="true" />
          )}
        </div>
      </div>
    </section>
  );
};
