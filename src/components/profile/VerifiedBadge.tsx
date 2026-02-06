import { CheckCircle2, Shield, Clock, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type KycStatus = "approved" | "affiliation" | "registration" | "refused" | "not_started" | string;

interface VerifiedBadgeProps {
  isVerified: boolean;
  kycStatus?: KycStatus | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function VerifiedBadge({ 
  isVerified, 
  kycStatus,
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

  // Use kycStatus if provided, otherwise fall back to isVerified boolean
  const effectiveStatus = kycStatus || (isVerified ? "approved" : "not_started");

  if (effectiveStatus === "approved") {
    return (
      <div className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full bg-[#4CAF50]/10 text-[#4CAF50] font-medium",
        sizeClasses[size],
        className
      )}>
        <CheckCircle2 className={iconSizes[size]} />
        {showLabel && <span>Conta Verificada</span>}
      </div>
    );
  }

  if (effectiveStatus === "affiliation" || effectiveStatus === "registration") {
    return (
      <div className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium",
        sizeClasses[size],
        className
      )}>
        <Clock className={iconSizes[size]} />
        {showLabel && <span>Em análise</span>}
      </div>
    );
  }

  if (effectiveStatus === "refused") {
    return (
      <div className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-full bg-destructive/10 text-destructive font-medium",
        sizeClasses[size],
        className
      )}>
        <XCircle className={iconSizes[size]} />
        {showLabel && <span>Recusado</span>}
      </div>
    );
  }

  // Default: not_started / pending
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
