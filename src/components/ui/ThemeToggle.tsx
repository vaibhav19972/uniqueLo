import React from 'react';
import { useThemeMode } from '../../config/theme';

/**
 * Light ⇄ dark switch.
 *
 * Both icons are always in the DOM and slide past each other, so the control
 * has a fixed width in both modes and the header never reflows on toggle.
 * The state is announced with aria-pressed rather than by swapping the label,
 * so screen readers hear "Dark mode, toggle button, pressed".
 */
export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { mode, toggle } = useThemeMode();
  const isDark = mode === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative inline-flex items-center justify-center w-9 h-9 min-w-[36px] min-h-[36px] sm:w-10 sm:h-10 text-ink hover:text-accent transition-colors duration-300 group ${className}`}
    >
      {/* Sun — visible in light mode */}
      <svg
        className={`absolute w-5 h-5 transition-all duration-500 ease-base ${
          isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4.2" strokeWidth="1.5" />
        <path
          strokeLinecap="round"
          strokeWidth="1.5"
          d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"
        />
      </svg>

      {/* Moon — visible in dark mode */}
      <svg
        className={`absolute w-5 h-5 transition-all duration-500 ease-base ${
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M20.5 14.3A8.5 8.5 0 019.7 3.5a8.5 8.5 0 1010.8 10.8z"
        />
      </svg>
    </button>
  );
};
