import React from 'react';
import { Link } from 'react-router';

/**
 * THE SECTION HEAD
 *
 * Every band on the page is introduced the same way, and the shape is a
 * loom-rule, not a magazine masthead. The old header stacked a tracked
 * eyebrow above a large serif title above an italic sub — three type
 * registers for one thought, repeated ten times down the page. That is the
 * exact pattern that makes a storefront read as a template.
 *
 * Here the heading carries its own weight: the title is the loudest thing,
 * the supporting line sits beneath it at reading size, and the action is a
 * plain underlined link on the same baseline. One register, three jobs.
 */
interface MarketingHeaderProps {
  title: string;
  titleId: string;
  sub?: string;
  linkTo?: string;
  linkLabel?: string;
  /** Count of items in the band, shown as a fact rather than a badge. */
  count?: number;
  countLabel?: string;
}

export const MarketingHeader: React.FC<MarketingHeaderProps> = ({
  title,
  titleId,
  sub,
  linkTo,
  linkLabel,
  count,
  countLabel,
}) => (
  <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-stone pb-4">
    <div className="min-w-0">
      <h2
        id={titleId}
        className="loom-display text-ink"
        style={{ fontSize: 'var(--text-display-lg)' }}
      >
        {title}
      </h2>
      {sub && (
        <p className="mt-2 max-w-[58ch] font-sans text-[15px] leading-relaxed text-ink-muted">
          {sub}
        </p>
      )}
    </div>

    <div className="flex items-center gap-6">
      {typeof count === 'number' && (
        <p className="loom-label text-ink-muted">
          {count} {countLabel ?? 'pieces'}
        </p>
      )}
      {linkTo && linkLabel && (
        <Link
          to={linkTo}
          className="group inline-flex items-center gap-1.5 border-b border-stone-strong pb-0.5 font-sans text-[13px] font-medium text-ink transition-colors hover:border-ink"
        >
          {linkLabel}
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      )}
    </div>
  </div>
);
