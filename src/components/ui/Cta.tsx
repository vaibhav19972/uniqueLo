import React from 'react';
import { Link } from 'react-router';

/**
 * Render-style marketing CTAs (chatgpt-v2 targets): serif, sentence-case,
 * gold solid or ink outline. Commerce UI keeps using `Button` (sans, uppercase).
 */
type CtaVariant = 'gold' | 'outline' | 'light';

const variantStyles: Record<CtaVariant, string> = {
  gold: 'bg-gold text-on-gold hover:bg-gold-hover',
  outline: 'bg-transparent text-ink border border-ink/30 hover:border-ink',
  light: 'bg-cream text-ink hover:bg-paper',
};

const base =
  'inline-flex items-center justify-center gap-2 px-7 py-3.5 font-serif text-lg leading-none tracking-normal transition-colors min-h-[48px] select-none';

interface CtaProps {
  variant?: CtaVariant;
  className?: string;
  children: React.ReactNode;
}

export const CtaButton: React.FC<CtaProps & React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  variant = 'gold',
  className = '',
  children,
  ...props
}) => (
  <button className={`${base} ${variantStyles[variant]} ${className}`} {...props}>
    {children}
  </button>
);

export const CtaLink: React.FC<CtaProps & { to: string }> = ({
  variant = 'gold',
  className = '',
  to,
  children,
}) => (
  <Link to={to} className={`${base} ${variantStyles[variant]} ${className}`}>
    {children}
  </Link>
);

/** Small functional-voice text link "View all / See more" (render style: sans, hairline underline). */
export const TextLink: React.FC<{ to: string; children: React.ReactNode; className?: string }> = ({
  to,
  children,
  className = '',
}) => (
  <Link
    to={to}
    className={`hidden sm:inline-flex items-center gap-2 text-sm font-sans font-medium text-ink border-b border-ink/30 hover:border-ink pb-1 transition-colors shrink-0 ${className}`}
  >
    {children}
  </Link>
);
