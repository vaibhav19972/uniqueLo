import React from 'react';
import { useReveal } from '../../hooks/useReveal';

/** Render target 01: 4-up trust strip below the hero (chatgpt-v2).
 * Copy rule: "embroidery", never "hand-embroidery" — handcraft claims are
 * per-product only (Product.handcrafted flag). */
const ITEMS = [
  {
    title: 'Signature Embroidery',
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
    detail: 'Designed at home, worn everywhere',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0c2.5-2.5 4-5.5 4-9s-1.5-6.5-4-9m0 18c-2.5-2.5-4-5.5-4-9s1.5-6.5 4-9M3.5 9h17M3.5 15h17" />
    ),
  },
  {
    title: 'Thoughtful Drops',
    detail: 'Limited pieces, more meaning',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21c-5 0-8-3-8-8 0-6 5-10 13-10 0 8-2 18-5 18zm0 0V9" />
    ),
  },
];

export const TrustStrip: React.FC = () => {
  const revealRef = useReveal<HTMLElement>();
  return (
    <section ref={revealRef} className="reveal border-y border-stone bg-cream" aria-label="Why UniqueLo" >
      <div className="mx-auto grid max-w-[var(--container-max)] grid-cols-2 divide-y divide-stone px-4 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:px-6 lg:grid-cols-4 lg:px-12">
        {ITEMS.map((item, i) => (
          <div
            key={item.title}
            className={`flex items-center gap-2.5 px-1.5 py-4 sm:justify-center sm:gap-4 sm:px-6 lg:justify-start lg:pl-8 ${i % 2 === 1 ? 'border-l border-stone sm:border-l-0' : ''}`}
          >
            <svg className="w-6 h-6 sm:w-8 sm:h-8 shrink-0 text-gold-deep" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              {item.icon}
            </svg>
            <div>
              <p className="font-sans text-xs font-medium leading-tight text-ink sm:text-base">{item.title}</p>
              <p className="mt-0.5 font-sans text-[10px] leading-tight text-ink-muted sm:text-sm">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
