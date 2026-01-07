import { useState, memo } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
}

function OptimizedImageComponent({
  src,
  alt,
  className,
  fallbackSrc = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Optimize Unsplash URLs with WebP format and quality
  const optimizedSrc = (() => {
    if (hasError) return fallbackSrc;
    if (!src) return fallbackSrc;
    
    if (src.includes("unsplash.com")) {
      const separator = src.includes("?") ? "&" : "?";
      return `${src}${separator}fm=webp&q=80&w=400`;
    }
    return src;
  })();

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!isLoaded && (
        <Skeleton className={cn("absolute inset-0", className)} />
      )}
      <img
        src={optimizedSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        {...props}
      />
    </div>
  );
}

export const OptimizedImage = memo(OptimizedImageComponent);
