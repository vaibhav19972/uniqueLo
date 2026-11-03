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
  <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-neutral-200 pb-4">
    <div className="min-w-0">
      <h2
        id={titleId}
        className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-neutral-900"
      >
        {title}
      </h2>
      {sub && (
        <p className="mt-1.5 max-w-[58ch] text-xs sm:text-sm text-neutral-500 leading-relaxed">
          {sub}
        </p>
      )}
    </div>

    <div className="flex items-center gap-6">
      {typeof count === 'number' && (
        <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-bold text-neutral-600">
          {count} {countLabel ?? 'pieces'}
        </span>
      )}
      {linkTo && linkLabel && (
        <Link
          to={linkTo}
          className="group inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-black transition-colors hover:text-red-600"
        >
          <span>{linkLabel}</span>
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      )}
    </div>
  </div>
);
