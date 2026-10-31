import React from 'react';

type Blob = {
  /** Position + size, as Tailwind arbitrary values. */
  className: string;
  /** Which wash token this blob pulls its colour from. */
  tone: 'a' | 'b' | 'c';
  /** Seconds; drives the drift speed. */
  duration: number;
  delay?: number;
};

const BLOBS: Blob[] = [
  { className: '-top-40 -left-32 w-[42rem] h-[42rem]', tone: 'a', duration: 26 },
  { className: '-top-24 right-[-12rem] w-[36rem] h-[36rem]', tone: 'b', duration: 34, delay: -6 },
  { className: 'bottom-[-14rem] left-1/3 w-[40rem] h-[40rem]', tone: 'c', duration: 30, delay: -12 },
];

/**
 * Soft colour fields behind a hero or portal band.
 *
 * These are the "playful background": large, low-opacity blobs tinted from the
 * wash tokens (which are themselves keyed to the active mode and universe
 * accent). They drift on the compositor — transform and opacity only — so
 * they cost nothing during scroll.
 *
 * Purely decorative: aria-hidden, pointer-events-none, and frozen to a static
 * position under prefers-reduced-motion.
 */
export const AmbientBackdrop: React.FC<{
  /** 'hero' bleeds off both edges; 'band' stays inside its section. */
  variant?: 'hero' | 'band';
  className?: string;
}> = ({ variant = 'hero', className = '' }) => (
  <div
    aria-hidden="true"
    className={`pointer-events-none absolute inset-0 overflow-hidden ${
      variant === 'band' ? 'rounded-2xl' : ''
    } ${className}`}
  >
    {BLOBS.map((blob, i) => (
      <div
        key={i}
        className={`wash-blob animate-blob ${blob.className}`}
        style={{
          backgroundColor: `var(--wash-${blob.tone})`,
          animationDuration: `${blob.duration}s`,
          animationDelay: `${blob.delay ?? 0}s`,
        }}
      />
    ))}

    {/* A faint stitched grid keeps the wash from reading as a blurry photo. */}
    <div
      className="absolute inset-0 opacity-[0.35]"
      style={{
        backgroundImage:
          'linear-gradient(to right, var(--color-stone) 1px, transparent 1px), linear-gradient(to bottom, var(--color-stone) 1px, transparent 1px)',
        backgroundSize: '64px 64px',
        maskImage: 'radial-gradient(ellipse at 50% 40%, black 20%, transparent 78%)',
        WebkitMaskImage: 'radial-gradient(ellipse at 50% 40%, black 20%, transparent 78%)',
      }}
    />
  </div>
);
