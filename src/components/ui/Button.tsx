import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed select-none focus-visible:outline-2 focus-visible:outline-accent';

    const sizeStyles = {
      sm: 'px-3.5 py-1.5 text-xs font-medium uppercase tracking-wider',
      md: 'px-6 py-3 text-sm font-medium uppercase tracking-widest',
      lg: 'px-8 py-4 text-base font-medium uppercase tracking-widest',
    }[size];

    const variantStyles = {
      primary:
        'bg-ink text-cream hover:bg-ink/90 active:scale-[0.99] border border-ink',
      secondary:
        'bg-transparent text-ink border border-stone hover:border-ink hover:bg-stone/20 active:scale-[0.99]',
      ghost:
        'bg-transparent text-ink hover:bg-stone/30 active:scale-[0.99] border border-transparent',
      accent:
        'bg-accent text-paper hover:bg-accent/90 active:scale-[0.99] border border-accent',
    }[variant];

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
