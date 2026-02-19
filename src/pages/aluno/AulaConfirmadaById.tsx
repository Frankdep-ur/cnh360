import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Check, 
  Calendar, 
  Clock, 
  MapPin, 
  Loader2, 
  AlertCircle,
  Navigation,
  Car,
  Play,
  QrCode,
  User
} from "lucide-react";
import { TripChat } from "@/components/maps/TripChat";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { useLessonWorkflow } from "@/hooks/useLessonWorkflow";
import { useAulaTimer } from "@/hooks/useAulaTimer";
import { AulaTimer } from "@/components/aula/AulaTimer";
import { QRCodeDisplay } from "@/components/qr/QRCodeDisplay";
import { LessonStartConfirmationModal } from "@/components/aula/LessonStartConfirmationModal";
import { toast } from "sonner";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";

interface AulaData {
  id: string;
  status: string;
  data_hora: string;
  duracao_minutos: number;
  ponto_encontro: string | null;
  valor: number;
  instrutor_id: string;
  instrutor_nome?: string;
  instrutor_foto?: string;
  instrutor_a_caminho?: boolean;
  instrutor_chegou?: boolean;
  aluno_confirmou_chegada?: boolean;
  aluno_pronto_para_aula?: boolean;
  aula_inicio?: string | null;
  aula_fim?: string | null;
  qr_code_data?: string | null;
  qr_code_expires_at?: string | null;
  qr_code_inicio_data?: string | null;
  qr_code_inicio_expires_at?: string | null;
}

const STATUS_CONFIG = {
  confirmada: { label: "Confirmada", color: "bg-primary", icon: Check },
  em_rota: { label: "Instrutor a caminho", color: "bg-blue-500", icon: Car },
  aguardando_confirmacao: { label: "Instrutor chegou", color: "bg-amber-500", icon: MapPin },
  em_andamento: { label: "Em aula", color: "bg-primary", icon: Play },
  aguardando_qr: { label: "Validando", color: "bg-purple-500", icon: QrCode },
  concluida: { label: "Concluída", color: "bg-[#4CAF50]", icon: Check },
};

