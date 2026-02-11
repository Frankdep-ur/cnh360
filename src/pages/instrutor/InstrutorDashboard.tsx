import { useState, useEffect } from "react";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { InstructorBottomNav } from "@/components/layout/InstructorBottomNav";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { OnlineStatusToggle } from "@/components/instrutor/OnlineStatusToggle";
import { PremiumActivationModal } from "@/components/instrutor/PremiumActivationModal";
import { RideRequestNotification } from "@/components/instrutor/RideRequestNotification";
import { ActiveLessonBanner } from "@/components/instrutor/ActiveLessonBanner";
import { useActiveLessonBanner } from "@/hooks/useActiveLessonBanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  TrendingUp, 
  Crown,
  Car,
  Users,
  Wallet,
  Calendar,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useInstrutorNotifications } from "@/hooks/useInstrutorNotifications";

export default function InstrutorDashboard() {
  const { user } = useAuth();
  const { activeLesson } = useActiveLessonBanner();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [instrutorId, setInstrutorId] = useState<string | null>(null);
  
  const [isOnline, setIsOnline] = useState(() => {
    const saved = localStorage.getItem("instrutor_online_status");
    return saved === "true";
  });

  const handleOnlineToggle = (online: boolean) => {
    setIsOnline(online);
    localStorage.setItem("instrutor_online_status", String(online));
  };

  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null; cidade: string | null } | null>(null);

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

  const { novaAula, showPopup, dismissPopup } = useInstrutorNotifications(instrutorId, isOnline);

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

        {/* Active Lesson Banner */}
        {activeLesson && <ActiveLessonBanner lesson={activeLesson} />}

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

      </div>

      <PremiumActivationModal
        open={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onActivate={() => setIsPremium(true)}
        currentTax={28}
        taxPaidThisMonth={1358}
      />

      <RideRequestNotification
        aula={novaAula}
        open={showPopup}
        onClose={dismissPopup}
      />

      <InstructorBottomNav />
    </div>
  );
}
