import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X, Check, Clock, MapPin, User, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AulaPendente } from "@/hooks/useInstrutorNotifications";
import { useAulasPendentes } from "@/hooks/useAulasPendentes";
import { toast } from "sonner";

interface NovaAulaPopupProps {
  aula: AulaPendente | null;
  open: boolean;
  onClose: () => void;
}

export function NovaAulaPopup({ aula, open, onClose }: NovaAulaPopupProps) {
  const { aceitarAula, recusarAula, loading } = useAulasPendentes();

  if (!aula) return null;

  const dataFormatada = format(new Date(aula.data_hora), "EEEE, dd 'de' MMMM 'às' HH:mm", {
    locale: ptBR,
  });

  const handleAceitar = async () => {
    try {
      await aceitarAula(aula.id);
      toast.success("Aula aceita! O aluno será notificado.");
      onClose();
    } catch (error) {
      toast.error("Erro ao aceitar aula");
    }
  };

  const handleRecusar = async () => {
    try {
      await recusarAula(aula.id);
      toast.info("Aula recusada");
      onClose();
    } catch (error) {
      toast.error("Erro ao recusar aula");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 border-green-500 animate-pulse-slow">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-600 text-xl">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
            🚗 Novo Pedido de Aula!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Aluno</p>
              <p className="font-semibold">{aula.aluno_nome || "Aluno"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Horário</p>
              <p className="font-semibold capitalize">{dataFormatada}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Local</p>
              <p className="font-semibold">{aula.ponto_encontro || "A combinar"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Valor</p>
              <p className="font-semibold text-green-600">
                R$ {aula.valor.toFixed(2)} ({aula.duracao_minutos} min)
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={handleRecusar}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Rejeitar
          </Button>
          <Button
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={handleAceitar}
            disabled={loading}
          >
            <Check className="h-4 w-4 mr-2" />
            Aceitar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
