import React from 'react';
import { TextLink } from './Cta';

/**
 * Render-style marketing section header (chatgpt-v2 targets):
 * gold tracked-caps sans eyebrow · display serif title (--text-display-lg)
 * · italic serif poetic sub · right-aligned functional link.
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
      <p className="text-[12px] font-sans uppercase tracking-eyebrow font-medium text-gold">
        {eyebrow}
      </p>
      <h2
        id={titleId}
        className="font-serif font-medium text-ink mt-3 leading-display tracking-tight"
        style={{ fontSize: 'var(--text-display-lg)' }}
      >
        {title}
      </h2>
      {sub && (
        <p className="font-serif italic text-lg text-ink-muted mt-3 max-w-2xl">{sub}</p>
      )}
    </div>
    {linkTo && linkLabel && (
      <TextLink to={linkTo}>
        {linkLabel} <span aria-hidden="true">→</span>
      </TextLink>
    )}
  </div>
);