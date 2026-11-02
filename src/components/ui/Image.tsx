import React, { useState } from 'react';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspectRatio?: string;
  placeholderColor?: string;
  lazy?: boolean;
  /**
   * How the photograph fills its frame. `cover` crops to fill — right for
   * garment-on-model shots. `contain` preserves the whole product, which is
   * what a cut-out studio shot needs: cropping a shirt to a 4:5 hero box
   * silently deletes its collar and hem.
   */
  fit?: 'cover' | 'contain';
}

export const Image: React.FC<ImageProps> = ({
  src,
  alt,
  aspectRatio = '3/4',
  placeholderColor = 'var(--color-stone)',
  lazy = true,
  fit = 'cover',
  className = '',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);
  const [overrideSrc, setOverrideSrc] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

  // If prop src changed during render, reset state
  if (prevSrc !== src) {
    setPrevSrc(src);
    setOverrideSrc(null);
    setHasError(false);
    setIsLoaded(false);
  }

  const currentSrc = overrideSrc || src;

  const handleError = () => {
    // If the path failed, try the alternate extension (.png vs .jpg)
    if (!overrideSrc) {
      if (src.endsWith('.jpg')) {
        setOverrideSrc(src.replace(/\.jpg$/, '.png'));
      } else if (src.endsWith('.png')) {
        setOverrideSrc(src.replace(/\.png$/, '.jpg'));
      } else if (src.endsWith('.jpeg')) {
        setOverrideSrc(src.replace(/\.jpeg$/, '.png'));
      } else {
        setHasError(true);
      }
    } else {
      setHasError(true);
    }
  };

  // Fallback to tonal placeholder if path fails completely
  const imgSrc = hasError ? '/images/placeholders/hero.jpg' : currentSrc;

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
        onError={handleError}
        className={`w-full h-full transition-all duration-700 ease-out ${
          fit === 'contain' ? 'object-contain' : 'object-cover'
        } ${isLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-105 blur-sm'}`}
        {...props}
      />
    </div>
  );
};
