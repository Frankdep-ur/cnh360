import { CheckCircle2, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  isVerified: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function VerifiedBadge({ 
  isVerified, 
  size = "md", 
  showLabel = true,
  className 
}: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "text-xs gap-1",
    md: "text-sm gap-1.5",
    lg: "text-base gap-2"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  };

  if (!isVerified) {
    return (
      <div className={cn(
        "inline-flex items-center px-2 py-1 rounded-full bg-muted text-muted-foreground",
        sizeClasses[size],
        className
      )}>
        <Shield className={iconSizes[size]} />
        {showLabel && <span>Pendente</span>}
      </div>
    );
  }

  return (
    <div className={cn(
      "inline-flex items-center px-2 py-1 rounded-full bg-primary/10 text-primary font-medium",
      sizeClasses[size],
      className
    )}>
      <CheckCircle2 className={iconSizes[size]} />
      {showLabel && <span>Verificado</span>}
    </div>
  );
}
