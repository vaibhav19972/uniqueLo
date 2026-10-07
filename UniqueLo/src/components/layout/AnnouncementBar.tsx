import React, { useState } from 'react';

export const AnnouncementBar: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const announcements = [
    '✦ COMPLIMENTARY WORLDWIDE WHITE-GLOVE SHIPPING ON ORDERS OVER $350',
    '✦ 100% ARTISANAL NEEDLECRAFT — 14 TO 32 HOURS EMBROIDERED PER PIECE',
    '✦ BESPOKE MONOGRAMMING STUDIO NOW OPEN — 24K GOLD ZARI & SPUN SILK YARNS',
    '✦ ENJOY 10% OFF YOUR FIRST HEIRLOOM COMMISSION WITH CODE "ATELIER10"',
  ];

  return (
    <div className="bg-ink text-cream border-b border-stone/20 text-[10px] tracking-[0.22em] uppercase font-sans overflow-hidden relative z-[210] py-2">
      <div className="flex items-center">
        {/* Continuous Marquee Rail */}
        <div className="animate-marquee whitespace-nowrap flex items-center space-x-12 cursor-default">
          {announcements.concat(announcements).map((text, idx) => (
            <span key={idx} className="flex items-center space-x-4">
              <span className="text-accent font-bold">✦</span>
              <span className="text-cream/90 hover:text-cream transition-colors">{text}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Dismiss Button */}
      <button
        onClick={() => setIsDismissed(true)}
        aria-label="Dismiss banner"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone/60 hover:text-cream px-1.5 py-0.5 text-xs transition-colors bg-ink/80 backdrop-blur-xs"
      >
        ✕
      </button>
    </div>
  );
};
