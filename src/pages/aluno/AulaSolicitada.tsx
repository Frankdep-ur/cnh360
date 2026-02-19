import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  Clock, 
  MapPin, 
  Car, 
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Loader2,
  Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AulaData {
  id: string;
  status: string;
  data_hora: string;
  duracao_minutos: number;
  ponto_encontro: string | null;
  valor: number;
  usa_carro_aluno: boolean;
  instrutor_id: string;
  instrutor_nome?: string;
  instrutor_foto?: string;
  instrutor_a_caminho?: boolean;
  instrutor_chegou?: boolean;
}

export default function AulaSolicitada() {
  const navigate = useNavigate();
  const { aulaId } = useParams();
  const { user } = useAuth();
  const [aula, setAula] = useState<AulaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (aulaId && user) {
      fetchAula();
      const cleanup = setupRealtimeSubscription();
      return cleanup;
    }

    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, [aulaId, user]);

  async function fetchAula() {
    try {
      const { data: aulaData, error: aulaError } = await supabase
        .from("aulas")
        .select("*")
        .eq("id", aulaId)
        .single();

      if (aulaError) {
        console.error("Error fetching aula:", aulaError);
        return;
      }

      // Get instructor name from cache
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
      setShowContent(true);
    } catch (err) {
      console.error("Error in fetchAula:", err);
    } finally {
      setLoading(false);
    }
  }

  function setupRealtimeSubscription() {
    const channel = supabase
      .channel(`aula-${aulaId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "aulas",
          filter: `id=eq.${aulaId}`,
        },
        (payload) => {
          console.log("Aula updated:", payload);
          const newData = payload.new;
          
          setAula(prev => prev ? { 
            ...prev, 
            status: newData.status,
            instrutor_a_caminho: newData.instrutor_a_caminho,
            instrutor_chegou: newData.instrutor_chegou
          } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
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
        <Button onClick={() => navigate("/aluno")}>Voltar ao início</Button>
      </div>
    );
  }

  const isPending = aula.status === "pendente";
  const isConfirmed = aula.status === "confirmada";
  const isCancelled = aula.status === "cancelada";
  const instrutorACaminho = aula.instrutor_a_caminho === true;
  const instrutorChegou = aula.instrutor_chegou === true;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 pt-6 pb-4 safe-top">
        <div className="max-w-md mx-auto">
          <button
            onClick={() => navigate("/aluno")}
            className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="px-6 py-8">
        <div className="max-w-md mx-auto">
          {/* Status Section */}
          <div
            className={cn(
              "text-center mb-8 transition-all duration-500",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {isPending && (
              <>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Aguardando confirmação
                </h1>
                <p className="text-muted-foreground">
                  O instrutor está analisando sua solicitação
                </p>
              </>
            )}

            {isConfirmed && instrutorChegou && (
              <>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#4CAF50]/10 flex items-center justify-center animate-scale-in">
                  <CheckCircle2 className="w-12 h-12 text-[#4CAF50]" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Instrutor chegou! 🎉
                </h1>
                <p className="text-muted-foreground">
                  O instrutor está no local de encontro
                </p>
              </>
            )}

            {isConfirmed && instrutorACaminho && !instrutorChegou && (
              <>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <div className="relative">
                    <Car className="w-10 h-10 text-blue-500" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-ping" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Instrutor a caminho! 🚗
                </h1>
                <p className="text-muted-foreground">
                  Acompanhe a localização em tempo real
                </p>
              </>
            )}

            {isConfirmed && !instrutorACaminho && !instrutorChegou && (
              <>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center animate-scale-in">
                  <CheckCircle2 className="w-12 h-12 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Aula confirmada! 🎉
                </h1>
                <p className="text-muted-foreground">
                  Aguardando instrutor iniciar o trajeto
                </p>
              </>
            )}

            {isCancelled && (
              <>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-destructive" />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Aula não confirmada
                </h1>
                <p className="text-muted-foreground">
                  O instrutor não pôde aceitar sua solicitação
                </p>
              </>
            )}
          </div>

          {/* Instructor Card */}
          <div
            className={cn(
              "bg-card rounded-2xl p-4 border border-border mb-6 transition-all duration-500 delay-100",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="flex items-center gap-4">
              {aula.instrutor_foto ? (
                <img
                  src={aula.instrutor_foto}
                  alt={aula.instrutor_nome}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: (() => { let h=0; const n=aula.instrutor_nome||''; for(let i=0;i<n.length;i++) h=n.charCodeAt(i)+((h<<5)-h); return `hsl(${Math.abs(h)%360},55%,45%)`; })() }}>
                  {(aula.instrutor_nome||'?').split(' ').filter(Boolean).map((p: string)=>p[0]).slice(0,2).join('').toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-lg">
                  {aula.instrutor_nome}
                </h3>
                <p className="text-sm text-muted-foreground">Seu instrutor</p>
              </div>
              {isPending && (
                <div className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-sm font-medium">
                  Pendente
                </div>
              )}
              {isConfirmed && instrutorACaminho && !instrutorChegou && (
                <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-sm font-medium flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  A caminho
                </div>
              )}
              {isConfirmed && instrutorChegou && (
                <div className="px-3 py-1 rounded-full bg-[#4CAF50]/10 text-[#4CAF50] text-sm font-medium">
                  Chegou
                </div>
              )}
              {isConfirmed && !instrutorACaminho && !instrutorChegou && (
                <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  Confirmado
                </div>
              )}
            </div>
          </div>

          {/* Lesson Details */}
          <div
            className={cn(
              "bg-card rounded-2xl p-5 border border-border mb-6 space-y-4 transition-all duration-500 delay-200",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <h3 className="font-semibold text-foreground">Detalhes da aula</h3>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground capitalize">
                  {formatDate(aula.data_hora)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(aula.data_hora)} • {aula.duracao_minutos / 60}h de aula
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Ponto de encontro</p>
                <p className="text-sm text-muted-foreground">
                  {aula.ponto_encontro || "A definir"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Veículo</p>
                <p className="text-sm text-muted-foreground">
                  {aula.usa_carro_aluno ? "Seu próprio carro" : "Carro do instrutor"}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-muted-foreground">Valor total</span>
              <span className="text-2xl font-bold text-primary">
                R$ {Number(aula.valor).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div
            className={cn(
              "space-y-3 transition-all duration-500 delay-300",
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            {/* Track instructor button - only show when instructor is on the way */}
            {isConfirmed && instrutorACaminho && !instrutorChegou && (
              <Button
                variant="hero"
                size="xl"
                className="w-full"
                onClick={() => navigate(`/aluno/rastrear/${aulaId}`)}
              >
                <Navigation className="w-5 h-5 mr-2" />
                Rastrear instrutor em tempo real
              </Button>
            )}

            {isPending && (
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Você será notificado assim que o instrutor responder
                </p>
              </div>
            )}

            {isConfirmed && !instrutorACaminho && !instrutorChegou && (
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  O instrutor ainda não iniciou o trajeto. Você poderá rastrear quando ele sair.
                </p>
              </div>
            )}

            {isConfirmed && instrutorChegou && (
              <div className="bg-[#4CAF50]/10 rounded-xl p-4 text-center">
                <p className="text-sm text-[#4CAF50] font-medium">
                  O instrutor está te esperando no local combinado!
                </p>
              </div>
            )}

            {isCancelled && (
              <Button
                variant="hero"
                size="xl"
                className="w-full"
                onClick={() => navigate("/aluno/buscar")}
              >
                Buscar outro instrutor
              </Button>
            )}

            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              onClick={() => navigate("/aluno")}
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao início
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
