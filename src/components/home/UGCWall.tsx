import React from 'react';
import { Link } from 'react-router';
import { MarketingHeader } from '../ui/MarketingHeader';

/**
 * Render target 06: Worn Across Universes.
 * ALL stories/figures below are flagged SAMPLE data (user-approved) —
 * replace with real customer photos + computed aggregates at P5.
 */
const SAMPLE_STORIES = [
  {
    quote: 'The embroidery feels alive. I get compliments everywhere.',
    name: 'Rhea Sharma',
    detail: 'Student, Delhi',
    image: '/images/campaigns/lookbook-01.jpg',
    alt: 'Customer wearing embroidered hoodie in city street (sample photo)',
    tall: true,
  },
  {
    quote: 'My go-to tee. Amazing quality and the embroidery is next level.',
    name: 'Arjun Mehta',
    detail: 'Product Designer, Bengaluru',
    image: '/images/campaigns/lookbook-02.jpg',
    alt: 'Customer wearing koi embroidered tee outdoors (sample photo)',
    tall: false,
  },
  {
    quote: 'Perfect for anime events! So many people asked me where I got this from.',
    name: 'Ishita Rao',
    detail: 'Cosplayer, Mumbai',
    image: '/images/campaigns/lookbook-03.jpg',
    alt: 'Customer wearing graphic embroidered jacket at event (sample photo)',
    tall: false,
  },
  {
    quote: 'Super comfortable and the embroidery is so elegant.',
    name: 'Ananya Verma',
    detail: 'Marketing, Gurugram',
    image: '/images/campaigns/editorial-split.jpg',
    alt: 'Customer wearing crane sweatshirt at cafe (sample photo)',
    tall: false,
  },
  {
    quote: 'Feels like wearing art. The fit, the fabric, everything is perfect.',
    name: 'Kabir Malhotra',
    detail: 'Student, Pune',
    image: '/images/campaigns/atelier-craft.jpg',
    alt: 'Customer wearing tiger embroidered jacket at night market (sample photo)',
    tall: false,
  },
  {
    quote: 'A piece of history I can wear. The detailing is incredible.',
    name: 'Kushagra Singh',
    detail: 'History Enthusiast, Jaipur',
    image: '/images/campaigns/hero.jpg',
    alt: 'Customer wearing procession jacket before palace (sample photo)',
    tall: true,
  },
];

const SAMPLE_STATS = [
  { value: '10,000+', label: 'Happy customers' },
  { value: '4.8/5', label: 'Average rating' },
  { value: '#UniqueLo', label: 'On Instagram' },
];

export const UGCWall: React.FC = () => {
  return (
    <section aria-labelledby="ugc-heading" className="bg-paper py-16 lg:py-24 border-t border-stone/60">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          eyebrow="Real people. Real stories."
          title="Worn Across Universes."
          titleId="ugc-heading"
          sub="Different worlds. Same love for handcrafted details."
          linkTo="/shop"
          linkLabel="See more stories"
        />
        <p className="inline-block text-[10px] uppercase tracking-[0.2em] text-ink-muted border border-stone px-2 py-1 mb-6 -mt-6">
          Sample stories — replace with real customer photos at P5
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 auto-rows-[240px]">
          {SAMPLE_STORIES.map((s) => (
            <figure
              key={s.name}
              className={`group relative overflow-hidden bg-stone/20 border border-stone/60 ${s.tall ? 'row-span-2' : ''}`}
            >
              <img
                src={s.image}
                alt={s.alt}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-4 text-cream">
                <p className="font-serif text-[17px] leading-snug">“{s.quote}”</p>
                <p className="text-[13px] mt-2 font-medium">
                  {s.name} <span aria-label="verified customer" className="text-gold">●</span>
                </p>
                <p className="text-[11px] text-cream/75">{s.detail}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Stats bar (sample figures) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 bg-cream border border-stone/60 px-6 py-6">
          {SAMPLE_STATS.map((s, i) => (
            <div
              key={s.label}
              className={`flex items-center justify-center gap-3 ${i > 0 ? 'sm:border-l sm:border-stone/60' : ''}`}
            >
              <span className="text-gold font-serif text-2xl" aria-hidden="true">✦</span>
              <p>
                <span className="block font-serif text-2xl text-ink">{s.value}</span>
                <span className="block text-xs text-ink-muted">{s.label}</span>
              </p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-ink-muted mt-2">Illustrative figures — wire to real aggregates at P5.</p>

        <div className="mt-6 text-center sm:hidden">
          <Link to="/shop" className="text-[15px] font-serif text-ink border-b border-ink/30 pb-1">
            See more stories →
          </Link>
        </div>
      </div>
    </section>
  );
};
