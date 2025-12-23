import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeLocation } from "@/hooks/useRealtimeLocation";
import { useRoute } from "@/hooks/useRoute";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AulaData {
  id: string;
  ponto_encontro: string | null;
  latitude_encontro: number | null;
  longitude_encontro: number | null;
  latitude_aluno: number | null;
  longitude_aluno: number | null;
  aluno_nome?: string;
  aluno_foto?: string;
  data_hora: string;
  valor: number;
}

export default function InstrutorACaminho() {
  const navigate = useNavigate();
  const { aulaId } = useParams();
  const { user } = useAuth();
  const [aula, setAula] = useState<AulaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [arriving, setArriving] = useState(false);
  
  const { currentLocation, isTracking, startTracking, stopTracking, error: locationError } = useRealtimeLocation();
  const { route, calculateRoute, loading: routeLoading } = useRoute();

  useEffect(() => {
    if (aulaId && user) {
      fetchAula();
    }
  }, [aulaId, user]);

  // Start tracking when component mounts
  useEffect(() => {
    if (aulaId && !isTracking) {
      startTracking(aulaId);
    }

    return () => {
      stopTracking();
    };
  }, [aulaId]);

  // Calculate route when we have both locations
  useEffect(() => {
    if (currentLocation && aula) {
      const destination = aula.latitude_aluno && aula.longitude_aluno
        ? { lat: aula.latitude_aluno, lng: aula.longitude_aluno }
        : aula.latitude_encontro && aula.longitude_encontro
          ? { lat: aula.latitude_encontro, lng: aula.longitude_encontro }
          : aula.ponto_encontro || '';
      
      if (destination) {
        calculateRoute(
          { lat: currentLocation.latitude, lng: currentLocation.longitude },
          destination
        );
      }
    }
  }, [currentLocation, aula]);

  async function fetchAula() {
    try {
      const { data: aulaData, error: aulaError } = await supabase
        .from("aulas")
        .select("*")
        .eq("id", aulaId)
        .single();

      if (aulaError) throw aulaError;

      // Get student info
      const { data: alunoData } = await supabase
        .from("alunos")
        .select("user_id")
        .eq("id", aulaData.aluno_id)
        .single();

      let alunoNome = "Aluno";
      let alunoFoto = "";

      if (alunoData) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", alunoData.user_id)
          .single();

        if (profileData) {
          alunoNome = profileData.full_name || "Aluno";
          alunoFoto = profileData.avatar_url || "";
        }
      }

      setAula({
        ...aulaData,
        aluno_nome: alunoNome,
        aluno_foto: alunoFoto,
      });

      // Mark instructor as "a caminho" and notify the student
      await supabase
        .from("aulas")
        .update({ instrutor_a_caminho: true })
        .eq("id", aulaId);

      // Send push notification to student
      try {
        await supabase.functions.invoke('send-lesson-notification', {
          body: {
            aulaId: aulaId,
            type: 'instrutor_a_caminho',
            title: 'Instrutor a caminho! 🚗',
            body: `O instrutor está indo até você. Acompanhe em tempo real!`
          }
        });
      } catch (notifErr) {
        console.log("Could not send notification:", notifErr);
      }

    } catch (err) {
      console.error("Error fetching aula:", err);
      toast.error("Erro ao carregar dados da aula");
    } finally {
      setLoading(false);
    }
  }

  const handleCheguei = async () => {
    if (!aulaId) return;
    
    setArriving(true);
    try {
      await supabase
        .from("aulas")
        .update({ 
          instrutor_chegou: true,
          instrutor_a_caminho: false 
        })
        .eq("id", aulaId);

      stopTracking();
      
      toast.success("Aluno notificado que você chegou!");
      navigate(`/instrutor/validar-aula?aulaId=${aulaId}`);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Erro ao notificar chegada");
    } finally {
      setArriving(false);
    }
  };

  const handleNavigate = () => {
    if (!aula) return;
    
    let destination = aula.ponto_encontro || "";
    
    if (aula.latitude_aluno && aula.longitude_aluno) {
      destination = `${aula.latitude_aluno},${aula.longitude_aluno}`;
    } else if (aula.latitude_encontro && aula.longitude_encontro) {
      destination = `${aula.latitude_encontro},${aula.longitude_encontro}`;
    }
    
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    window.open(url, '_blank');
  };

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
        <Button onClick={() => navigate("/instrutor")}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 pt-6 pb-4 safe-top">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate("/instrutor")}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">A caminho do aluno</h1>
            <p className="text-sm text-muted-foreground">Sua localização está sendo compartilhada</p>
          </div>
          {isTracking && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-xs text-primary font-medium">Ao vivo</span>
            </div>
          )}
        </div>
      </header>

      <div className="px-6 py-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Map Preview */}
          <Card className="overflow-hidden">
            <div className="relative h-48 bg-gradient-to-br from-primary/5 to-secondary/5">
              <svg className="w-full h-full" viewBox="0 0 400 192">
                <defs>
                  <pattern id="grid-route" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-muted-foreground/20" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-route)" />
                
                {/* Route line */}
                <path
                  d="M 50 150 Q 150 80 350 40"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="10 5"
                  className="animate-pulse"
                />
                
                {/* Your position (instructor) */}
                <g transform="translate(50, 150)">
                  <circle r="20" fill="hsl(var(--primary))" opacity="0.2" className="animate-ping" />
                  <circle r="12" fill="hsl(var(--primary))" />
                  <text x="0" y="4" textAnchor="middle" fontSize="14" fill="white">🚗</text>
                </g>
                
                {/* Student position */}
                <g transform="translate(350, 40)">
                  <circle r="12" fill="#f44336" />
                  <circle r="6" fill="white" />
                </g>
              </svg>
              
              {/* ETA Badge */}
              {route && (
                <div className="absolute top-3 right-3 flex gap-2">
                  <div className="bg-background/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-bold text-sm">{route.eta_minutes} min</span>
                  </div>
                  <div className="bg-background/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg flex items-center gap-1.5">
                    <Car className="w-4 h-4 text-muted-foreground" />
                    <span className="font-bold text-sm">{route.distance.text}</span>
                  </div>
                </div>
              )}
              
              {routeLoading && (
                <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
            </div>
          </Card>

          {/* Student Info */}
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                {aula.aluno_foto ? (
                  <img src={aula.aluno_foto} alt={aula.aluno_nome} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{aula.aluno_nome}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {aula.ponto_encontro || "Aguardando localização"}
                </p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="hero"
              size="xl"
              className="w-full"
              onClick={handleNavigate}
            >
              <Navigation className="w-5 h-5 mr-2" />
              Abrir navegação
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white border-0"
              onClick={handleCheguei}
              disabled={arriving}
            >
              {arriving ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5 mr-2" />
              )}
              Cheguei no local!
            </Button>
          </div>

          {/* Status info */}
          {locationError && (
            <div className="bg-destructive/10 text-destructive rounded-xl p-4 text-sm text-center">
              {locationError}
            </div>
          )}

          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              O aluno está acompanhando sua localização em tempo real
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
