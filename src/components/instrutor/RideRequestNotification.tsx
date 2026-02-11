import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { X, Check, Clock, MapPin, User, DollarSign, Navigation, Car, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AulaPendente } from "@/hooks/useInstrutorNotifications";
import { useAulasPendentes } from "@/hooks/useAulasPendentes";
import { useRoute } from "@/hooks/useRoute";
import { useGeolocation } from "@/hooks/useGeolocation";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface RideRequestNotificationProps {
  aula: AulaPendente | null;
  open: boolean;
  onClose: () => void;
}

export function RideRequestNotification({ aula, open, onClose }: RideRequestNotificationProps) {
  const navigate = useNavigate();
  const { aceitarAula, recusarAula, loading } = useAulasPendentes();
  const { getCurrentLocation } = useGeolocation();
  const { route, calculateRoute, loading: routeLoading } = useRoute();
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [isVisible, setIsVisible] = useState(false);

  // Animation entrance
  useEffect(() => {
    if (open) {
      setCountdown(30);
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [open]);

  // Countdown timer
  useEffect(() => {
    if (!open || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleRecusar();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open]);

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
      const location = await getCurrentLocation();
      
      if (location) {
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

  if (!open || !aula) return null;

  const dataFormatada = format(new Date(aula.data_hora), "HH:mm", { locale: ptBR });
  const eta = route?.eta_minutes || null;
  const distance = route?.distance?.text || null;

  const handleAceitar = async () => {
    try {
      await aceitarAula(aula.id);
      toast.success("Aula aceita! Iniciando navegação...");
      onClose();
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

  const countdownPercentage = (countdown / 30) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
      {/* Backdrop */}
      <div 
        className={cn(
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto",
          isVisible ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      
      {/* Notification Card */}
      <div 
        className={cn(
          "relative w-full max-w-lg mx-4 mb-4 pointer-events-auto transition-all duration-500 ease-out",
          isVisible 
            ? "translate-y-0 opacity-100 scale-100" 
            : "translate-y-full opacity-0 scale-95"
        )}
      >
        <Card className="bg-card border-2 border-[#4CAF50] shadow-2xl overflow-hidden">
          {/* Progress bar countdown */}
          <div className="h-1.5 bg-muted">
            <div 
              className="h-full bg-gradient-to-r from-[#4CAF50] to-[#8BC34A] transition-all duration-1000 ease-linear"
              style={{ width: `${countdownPercentage}%` }}
            />
          </div>

          {/* Header with pulse animation */}
          <div className="bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-4 h-4 bg-white rounded-full animate-ping absolute" />
                  <div className="w-4 h-4 bg-white rounded-full relative" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-xl">Nova Solicitação!</h2>
                  <p className="text-white/80 text-sm">Aula de direção disponível</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-white/20 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-white" />
                  <span className="text-white font-bold text-lg">{countdown}s</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Student Info & Value */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden ring-2 ring-primary/20">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-lg text-foreground">{aula.aluno_nome || "Aluno"}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Hoje às {dataFormatada}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#4CAF50]">
                  R$ {aula.valor.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">{aula.duracao_minutos} min</p>
              </div>
            </div>

            {/* Route Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#4CAF50]/10 flex items-center justify-center">
                  <Navigation className="w-5 h-5 text-[#4CAF50]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Distância</p>
                  <p className="font-bold text-foreground">
                    {calculatingRoute || routeLoading ? (
                      <span className="animate-pulse">Calculando...</span>
                    ) : distance || "--"}
                  </p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tempo até lá</p>
                  <p className="font-bold text-foreground">
                    {calculatingRoute || routeLoading ? (
                      <span className="animate-pulse">...</span>
                    ) : eta ? `${eta} min` : "--"}
                  </p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-muted/30 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-destructive mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Ponto de Encontro</p>
                  <p className="font-medium text-foreground text-sm">
                    {aula.ponto_encontro || "A combinar com o aluno"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 pt-0 flex gap-3">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 h-14 border-2 border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
              onClick={handleRecusar}
              disabled={loading}
            >
              <X className="h-5 w-5 mr-2" />
              Recusar
            </Button>
            <Button
              size="lg"
              className="flex-[2] h-14 bg-[#4CAF50] hover:bg-[#45a049] text-white text-lg font-bold shadow-lg shadow-[#4CAF50]/30"
              onClick={handleAceitar}
              disabled={loading}
            >
              <Check className="h-5 w-5 mr-2" />
              Aceitar Aula
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
