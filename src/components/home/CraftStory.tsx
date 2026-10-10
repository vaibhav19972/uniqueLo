import React from 'react';
import { Link } from 'react-router';
import { MarketingHeader } from '../ui/MarketingHeader';

/**
 * Render target 04: Slow Fashion. Deeper Stories. (chatgpt-v2)
 * Artisan identity below is flagged SAMPLE data (user-approved) — replace with
 * verified artisan records at P5. Imagery is tonal placeholders until the shoot.
 * The SAMPLE disclosure lives here + in img alt text, not as a visible UI chip.
 */
const SAMPLE_ARTISAN = {
  quote:
    'For me, embroidery is a way of keeping our stories alive — in every stitch, there is a piece of home.',
  name: 'Savitri Devi',
  role: 'Artisan, Uttar Pradesh',
  photo: '/images/campaigns/lookbook-01.jpg',
  photoAlt: 'Artisan hand-embroidering at a wooden frame (sample photo, replace at P5)',
};

const STEPS = [
  {
    n: '01',
    title: 'Sketch',
    detail: 'Ideas become art.',
    image: '/images/campaigns/editorial-split.jpg',
    alt: 'Step 1 — motif sketch becoming embroidery art (placeholder)',
  },
  {
    n: '02',
    title: 'Thread-dye',
    detail: 'Naturally dyed, richer tones.',
    image: '/images/campaigns/lookbook-02.jpg',
    alt: 'Step 2 — bowls of naturally dyed thread (placeholder)',
  },
  {
    n: '03',
    title: '40-hr handwork',
    detail: 'Skilled hands bring every detail to life.',
    image: '/images/campaigns/lookbook-03.jpg',
    alt: 'Step 3 — artisan stitching floral motif (placeholder)',
  },
  {
    n: '04',
    title: 'Finish',
    detail: 'A piece made to last.',
    image: '/images/campaigns/atelier-craft.jpg',
    alt: 'Step 4 — finished embroidered garment on hanger (placeholder)',
  },
];

const BADGES = [
  {
    title: 'Hand-Embroidered',
    detail: 'Real craftsmanship, not mass prints.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 20l3-3m2-2l9.5-9.5a1.5 1.5 0 00-2-2L7 13l-3 3m9-9l2 2M9 7l8 8" />
    ),
  },
  {
    title: 'Natural Dyes & Fabrics',
    detail: 'Gentle on you, kinder to the planet.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21c-5 0-8-3-8-8 0-6 5-10 13-10 0 8-2 18-5 18zm0 0V9" />
    ),
  },
  {
    title: '14-Day Home Inspection',
    detail: 'Try it at home. Easy returns, no questions.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3l8 3v6c0 4.5-3.5 7.5-8 9-4.5-1.5-8-4.5-8-9V6l8-3zm-2.5 8.5l2 2 4-4" />
    ),
  },
];

export const CraftStory: React.FC = () => {
  return (
    <section aria-labelledby="craft-heading" className="bg-cream py-16 lg:py-24">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          eyebrow="Our Craft"
          title="Slow Fashion. Deeper Stories."
          titleId="craft-heading"
          sub="Every piece is thoughtfully designed and hand-embroidered by skilled Indian artisans, blending tradition with contemporary expression."
          linkTo="/atelier"
          linkLabel="The people behind your clothes"
        />

        {/* Macro visual bleeds to the left viewport edge on lg (render 04) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start mt-2">
          <div className="relative aspect-[4/5] overflow-hidden bg-stone/30 lg:-ml-[max(0px,calc((100vw-var(--container-max))/2+3rem))] lg:aspect-auto lg:h-full">
            <img
              src="/images/campaigns/atelier-craft.jpg"
              alt="Macro of gold and red hand-embroidery with needle in hand (placeholder)"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Steps + artisan */}
          <div>
            <ol className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {STEPS.map((s, i) => (
                <li key={s.n} className="flex flex-col">
                  <p className="font-serif text-3xl text-gold">
                    {s.n}
                    {i < STEPS.length - 1 && (
                      <span aria-hidden="true" className="text-stone text-2xl ml-1.5 hidden lg:inline">
                        →
                      </span>
                    )}
                  </p>
                  <p className="font-serif text-lg text-ink mt-1">{s.title}</p>
                  <p className="font-serif text-[13px] text-ink-muted mt-1 leading-relaxed">{s.detail}</p>
                  <div className="aspect-square overflow-hidden bg-stone/30 mt-3">
                    <img src={s.image} alt={s.alt} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                </li>
              ))}
            </ol>

            {/* Artisan quote (SAMPLE) — barely-lighter cream strip, no card chrome */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 mt-8 bg-parchment/60 p-5 sm:p-6">
              <div className="sm:col-span-3">
                <div className="aspect-[3/4] overflow-hidden bg-stone/30">
                  <img src={SAMPLE_ARTISAN.photo} alt={SAMPLE_ARTISAN.photoAlt} loading="lazy" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="sm:col-span-6">
                <blockquote className="font-serif italic text-lg sm:text-xl text-ink leading-relaxed">
                  “{SAMPLE_ARTISAN.quote}”
                </blockquote>
                {/* Script signature face not self-hosted — italic serif stands in (logged) */}
                <p className="font-serif italic text-lg text-ink mt-3">{SAMPLE_ARTISAN.name}</p>
                <p className="font-sans text-[11px] uppercase tracking-[0.2em] text-ink-muted mt-0.5">
                  {SAMPLE_ARTISAN.role}
                </p>
              </div>
              <div className="sm:col-span-3 sm:border-l sm:border-stone/60 sm:pl-5 flex flex-col justify-center">
                <p className="font-serif text-[15px] text-ink leading-relaxed">
                  Over 30+ artisans across India bring UniqueLo to life.
                </p>
                <Link
                  to="/atelier"
                  className="self-start mt-2 pb-0.5 font-serif text-[15px] text-gold border-b border-gold/40 hover:border-gold transition-colors"
                >
                  Meet our artisans <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10 pt-8 border-t border-stone/60">
          {BADGES.map((b) => (
            <div key={b.title} className="flex items-center gap-4">
              <span className="w-12 h-12 rounded-full bg-stone/40 flex items-center justify-center shrink-0 text-ink" aria-hidden="true">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {b.icon}
                </svg>
              </span>
              <div>
                <p className="font-serif text-lg text-ink">{b.title}</p>
                <p className="font-serif text-[13px] text-ink-muted">{b.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};