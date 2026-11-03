import React from 'react';

const VALUES = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    label: 'CREATIVE EXPRESSION',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    label: 'INCLUSIVITY',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
    label: 'HIGH QUALITY',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: 'SUSTAINABILITY',
  },
];

export const OurStorySplitSection: React.FC = () => {
  return (
    <section aria-label="Our Story and Values" className="w-full bg-black text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left: Editorial Image */}
        <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-auto lg:h-full w-full overflow-hidden">
          <img
            src="/images/campaigns/editorial-split.jpg"
            alt="UniqueLo Streetwear Editorial Cast"
            className="h-full w-full object-cover object-center"
          />
        </div>

        {/* Right: Black Panel with Brand Manifesto */}
        <div className="flex flex-col justify-center items-center text-center p-8 sm:p-12 lg:p-16">
          <span className="font-display text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            UNIQUELO
          </span>

          <h2 className="mt-3 text-base font-black uppercase tracking-[0.2em] text-neutral-300 sm:text-lg">
            OUR STORY
          </h2>

          <p className="mt-4 max-w-lg text-xs leading-relaxed text-neutral-400 sm:text-sm font-medium">
            UniqueLo isn&apos;t just a brand — it&apos;s a culture. Rooted in pop culture,
            Indian heritage, and bold individuality, we craft unisex streetwear that
            blends luxury with affordability. From limited online drops to homegrown
            studios, we&apos;re building a community where fashion is fearless, inclusive,
            and unapologetically bold.
          </p>

          {/* 4-Icon Value Row */}
          <div className="mt-8 grid w-full max-w-md grid-cols-4 gap-2 sm:gap-4 border-t border-neutral-800 pt-8">
            {VALUES.map((val) => (
              <div key={val.label} className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white">
                  {val.icon}
                </div>
                <span className="mt-2 text-[9px] font-bold uppercase tracking-wider text-neutral-400 text-center leading-tight">
                  {val.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
