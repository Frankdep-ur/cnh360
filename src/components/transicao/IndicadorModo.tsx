import { useModoTransicao } from "@/contexts/ModoTransicaoContext";
import { cn } from "@/lib/utils";
import { Leaf, Building2 } from "lucide-react";

interface IndicadorModoProps {
  className?: string;
  showLabel?: boolean;
}

export function IndicadorModo({ className, showLabel = true }: IndicadorModoProps) {
  const { modo, config } = useModoTransicao();

  if (!modo) return null;

  const isNovaLei = modo === "nova_lei";
  const Icon = isNovaLei ? Leaf : Building2;

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
      isNovaLei 
        ? "bg-primary/10 text-primary border border-primary/20" 
        : "bg-secondary/10 text-secondary border border-secondary/20",
      className
    )}>
      <Icon className="w-3 h-3" />
      {showLabel && (
        <span>{config.label}</span>
      )}
    </div>
  );
}
