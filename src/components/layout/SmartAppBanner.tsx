import React from 'react';
import { useUIStore } from '../../stores/ui';

export const SmartAppBanner: React.FC = () => {
  const isDismissed = useUIStore((state) => state.isAppBannerDismissed);
  const dismissBanner = useUIStore((state) => state.dismissAppBanner);

  if (isDismissed) return null;

  return (
    <div className="relative z-40 flex h-16 w-full items-center justify-between border-b border-[#EDEDED] bg-white px-3 md:hidden">
      {/* Left: Brand App Icon */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black text-white font-black text-sm tracking-tighter shadow-sm">
          UL
        </div>

        {/* Center: Copy */}
        <div className="flex flex-col min-w-0">
          <span className="truncate text-[13px] font-bold text-[#111111]">
            Welcome to UniqueLo!
          </span>
          <span className="line-clamp-2 text-[11px] leading-tight text-[#666666]">
            Faster checkout &amp; VIP access to limited drops.
          </span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex shrink-0 items-center gap-2 pl-2">
        <a
          href="#open-app"
          onClick={(e) => {
            e.preventDefault();
            window.alert('Opening the UniqueLo Streetwear App...');
          }}
          className="inline-flex h-8 items-center rounded-full bg-black px-3.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-neutral-800 active:scale-95"
        >
          Open app
        </a>

        {/* 44x44px ergonomic touch area wrapper for the close button */}
        <button
          type="button"
          onClick={dismissBanner}
          aria-label="Dismiss smart app banner"
          className="flex h-11 w-11 items-center justify-center text-neutral-400 hover:text-black"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};
