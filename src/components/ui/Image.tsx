import React, { useState } from 'react';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: string;
  placeholderColor?: string;
  lazy?: boolean;
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  aspectRatio = '3/4',
  placeholderColor = 'var(--color-stone)',
  lazy = true,
  className = '',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Fallback to tonal placeholder if path fails
  const imgSrc = hasError ? '/images/placeholders/hero.jpg' : src;

  return (
    <div
      className={`relative overflow-hidden bg-stone/40 select-none ${className}`}
      style={{
        aspectRatio,
        backgroundColor: placeholderColor,
      }}
    >
      <img
        src={imgSrc}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`w-full h-full object-cover transition-all duration-700 ease-out ${
          isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'
        }`}
        {...props}
      />
    </div>
  );
};
