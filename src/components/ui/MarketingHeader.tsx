import React from 'react';
import { TextLink } from './Cta';

/**
 * Render-style marketing section header (chatgpt-v2 targets):
 * gold eyebrow · large tight serif title · muted sub · right-aligned link.
 * Distinct from ui/SectionHeader (atelier archetypes) — marketing surfaces only.
 */
interface MarketingHeaderProps {
  eyebrow: string;
  title: string;
  titleId: string;
  sub?: string;
  linkTo?: string;
  linkLabel?: string;
}

export const MarketingHeader: React.FC<MarketingHeaderProps> = ({
  eyebrow,
  title,
  titleId,
  sub,
  linkTo,
  linkLabel,
}) => (
  <div className="flex items-end justify-between gap-6 mb-10 lg:mb-12">
    <div>
      <p className="text-[11px] font-sans uppercase tracking-[0.28em] text-gold">{eyebrow}</p>
      <h2
        id={titleId}
        className="font-serif text-4xl sm:text-5xl lg:text-6xl text-ink mt-3 tracking-tight leading-[1.05]"
      >
        {title}
      </h2>
      {sub && <p className="text-[15px] sm:text-base text-ink-muted mt-3 font-light">{sub}</p>}
    </div>
    {linkTo && linkLabel && (
      <TextLink to={linkTo}>
        {linkLabel} <span aria-hidden="true">→</span>
      </TextLink>
    )}
  </div>
);
