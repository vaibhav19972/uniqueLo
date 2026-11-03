import React from 'react';

const MESSAGES = [
  '🚚 FREE EXPRESS SHIPPING ON ALL ORDERS ABOVE ₹999',
  '✨ USE CODE HUSTLE10 FOR 10% OFF YOUR ORDER',
  '⚡ EXTRA 5% INSTANT DISCOUNT ON ALL UPI & PREPAID ORDERS',
  '🧵 100% HEAVYWEIGHT COMBED COTTON · HANDCRAFTED EMBROIDERY',
];

export const AnnouncementMarquee: React.FC = () => {
  return (
    <div
      role="region"
      aria-label="Promotions Announcement"
      className="relative z-50 h-8 w-full overflow-hidden bg-black text-white"
    >
      <div className="flex h-full w-max items-center animate-marquee whitespace-nowrap">
        {/* Render twice for continuous loop */}
        {[...MESSAGES, ...MESSAGES, ...MESSAGES].map((msg, idx) => (
          <div key={idx} className="flex items-center px-6">
            <span className="text-[11px] font-bold uppercase italic tracking-wider">
              {msg}
            </span>
            <span className="mx-4 text-[10px] text-neutral-500">•</span>
          </div>
        ))}
      </div>
    </div>
  );
};
