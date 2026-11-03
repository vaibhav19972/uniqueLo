import React from 'react';

interface Testimonial {
  id: string;
  name: string;
  city: string;
  quote: string;
  rating: number;
  verified: boolean;
}

const REVIEWS: Testimonial[] = [
  {
    id: '1',
    name: 'Tamchi Nyakum',
    city: 'Bengaluru',
    quote: 'It was so much more worthy than buying a ₹1,400 t-shirt from fast fashion brands. The fabric thickness and embroidery are unmatched.',
    rating: 5,
    verified: true,
  },
  {
    id: '2',
    name: 'Saumya Raj',
    city: 'Mumbai',
    quote: 'The oversized fit on the Acid Wash hoodie is absolute perfection. 400 GSM heavy fabric that holds its shape after 15+ washes.',
    rating: 5,
    verified: true,
  },
  {
    id: '3',
    name: 'Ansh Jadli',
    city: 'Delhi NCR',
    quote: 'Fast 48-hour delivery, genuine packaging, and the parachute cargo pants look straight off a runway. Already ordered two more pairs!',
    rating: 5,
    verified: true,
  },
];

export const CustomerTestimonialsStrip: React.FC = () => {
  return (
    <section aria-label="Customer Reviews" className="w-full bg-white py-8 md:py-12 border-t border-[#EDEDED]">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="text-center mb-6">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">
            ★ VERIFIED REVIEWS ★
          </span>
          <h2 className="mt-1 font-display text-lg font-black uppercase tracking-tight text-neutral-900 md:text-2xl">
            What The Community Says
          </h2>
        </div>

        <div
          className="no-scrollbar flex w-full overflow-x-auto gap-4 md:grid md:grid-cols-3 md:gap-6"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="w-[82vw] shrink-0 sm:w-[60vw] md:w-auto rounded-lg border border-neutral-200 bg-neutral-50 p-5 shadow-2xs flex flex-col justify-between"
              style={{ scrollSnapAlign: 'start' }}
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-0.5 text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <span key={i} className="text-sm">★</span>
                  ))}
                </div>

                <p className="mt-3 text-xs leading-relaxed text-neutral-700 italic font-medium">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-neutral-900">{rev.name}</h4>
                  <span className="text-[10px] text-neutral-500">{rev.city}</span>
                </div>
                {rev.verified && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    ✓ Verified Buyer
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