export default function AulaConfirmadaById() {
  const navigate = useNavigate();
  const { aulaId } = useParams();
  const { user } = useAuth();
  const [showContent, setShowContent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aula, setAula] = useState<AulaData | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  async function fetchAula() {
    try {
      setLoading(true);
      
      const { data: aulaData, error: aulaError } = await supabase
        .from("aulas")
        .select("*")
        .eq("id", aulaId)
        .single();

      if (aulaError) throw aulaError;

      // Get instructor from cache
      const { data: instrutorCache } = await supabase
        .from("instrutores_publico_cache")
        .select("nome, foto")
        .eq("id", aulaData.instrutor_id)
        .single();

      setAula({
        ...aulaData,
        instrutor_nome: instrutorCache?.nome || "Instrutor",
        instrutor_foto: instrutorCache?.foto || null,
      });
      setTimeout(() => setShowContent(true), 100);
    } catch (err) {
      console.error('Error fetching aula:', err);
      setError('Erro ao carregar dados da aula');
    } finally {
      setLoading(false);
    }
  }

  function setupRealtimeSubscription() {
    const channel = supabase
      .channel(`aula-aluno-${aulaId}`)
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
            instrutor_nome: prev.instrutor_nome,
            instrutor_foto: prev.instrutor_foto,
          } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  const handleConfirmarChegada = async () => {
    if (!aulaId) return;
    await executeAction(aulaId, 'confirmar_chegada');
  };

  const handleConfirmarInicio = async () => {
    if (!aulaId) return;
    const success = await executeAction(aulaId, 'confirmar_inicio_aluno');
    if (!success) {
      toast.error("Erro ao confirmar início");
    }
  };

  const handleRecusarInicio = () => {
    if (!aulaId) return;
    executeAction(aulaId, 'recusar_inicio_aluno');
    toast.info("Você informou que não está no local");
  };

  const formatLessonDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  };

  const formatLessonTime = (dateStr: string, duration: number) => {
    const date = new Date(dateStr);
    const endDate = new Date(date.getTime() + duration * 60000);
    const startTime = format(date, "HH:mm");
    const endTime = format(endDate, "HH:mm");
    const hours = Math.floor(duration / 60);
    return `${startTime} - ${endTime} (${hours} hora${hours > 1 ? 's' : ''})`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Carregando...</h2>
        </div>
      </div>
    );
  }

  if (error || !aula) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Aula não encontrada</h1>
          <p className="text-muted-foreground mb-8">{error || 'Não foi possível carregar os dados da aula'}</p>
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full"
            onClick={() => navigate("/aluno")}
          >
            Voltar ao início
          </Button>
        </div>
      </div>
    );
  }

  const currentStatus = STATUS_CONFIG[aula.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.confirmada;
  const StatusIcon = currentStatus.icon;

  // Determine UI state
  const showStartModal = aula.status === 'aguardando_confirmacao' && !aula.aluno_pronto_para_aula;
  const showStartQRCode = aula.status === 'aguardando_confirmacao' && aula.aluno_pronto_para_aula;
  const showConfirmButton = false; // Legacy - replaced by modal
  const showWaitingForStart = false; // Legacy - replaced by QR flow
  const showTimer = aula.status === 'em_andamento';
  const showQRCode = aula.status === 'aguardando_qr' && aula.qr_code_data;
  const showCompleted = aula.status === 'concluida';

  return (
    <>
      {/* Full-screen blocking modal for start confirmation */}
      <LessonStartConfirmationModal
        isOpen={showStartModal || showStartQRCode}
        aula={{
          id: aula.id,
          ponto_encontro: aula.ponto_encontro,
          valor: aula.valor,
          duracao_minutos: aula.duracao_minutos,
          data_hora: aula.data_hora,
          qr_code_inicio_data: aula.qr_code_inicio_data,
          qr_code_inicio_expires_at: aula.qr_code_inicio_expires_at,
          aluno_pronto_para_aula: aula.aluno_pronto_para_aula,
        }}
        instrutor={{
          nome: aula.instrutor_nome || 'Instrutor',
          foto: aula.instrutor_foto,
        }}
        onConfirm={handleConfirmarInicio}
        onReject={handleRecusarInicio}
        isConfirming={workflowLoading}
        isWaitingForScan={showStartQRCode}
      />

      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className={cn(
        "max-w-md w-full text-center transition-all duration-700",
        showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"
      )}>
        {/* Status Icon */}
        <div className="relative mb-8">
          {aula.status === 'em_rota' ? (
            <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <Car className="w-12 h-12 text-white" />
            </div>
          ) : aula.status === 'aguardando_confirmacao' ? (
            <div className="w-24 h-24 rounded-full bg-amber-500 flex items-center justify-center mx-auto shadow-lg">
              <MapPin className="w-12 h-12 text-white" />
            </div>
          ) : aula.status === 'em_andamento' ? (
            <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto shadow-lg">
              <Play className="w-12 h-12 text-white" />
            </div>
          ) : aula.status === 'aguardando_qr' ? (
            <div className="w-24 h-24 rounded-full bg-purple-500 flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <QrCode className="w-12 h-12 text-white" />
            </div>
          ) : showCompleted ? (
            <div className="w-24 h-24 rounded-full bg-[#4CAF50] flex items-center justify-center mx-auto shadow-lg">
              <Check className="w-12 h-12 text-white" />
            </div>
          ) : (
            <>
              <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mx-auto shadow-glow-primary animate-bounce-subtle">
                <Check className="w-12 h-12 text-primary-foreground" />
              </div>
              <div className="absolute inset-0 w-24 h-24 rounded-full gradient-primary mx-auto opacity-30 animate-ping" />
            </>
          )}
        </div>

        {/* Title & Status Badge */}
        <Badge className={cn("mb-4 text-white", currentStatus.color)}>
          {currentStatus.label}
        </Badge>

        <h1 className="text-3xl font-bold text-foreground mb-2">
          {showCompleted ? "Aula concluída!" :
           showQRCode ? "Mostre o QR Code" :
           showTimer ? "Aula em andamento" :
           showWaitingForStart ? "Aguardando instrutor" :
           showConfirmButton ? "Instrutor chegou!" :
           aula.status === 'em_rota' ? "Instrutor a caminho!" :
           "Aula confirmada!"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {showCompleted ? "Parabéns! Sua aula foi concluída com sucesso." :
           showQRCode ? "Apresente este código para o instrutor validar" :
           showTimer ? "Cronômetro ativado. Boa aula!" :
           showWaitingForStart ? "O instrutor irá iniciar a aula em instantes" :
           showConfirmButton ? "Confirme sua presença para iniciar a aula" :
           aula.status === 'em_rota' ? "Acompanhe a localização em tempo real" :
           "Sua aula prática foi confirmada com sucesso"}
        </p>

        {/* QR Code Display */}
        {showQRCode && aula.qr_code_data && (
          <QRCodeDisplay
            qrData={aula.qr_code_data}
            expiresAt={aula.qr_code_expires_at || null}
            className="mb-8"
          />
        )}

        {/* Timer Display */}
        {showTimer && (
          <AulaTimer
            elapsedFormatted={elapsedFormatted}
            duracaoMinutos={aula.duracao_minutos}
            elapsedSeconds={elapsedSeconds}
            canFinish={canFinish}
            remainingMinutes={remainingMinutes}
            className="mb-8"
          />
        )}

        {/* Confirm Arrival Button */}
        {showConfirmButton && (
          <Button
            variant="hero"
            size="xl"
            className="w-full mb-8"
            onClick={handleConfirmarChegada}
            disabled={workflowLoading}
          >
            {workflowLoading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Check className="w-5 h-5 mr-2" />
            )}
            Confirmar Chegada
          </Button>
        )}

        {/* Waiting for instructor to start */}
        {showWaitingForStart && (
          <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
            <Loader2 className="w-8 h-8 mx-auto mb-3 text-primary animate-spin" />
            <h3 className="font-semibold text-foreground mb-1">Presença confirmada!</h3>
            <p className="text-sm text-muted-foreground">
              Aguarde o instrutor iniciar a aula
            </p>
          </Card>
        )}

        {/* Details Card */}
        {!showQRCode && !showTimer && (
          <div className={cn(
            "bg-card rounded-3xl p-6 shadow-elevated mb-8 text-left transition-all duration-500 delay-200",
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}>
            <div className="flex items-center gap-4 mb-6">
              {aula.instrutor_foto ? (
                <img
                  src={aula.instrutor_foto}
                  alt={aula.instrutor_nome}
                  className="w-14 h-14 rounded-xl object-cover"
                />
              ) : (
                <InitialsAvatar name={aula.instrutor_nome || 'Instrutor'} size="w-14 h-14" textSize="text-lg" />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{aula.instrutor_nome}</h3>
                <p className="text-sm text-muted-foreground">Instrutor de direção</p>
              </div>
              {aula.status === 'em_rota' && (
                <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  A caminho
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium text-foreground capitalize">
                    {formatLessonDate(aula.data_hora)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium text-foreground">
                    {formatLessonTime(aula.data_hora, aula.duracao_minutos)}
                  </p>
                </div>
              </div>

              {aula.ponto_encontro && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Local</p>
                    <p className="font-medium text-foreground">{aula.ponto_encontro}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6 border-t border-border flex items-center justify-between">
              <span className="text-muted-foreground">Valor</span>
              <span className="text-2xl font-bold text-primary">
                R$ {Number(aula.valor).toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={cn(
          "space-y-3 transition-all duration-500 delay-400",
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          {aula.status === 'em_rota' && (
            <Button 
              variant="hero" 
              size="xl" 
              className="w-full"
              onClick={() => navigate(`/aluno/rastrear/${aulaId}`)}
            >
              <Navigation className="w-5 h-5 mr-2" />
              Rastrear instrutor
            </Button>
          )}

          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => navigate("/aluno")}
          >
            Ir para o início
          </Button>
        </div>

        {/* Tip */}
        {!showCompleted && !showQRCode && !showTimer && (
          <div className={cn(
            "mt-8 p-4 bg-secondary/10 rounded-2xl text-left transition-all duration-500 delay-500",
            showContent ? "opacity-100" : "opacity-0"
          )}>
            <p className="text-sm text-secondary font-medium mb-1">💡 Dica</p>
            <p className="text-sm text-muted-foreground">
              {showConfirmButton 
                ? "Confirme a chegada do instrutor para que ele possa iniciar a aula."
                : "Lembre-se de levar um documento com foto e chegar 5 minutos antes no local combinado."}
            </p>
          </div>
        )}
      </div>

      {/* Trip Chat */}
      {aulaId && aula && aula.status !== 'cancelada' && aula.status !== 'concluida' && (
        <TripChat 
          aulaId={aulaId} 
          instructorName={aula.instrutor_nome}
        />
      )}
    </div>
    </>
  );
}
