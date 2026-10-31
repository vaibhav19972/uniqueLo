import React, { useState, useMemo } from 'react';
import { Link } from 'react-router';
import {
  type AnnouncementItem,
  type AnnouncementBadgeStyle,
  type AnnouncementIconType,
  DEFAULT_ANNOUNCEMENTS,
  getPrioritizedAnnouncements,
} from '../../config/announcements';
import { SITE_TWEAKS } from '../../config/tweaks';

export interface AnnouncementBarProps {
  customItems?: AnnouncementItem[];
  defaultMode?: 'marquee' | 'spotlight';
  speedSeconds?: number;
  showControls?: boolean;
}

/**
 * Announcement Icon Component
 * Renders lightweight, crisp SVG icons tailored to each announcement.
 */
const AnnouncementIcon: React.FC<{
  type?: AnnouncementIconType;
  className?: string;
}> = ({ type, className = 'w-3.5 h-3.5' }) => {
  switch (type) {
    case 'lightning':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 'truck':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      );
    case 'shield':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case 'tracking':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      );
    case 'craft':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
        </svg>
      );
    case 'gift':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      );
    case 'flame':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
      );
    case 'hourglass':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
        </svg>
      );
    default:
      return null;
  }
};

/**
 * Badge styling resolver.
 *
 * The bar carries one accent — the universe's — so badge variants differ by
 * EMPHASIS, not by hue. Three treatments only:
 *
 *   default   → quiet panel chip, reads as metadata
 *   urgent    → solid accent chip, reads as a deadline (crimson / amber)
 *   highlight → soft accent chip, reads as an offer (emerald / cyan / etc.)
 *
 * `isFlashing` adds a slow opacity pulse to the urgent treatment and nothing
 * to the rest. The old beacon pulse was dropped: it competed with the sticky
 * header for attention on every scroll.
 */
function getBadgeClasses(style: AnnouncementBadgeStyle, isFlashing?: boolean): string {
  const base = 'inline-flex items-center px-2 py-0.5 text-[10px] font-sans font-semibold uppercase tracking-widest';

  if (style === 'crimson' || style === 'amber') {
    return `${base} bg-accent text-on-accent ${isFlashing ? 'animate-flash-text' : ''}`;
  }

  if (style === 'default') {
    return `${base} border border-stone bg-panel text-ink`;
  }

  return `${base} border border-accent-border bg-accent-soft text-accent`;
}

/**
 * Announcement Content Renderer
 * Formats the badge, icon, pulsing beacon, and highlighted text.
 */
const AnnouncementCard: React.FC<{
  item: AnnouncementItem;
}> = ({ item }) => {
  const badgeClasses = getBadgeClasses(item.badgeStyle, item.isFlashing);

  // Split text if it has highlighted words
  let renderedText: React.ReactNode = item.text;
  if (item.highlightWords && item.text.includes(item.highlightWords)) {
    const [before, after] = item.text.split(item.highlightWords);
    renderedText = (
      <>
        <span>{before}</span>
        <span className="font-semibold text-accent underline decoration-accent/40 underline-offset-2">
          {item.highlightWords}
        </span>
        <span>{after}</span>
      </>
    );
  }

  const content = (
    <div className="inline-flex items-center gap-2.5 whitespace-nowrap group/item py-0.5">
      {/* Live dot — a single accent dot, no ping ring. */}
      {item.isFlashing && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
          aria-hidden="true"
        />
      )}

      {/* Badge Pill */}
      {item.badge && (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-mono font-bold tracking-wider uppercase transition-transform group-hover/item:scale-105 ${badgeClasses}`}
        >
          {item.icon && <AnnouncementIcon type={item.icon} className="w-3 h-3 shrink-0" />}
          <span>{item.badge}</span>
        </span>
      )}

      {/* Main Text */}
      <span className="font-sans text-[11.5px] sm:text-[12.5px] font-medium tracking-tight text-ink transition-colors">
        {renderedText}
      </span>

      {/* Subtle Arrow Indicator on Clickable Items */}
      {item.link && (
        <span
          aria-hidden="true"
          className="text-ink-muted text-[10px] group-hover/item:text-accent group-hover/item:translate-x-0.5 transition-all"
        >
          →
        </span>
      )}
    </div>
  );

  if (item.link) {
    return (
      <Link
        to={item.link}
        aria-label={item.ariaLabel || item.text}
        className="inline-flex items-center rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      >
        {content}
      </Link>
    );
  }

  return content;
};

/**
 * Revamped AnnouncementBar Component
 *
 * Clean, seamless e-commerce rolling announcement bar:
 * • Smooth continuous rolling animation in priority order from top to bottom.
 * • Flashing beacon dots and glowing badges on high-priority items.
 * • Natural pause-on-hover: hovering pauses scrolling so shoppers can comfortably read/click.
 * • Clean dismiss button (✕) on the right.
 * • Priority order is managed under the hood in `src/config/announcements.ts`.
 */
export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  customItems,
  speedSeconds = SITE_TWEAKS.announcements.speedSeconds,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  // Announcements ordered with flexible priority from top
  const announcements = useMemo(() => {
    return getPrioritizedAnnouncements(customItems || DEFAULT_ANNOUNCEMENTS, 'all');
  }, [customItems]);

  if (isDismissed) {
    return null;
  }

  return (
    <aside
      role="region"
      aria-label="Store Announcements and Offers"
      className="relative z-10 h-9 w-full select-none overflow-hidden border-b border-stone bg-panel text-xs text-ink"
    >
      <div className="h-full max-w-[var(--container-max)] mx-auto px-2 sm:px-4 flex items-center justify-between gap-2">
        {/* RUNNING / ROLLING MARQUEE */}
        <div
          className="flex-1 overflow-hidden relative mask-marquee-fade flex items-center h-full"
          title="Hover to pause"
        >
          {/* Infinite Marquee Track: duplicated sets for seamless loop */}
          <div
            className="flex shrink-0 items-center animate-marquee hover:[animation-play-state:paused] focus-within:[animation-play-state:paused]"
            style={{ animationDuration: `${speedSeconds}s` }}
          >
            {/* Set 1 */}
            <div className="flex shrink-0 items-center space-x-6 sm:space-x-8 pr-6 sm:pr-8">
              {announcements.map((item) => (
                <React.Fragment key={`set1-${item.id}`}>
                  <AnnouncementCard item={item} />
                  <span aria-hidden="true" className="select-none text-[10px] text-ink-muted/50">
                    ✦
                  </span>
                </React.Fragment>
              ))}
            </div>

            {/* Set 2 (for continuous 0% to -50% loop) */}
            <div
              className="flex shrink-0 items-center space-x-6 sm:space-x-8 pr-6 sm:pr-8"
              aria-hidden="true"
            >
              {announcements.map((item) => (
                <React.Fragment key={`set2-${item.id}`}>
                  <AnnouncementCard item={item} />
                  <span aria-hidden="true" className="select-none text-[10px] text-ink-muted/50">
                    ✦
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: CLEAN DISMISS BUTTON ONLY */}
        <button
          onClick={() => setIsDismissed(true)}
          aria-label="Dismiss announcement"
          title="Dismiss announcement"
          className="p-1 rounded text-ink-muted hover:text-ink hover:bg-panel-raised transition-colors shrink-0 z-10 min-w-[28px] min-h-[28px] flex items-center justify-center"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </aside>
  );
};