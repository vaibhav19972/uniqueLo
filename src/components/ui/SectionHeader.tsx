import React from 'react';

interface SectionHeaderProps {
  archetype?: 'index' | 'statement' | 'utility';
  numeral?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  archetype = 'index',
  numeral,
  eyebrow,
  title,
  subtitle,
  action,
  className = '',
}) => {
  if (archetype === 'statement') {
    return (
      <div className={`mb-12 pb-6 border-b border-stone/50 ${className}`}>
        <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-ink font-normal tracking-tight leading-[1.08]">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs sm:text-sm text-ink-muted max-w-2xl mt-4 font-light leading-relaxed">
            {subtitle}
          </p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
    );
  }

  if (archetype === 'utility') {
    return (
      <div className={`flex items-center justify-between pb-3 border-b border-stone/60 ${className}`}>
        <span className="text-[10px] font-sans tracking-[0.22em] uppercase font-medium text-ink">
          {title}
        </span>
        {action && <div>{action}</div>}
      </div>
    );
  }

  // Default: 'index' archetype (oversized numeral + title + hairline)
  return (
    <div className={`mb-10 pb-4 border-b border-stone/40 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          {numeral && (
            <span className="block text-[11px] font-sans tracking-[0.25em] text-ink-muted uppercase font-medium mb-1">
              {numeral}
            </span>
          )}
          {eyebrow && !numeral && (
            <span className="block text-[10px] font-sans tracking-[0.25em] text-accent uppercase font-medium mb-1">
              {eyebrow}
            </span>
          )}
          <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-ink-muted font-light mt-1.5 max-w-xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="mt-2 sm:mt-0">{action}</div>}
      </div>
    </div>
  );
};
