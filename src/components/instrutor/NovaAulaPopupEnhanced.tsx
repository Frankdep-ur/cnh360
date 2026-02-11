import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X, Check, Clock, MapPin, User, DollarSign, Navigation, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { AulaPendente } from "@/hooks/useInstrutorNotifications";
import { useAulasPendentes } from "@/hooks/useAulasPendentes";
import { useRoute } from "@/hooks/useRoute";
import { useGeolocation } from "@/hooks/useGeolocation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface NovaAulaPopupEnhancedProps {
  aula: AulaPendente | null;
  open: boolean;
  onClose: () => void;
}

export function NovaAulaPopupEnhanced({ aula, open, onClose }: NovaAulaPopupEnhancedProps) {
  const navigate = useNavigate();
  const { aceitarAula, recusarAula, loading } = useAulasPendentes();
  const { getCurrentLocation, latitude, longitude } = useGeolocation();
  const { route, calculateRoute, loading: routeLoading } = useRoute();
  const [calculatingRoute, setCalculatingRoute] = useState(false);

  // Calculate route when popup opens
  useEffect(() => {
    if (open && aula) {
      calculateRealRoute();
    }
  }, [open, aula]);

  const calculateRealRoute = async () => {
    if (!aula) return;
    
    setCalculatingRoute(true);
    try {
      // Get instructor's current location
      const location = await getCurrentLocation();
      
      if (location) {
        // Determine destination - use stored coordinates or address
        let destination: { lat: number; lng: number } | string;
        
        if (aula.latitude_encontro && aula.longitude_encontro) {
          destination = { lat: aula.latitude_encontro, lng: aula.longitude_encontro };
        } else if (aula.ponto_encontro) {
          destination = aula.ponto_encontro;
        } else {
          destination = "Localização não informada";
        }
        
        await calculateRoute(
          { lat: location.latitude, lng: location.longitude },
          destination
        );
      }
    } catch (err) {
      console.error("Error calculating route:", err);
    } finally {
      setCalculatingRoute(false);
    }
  };

  if (!aula) return null;

  const dataFormatada = format(new Date(aula.data_hora), "EEEE, dd 'de' MMMM 'às' HH:mm", {
    locale: ptBR,
  });

  // Use real ETA/distance if available, otherwise show calculating
  const eta = route?.eta_minutes || null;
  const distance = route?.distance?.text || null;

  const handleAceitar = async () => {
    try {
      await aceitarAula(aula.id);
      toast.success("Aula aceita! Iniciando navegação...");
      onClose();
      // Navigate to tracking page
      navigate(`/instrutor/a-caminho/${aula.id}`);
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
    let destination = aula.ponto_encontro || "Localização não informada";
    
    if (aula.latitude_encontro && aula.longitude_encontro) {
      destination = `${aula.latitude_encontro},${aula.longitude_encontro}`;
    }
    
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
              <p className="text-sm text-muted-foreground">Localização não informada</p>
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
                  {calculatingRoute || routeLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : eta ? (
                    `${eta} min`
                  ) : (
                    "--"
                  )}
                </div>
                <div className="bg-background/95 backdrop-blur-sm rounded-lg px-2 py-1 text-sm font-bold flex items-center gap-1">
                  <Car className="w-3 h-3 text-primary" />
                  {calculatingRoute || routeLoading ? (
                    <span className="animate-pulse">...</span>
                  ) : distance ? (
                    distance
                  ) : (
                    "--"
                  )}
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
