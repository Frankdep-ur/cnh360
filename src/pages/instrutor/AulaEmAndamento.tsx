import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Navigation, 
  MapPin, 
  Clock, 
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Car,
  Play,
  Flag,
  QrCode,
  User,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeLocation } from "@/hooks/useRealtimeLocation";
import { useLessonWorkflow } from "@/hooks/useLessonWorkflow";
import { useAulaTimer } from "@/hooks/useAulaTimer";
import { RealtimeMap } from "@/components/maps/RealtimeMap";
import { TripChat } from "@/components/maps/TripChat";
import { AulaTimer } from "@/components/aula/AulaTimer";
import { QRCodeScanner } from "@/components/qr/QRCodeScanner";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AulaData {
  id: string;
  status: string;
  ponto_encontro: string | null;
  latitude_encontro: number | null;
  longitude_encontro: number | null;
  latitude_aluno: number | null;
  longitude_aluno: number | null;
  aluno_nome?: string;
  aluno_foto?: string;
  data_hora: string;
  valor: number;
  duracao_minutos: number;
  aluno_confirmou_chegada: boolean;
  aula_inicio: string | null;
  aula_fim: string | null;
  qr_code_data: string | null;
}

const STEP_CONFIG = {
  confirmada: { step: 1, label: "Confirmada", color: "bg-muted" },
  em_rota: { step: 2, label: "A caminho", color: "bg-blue-500" },
  aguardando_confirmacao: { step: 3, label: "Chegou", color: "bg-amber-500" },
  em_andamento: { step: 4, label: "Em aula", color: "bg-primary" },
  aguardando_qr: { step: 5, label: "Validando", color: "bg-purple-500" },
  concluida: { step: 6, label: "Concluída", color: "bg-[#4CAF50]" },
};

