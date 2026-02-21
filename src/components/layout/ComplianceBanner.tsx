import { Shield, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ComplianceBannerProps {
  variant?: "full" | "compact";
  dismissible?: boolean;
  className?: string;
}

export function ComplianceBanner({ 
  variant = "compact", 
  dismissible = false,
  className 
}: ComplianceBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (variant === "full") {
    return (
      <div className={cn(
        "bg-gradient-to-r from-primary to-secondary text-primary-foreground px-4 py-3 relative",
        className
      )}>
        <div className="max-w-md mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide opacity-90">
              100% Alinhado
            </p>
            <p className="text-sm font-medium">
              Res. CONTRAN 1.020/2025: Mínimo 2h por aula + Instrutores Autônomos + EAD Grátis!
            </p>
          </div>
          {dismissible && (
            <button 
              onClick={() => setDismissed(true)}
              className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0 hover:bg-primary-foreground/30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-primary/10 border border-primary/20 text-primary px-3 py-2 rounded-xl",
      className
    )}>
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 flex-shrink-0" />
        <p className="text-xs font-medium flex-1">
          Res. CONTRAN 1.020/2025: Mínimo 2h por aula + EAD grátis
        </p>
        <ChevronRight className="w-4 h-4 flex-shrink-0 opacity-50" />
      </div>
    </div>
  );
}
