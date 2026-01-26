import { useState } from "react";
import { Star, Send, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface RatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instructorName: string;
  instructorPhoto: string | null;
  onSubmit: (nota: number, comentario: string) => Promise<void>;
}

export function RatingModal({
  open,
  onOpenChange,
  instructorName,
  instructorPhoto,
  onSubmit,
}: RatingModalProps) {
  const [nota, setNota] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comentario, setComentario] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (nota === 0) return;
    
    setSubmitting(true);
    try {
      await onSubmit(nota, comentario);
      // Reset state
      setNota(0);
      setComentario("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStarLabel = (rating: number) => {
    switch (rating) {
      case 1: return "Ruim";
      case 2: return "Regular";
      case 3: return "Bom";
      case 4: return "Muito bom";
      case 5: return "Excelente";
      default: return "Selecione uma nota";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Como foi sua aula?</DialogTitle>
          <DialogDescription className="text-center">
            Avalie sua experiência com {instructorName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center py-4 space-y-6">
          {/* Instructor Photo */}
          <div className="relative">
            {instructorPhoto ? (
              <img
                src={instructorPhoto}
                alt={instructorName}
                className="w-20 h-20 rounded-full object-cover border-4 border-primary/20"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-4 border-primary/20">
                <span className="text-2xl font-bold text-primary">
                  {instructorName.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Star Rating */}
          <div className="flex flex-col items-center space-y-2">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNota(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={cn(
                      "w-10 h-10 transition-colors",
                      (hoveredStar || nota) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
            </div>
            <span className={cn(
              "text-sm font-medium transition-colors",
              nota > 0 ? "text-foreground" : "text-muted-foreground"
            )}>
              {getStarLabel(hoveredStar || nota)}
            </span>
          </div>

          {/* Comment */}
          <div className="w-full space-y-2">
            <Textarea
              placeholder="Deixe um comentário sobre a aula (opcional)..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comentario.length}/500
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              <X className="w-4 h-4 mr-2" />
              Pular
            </Button>
            <Button
              className="flex-1 gradient-primary text-primary-foreground"
              onClick={handleSubmit}
              disabled={nota === 0 || submitting}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Enviar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
