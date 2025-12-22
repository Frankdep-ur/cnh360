import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X, Check, Clock, MapPin, User, DollarSign, Navigation, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { AulaPendente } from "@/hooks/useInstrutorNotifications";
import { useAulasPendentes } from "@/hooks/useAulasPendentes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NovaAulaPopupEnhancedProps {
  aula: AulaPendente | null;
  open: boolean;
  onClose: () => void;
}

export function NovaAulaPopupEnhanced({ aula, open, onClose }: NovaAulaPopupEnhancedProps) {
  const { aceitarAula, recusarAula, loading } = useAulasPendentes();

  if (!aula) return null;

  const dataFormatada = format(new Date(aula.data_hora), "EEEE, dd 'de' MMMM 'às' HH:mm", {
    locale: ptBR,
  });

  // Mock ETA and distance based on location
  const eta = Math.floor(Math.random() * 10) + 5; // 5-15 min
  const distance = (Math.random() * 3 + 1).toFixed(1); // 1-4 km

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

  const handleNavigate = () => {
    const destination = aula.ponto_encontro || "Araçatuba, SP";
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
    window.open(url, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 border-[#4CAF50] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#4CAF50] text-xl">
            <div className="w-3 h-3 bg-[#4CAF50] rounded-full animate-ping" />
            🚗 Novo Pedido de Aula!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Student Info */}
          <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg text-foreground">{aula.aluno_nome || "Aluno"}</p>
              <p className="text-sm text-muted-foreground">Araçatuba, SP</p>
            </div>
          </div>

          {/* Map Preview with Route */}
          <Card className="overflow-hidden">
            <div className="relative h-32 bg-gradient-to-br from-primary/5 to-secondary/5">
              <svg className="w-full h-full" viewBox="0 0 400 128">
                <defs>
                  <pattern id="grid-popup" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-muted-foreground/20" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-popup)" />
                
                <path
                  d="M 50 100 Q 150 40 350 30"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="10 5"
                />
                
                <circle cx="50" cy="100" r="10" fill="#4CAF50" />
                <circle cx="50" cy="100" r="5" fill="white" />
                
                <circle cx="350" cy="30" r="10" fill="#f44336" />
                <circle cx="350" cy="30" r="5" fill="white" />
                
                <g transform="translate(200, 60)">
                  <circle r="12" fill="white" />
                  <text x="0" y="4" textAnchor="middle" fontSize="12">🚗</text>
                </g>
              </svg>
              
              {/* ETA and Distance */}
              <div className="absolute top-2 right-2 flex gap-2">
                <div className="bg-background/95 backdrop-blur-sm rounded-lg px-2 py-1 text-sm font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#4CAF50]" />
                  {eta} min
                </div>
                <div className="bg-background/95 backdrop-blur-sm rounded-lg px-2 py-1 text-sm font-bold flex items-center gap-1">
                  <Car className="w-3 h-3 text-primary" />
                  {distance} km
                </div>
              </div>
            </div>
          </Card>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-primary" />
                <p className="text-xs text-muted-foreground">Horário</p>
              </div>
              <p className="font-semibold text-sm capitalize">{dataFormatada}</p>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-[#4CAF50]" />
                <p className="text-xs text-muted-foreground">Valor</p>
              </div>
              <p className="font-bold text-[#4CAF50]">
                R$ {aula.valor.toFixed(2)}
                <span className="text-xs font-normal text-muted-foreground ml-1">
                  ({aula.duracao_minutos}min)
                </span>
              </p>
            </div>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-destructive" />
              <p className="text-xs text-muted-foreground">Ponto de Encontro</p>
            </div>
            <p className="font-semibold text-sm">{aula.ponto_encontro || "A combinar"}</p>
          </div>

          {/* Navigate Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleNavigate}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Ver rota no Google Maps
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
            onClick={handleRecusar}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Rejeitar
          </Button>
          <Button
            className="flex-1 bg-[#4CAF50] hover:bg-[#45a049] text-white"
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
