import { useModoTransicao } from "@/contexts/ModoTransicaoContext";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContadorTransicaoProps {
  className?: string;
  compact?: boolean;
}

export function ContadorTransicao({ className, compact = false }: ContadorTransicaoProps) {
  const { diasRestantes, isSP } = useModoTransicao();

  if (!isSP) return null;

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-1.5 text-xs font-medium",
        "bg-amber-500/10 text-amber-600 px-2 py-1 rounded-full",
        className
      )}>
        <Clock className="w-3 h-3" />
        <span>{diasRestantes}d restantes</span>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-2 px-4 py-2 rounded-xl",
      "bg-gradient-to-r from-amber-500/10 to-orange-500/10",
      "border border-amber-500/20",
      className
    )}>
      <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
        <Clock className="w-4 h-4 text-amber-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-amber-600">
          Faltam {diasRestantes} dias
        </p>
        <p className="text-xs text-muted-foreground">
          para o fim da transição em SP
        </p>
      </div>
    </div>
  );
}
