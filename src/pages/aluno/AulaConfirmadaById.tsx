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
  Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";

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
}

export default function AulaConfirmadaById() {
  const navigate = useNavigate();
  const { aulaId } = useParams();
  const { user } = useAuth();
  const [showContent, setShowContent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aula, setAula] = useState<AulaData | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      .channel(`aula-confirmada-${aulaId}`)
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

  const instrutorACaminho = aula.instrutor_a_caminho === true;
  const instrutorChegou = aula.instrutor_chegou === true;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className={cn(
        "max-w-md w-full text-center transition-all duration-700",
        showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"
      )}>
        {/* Status Icon */}
        <div className="relative mb-8">
          {instrutorChegou ? (
            <div className="w-24 h-24 rounded-full bg-[#4CAF50] flex items-center justify-center mx-auto shadow-lg">
              <Check className="w-12 h-12 text-white" />
            </div>
          ) : instrutorACaminho ? (
            <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <Car className="w-12 h-12 text-white" />
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

        {/* Message */}
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {instrutorChegou 
            ? "Instrutor chegou!" 
            : instrutorACaminho 
              ? "Instrutor a caminho!" 
              : "Aula confirmada!"}
        </h1>
        <p className="text-muted-foreground mb-8">
          {instrutorChegou 
            ? "O instrutor está te esperando no local" 
            : instrutorACaminho 
              ? "Acompanhe a localização em tempo real" 
              : "Sua aula prática foi confirmada com sucesso"}
        </p>

        {/* Details Card */}
        <div className={cn(
          "bg-card rounded-3xl p-6 shadow-elevated mb-8 text-left transition-all duration-500 delay-200",
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <div className="flex items-center gap-4 mb-6">
            <img
              src={aula.instrutor_foto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"}
              alt={aula.instrutor_nome}
              className="w-14 h-14 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{aula.instrutor_nome}</h3>
              <p className="text-sm text-muted-foreground">Instrutor de direção</p>
            </div>
            {instrutorACaminho && !instrutorChegou && (
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

        {/* Actions */}
        <div className={cn(
          "space-y-3 transition-all duration-500 delay-400",
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          {instrutorACaminho && !instrutorChegou && (
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
