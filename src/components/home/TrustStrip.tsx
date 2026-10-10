import React from 'react';

/** Render target 01: 4-up trust strip below the hero. */
const ITEMS = [
  {
    title: 'Hand-Embroidered',
    detail: 'Slow fashion, lasting details',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 20l3-3m2-2l9.5-9.5a1.5 1.5 0 00-2-2L7 13l-3 3m9-9l2 2M9 7l8 8" />
    ),
  },
  {
    title: 'Premium Fabrics',
    detail: 'Comfort that stays',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 3c-4 3-6 6-6 10a6 6 0 0012 0c0-4-2-7-6-10zm0 0v18M8 9c1 2 2 3 4 4m4-4c-1 2-2 3-4 4" />
    ),
  },
  {
    title: 'Made in India',
    detail: 'Supporting local artisans',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11zm0-8a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
    ),
  },
  {
    title: 'Thoughtful Drops',
    detail: 'Limited pieces, more meaning',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 19C5 9 13 5 20 5c0 8-4 14-13 14m0 0c3-5 7-8 11-9" />
    ),
  },
];

export const TrustStrip: React.FC = () => {
  return (
    <section aria-label="Why UniqueLo" className="bg-paper border-y border-stone/60">
      <div className="max-w-[var(--container-max)] mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item, i) => (
          <div
            key={item.title}
            className={`flex items-center gap-4 py-6 ${i > 0 ? 'lg:border-l lg:border-stone/60 lg:pl-8' : ''} ${i % 2 === 1 ? 'pl-4 lg:pl-8 border-l border-stone/60 lg:border-l' : ''}`}
          >
            <svg className="w-8 h-8 shrink-0" style={{ color: 'var(--brand-gold)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {item.icon}
            </svg>
            <div>
              <p className="font-serif text-base sm:text-lg text-ink">{item.title}</p>
              <p className="text-[11px] sm:text-xs text-ink-muted">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
