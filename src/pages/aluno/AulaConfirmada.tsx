import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Calendar, Clock, MapPin, MessageCircle, Share2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";

interface LessonData {
  aulaId: string;
  dataHora: string;
  duracao: number;
  pontoEncontro: string | null;
  instrutorNome: string;
  instrutorFoto: string | null;
}

interface PaymentVerification {
  status: 'paid' | 'unpaid' | 'processing';
  amount: number;
  paymentMethod: 'pix' | 'card';
  lesson?: LessonData;
  alreadyProcessed?: boolean;
}

type VerificationState = 'loading' | 'success' | 'error' | 'not_found';

export default function AulaConfirmada() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showContent, setShowContent] = useState(false);
  const [verificationState, setVerificationState] = useState<VerificationState>('loading');
  const [paymentData, setPaymentData] = useState<PaymentVerification | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setVerificationState('not_found');
      setErrorMessage("Nenhuma sessão de pagamento encontrada.");
      return;
    }

    verifyPayment(sessionId);
  }, [sessionId]);

  const verifyPayment = async (sid: string) => {
    try {
      setVerificationState('loading');
      
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { sessionId: sid }
      });

      if (error) {
        throw new Error(error.message || 'Erro ao verificar pagamento');
      }

      if (data.status === 'paid') {
        setPaymentData(data as PaymentVerification);
        setVerificationState('success');
        setTimeout(() => setShowContent(true), 100);
        
        if (data.alreadyProcessed) {
          toast.info("Este pagamento já foi processado anteriormente.");
        }
      } else {
        setVerificationState('error');
        setErrorMessage("O pagamento ainda não foi confirmado. Por favor, tente novamente.");
      }
    } catch (err) {
      console.error('Error verifying payment:', err);
      setVerificationState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao verificar pagamento');
    }
  };

  const formatPaymentMethod = (method: string) => {
    return method === 'pix' ? 'PIX' : 'Cartão de Crédito';
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
    const minutes = duration % 60;
    const durationStr = hours > 0 
      ? minutes > 0 ? `${hours}h${minutes}min` : `${hours} hora${hours > 1 ? 's' : ''}`
      : `${minutes} minutos`;
    return `${startTime} - ${endTime} (${durationStr})`;
  };

  // Loading state
  if (verificationState === 'loading') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Verificando pagamento...</h2>
          <p className="text-muted-foreground">Por favor, aguarde enquanto confirmamos seu pagamento.</p>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (verificationState === 'error' || verificationState === 'not_found') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {verificationState === 'not_found' ? 'Sessão não encontrada' : 'Erro na verificação'}
          </h1>
          <p className="text-muted-foreground mb-8">{errorMessage}</p>
          <div className="space-y-3">
            {sessionId && (
              <Button 
                variant="default" 
                size="lg" 
                className="w-full"
                onClick={() => verifyPayment(sessionId)}
              >
                Tentar novamente
              </Button>
            )}
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
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className={cn(
        "max-w-md w-full text-center transition-all duration-700",
        showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"
      )}>
        {/* Success Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mx-auto shadow-glow-primary animate-bounce-subtle">
            <Check className="w-12 h-12 text-primary-foreground" />
          </div>
          <div className="absolute inset-0 w-24 h-24 rounded-full gradient-primary mx-auto opacity-30 animate-ping" />
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Pagamento confirmado!
        </h1>
        <p className="text-muted-foreground mb-8">
          Sua aula prática foi confirmada com sucesso
        </p>

        {/* Details Card */}
        <div className={cn(
          "bg-card rounded-3xl p-6 shadow-elevated mb-8 text-left transition-all duration-500 delay-200",
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          {paymentData?.lesson && (
            <>
              <div className="flex items-center gap-4 mb-6">
                {paymentData.lesson.instrutorFoto ? (
                  <img
                    src={paymentData.lesson.instrutorFoto}
                    alt={paymentData.lesson.instrutorNome}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                ) : (
                  <InitialsAvatar name={paymentData.lesson.instrutorNome || '?'} size="w-14 h-14" textSize="text-lg" />
                )}
                <div>
                  <h3 className="font-semibold text-foreground">{paymentData.lesson.instrutorNome}</h3>
                  <p className="text-sm text-muted-foreground">Instrutor de direção</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium text-foreground capitalize">
                      {formatLessonDate(paymentData.lesson.dataHora)}
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
                      {formatLessonTime(paymentData.lesson.dataHora, paymentData.lesson.duracao)}
                    </p>
                  </div>
                </div>

                {paymentData.lesson.pontoEncontro && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Local</p>
                      <p className="font-medium text-foreground">{paymentData.lesson.pontoEncontro}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className={cn(
            "pt-6 border-t border-border flex items-center justify-between",
            paymentData?.lesson ? "mt-6" : ""
          )}>
            <div>
              <span className="text-muted-foreground block text-sm">Total pago</span>
              <span className="text-xs text-muted-foreground">
                via {formatPaymentMethod(paymentData?.paymentMethod || 'card')}
              </span>
            </div>
            <span className="text-2xl font-bold text-primary">
              R$ {paymentData?.amount?.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className={cn(
          "space-y-3 transition-all duration-500 delay-400",
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <Button 
            variant="hero" 
            size="xl" 
            className="w-full"
            onClick={() => {
              if (paymentData?.lesson?.aulaId) {
                navigate(`/aluno/chat`, { state: { openAulaId: paymentData.lesson.aulaId } });
              } else {
                toast.info("Chat não disponível no momento");
              }
            }}
          >
            <MessageCircle className="w-5 h-5" />
            Enviar mensagem ao instrutor
          </Button>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="lg" 
              className="flex-1"
              onClick={async () => {
                const lesson = paymentData?.lesson;
                const shareData = {
                  title: "🚗 Minha aula de direção - CNH 360",
                  text: `Aula marcada com ${lesson?.instrutorNome || 'instrutor'} - ${lesson?.dataHora ? formatLessonDate(lesson.dataHora) : 'Em breve'}${lesson?.pontoEncontro ? ` em ${lesson.pontoEncontro}` : ''}`,
                  url: window.location.href
                };

                try {
                  if (navigator.share) {
                    await navigator.share(shareData);
                  } else {
                    await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
                    toast.success("Informações copiadas para a área de transferência!");
                  }
                } catch (err) {
                  if ((err as Error).name !== 'AbortError') {
                    toast.error("Erro ao compartilhar");
                  }
                }
              }}
            >
              <Share2 className="w-5 h-5" />
              Compartilhar
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="flex-1"
              onClick={() => navigate("/aluno")}
            >
              Ir para o início
            </Button>
          </div>
        </div>

        {/* Tip */}
        <div className={cn(
          "mt-8 p-4 bg-secondary/10 rounded-2xl text-left transition-all duration-500 delay-500",
          showContent ? "opacity-100" : "opacity-0"
        )}>
          <p className="text-sm text-secondary font-medium mb-1">💡 Dica</p>
          <p className="text-sm text-muted-foreground">
            Lembre-se de levar um documento com foto e chegar 5 minutos antes no local combinado.
          </p>
        </div>
      </div>
    </div>
  );
}
