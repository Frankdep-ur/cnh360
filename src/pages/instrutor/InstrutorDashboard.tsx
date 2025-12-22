import { useState, useEffect } from "react";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { InstructorBottomNav } from "@/components/layout/InstructorBottomNav";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { OnlineStatusToggle } from "@/components/instrutor/OnlineStatusToggle";
import { NovaAulaPopupEnhanced } from "@/components/instrutor/NovaAulaPopupEnhanced";
import { useInstrutorNotifications } from "@/hooks/useInstrutorNotifications";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  TrendingUp, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Crown,
  Car,
  Users,
  Wallet,
  Calendar,
  Navigation,
  Shield,
  Zap,
  X,
  Check,
  Loader2,
  Bell
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AulaPendente {
  id: string;
  aluno_nome: string;
  aluno_foto: string | null;
  data_hora: string;
  duracao_minutos: number;
  ponto_encontro: string | null;
  valor: number;
  usa_carro_aluno: boolean;
  status: string;
}

export default function InstrutorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [aulasPendentes, setAulasPendentes] = useState<AulaPendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [instrutorId, setInstrutorId] = useState<string | null>(null);
  
  // Persist online status in localStorage
  const [isOnline, setIsOnline] = useState(() => {
    const saved = localStorage.getItem("instrutor_online_status");
    console.log("[Dashboard] Estado online inicial do localStorage:", saved);
    return saved === "true";
  });

  // Save online status to localStorage when it changes
  const handleOnlineToggle = (online: boolean) => {
    console.log("[Dashboard] Alterando status online para:", online);
    setIsOnline(online);
    localStorage.setItem("instrutor_online_status", String(online));
  };

  // Real-time notification system
  const { novaAula, showPopup, dismissPopup, refetch } = useInstrutorNotifications(
    instrutorId,
    isOnline
  );

  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => setProfile(data));
    }
  }, [user]);

  const instrutor = {
    nome: profile?.full_name || "Instrutor",
    foto: profile?.avatar_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    nota: 4.9,
    totalAvaliacoes: 127,
    aulasCompletadas: 89,
    rankingCidade: 3,
    totalInstrutores: 45,
    isPremium: false,
    taxaAtual: 28,
    ganhosMes: 4850,
    metaMes: 6000,
    horasValidadas: 178,
  };

  const estatisticasSemana = {
    aulasRealizadas: 12,
    horasRegistradas: 12,
    ganhosBrutos: 1440,
    taxaPlataforma: 403,
    ganhoLiquido: 1037,
  };

  useEffect(() => {
    if (user) {
      fetchAulasPendentes();
      
      // Setup realtime subscription for new lessons
      const channel = supabase
        .channel("aulas-instrutor")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "aulas",
          },
          () => {
            console.log("Aulas table changed, refetching...");
            fetchAulasPendentes();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  async function fetchAulasPendentes() {
    if (!user) return;

    try {
      setLoading(true);

      // Get instructor ID
      const { data: instrutorData, error: instrutorError } = await supabase
        .from("instrutores")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (instrutorError) {
        console.error("Error fetching instructor:", instrutorError);
        return;
      }

      if (instrutorData) {
        setInstrutorId(instrutorData.id);
      }

      // Get pending/confirmed lessons
      const { data: aulasData, error: aulasError } = await supabase
        .from("aulas")
        .select("*")
        .eq("instrutor_id", instrutorData.id)
        .in("status", ["pendente", "confirmada"])
        .order("data_hora", { ascending: true });

      if (aulasError) {
        console.error("Error fetching lessons:", aulasError);
        return;
      }

      // Get student names
      const aulasComNomes: AulaPendente[] = [];
      for (const aula of aulasData || []) {
        let alunoNome = "Aluno";

        try {
          const { data: alunoData } = await supabase
            .from("alunos")
            .select("user_id")
            .eq("id", aula.aluno_id)
            .single();

          if (alunoData) {
            const { data: nome } = await supabase.rpc("get_participant_name", {
              p_user_id: alunoData.user_id,
            });
            if (nome) alunoNome = nome;
          }
        } catch (err) {
          console.error("Error fetching student name:", err);
        }

        aulasComNomes.push({
          id: aula.id,
          aluno_nome: alunoNome,
          aluno_foto: null,
          data_hora: aula.data_hora,
          duracao_minutos: aula.duracao_minutos,
          ponto_encontro: aula.ponto_encontro,
          valor: Number(aula.valor),
          usa_carro_aluno: aula.usa_carro_aluno || false,
          status: aula.status,
        });
      }

      setAulasPendentes(aulasComNomes);
    } catch (err) {
      console.error("Error in fetchAulasPendentes:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAceitarAula(aulaId: string) {
    setProcessingId(aulaId);
    try {
      const { error } = await supabase
        .from("aulas")
        .update({ status: "confirmada" })
        .eq("id", aulaId);

      if (error) throw error;

      toast({
        title: "Aula aceita!",
        description: "O aluno será notificado.",
      });

      fetchAulasPendentes();
    } catch (err: any) {
      console.error("Error accepting lesson:", err);
      toast({
        title: "Erro ao aceitar aula",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  }

  async function handleRecusarAula(aulaId: string) {
    setProcessingId(aulaId);
    try {
      const { error } = await supabase
        .from("aulas")
        .update({ status: "cancelada" })
        .eq("id", aulaId);

      if (error) throw error;

      toast({
        title: "Aula recusada",
        description: "O aluno será notificado.",
      });

      fetchAulasPendentes();
    } catch (err: any) {
      console.error("Error declining lesson:", err);
      toast({
        title: "Erro ao recusar aula",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      data: date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }),
      hora: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const aulasPendentesCount = aulasPendentes.filter((a) => a.status === "pendente").length;

  return (
    <div className="app-container pb-24">
      <ComplianceBanner />
      
      {/* Nova Aula Popup Enhanced com Mapa */}
      <NovaAulaPopupEnhanced 
        aula={novaAula} 
        open={showPopup} 
        onClose={() => {
          dismissPopup();
          fetchAulasPendentes();
        }} 
      />
      
      <div className="px-4 py-6 page-enter space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={instrutor.foto} 
                alt={instrutor.nome}
                className="w-14 h-14 rounded-full object-cover border-2 border-primary"
              />
              {instrutor.isPremium && (
                <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Olá, {instrutor.nome.split(' ')[0]}!</h1>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-semibold text-foreground">{instrutor.nota}</span>
                <span>({instrutor.totalAvaliacoes} avaliações)</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              #{instrutor.rankingCidade} em Araçatuba
            </Badge>
          </div>
        </div>

        {/* Online Status Toggle */}
        <OnlineStatusToggle isOnline={isOnline} onToggle={handleOnlineToggle} />

        {/* Pending Lessons Alert */}
        {aulasPendentesCount > 0 && (
          <Card className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20">
                <Bell className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">
                  {aulasPendentesCount} nova{aulasPendentesCount > 1 ? "s" : ""} solicitaç{aulasPendentesCount > 1 ? "ões" : "ão"}!
                </p>
                <p className="text-xs text-muted-foreground">
                  Aceite ou recuse as solicitações de aula abaixo
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Premium Upsell */}
        {!instrutor.isPremium && (
          <Card className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20">
                  <Crown className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Seja Premium</p>
                  <p className="text-xs text-muted-foreground">Taxa de {instrutor.taxaAtual}% → 18% | R$89/mês</p>
                </div>
              </div>
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                Ativar
              </Button>
            </div>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{instrutor.aulasCompletadas}</p>
                <p className="text-xs text-muted-foreground">Aulas este mês</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-secondary/10">
                <Wallet className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">R${instrutor.ganhosMes.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Ganhos do mês</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{instrutor.horasValidadas}h</p>
                <p className="text-xs text-muted-foreground">Horas RENACH</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 shadow-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-violet-500/10">
                <Users className="w-5 h-5 text-violet-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{instrutor.totalAvaliacoes}</p>
                <p className="text-xs text-muted-foreground">Alunos atendidos</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Meta do Mês */}
        <Card className="p-4 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Meta do Mês</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {Math.round((instrutor.ganhosMes / instrutor.metaMes) * 100)}%
            </span>
          </div>
          <Progress value={(instrutor.ganhosMes / instrutor.metaMes) * 100} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground">
            R${instrutor.ganhosMes.toLocaleString()} de R${instrutor.metaMes.toLocaleString()}
          </p>
        </Card>

        {/* Solicitações e Próximas Aulas */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Solicitações e Aulas
              {aulasPendentesCount > 0 && (
                <Badge className="bg-amber-500 text-white">{aulasPendentesCount}</Badge>
              )}
            </h3>
            <Link to="/instrutor/agenda">
              <Button variant="ghost" size="sm" className="text-primary">
                Ver agenda
              </Button>
            </Link>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : aulasPendentes.length === 0 ? (
            <Card className="p-6 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma aula agendada</p>
              <p className="text-sm text-muted-foreground">
                Novas solicitações aparecerão aqui
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {aulasPendentes.map((aula) => {
                const { data, hora } = formatDateTime(aula.data_hora);
                const isPendente = aula.status === "pendente";

                return (
                  <Card 
                    key={aula.id} 
                    className={`p-4 shadow-card ${isPendente ? "border-amber-500/50 bg-amber-500/5" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <Users className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-foreground">{aula.aluno_nome}</h4>
                          <Badge 
                            variant={isPendente ? "secondary" : "default"}
                            className={isPendente 
                              ? "bg-amber-500/10 text-amber-600 border-0" 
                              : "bg-primary/10 text-primary border-0"
                            }
                          >
                            {isPendente ? (
                              <><AlertCircle className="w-3 h-3 mr-1" /> Nova</>
                            ) : (
                              <><CheckCircle2 className="w-3 h-3 mr-1" /> Confirmada</>
                            )}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {data} às {hora} ({aula.duracao_minutos}min)
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          {aula.usa_carro_aluno && (
                            <Badge variant="outline" className="text-xs bg-secondary/10 text-secondary border-secondary/20">
                              <Car className="w-3 h-3 mr-1" />
                              Carro do aluno
                            </Badge>
                          )}
                          <span className="font-semibold text-primary">R$ {aula.valor.toFixed(2)}</span>
                        </div>
                        
                        {aula.ponto_encontro && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate">{aula.ponto_encontro}</span>
                          </div>
                        )}
                        
                        {isPendente ? (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                              onClick={() => handleRecusarAula(aula.id)}
                              disabled={processingId === aula.id}
                            >
                              {processingId === aula.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <><X className="w-4 h-4 mr-1" /> Recusar</>
                              )}
                            </Button>
                            <Button 
                              size="sm" 
                              className="flex-1 gradient-primary text-primary-foreground"
                              onClick={() => handleAceitarAula(aula.id)}
                              disabled={processingId === aula.id}
                            >
                              {processingId === aula.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <><Check className="w-4 h-4 mr-1" /> Aceitar</>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Navigation className="w-4 h-4 mr-1" />
                              Rota
                            </Button>
                            <Link to="/instrutor/validar-aula" className="flex-1">
                              <Button size="sm" className="w-full gradient-primary text-primary-foreground">
                                <Zap className="w-4 h-4 mr-1" />
                                Iniciar
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Resumo da Semana */}
        <Card className="p-4 shadow-card">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-secondary" />
            Resumo da Semana
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Aulas realizadas</span>
              <span className="font-semibold text-foreground">{estatisticasSemana.aulasRealizadas}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Horas registradas (RENACH)</span>
              <span className="font-semibold text-foreground">{estatisticasSemana.horasRegistradas}h</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Ganhos brutos</span>
              <span className="font-semibold text-foreground">R${estatisticasSemana.ganhosBrutos}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Taxa plataforma ({instrutor.taxaAtual}%)</span>
              <span className="font-semibold text-destructive">-R${estatisticasSemana.taxaPlataforma}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-semibold text-foreground">Ganho líquido</span>
              <span className="font-bold text-primary text-lg">R${estatisticasSemana.ganhoLiquido}</span>
            </div>
          </div>
        </Card>

        {/* Ranking */}
        <Card className="p-4 shadow-card bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground mb-1">Seu Ranking em Araçatuba</h3>
              <p className="text-sm text-muted-foreground">
                #{instrutor.rankingCidade} de {instrutor.totalInstrutores} instrutores
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">#{instrutor.rankingCidade}</div>
              <p className="text-xs text-muted-foreground">
                +5 posições este mês
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
            💡 Dica: Complete mais aulas e mantenha nota alta para subir no ranking!
          </p>
        </Card>
      </div>

      <InstructorBottomNav />
    </div>
  );
}
