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
   * Section 2: Announcement Bar Settings
   */
  announcements: {
    /**
     * Duration in seconds for one full loop of the marquee running ticker.
     * Lower value = faster movement; Higher value = gentler movement.
     */
    speedSeconds: number;
    /**
     * Pause scrolling when hovered by mouse.
     */
    pauseOnHover: boolean;
    /**
     * Interval in milliseconds between items in Spotlight mode.
     */
    spotlightIntervalMs: number;
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
  announcements: {
    // 📢 ANNOUNCEMENT MARQUEE SPEED: Duration for one full loop (in seconds)
    speedSeconds: 32,
    // ⏸️ PAUSE ON HOVER: Pause marquee on mouse hover
    pauseOnHover: true,
    // ⏱️ SPOTLIGHT ROTATION: Duration per announcement in spotlight mode (ms)
    spotlightIntervalMs: 4500,
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
export const ANNOUNCEMENT_SPEED_SECONDS = SITE_TWEAKS.announcements.speedSeconds;
export const ANNOUNCEMENT_PAUSE_ON_HOVER = SITE_TWEAKS.announcements.pauseOnHover;

