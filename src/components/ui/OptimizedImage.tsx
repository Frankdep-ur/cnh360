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
  fallbackSrc,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const resolvedSrc = (() => {
    if (hasError || !src) return fallbackSrc || "";
    return src;
  })();

  if (!resolvedSrc) {
    // No image available — render initials fallback
    const initials = alt?.split(' ').filter(Boolean).map(p => p[0]).slice(0, 2).join('').toUpperCase() || '?';
    let hash = 0;
    for (let i = 0; i < alt.length; i++) hash = alt.charCodeAt(i) + ((hash << 5) - hash);
    const bgColor = `hsl(${Math.abs(hash) % 360}, 55%, 45%)`;
    return (
      <div className={cn("flex items-center justify-center text-white font-bold", className)} style={{ backgroundColor: bgColor }}>
        {initials}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!isLoaded && (
        <Skeleton className={cn("absolute inset-0", className)} />
      )}
      <img
        src={resolvedSrc}
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
