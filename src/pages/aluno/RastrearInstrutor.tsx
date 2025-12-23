import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  MapPin, 
  Clock, 
  Phone, 
  ArrowLeft,
  Loader2,
  Car,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscribeToLocation } from "@/hooks/useRealtimeLocation";
import { RealtimeMap } from "@/components/maps/RealtimeMap";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AulaData {
  id: string;
  ponto_encontro: string | null;
  latitude_encontro: number | null;
  longitude_encontro: number | null;
  instrutor_id: string;
  instrutor_nome?: string;
  instrutor_foto?: string;
  instrutor_a_caminho: boolean;
  instrutor_chegou: boolean;
  data_hora: string;
}

export default function RastrearInstrutor() {
  const navigate = useNavigate();
  const { aulaId } = useParams();
  const { user } = useAuth();
  const [aula, setAula] = useState<AulaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [instrutorUserId, setInstrutorUserId] = useState<string | null>(null);
  const [eta, setEta] = useState<string>("--");
  const [distance, setDistance] = useState<string>("--");
  
  const { location: instrutorLocation, loading: locationLoading } = useSubscribeToLocation(aulaId || null, instrutorUserId || undefined);

  useEffect(() => {
    if (aulaId && user) {
      fetchAula();
      setupRealtimeSubscription();
    }
  }, [aulaId, user]);

  // Notify when instructor is close
  useEffect(() => {
    const etaMinutes = parseInt(eta);
    if (!isNaN(etaMinutes) && etaMinutes <= 2 && aula && !aula.instrutor_chegou) {
      toast.info("🚗 Instrutor está quase chegando!", {
        duration: 5000,
      });
    }
  }, [eta, aula]);

  const handleRouteCalculated = (dist: string, dur: string) => {
    setDistance(dist);
    setEta(dur);
  };

  async function fetchAula() {
    try {
      const { data: aulaData, error: aulaError } = await supabase
        .from("aulas")
        .select("*")
        .eq("id", aulaId)
        .single();

      if (aulaError) throw aulaError;

      // Get instructor info
      const { data: instrutorData } = await supabase
        .from("instrutores")
        .select("user_id")
        .eq("id", aulaData.instrutor_id)
        .single();

      if (instrutorData) {
        setInstrutorUserId(instrutorData.user_id);
      }

      // Get instructor cache for name/photo
      const { data: instrutorCache } = await supabase
        .from("instrutores_publico_cache")
        .select("nome, foto")
        .eq("id", aulaData.instrutor_id)
        .single();

      setAula({
        ...aulaData,
        instrutor_nome: instrutorCache?.nome || "Instrutor",
        instrutor_foto: instrutorCache?.foto || "",
      });

    } catch (err) {
      console.error("Error fetching aula:", err);
      toast.error("Erro ao carregar dados da aula");
    } finally {
      setLoading(false);
    }
  }

  function setupRealtimeSubscription() {
    const channel = supabase
      .channel(`aula-tracking-${aulaId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "aulas",
          filter: `id=eq.${aulaId}`,
        },
        (payload) => {
          const newData = payload.new as any;
          setAula(prev => prev ? { 
            ...prev, 
            instrutor_a_caminho: newData.instrutor_a_caminho,
            instrutor_chegou: newData.instrutor_chegou 
          } : null);

          if (newData.instrutor_chegou) {
            toast.success("🎉 O instrutor chegou!", {
              duration: 10000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  // Calculate progress based on ETA
  const getProgress = () => {
    const etaMinutes = parseInt(eta);
    if (isNaN(etaMinutes)) return 0;
    const maxEta = 30;
    const progress = Math.max(0, Math.min(100, ((maxEta - etaMinutes) / maxEta) * 100));
    return progress;
  };

  const destinationCoords = aula && aula.latitude_encontro && aula.longitude_encontro
    ? { latitude: aula.latitude_encontro, longitude: aula.longitude_encontro }
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!aula) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground mb-4">Aula não encontrada</p>
        <Button onClick={() => navigate("/aluno")}>Voltar</Button>
      </div>
    );
  }

  const isInstructorOnTheWay = aula.instrutor_a_caminho && !aula.instrutor_chegou;
  const hasArrived = aula.instrutor_chegou;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 pt-6 pb-4 safe-top">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(`/aluno/aula-confirmada/${aulaId}`)}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">
              {hasArrived ? "Instrutor chegou!" : "Rastrear Instrutor"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {hasArrived ? "Encontre-o no ponto de encontro" : "Acompanhe em tempo real"}
            </p>
          </div>
          {isInstructorOnTheWay && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-xs text-primary font-medium">Ao vivo</span>
            </div>
          )}
        </div>
      </header>

      <div className="px-6 py-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Status Card */}
          {hasArrived ? (
            <Card className="p-6 bg-[#4CAF50]/10 border-[#4CAF50]">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#4CAF50] flex items-center justify-center">
                  <span className="text-3xl">🎉</span>
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">O instrutor chegou!</h2>
                <p className="text-muted-foreground">
                  Vá até o ponto de encontro para iniciar sua aula
                </p>
              </div>
            </Card>
          ) : isInstructorOnTheWay ? (
            <>
              {/* Interactive Map with live tracking */}
              <Card className="overflow-hidden">
                <div className="relative h-64">
                  <RealtimeMap
                    instructorLocation={instrutorLocation ? {
                      latitude: instrutorLocation.latitude,
                      longitude: instrutorLocation.longitude,
                    } : null}
                    destinationLocation={destinationCoords}
                    showRoute={!!instrutorLocation && !!destinationCoords}
                    onRouteCalculated={handleRouteCalculated}
                    className="h-full w-full"
                  />
                  
                  {/* ETA and Distance Overlay */}
                  <div className="absolute top-3 left-3 right-3 flex justify-between pointer-events-none">
                    <div className="bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Chegada em</p>
                          <p className="font-bold text-lg">{eta}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-background/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Distância</p>
                          <p className="font-bold text-lg">{distance}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {locationLoading && (
                    <div className="absolute bottom-3 left-3 pointer-events-none">
                      <div className="bg-background/95 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground">Atualizando...</span>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso da viagem</span>
                  <span className="font-medium text-primary">{Math.round(getProgress())}%</span>
                </div>
                <Progress value={getProgress()} className="h-2" />
              </div>
            </>
          ) : (
            <Card className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Aguardando instrutor iniciar viagem
                </h2>
                <p className="text-sm text-muted-foreground">
                  Você será notificado quando ele estiver a caminho
                </p>
              </div>
            </Card>
          )}

          {/* Instructor Info */}
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                {aula.instrutor_foto ? (
                  <img src={aula.instrutor_foto} alt={aula.instrutor_nome} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">👨‍🏫</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{aula.instrutor_nome}</h3>
                <p className="text-sm text-muted-foreground">Seu instrutor</p>
              </div>
              {isInstructorOnTheWay && (
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  A caminho
                </div>
              )}
            </div>
          </Card>

          {/* Meeting Point */}
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-destructive" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Ponto de encontro</p>
                <p className="font-medium text-foreground">
                  {aula.ponto_encontro || "A definir"}
                </p>
              </div>
            </div>
          </Card>

          {/* Back Button */}
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate(`/aluno/aula-confirmada/${aulaId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para detalhes da aula
          </Button>
        </div>
      </div>
    </div>
  );
}
