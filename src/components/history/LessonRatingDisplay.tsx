import { Star, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface LessonRatingDisplayProps {
  nota: number;
  comentario: string | null;
  dataAvaliacao: string;
  isOwn?: boolean; // true = aluno vendo sua avaliação, false = instrutor recebendo
}

export function LessonRatingDisplay({ 
  nota, 
  comentario, 
  dataAvaliacao,
  isOwn = true 
}: LessonRatingDisplayProps) {
  const getRatingLabel = (rating: number) => {
    if (rating >= 5) return 'Excelente';
    if (rating >= 4) return 'Muito Bom';
    if (rating >= 3) return 'Bom';
    if (rating >= 2) return 'Regular';
    return 'Precisa Melhorar';
  };

  return (
    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-500" />
          {isOwn ? 'Minha Avaliação' : 'Avaliação Recebida'}
        </h4>
        <span className="text-xs text-muted-foreground">
          {format(new Date(dataAvaliacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </span>
      </div>

      {/* Stars */}
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= nota
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground/30'
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-foreground">
          {getRatingLabel(nota)}
        </span>
      </div>

      {/* Comment */}
      {comentario && (
        <div className="flex items-start gap-2 pt-2 border-t border-border">
          <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground italic">
            "{comentario}"
          </p>
        </div>
      )}
    </div>
  );
}
