import React, { useMemo } from 'react';
import { Link } from 'react-router';
import { useCraftTechniques } from '../../hooks/useCatalog';
import { useReveal } from '../../hooks/useReveal';

/**
 * THE CRAFT MOMENT — the one band that goes dark.
 *
 * Every surface above this one is unbleached cotton. This section inverts the
 * page, and that inversion is the whole argument: the ground goes to dyed
 * indigo-black so that a single photograph of thread under a work light can
 * be the brightest object on the screen. Mezzotint logic — the image is
 * revealed by removing darkness, and only one plate earns that treatment.
 *
 * The artisan quote and name are removed, not restyled. They were sample data
 * presented as a real person ("Savitri Devi, Artisan, Uttar Pradesh") on a
 * live storefront, which is a fabricated claim under PRODUCT.md's honesty
 * principle and a consent problem besides. The section speaks for the studio
 * until a verified profile exists to name.
 *
 * The headline used to read "Forty hours, per piece." The technique registry
 * puts every one of the nine techniques between 6 and 34 hours, so forty was
 * an invented upper bound — and 28 of 29 products carry no recorded hours at
 * all. The band now prints the real range, computed from the registry.
 */
const STEPS = [
  {
    n: '01',
    title: 'Drawn',
    detail: 'The motif is drawn to the garment’s panel before any thread is chosen.',
    image: '/images/campaigns/craft-sketch.jpg',
  },
  {
    n: '02',
    title: 'Dyed',
    detail: 'Thread is matched to the base cloth and tested against it in daylight.',
    image: '/images/campaigns/craft-thread-dye.jpg',
  },
  {
    n: '03',
    title: 'Stitched',
    detail: 'Worked on a frame by hand, one motif at a time. The registry records how long each technique takes.',
    image: '/images/campaigns/craft-handwork.jpg',
  },
  {
    n: '04',
    title: 'Finished',
    detail: 'Pressed, inspected and finished before it leaves the workshop.',
    image: '/images/campaigns/craft-finish.jpg',
  },
];

export const CraftStory: React.FC = () => {
  const revealRef = useReveal<HTMLElement>();
  const { data: techniques } = useCraftTechniques();

  // The working-time range, parsed from the registry's own "12–16 hours per
  // garment" strings. No value outside the registry is invented.
  const hoursRange = useMemo(() => {
    const all: number[] = [];
    for (const t of techniques ?? []) {
      // Only garment-scale work: the monogram commission is 6–10 hours and
      // belongs to a different unit, so including it would drag the floor down.
      if (!/per garment/i.test(t.artisanPace)) continue;
      for (const m of t.artisanPace.matchAll(/\d+/g)) {
        const n = Number(m[0]);
        if (Number.isFinite(n) && n > 0) all.push(n);
      }
    }
    if (all.length === 0) return null;
    return { min: Math.min(...all), max: Math.max(...all) };
  }, [techniques]);

  const headline = hoursRange
    ? `${hoursRange.min}–${hoursRange.max} hours, per piece.`
    : 'Hours of work, per piece.';

  return (
    <section
      ref={revealRef}
      className="reveal bg-ink py-14 text-cream lg:py-20"
      aria-labelledby="craft-heading"
    >
      <div className="mx-auto max-w-[var(--container-max)] px-4 sm:px-6 lg:px-12">
        {/* The head is inverted from the shared component by hand: on this
            ground the rule and the secondary text must come from the cream
            end of the palette, not the stone one. */}
        <div className="border-b border-cream/20 pb-5">
          <h2
            id="craft-heading"
            className="loom-display"
            style={{ fontSize: 'var(--text-display-lg)' }}
          >
            {headline}
          </h2>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <p className="max-w-[56ch] font-sans text-[15px] leading-relaxed text-cream/70">
              Nothing here is printed. The embroidery is worked by hand on a
              frame, in a workshop in India, before the garment is cut and
              finished. That is why a piece costs what it costs — and why it is
              still wearing in five years.
            </p>
            <Link
              to="/our-craft"
              className="group inline-flex items-center gap-1.5 border-b border-cream/40 pb-0.5 font-sans text-[13px] font-medium text-cream transition-colors hover:border-cream"
            >
              The techniques
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
          {/* The plate. One photograph, allowed to be the brightest thing. */}
          <div className="relative order-2 aspect-[4/3] overflow-hidden bg-[#0b0f24] lg:order-1 lg:aspect-auto lg:min-h-[520px]">
            <img
              src="/images/campaigns/atelier-craft.jpg"
              alt="Gold zari thread being worked through ivory silk on an embroidery frame"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          {/* The four moves, as a ruled list. No thumbnails: four small
              photographs beside one large one split the eye and turn a proof
              into a gallery. The steps are text, and the plate is the image. */}
          <ol className="order-1 lg:order-2">
            {STEPS.map((step) => (
              <li key={step.n} className="border-t border-cream/15 py-5 first:border-t-0 first:pt-0">
                <div className="flex gap-5">
                  <span className="loom-price shrink-0 pt-0.5 text-[11px] text-cream/45">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="font-sans text-[15px] font-medium text-cream">
                      {step.title}
                    </h3>
                    <p className="mt-1 max-w-[42ch] font-sans text-[13px] leading-relaxed text-cream/65">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Three facts, stated plainly, no icons. */}
        <dl className="mt-10 grid grid-cols-1 gap-px border-t border-cream/15 pt-6 sm:grid-cols-3">
          {[
            ['Hand-worked', 'Every motif is stitched, never printed or appliquéd.'],
            ['Sized honestly', 'Measurements are garment measurements, listed on every product page.'],
            ['7-day returns', 'Seven days from delivery, on every piece.'],
          ].map(([term, def]) => (
            <div key={term} className="py-3 sm:pr-8">
              <dt className="loom-label text-cream">{term}</dt>
              <dd className="mt-1.5 font-sans text-[13px] leading-relaxed text-cream/65">{def}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
};
