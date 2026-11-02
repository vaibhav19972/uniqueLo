import React from 'react';
import { Link } from 'react-router';

/**
 * THE FIRST VIEWPORT — a cast, not a campaign.
 *
 * The previous hero was one garment with its own price label, which was the
 * right correction to the carousel it replaced (a dark scrim, a headline, four
 * dots, no price anywhere) but it swung one step too far: a single shirt on a
 * cotton ground reads as a small studio's product page, and this label sells
 * *worlds*. What a fandom buyer is actually shopping for is a place to belong,
 * so the first thing on the page is two people standing in one.
 *
 * The structure is taken from the reference set and inverted. The reference
 * lays a cast photograph edge-to-edge and floats a headline over it behind a
 * scrim, with the price nowhere. This keeps the cast and refuses both of those:
 * the photograph is a discrete plate on the cotton ground (no scrim, no
 * full-bleed), and the words sit beside it in the page's own type register, with
 * the real price ladder printed underneath as mono fact. Nothing on this screen
 * is a claim the catalogue cannot back.
 *
 * The photograph carries all the headroom and empty wall on the LEFT, because
 * the caption block sits to its left on desktop; on mobile the block moves
 * below. It is a placeholder frame for the real shoot — the alt text says so,
 * and no product claims to be the garment shown.
 */
export const CastHero: React.FC = () => {
  return (
    <section aria-labelledby="hero-heading" className="border-b border-stone bg-cream">
      <div className="mx-auto grid max-w-[var(--container-max)] grid-cols-1 gap-8 px-4 pb-8 pt-6 sm:px-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-stretch lg:gap-12 lg:px-12 lg:pb-10 lg:pt-10">
        {/* ── The words ─────────────────────────────────────────────── */}
        <div className="order-2 flex flex-col justify-center lg:order-1">
          <p className="loom-label text-ink-muted">Est. craft · Made in India</p>

          <h1
            id="hero-heading"
            className="loom-display mt-3 text-ink"
            style={{ fontSize: 'clamp(2.4rem, 4.6vw, 4.25rem)' }}
          >
            Embroidered worlds,
            <br />
            <span className="text-accent">worn daily.</span>
          </h1>

          <p className="mt-5 max-w-[44ch] font-sans text-[15px] leading-relaxed text-ink-muted sm:text-base">
            Original hand embroidery on heavyweight Indian cotton. Three worlds
            to walk into — heritage, anime, heroic — and one plain atelier
            line for everything in between.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              to="/shop"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 bg-ink px-6 font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-cream transition-colors hover:bg-accent"
            >
              Shop every piece
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/worlds"
              className="inline-flex min-h-[48px] items-center justify-center border border-stone-strong px-5 font-sans text-[12px] font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:border-ink"
            >
              Enter a world
            </Link>
          </div>
        </div>

        {/* ── The cast ──────────────────────────────────────────────── */}
        <div className="order-1 lg:order-2">
          <figure className="relative">
            <div className="relative overflow-hidden bg-panel">
              <img
                src="/images/home/hero-cast-wide.jpg"
                alt="Two models in the studio: a hand-embroidered cream tee and a black embroidered overshirt."
                width={1600}
                height={1066}
                fetchPriority="high"
                decoding="async"
                className="block h-full w-full object-cover"
                style={{ aspectRatio: '3 / 2' }}
              />
            </div>

            {/* The caption is a solid plate under the plate — never a scrim
                over the photograph.

                It deliberately does NOT name a product. The cast frame is a
                campaign plate, not a photograph of one catalogue piece, and
                setting "Sage Linen Embroidered Shirt — ₹1,199" beneath it
                would tell the buyer that the shirt on the model is that SKU.
                It isn't. So the caption states the season and the line, and
                the link goes to the line itself with the real entry price,
                which is a claim the catalogue can back. */}
            <figcaption className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-stone bg-paper px-4 py-3">
              <p className="font-sans text-[11px] uppercase tracking-[0.14em] text-ink-muted">
                Autumn&nbsp;/&nbsp;Winter · The Atelier line
              </p>
              <Link
                to="/shop?universe=atelier"
                className="group flex min-h-[44px] items-center gap-2 font-sans text-[12px] text-ink"
              >
                <span className="transition-colors group-hover:text-accent">
                  Shop the line
                </span>
                <span className="transition-transform group-hover:translate-x-1 group-hover:text-accent" aria-hidden="true">
                  →
                </span>
              </Link>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
};
