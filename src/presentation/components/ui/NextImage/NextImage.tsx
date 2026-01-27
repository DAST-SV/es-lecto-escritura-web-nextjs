'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_BLUR_DATA_URL =
  'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q==';

const DEFAULT_FALLBACK_SRC = '/images/placeholder.jpg';

// ============================================
// TYPES
// ============================================

export interface NextImageProps extends Omit<ImageProps, 'onError'> {
  /** Fallback image source when main image fails to load */
  fallbackSrc?: string;
  /** Show loading spinner while image loads */
  showLoader?: boolean;
  /** Custom class for the loader container */
  loaderClassName?: string;
}

// ============================================
// COMPONENT
// ============================================

/**
 * Optimized Next.js Image component with fallback support
 *
 * Features:
 * - Automatic lazy loading
 * - Blur placeholder for better UX
 * - Fallback image on error
 * - Optional loading spinner
 * - GPU acceleration for smooth transitions
 */
export function NextImage({
  src,
  alt,
  className,
  fallbackSrc = DEFAULT_FALLBACK_SRC,
  showLoader = false,
  loaderClassName,
  placeholder = 'blur',
  blurDataURL = DEFAULT_BLUR_DATA_URL,
  quality = 85,
  ...props
}: NextImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  }, [fallbackSrc, hasError]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Loading spinner */}
      {showLoader && isLoading && (
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse z-10',
            loaderClassName
          )}
        >
          <svg
            className="w-8 h-8 text-gray-300 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      )}

      <Image
        src={imgSrc}
        alt={alt}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        quality={quality}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'transition-opacity duration-300 will-change-transform',
          isLoading ? 'opacity-0' : 'opacity-100'
        )}
        {...props}
      />
    </div>
  );
}

export default NextImage;
