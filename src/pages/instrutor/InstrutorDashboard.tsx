import { useState, useEffect } from "react";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { InstructorBottomNav } from "@/components/layout/InstructorBottomNav";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { OnlineStatusToggle } from "@/components/instrutor/OnlineStatusToggle";
import { PremiumActivationModal } from "@/components/instrutor/PremiumActivationModal";
import { RideRequestNotification } from "@/components/instrutor/RideRequestNotification";
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
  Bell,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useAulasPendentes } from "@/hooks/useAulasPendentes";
import { useInstrutorNotifications } from "@/hooks/useInstrutorNotifications";
import { cn } from "@/lib/utils";

// Aula de demonstração estática para exibição visual quando não há aulas reais
const aulaDemostracao = {
  id: "demo-1",
  aluno_id: "demo-aluno",
  aluno_nome: "João Silva",
  aluno_foto: null as string | null,
  data_hora: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  duracao_minutos: 50,
  ponto_encontro: "Av. Brasil, 1234 - Centro",
  valor: 120.00,
  usa_carro_aluno: false,
  status: "pendente" as const,
  created_at: new Date().toISOString(),
  transaction_id: null as string | null,
};

export default function InstrutorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [instrutorId, setInstrutorId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [testingKyc, setTestingKyc] = useState(false);
  const [kycTestResult, setKycTestResult] = useState<{ success: boolean; data: any } | null>(null);
  
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

  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null; cidade: string | null } | null>(null);

  // Fetch instructor ID for notifications
  useEffect(() => {
    const fetchInstrutorId = async () => {
      if (user) {
        const { data } = await supabase
          .from("instrutores")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (data) setInstrutorId(data.id);
      }
    };
    fetchInstrutorId();
  }, [user]);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('full_name, avatar_url, cidade')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => setProfile(data));
    }
  }, [user]);

  // Real lessons hook
  const { 
    aulasPendentes, 
    loading: loadingAulas, 
    aceitarAula, 
    recusarAula 
  } = useAulasPendentes();

  // Notifications hook for Uber-style popup
  const { novaAula, showPopup, dismissPopup } = useInstrutorNotifications(instrutorId, isOnline);

  // Filter only pending lessons
  const aulasPendentesReais = aulasPendentes.filter(a => a.status === "pendente");
  const temAulasReais = aulasPendentesReais.length > 0;

  // Show real lessons if available, otherwise show demo
  const aulasParaExibir = temAulasReais ? aulasPendentesReais : [aulaDemostracao];

  const handleAceitarAula = async (aulaId: string) => {
    setProcessingId(aulaId);
    try {
      await aceitarAula(aulaId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRecusarAula = async (aulaId: string) => {
    setProcessingId(aulaId);
    try {
      await recusarAula(aulaId);
    } finally {
      setProcessingId(null);
    }
  };

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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      data: date.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }),
      hora: date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const handleDemoAction = () => {
    toast({
      title: "Modo demonstração",
      description: "Esta é uma aula de exemplo para visualização.",
    });
  };

  // Teste temporário de geração de link KYC
  const handleTestKyc = async () => {
    if (!instrutorId) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Instrutor não identificado. Faça login novamente.",
      });
      return;
    }

    setTestingKyc(true);
    setKycTestResult(null);

    try {
      console.log("[TestKYC] Iniciando teste para instructor_id:", instrutorId);
      
      const { data, error } = await supabase.functions.invoke("start-kyc", {
        body: { instructor_id: instrutorId },
      });

      console.log("[TestKYC] Resultado:", { data, error });

      if (error) {
        setKycTestResult({ success: false, data: { error: error.message } });
        toast({
          variant: "destructive",
          title: "Erro na chamada",
          description: error.message,
        });
        return;
      }

      setKycTestResult({ success: data?.success || false, data });

      if (data?.kyc_url) {
        toast({
          title: "✅ Link KYC gerado!",
          description: `URL: ${data.kyc_url.substring(0, 50)}...`,
          duration: 10000,
        });
      } else if (data?.error) {
        toast({
          variant: "destructive",
          title: "Erro Pagar.me",
          description: data.message || data.error,
        });
      } else {
        toast({
          title: "Resultado",
          description: JSON.stringify(data).substring(0, 100),
        });
      }
    } catch (err: any) {
      console.error("[TestKYC] Erro:", err);
      setKycTestResult({ success: false, data: { error: err.message } });
      toast({
        variant: "destructive",
        title: "Erro",
        description: err.message,
      });
    } finally {
      setTestingKyc(false);
    }
  };

  return (
    <div className="app-container pb-24">
      <ComplianceBanner />
      
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
              #{instrutor.rankingCidade} em {profile?.cidade || "sua cidade"}
            </Badge>
          </div>
        </div>

        {/* Online Status Toggle */}
        <OnlineStatusToggle isOnline={isOnline} onToggle={handleOnlineToggle} />

        {/* Pending Lessons Alert */}
        <Card className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20">
              <Bell className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">
                {temAulasReais 
                  ? `${aulasPendentesReais.length} nova(s) solicitação(ões)!` 
                  : "Exemplo de solicitação"}
              </p>
              <p className="text-xs text-muted-foreground">
                {temAulasReais 
                  ? "Aceite ou recuse as solicitações de aula abaixo" 
                  : "Quando houver solicitações reais, elas aparecerão aqui"}
              </p>
            </div>
          </div>
        </Card>

        {/* Premium Upsell */}
        {!isPremium && (
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
              <Button 
                size="sm" 
                className="bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => setShowPremiumModal(true)}
              >
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
              <Badge className="bg-amber-500 text-white">
                {temAulasReais ? aulasPendentesReais.length : 1}
              </Badge>
            </h3>
            <Link to="/instrutor/agenda">
              <Button variant="ghost" size="sm" className="text-primary">
                Ver agenda
              </Button>
            </Link>
          </div>
          
          {loadingAulas ? (
            <Card className="p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </Card>
          ) : (
            <div className="space-y-3">
              {aulasParaExibir.map((aula) => {
                const isDemoAula = aula.id === "demo-1";
                const { data, hora } = formatDateTime(aula.data_hora);
                
                return (
                  <Card 
                    key={aula.id} 
                    className={cn(
                      "p-4 shadow-card",
                      isDemoAula 
                        ? "border-dashed border-muted-foreground/30 opacity-70" 
                        : "border-amber-500/50 bg-amber-500/5"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {aula.aluno_foto ? (
                        <img 
                          src={aula.aluno_foto} 
                          alt={aula.aluno_nome}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <Users className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-foreground">{aula.aluno_nome}</h4>
                          <Badge 
                            variant="secondary"
                            className={cn(
                              "border-0",
                              isDemoAula 
                                ? "bg-muted text-muted-foreground" 
                                : "bg-amber-500/10 text-amber-600"
                            )}
                          >
                            {isDemoAula ? (
                              <>Exemplo</>
                            ) : (
                              <><AlertCircle className="w-3 h-3 mr-1" /> Nova</>
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
                          <span className="font-semibold text-primary">R$ {aula.valor.toFixed(2)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                          <MapPin className="w-3.5 h-3.5" />
                          <span className="truncate">{aula.ponto_encontro}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1 border-destructive text-destructive hover:bg-destructive/10"
                            onClick={() => isDemoAula ? handleDemoAction() : handleRecusarAula(aula.id)}
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
                            onClick={() => isDemoAula ? handleDemoAction() : handleAceitarAula(aula.id)}
                            disabled={processingId === aula.id}
                          >
                            {processingId === aula.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <><Check className="w-4 h-4 mr-1" /> Aceitar</>
                            )}
                          </Button>
                        </div>
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
              <h3 className="font-semibold text-foreground mb-1">Seu Ranking em {profile?.cidade || "sua cidade"}</h3>
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

        {/* Botão Temporário de Teste KYC */}
        <Card className="p-4 shadow-card border-dashed border-amber-500">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-amber-500" />
            <span className="font-semibold text-foreground">Teste de Verificação KYC</span>
            <Badge variant="outline" className="text-amber-600 border-amber-500">DEV</Badge>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Botão temporário para testar a geração de link KYC. Clique para testar se o link é gerado corretamente.
          </p>
          <Button 
            onClick={handleTestKyc}
            disabled={testingKyc || !instrutorId}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
          >
            {testingKyc ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando link KYC...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Testar Geração de Link KYC
              </>
            )}
          </Button>
          
          {kycTestResult && (
            <div className={cn(
              "mt-3 p-3 rounded-lg text-xs font-mono overflow-auto max-h-40",
              kycTestResult.success ? "bg-emerald-500/10 border border-emerald-500/30" : "bg-destructive/10 border border-destructive/30"
            )}>
              <pre className="whitespace-pre-wrap break-all">
                {JSON.stringify(kycTestResult.data, null, 2)}
              </pre>
            </div>
          )}
        </Card>
      </div>

      {/* Premium Activation Modal */}
      <PremiumActivationModal
        open={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onActivate={() => setIsPremium(true)}
        currentTax={28}
        taxPaidThisMonth={1358}
      />

      {/* Uber-style notification for new lessons */}
      <RideRequestNotification
        aula={novaAula}
        open={showPopup}
        onClose={dismissPopup}
      />

      <InstructorBottomNav />
    </div>
  );
}
