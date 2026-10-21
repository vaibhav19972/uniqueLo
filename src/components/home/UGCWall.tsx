import React from 'react';
import { Link } from 'react-router';
import { MarketingHeader } from '../ui/MarketingHeader';

/**
 * Render target 06: Worn Across Universes (chatgpt-v2).
 * ALL stories/figures below are flagged SAMPLE data (user-approved) —
 * replace with real customer photos + computed aggregates at P5.
 * The SAMPLE disclosure lives in this comment + img alt text, not as a
 * visible UI chip (same pattern as render 04's artisan quote).
 * Avatar photos per tile are omitted until real customer assets exist
 * (logged); verified badge + name + descriptor carry the identity.
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
  { value: '10,000+', label: 'Happy customers', icon: 'people' },
  { value: '4.8/5', label: 'Average rating', icon: 'star' },
  { value: '#UniqueLo', label: 'On Instagram', icon: 'camera' },
] as const;

const STAT_ICONS: Record<string, React.ReactNode> = {
  people: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H2v-2a4 4 0 013-3.87m5 1.87a6 6 0 100-12 6 6 0 000 12zm7-11a3 3 0 013 3" />
  ),
  star: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3l2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8L12 3z" />,
  camera: (
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 8h3l2-3h6l2 3h3v12H4V8zm8 10a4 4 0 100-8 4 4 0 000 8z" />
  ),
};

export const UGCWall: React.FC = () => {
  return (
    <section aria-labelledby="ugc-heading" className="bg-cream py-16 lg:py-24">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12">
        <MarketingHeader
          eyebrow="Real people. Real stories."
          title="Worn Across Universes."
          titleId="ugc-heading"
          sub="Different worlds. Same love for embroidered details."
          linkTo="/shop"
          linkLabel="See more stories"
        />

        {/* Masonry wall — 2 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 auto-rows-[180px] sm:auto-rows-[240px]">
          {SAMPLE_STORIES.map((s) => (
            <figure
              key={s.name}
              className={`group relative overflow-hidden rounded-sm bg-stone/20 ${s.tall ? 'row-span-2' : ''}`}
            >
              <img
                src={s.image}
                alt={s.alt}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
              <figcaption className="absolute inset-x-0 bottom-0 p-3 sm:p-4 text-cream">
                <p className="font-serif text-xs sm:text-[17px] leading-snug line-clamp-2 sm:line-clamp-none">“{s.quote}”</p>
                <p className="font-sans text-[11px] sm:text-[13px] mt-1.5 sm:mt-2 font-semibold flex items-center gap-1 sm:gap-1.5">
                  {s.name}
                  <span
                    aria-label="Verified customer"
                    className="inline-flex w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gold items-center justify-center shrink-0"
                  >
                    <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-on-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </p>
                <p className="font-sans text-[9px] sm:text-[11px] text-cream/75 truncate">{s.detail}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Stats bar (SAMPLE figures; wire to real aggregates at P5) —
            rounded beige strip, gold outline icons, serif numerals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 rounded-sm bg-stone/30 px-6 py-6">
          {SAMPLE_STATS.map((s, i) => (
            <div
              key={s.label}
              className={`flex items-center justify-center gap-3 ${i > 0 ? 'sm:border-l sm:border-stone/60' : ''}`}
            >
              <svg className="w-6 h-6 shrink-0 text-gold-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                {STAT_ICONS[s.icon]}
              </svg>
              <p>
                <span className="block font-serif text-2xl text-ink">{s.value}</span>
                <span className="block font-sans text-xs text-ink-muted">{s.label}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link to="/shop" className="text-[15px] font-serif text-ink border-b border-ink/30 pb-1">
            See more stories →
          </Link>
        </div>
      </div>
    </section>
  );
};