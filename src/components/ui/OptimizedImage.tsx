import React, { useState, useRef, useEffect } from 'react';
import { logger } from '@/lib/utils/logger';

const imageLogger = logger.create('OptimizedImage');

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  lazy?: boolean;
  quality?: number;
  blur?: boolean;
  onLoadComplete?: () => void;
  onError?: (error: Event) => void;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  lazy = true,
  quality = 75,
  blur = true,
  onLoadComplete,
  onError,
  className = '',
  style = {},
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isInView, setIsInView] = useState(!lazy);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazy || isInView) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            if (observerRef.current) {
              observerRef.current.disconnect();
            }
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, isInView]);

  // Set the source URL when the image should be loaded
  useEffect(() => {
    if (isInView && !currentSrc) {
      const optimizedSrc = optimizeImageUrl(src, quality);
      setCurrentSrc(optimizedSrc);
    }
  }, [isInView, src, quality, currentSrc]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoadComplete?.();
    imageLogger.debug(`Image loaded: ${src}`);
  };

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    imageLogger.warn(`Image failed to load: ${src}`);
    
    // Try fallback if available
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
      return;
    }
    
    onError?.(event.nativeEvent);
  };

  const imageStyles: React.CSSProperties = {
    ...style,
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0,
    filter: blur && !isLoaded ? 'blur(5px)' : 'none',
  };

  const placeholderStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isLoaded ? 0 : 1,
    transition: 'opacity 0.3s ease-in-out',
    color: '#9ca3af',
    fontSize: '14px',
  };

  // Show placeholder or error state
  if (!isInView || hasError) {
    return (
      <div
        ref={imgRef}
        className={`relative overflow-hidden ${className}`}
        style={style}
        {...(props as any)}
      >
        <div style={placeholderStyles}>
          {hasError ? (
            <span>Failed to load image</span>
          ) : (
            <span>Loading...</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={style}>
      {/* Placeholder */}
      {!isLoaded && (
        <div style={placeholderStyles}>
          <span>Loading...</span>
        </div>
      )}
      
      {/* Actual image */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        style={imageStyles}
        loading={lazy ? 'lazy' : 'eager'}
        decoding="async"
        {...props}
      />
    </div>
  );
}

// Image optimization utility
function optimizeImageUrl(src: string, quality: number): string {
  // If it's a local image or already optimized, return as-is
  if (src.startsWith('/') || src.startsWith('data:') || src.includes('w_') || src.includes('q_')) {
    return src;
  }

  // If it's an external URL, we could add optimization parameters
  // This is a placeholder - you'd typically use a service like Cloudinary, ImageKit, etc.
  try {
    const url = new URL(src);
    
    // Example for Cloudinary (adjust based on your image service)
    if (url.hostname.includes('cloudinary.com')) {
      // Add quality and format parameters
      const pathParts = url.pathname.split('/');
      const uploadIndex = pathParts.indexOf('upload');
      if (uploadIndex !== -1) {
        pathParts.splice(uploadIndex + 1, 0, `q_${quality}`, 'f_auto');
        url.pathname = pathParts.join('/');
      }
    }
    
    return url.toString();
  } catch {
    // If URL parsing fails, return original
    return src;
  }
}

// Hook for preloading images
export function useImagePreloader(imageSources: string[]) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadPromises = imageSources.map((src) => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set(prev).add(src));
          resolve(src);
        };
        img.onerror = () => {
          setFailedImages(prev => new Set(prev).add(src));
          reject(src);
        };
        img.src = src;
      });
    });

    Promise.allSettled(preloadPromises).then(() => {
      imageLogger.info(`Preloaded ${loadedImages.size} images, ${failedImages.size} failed`);
    });
  }, [imageSources]);

  return {
    loadedImages,
    failedImages,
    isImageLoaded: (src: string) => loadedImages.has(src),
    isImageFailed: (src: string) => failedImages.has(src),
  };
}

// Component for critical images that should load immediately
export function CriticalImage({ ...props }: OptimizedImageProps) {
  return <OptimizedImage {...props} lazy={false} />;
}