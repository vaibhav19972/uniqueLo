import React from 'react';
import { Link } from 'react-router';
import { MarketingHeader } from '../ui/MarketingHeader';

/**
 * Render target 04: Slow Fashion. Deeper Stories.
 * Artisan identity below is flagged SAMPLE data (user-approved) — replace with
 * verified artisan records at P5. Imagery is tonal placeholders until the shoot.
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
  { title: 'Hand-Embroidered', detail: 'Real craftsmanship, not mass prints.' },
  { title: 'Natural Dyes & Fabrics', detail: 'Gentle on you, kinder to the planet.' },
  { title: '14-Day Home Inspection', detail: 'Try it at home. Easy returns, no questions.' },
];

export const CraftStory: React.FC = () => {
  return (
    <section aria-labelledby="craft-heading" className="bg-cream py-16 lg:py-24 border-t border-stone/60">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          eyebrow="Our Craft"
          title="Slow Fashion. Deeper Stories."
          titleId="craft-heading"
          sub="Every piece is thoughtfully designed and hand-embroidered by skilled Indian artisans, blending tradition with contemporary expression."
          linkTo="/atelier"
          linkLabel="The people behind your clothes"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Macro visual */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden bg-stone/30 border border-stone/60">
              <img
                src="/images/campaigns/atelier-craft.jpg"
                alt="Macro of gold and red hand-embroidery with needle in hand (placeholder)"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Steps + artisan */}
          <div className="lg:col-span-7">
            <ol className="grid grid-cols-2 xl:grid-cols-4 gap-5">
              {STEPS.map((s) => (
                <li key={s.n}>
                  <p className="font-serif text-3xl text-gold">
                    {s.n} <span aria-hidden="true" className="text-stone text-2xl">→</span>
                  </p>
                  <p className="font-serif text-lg text-ink mt-1">{s.title}</p>
                  <p className="text-[13px] text-ink-muted mt-1 leading-relaxed">{s.detail}</p>
                  <div className="aspect-square overflow-hidden bg-stone/30 border border-stone/60 mt-3">
                    <img src={s.image} alt={s.alt} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                </li>
              ))}
            </ol>

            {/* Artisan quote (SAMPLE) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 mt-8 bg-paper border border-stone/60 p-5 sm:p-6">
              <div className="sm:col-span-3">
                <div className="aspect-[3/4] overflow-hidden bg-stone/30">
                  <img src={SAMPLE_ARTISAN.photo} alt={SAMPLE_ARTISAN.photoAlt} loading="lazy" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="sm:col-span-6">
                <span className="inline-block text-[10px] uppercase tracking-[0.2em] text-ink-muted border border-stone px-2 py-1">
                  Sample profile — verify at P5
                </span>
                <blockquote className="font-serif italic text-lg sm:text-xl text-ink leading-relaxed mt-3">
                  “{SAMPLE_ARTISAN.quote}”
                </blockquote>
                <p className="font-serif text-base text-ink mt-3 italic">{SAMPLE_ARTISAN.name}</p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-ink-muted">
                  {SAMPLE_ARTISAN.role}
                </p>
              </div>
              <div className="sm:col-span-3 sm:border-l sm:border-stone/60 sm:pl-5 flex flex-col justify-center">
                <p className="text-sm text-ink leading-relaxed">
                  Over 30+ artisans across India bring UniqueLo to life.
                </p>
                <Link to="/atelier" className="text-sm font-serif text-ink border-b border-ink/30 hover:border-ink self-start mt-2 pb-0.5">
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
              <span className="w-12 h-12 rounded-full bg-stone/40 flex items-center justify-center shrink-0 text-gold font-serif text-xl" aria-hidden="true">
                ✦
              </span>
              <div>
                <p className="font-serif text-lg text-ink">{b.title}</p>
                <p className="text-[13px] text-ink-muted">{b.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