export default function AulaEmAndamento() {
  const navigate = useNavigate();
  const { aulaId } = useParams();
  const { user } = useAuth();
  const [aula, setAula] = useState<AulaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);
  
  const { currentLocation, isTracking, startTracking, stopTracking } = useRealtimeLocation();
  const { executeAction, isLoading: workflowLoading } = useLessonWorkflow();
  const { elapsedFormatted, elapsedSeconds, canFinish, remainingMinutes } = useAulaTimer(
    aulaId || null,
    aula?.aula_inicio || null,
    aula?.duracao_minutos || 50
  );

  useEffect(() => {
    if (aulaId && user) {
      fetchAula();
      const cleanup = setupRealtimeSubscription();
      return cleanup;
    }
  }, [aulaId, user]);

  // Start tracking when em_rota
  useEffect(() => {
    if (aula?.status === 'em_rota' && aulaId && !isTracking) {
      startTracking(aulaId);
    } else if (aula?.status !== 'em_rota' && isTracking) {
      stopTracking();
    }
  }, [aula?.status, aulaId, isTracking]);

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

    } catch (err) {
      console.error("Error fetching aula:", err);
      toast.error("Erro ao carregar dados da aula");
    } finally {
      setLoading(false);
    }
  }

  function setupRealtimeSubscription() {
    const channel = supabase
      .channel(`aula-instrutor-${aulaId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "aulas",
          filter: `id=eq.${aulaId}`,
        },
        (payload) => {
          const newData = payload.new;
          setAula(prev => prev ? { 
            ...prev, 
            ...newData,
            aluno_nome: prev.aluno_nome,
            aluno_foto: prev.aluno_foto
          } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  const handleAction = async (action: 'em_rota' | 'cheguei' | 'iniciar_aula' | 'finalizar_aula' | 'regenerar_qr') => {
    if (!aulaId) return;
    const success = await executeAction(aulaId, action);
    if (success && action === 'em_rota') {
      startTracking(aulaId);
    }
  };

  const handleQRScan = async (qrData: string) => {
    if (!aulaId) return;
    setQrError(null);
    
    const success = await executeAction(aulaId, 'validar_qr', qrData);
    if (success) {
      setShowQRScanner(false);
      // Navigate to success/summary
      navigate(`/instrutor`);
    } else {
      setQrError("QR Code inválido ou expirado. Tente regenerar.");
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
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-6 text-center max-w-sm">
          <h2 className="text-lg font-semibold mb-2">Aula não encontrada</h2>
          <Button variant="outline" onClick={() => navigate("/instrutor")}>
            Voltar ao início
          </Button>
        </Card>
      </div>
    );
  }

  const currentStep = STEP_CONFIG[aula.status as keyof typeof STEP_CONFIG] || STEP_CONFIG.confirmada;
  const destinationCoords = aula.latitude_aluno && aula.longitude_aluno
    ? { latitude: aula.latitude_aluno, longitude: aula.longitude_aluno }
    : aula.latitude_encontro && aula.longitude_encontro
      ? { latitude: aula.latitude_encontro, longitude: aula.longitude_encontro }
      : null;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 pt-6 pb-4 safe-top sticky top-0 z-10">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate("/instrutor")}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">Gerenciar Aula</h1>
            <div className="flex items-center gap-2">
              <Badge className={cn("text-white text-xs", currentStep.color)}>
                {currentStep.label}
              </Badge>
              {isTracking && (
                <div className="flex items-center gap-1 text-xs text-primary">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  GPS ativo
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 max-w-md mx-auto space-y-4">
        {/* Progress Steps */}
        <Card className="p-4">
          <div className="flex justify-between items-center">
            {Object.entries(STEP_CONFIG).slice(0, 5).map(([key, config], index) => (
              <div key={key} className="flex flex-col items-center flex-1">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  currentStep.step > config.step 
                    ? "bg-[#4CAF50] text-white" 
                    : currentStep.step === config.step 
                      ? cn(config.color, "text-white")
                      : "bg-muted text-muted-foreground"
                )}>
                  {currentStep.step > config.step ? "✓" : config.step}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 text-center">
                  {config.label}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Map - Show when em_rota */}
        {(aula.status === 'confirmada' || aula.status === 'em_rota') && destinationCoords && (
          <Card className="overflow-hidden">
            <div className="h-48">
              <RealtimeMap
                instructorLocation={currentLocation}
                destinationLocation={destinationCoords}
                showRoute={!!currentLocation}
                className="h-full w-full"
              />
            </div>
          </Card>
        )}

        {/* Timer - Show when em_andamento */}
        {aula.status === 'em_andamento' && (
          <AulaTimer
            elapsedFormatted={elapsedFormatted}
            duracaoMinutos={aula.duracao_minutos}
            elapsedSeconds={elapsedSeconds}
            canFinish={canFinish}
            remainingMinutes={remainingMinutes}
          />
        )}

        {/* Student Info */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
              {aula.aluno_foto ? (
                <img src={aula.aluno_foto} alt={aula.aluno_nome} className="w-full h-full object-cover" />
              ) : (
                <User className="w-6 h-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{aula.aluno_nome}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {aula.ponto_encontro || "Local não definido"}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <Clock className="w-3 h-3" />
                {format(new Date(aula.data_hora), "d 'de' MMM 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
            {aula.aluno_confirmou_chegada && aula.status !== 'em_andamento' && aula.status !== 'aguardando_qr' && aula.status !== 'concluida' && (
              <Badge className="bg-[#4CAF50] text-white">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Confirmado
              </Badge>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Status: confirmada -> Show "Em Rota" */}
          {aula.status === 'confirmada' && (
            <>
              <Button
                variant="hero"
                size="xl"
                className="w-full"
                onClick={() => handleAction('em_rota')}
                disabled={workflowLoading}
              >
                {workflowLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Car className="w-5 h-5 mr-2" />
                )}
                Estou a caminho
              </Button>
            </>
          )}

          {/* Status: em_rota -> Show "Cheguei" */}
          {aula.status === 'em_rota' && (
            <>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleNavigate}
              >
                <Navigation className="w-5 h-5 mr-2" />
                Abrir navegação
              </Button>
              <Button
                variant="hero"
                size="xl"
                className="w-full bg-[#4CAF50] hover:bg-[#45a049]"
                onClick={() => handleAction('cheguei')}
                disabled={workflowLoading}
              >
                {workflowLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                )}
                Cheguei no local!
              </Button>
            </>
          )}

          {/* Status: aguardando_confirmacao -> Waiting for student */}
          {aula.status === 'aguardando_confirmacao' && !aula.aluno_confirmou_chegada && (
            <Card className="p-6 text-center bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
              <Loader2 className="w-8 h-8 mx-auto mb-3 text-amber-500 animate-spin" />
              <h3 className="font-semibold text-foreground mb-1">Aguardando confirmação</h3>
              <p className="text-sm text-muted-foreground">
                O aluno precisa confirmar sua chegada no app
              </p>
            </Card>
          )}

          {/* Status: aguardando_confirmacao + aluno confirmou -> Show "Iniciar Aula" */}
          {aula.status === 'aguardando_confirmacao' && aula.aluno_confirmou_chegada && (
            <Button
              variant="hero"
              size="xl"
              className="w-full"
              onClick={() => handleAction('iniciar_aula')}
              disabled={workflowLoading}
            >
              {workflowLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Play className="w-5 h-5 mr-2" />
              )}
              Iniciar Aula
            </Button>
          )}

          {/* Status: em_andamento -> Show "Finalizar" (conditionally enabled) */}
          {aula.status === 'em_andamento' && (
            <Button
              variant="hero"
              size="xl"
              className={cn(
                "w-full transition-all",
                canFinish ? "bg-[#4CAF50] hover:bg-[#45a049]" : "opacity-50"
              )}
              onClick={() => handleAction('finalizar_aula')}
              disabled={!canFinish || workflowLoading}
            >
              {workflowLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Flag className="w-5 h-5 mr-2" />
              )}
              {canFinish ? "Finalizar Aula" : `Aguarde ${remainingMinutes} min`}
            </Button>
          )}

          {/* Status: aguardando_qr -> Show QR Scanner button and Regenerate option */}
          {aula.status === 'aguardando_qr' && (
            <div className="space-y-3">
              <Button
                variant="hero"
                size="xl"
                className="w-full"
                onClick={() => setShowQRScanner(true)}
                disabled={workflowLoading}
              >
                <QrCode className="w-5 h-5 mr-2" />
                Escanear QR Code do Aluno
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => handleAction('regenerar_qr')}
                disabled={workflowLoading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerar QR Code (expirado?)
              </Button>
            </div>
          )}

          {/* Status: concluida */}
          {aula.status === 'concluida' && (
            <Card className="p-6 text-center bg-[#4CAF50]/10 border-[#4CAF50]/30">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-[#4CAF50]" />
              <h3 className="font-bold text-lg text-foreground mb-1">Aula Concluída!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Pagamento de R$ {Number(aula.valor).toFixed(2).replace('.', ',')} liberado
              </p>
              <Button variant="outline" onClick={() => navigate("/instrutor")}>
                Voltar ao início
              </Button>
            </Card>
          )}
        </div>

        {/* Info card */}
        {aula.status !== 'concluida' && (
          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              {aula.status === 'em_rota' && "Sua localização está sendo compartilhada com o aluno"}
              {aula.status === 'aguardando_confirmacao' && "Aguarde o aluno confirmar presença para iniciar"}
              {aula.status === 'em_andamento' && "Cronômetro sincronizado com o aluno"}
              {aula.status === 'aguardando_qr' && "Peça ao aluno para mostrar o QR Code no app"}
            </p>
          </div>
        )}
      </div>

      {/* Trip Chat */}
      {aulaId && aula.status !== 'concluida' && (
        <TripChat aulaId={aulaId} />
      )}

      {/* QR Scanner Modal */}
      <QRCodeScanner
        open={showQRScanner}
        onClose={() => {
          setShowQRScanner(false);
          setQrError(null);
        }}
        onScan={handleQRScan}
        isLoading={workflowLoading}
        error={qrError}
      />
    </div>
  );
}
