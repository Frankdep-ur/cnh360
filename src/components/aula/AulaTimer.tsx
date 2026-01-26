import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface AulaTimerProps {
  elapsedFormatted: string;
  duracaoMinutos: number;
  elapsedSeconds: number;
  canFinish: boolean;
  remainingMinutes: number;
  className?: string;
}

export function AulaTimer({ 
  elapsedFormatted, 
  duracaoMinutos, 
  elapsedSeconds,
  canFinish,
  remainingMinutes,
  className 
}: AulaTimerProps) {
  const totalSeconds = duracaoMinutos * 60;
  const progressPercent = Math.min(100, (elapsedSeconds / totalSeconds) * 100);

  return (
    <div className={cn("bg-card rounded-2xl p-6 shadow-lg", className)}>
      <div className="flex items-center justify-center gap-3 mb-4">
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center",
          canFinish ? "bg-[#4CAF50]" : "bg-primary"
        )}>
          <Clock className="w-6 h-6 text-white" />
        </div>
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Tempo de aula</p>
          <p className="text-4xl font-bold text-foreground font-mono">
            {elapsedFormatted}
          </p>
        </div>
      </div>

      <Progress 
        value={progressPercent} 
        className="h-2 mb-3"
      />

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0 min</span>
        <span>{duracaoMinutos} min</span>
      </div>

      {!canFinish && remainingMinutes > 0 && (
        <p className="text-center text-sm text-muted-foreground mt-4">
          Faltam <span className="font-semibold text-primary">{remainingMinutes} min</span> para poder finalizar
        </p>
      )}

      {canFinish && (
        <p className="text-center text-sm text-[#4CAF50] font-medium mt-4">
          ✓ Tempo mínimo atingido! Você pode finalizar a aula.
        </p>
      )}
    </div>
  );
}
