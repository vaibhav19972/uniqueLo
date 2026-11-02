import React from 'react';
import { Link } from 'react-router';
import { type AnnouncementItem, ANNOUNCEMENTS } from '../../config/announcements';

export interface AnnouncementBarProps {
  items?: AnnouncementItem[];
}

/**
 * TERMS STRIP
 *
 * Four facts, one line, ruled apart. No marquee, no badges, no flashing dots,
 * no dismiss button — a dismissal is a promise the visitor will never see the
 * terms again, and the terms are the reason the strip exists.
 *
 * On a phone the row stays horizontal and scrolls rather than wrapping into a
 * two-line block that pushes the header down.
 */
export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ items = ANNOUNCEMENTS }) => {
  return (
    <aside
      role="region"
      aria-label="Dispatch, payment and returns"
      className="border-b border-stone bg-panel"
    >
      <div className="mx-auto flex max-w-[var(--container-max)] items-stretch justify-between gap-6 px-4 sm:px-6 lg:px-12">
        <ul className="flex min-w-0 items-stretch gap-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item, i) => (
            <li
              key={item.id}
              className={`flex shrink-0 items-center py-1.5 ${
                i > 0 ? 'ml-4 border-l border-stone-strong pl-4' : ''
              }`}
            >
              {item.link ? (
                <Link
                  to={item.link}
                  aria-label={item.ariaLabel ?? item.text}
                  className="whitespace-nowrap font-sans text-[11px] tracking-[0.06em] text-ink-muted transition-colors hover:text-ink"
                >
                  {item.text}
                </Link>
              ) : (
                <span className="whitespace-nowrap font-sans text-[11px] tracking-[0.06em] text-ink-muted">
                  {item.text}
                </span>
              )}
            </li>
          ))}
        </ul>

        <Link
          to="/our-craft"
          className="hidden shrink-0 items-center gap-1.5 whitespace-nowrap font-sans text-[11px] uppercase tracking-[0.14em] text-ink transition-colors hover:text-accent sm:flex"
        >
          How it is made
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </aside>
  );
};
