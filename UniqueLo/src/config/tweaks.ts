/**
 * ─────────────────────────────────────────────────────────────────────────────
 * UNIQUE LO — WEBSITE TWEAKS & CONFIGURATION VARIABLES
 * ─────────────────────────────────────────────────────────────────────────────
 * Central configuration file for adjusting site-wide timings, animation speeds,
 * carousel settings, UX behaviors, and display toggles.
 *
 * Keep all tuning variables here so anyone can easily customize site behavior.
 */

export interface SiteTweaks {
  /**
   * Section 1: Hero Carousel Settings
   */
  carousel: {
    /**
     * Duration (in milliseconds) each slide stays active before rolling to the next.
     * e.g., 6000 = 6 seconds, 5000 = 5 seconds, 4000 = 4 seconds.
     */
    speedMs: number;

    /**
     * Controls whether the carousel roll timer stops when the cursor hovers over it.
     * Set to false so the timer never pauses and rolls continuously.
     */
    pauseOnHover: boolean;

    /**
     * Crossfade image transition duration in milliseconds.
     */
    fadeDurationMs: number;
  };

  /**
   * General UI Timings
   */
  ui: {
    /**
     * Toast notification auto-dismiss duration in milliseconds.
     */
    toastDurationMs: number;
  };
}

export const SITE_TWEAKS: SiteTweaks = {
  carousel: {
    // ⏱️ CAROUSEL SPEED: Duration per slide in milliseconds (e.g. 6000 = 6s)
    speedMs: 4000,

    // 🔄 PAUSE ON HOVER: Set to false so the roll timer counts continuously even when hovering
    pauseOnHover: false,

    // 🎨 CROSSFADE DURATION: Speed of image opacity transition in ms
    fadeDurationMs: 2000,
  },
  ui: {
    toastDurationMs: 1000,
  },
};

/**
 * Direct shorthand exports for quick import and tweaking
 */
export const CAROUSEL_SPEED_MS = SITE_TWEAKS.carousel.speedMs;
export const CAROUSEL_PAUSE_ON_HOVER = SITE_TWEAKS.carousel.pauseOnHover;
