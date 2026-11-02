import React from 'react';

export type LogoVariant = 'horizontal' | 'stacked' | 'emblem' | 'wordmark' | 'embroidery';

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  variant?: LogoVariant;
  className?: string;
  alt?: string;
}

/**
 * Shared Floral Branch artwork used across horizontal, stacked, and emblem lockups.
 */
const FloralBranch: React.FC = () => (
  <g id="flowering-branch" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path
      d="M42 177 C82 157 111 132 139 107 C164 85 189 63 224 37"
      stroke="#8A463B"
      strokeWidth="3.5"
    />
    <g stroke="#66715A" strokeWidth="2.6">
      <path d="M83 153 C67 137 54 138 49 140 C59 152 70 156 83 153Z" />
      <path d="M115 129 C104 111 91 108 82 110 C91 123 101 130 115 129Z" />
      <path d="M151 98 C145 81 133 75 123 77 C130 91 139 98 151 98Z" />
      <path d="M181 72 C179 57 170 49 160 48 C164 61 171 69 181 72Z" />
    </g>
    <g fill="#A65349" stroke="#8A463B" strokeWidth="1.2">
      <g transform="translate(91 111)">
        <ellipse cy="-6" rx="4.2" ry="6.5" />
        <ellipse cx="6" cy="-2" rx="4.2" ry="6.5" transform="rotate(72 6 -2)" />
        <ellipse cx="4" cy="5" rx="4.2" ry="6.5" transform="rotate(144 4 5)" />
        <ellipse cx="-4" cy="5" rx="4.2" ry="6.5" transform="rotate(216 -4 5)" />
        <ellipse cx="-6" cy="-2" rx="4.2" ry="6.5" transform="rotate(288 -6 -2)" />
        <circle r="2.2" fill="#D2A45A" stroke="none" />
      </g>
      <g transform="translate(151 78) scale(.82)">
        <ellipse cy="-6" rx="4.2" ry="6.5" />
        <ellipse cx="6" cy="-2" rx="4.2" ry="6.5" transform="rotate(72 6 -2)" />
        <ellipse cx="4" cy="5" rx="4.2" ry="6.5" transform="rotate(144 4 5)" />
        <ellipse cx="-4" cy="5" rx="4.2" ry="6.5" transform="rotate(216 -4 5)" />
        <ellipse cx="-6" cy="-2" rx="4.2" ry="6.5" transform="rotate(288 -6 -2)" />
        <circle r="2.2" fill="#D2A45A" stroke="none" />
      </g>
      <g transform="translate(198 54) scale(.68)">
        <ellipse cy="-6" rx="4.2" ry="6.5" />
        <ellipse cx="6" cy="-2" rx="4.2" ry="6.5" transform="rotate(72 6 -2)" />
        <ellipse cx="4" cy="5" rx="4.2" ry="6.5" transform="rotate(144 4 5)" />
        <ellipse cx="-4" cy="5" rx="4.2" ry="6.5" transform="rotate(216 -4 5)" />
        <ellipse cx="-6" cy="-2" rx="4.2" ry="6.5" transform="rotate(288 -6 -2)" />
        <circle r="2.2" fill="#D2A45A" stroke="none" />
      </g>
    </g>
  </g>
);

/**
 * Shared UL Monogram artwork.
 */
const ULMonogram: React.FC = () => (
  <g id="UL-monogram" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
    {/* U: broad, elegant bowl */}
    <path
      d="M55 26 V105 C55 145 77 165 111 165 C145 165 167 145 167 105 V45"
      strokeWidth="12"
    />
    {/* L: shares central stem and extends into foot */}
    <path d="M124 66 V181 H218" strokeWidth="12" />
    {/* Serif terminals */}
    <path d="M43 26 H67 M155 45 H179 M112 181 H136 M206 169 V193" strokeWidth="7" />
  </g>
);

/**
 * UNIQUELO OFFICIAL LOGO COMPONENT
 *
 * Implements the brand's master logo system.
 * Uses `currentColor` for line/text ink elements so it automatically harmonizes
 * with light and dark mode, while preserving floral/accent colors.
 */
export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  className = 'h-8 w-auto',
  alt = 'UniqueLo',
  ...rest
}) => {
  if (variant === 'horizontal') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 540 190"
        role="img"
        aria-label={alt}
        className={className}
        fill="none"
        {...rest}
      >
        <g transform="translate(0 0) scale(.78)">
          <ULMonogram />
          <FloralBranch />
        </g>
        <text
          x="224"
          y="117"
          fill="currentColor"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="62"
          letterSpacing="1.1"
        >
          UniqueLo
        </text>
        <path d="M227 137 H512" stroke="#8A463B" strokeWidth="2" />
      </svg>
    );
  }

  if (variant === 'stacked') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 300 260"
        role="img"
        aria-label={alt}
        className={className}
        fill="none"
        {...rest}
      >
        <g transform="translate(40 0) scale(.92)">
          <ULMonogram />
          <FloralBranch />
        </g>
        <text
          x="150"
          y="238"
          textAnchor="middle"
          fill="currentColor"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="30"
          letterSpacing="7"
        >
          UNIQUELO
        </text>
      </svg>
    );
  }

  if (variant === 'emblem') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 260 210"
        role="img"
        aria-label={alt}
        className={className}
        fill="none"
        {...rest}
      >
        <ULMonogram />
        <FloralBranch />
      </svg>
    );
  }

  if (variant === 'wordmark') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 540 190"
        role="img"
        aria-label={alt}
        className={className}
        fill="none"
        {...rest}
      >
        <text
          x="270"
          y="118"
          textAnchor="middle"
          fill="currentColor"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="76"
          letterSpacing="1.1"
        >
          UniqueLo
        </text>
        <path d="M142 145 H398" stroke="#8A463B" strokeWidth="2" />
      </svg>
    );
  }

  if (variant === 'embroidery') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 260 210"
        role="img"
        aria-label={alt}
        className={className}
        fill="none"
        {...rest}
      >
        <g fill="none" stroke="currentColor" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round">
          <path d="M55 26 V105 C55 145 77 165 111 165 C145 165 167 145 167 105 V45" />
          <path d="M124 66 V181 H218" />
        </g>
        <g fill="none" stroke="#8A463B" strokeWidth="7" strokeLinecap="round">
          <path d="M45 177 C84 157 112 132 140 107 C164 85 189 63 220 39" />
        </g>
        <g fill="#A65349">
          <circle cx="91" cy="111" r="7" />
          <circle cx="151" cy="78" r="7" />
          <circle cx="198" cy="54" r="6" />
        </g>
      </svg>
    );
  }

  return null;
};

