import React from 'react';

interface PackageImageProps {
    src?: string;
    alt: string;
    className?: string;
    fallbackSrc?: string;
}

export function PackageImage({
    src,
    alt,
    className = "w-full h-full object-cover",
    fallbackSrc = 'https://images.unsplash.com/photo-1579621970590-9d624316904b?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
}: PackageImageProps) {
    return (
        <img
            src={src || fallbackSrc}
            alt={alt}
            className={className}
            onError={(e) => {
                const imgEl = e.target as HTMLImageElement;
                if (imgEl.src !== fallbackSrc) {
                    imgEl.onerror = null;
                    imgEl.src = fallbackSrc;
                }
            }}
        />
    );
} 