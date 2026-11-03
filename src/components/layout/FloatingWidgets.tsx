import React, { useState } from 'react';

export const FloatingWidgets: React.FC = () => {
  const [showQR, setShowQR] = useState(true);

  return (
    <>
      {/* 1. Bottom-Left 44x44px Circular Chat Button */}
      <a
        href="https://wa.me/"
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with Customer Support on WhatsApp"
        className="fixed bottom-4 left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white shadow-xl border border-neutral-700 transition hover:scale-105 active:scale-95"
      >
        <svg
          className="h-6 w-6 fill-current text-white"
          viewBox="0 0 24 24"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67Z" />
        </svg>
      </a>

      {/* 2. Desktop Floating QR App Card (Hidden on mobile < 1024px) */}
      {showQR && (
        <div className="fixed bottom-4 left-20 z-40 hidden lg:flex items-center gap-3 rounded-xl bg-black/90 p-3 text-white backdrop-blur-md border border-neutral-700 shadow-2xl">
          {/* Mock QR SVG */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded bg-white p-1">
            <svg viewBox="0 0 24 24" className="h-full w-full fill-black">
              <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v2h-4v-2zm-4 0h2v4h-2v-4zm2 4h4v2h-4v-2z" />
            </svg>
          </div>

          <div className="pr-2">
            <p className="text-xs font-bold leading-tight">Get the App</p>
            <p className="text-[10px] text-neutral-400">Scan to unlock VIP drops</p>
          </div>

          <button
            type="button"
            onClick={() => setShowQR(false)}
            aria-label="Dismiss QR code"
            className="flex h-6 w-6 items-center justify-center text-neutral-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
};
