import React from 'react';

const TRUST_PILLARS = [
  {
    icon: (
      <svg className="h-6 w-6 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'SHIPPING WITHIN 48 HOURS',
    description: 'Your order will be dispatched within 48 hours from the time since order is placed!',
  },
  {
    icon: (
      <svg className="h-6 w-6 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: '5% OFF ON PREPAID',
    description: 'Get extra 5% instant discount on all UPI & prepaid online orders.',
  },
  {
    icon: (
      <svg className="h-6 w-6 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    title: '100% MADE IN INDIA',
    description: 'From raw combed yarn to the final handcrafted embroidery stitch.',
  },
  {
    icon: (
      <svg className="h-6 w-6 text-neutral-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: 'LUXURY MADE ACCESSIBLE',
    description: 'High-density streetwear fabrics at honest direct-to-consumer prices.',
  },
];

export const TrustBadgesPreFooter: React.FC = () => {
  return (
    <section aria-label="Customer Guarantees" className="w-full bg-white border-t border-b border-[#E5E5E5] py-8 sm:py-10">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 lg:gap-8 text-center">
          {TRUST_PILLARS.map((pillar) => (
            <div key={pillar.title} className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100">
                {pillar.icon}
              </div>
              <h3 className="mt-3 text-xs font-black uppercase tracking-tight text-neutral-900">
                {pillar.title}
              </h3>
              <p className="mt-1 max-w-[24ch] text-[11px] leading-snug text-neutral-500 font-normal">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
