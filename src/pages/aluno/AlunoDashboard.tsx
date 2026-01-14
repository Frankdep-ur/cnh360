import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronRight, 
  BookOpen, 
  Car, 
  ClipboardCheck, 
  Trophy,
  Clock,
  MapPin,
  Star,
  Shield,
  Timer,
  FileText,
  CreditCard,
  Navigation,
  Stethoscope,
  Award,
  ExternalLink,
  Play,
  Upload,
  Info
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { BottomNav } from "@/components/layout/BottomNav";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { LocationShareButton } from "@/components/maps/LocationShareButton";
import { RouteMapCard } from "@/components/maps/RouteMapCard";
import { PaymentCheckout } from "@/components/payment/PaymentCheckout";
import { UploadCertificadoModal } from "@/components/certificado/UploadCertificadoModal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ProximaAula {
  id: string;
  instructor: string;
  photo: string | null;
  date: string;
  time: string;
  location: string;
  duration: string;
  valor: number;
  instructorId: string;
}

export default function AlunoDashboard() {
  const [showContent, setShowContent] = useState(true);
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);
  const [locationShared, setLocationShared] = useState(false);
  const [sharedLocation, setSharedLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [proximaAula, setProximaAula] = useState<ProximaAula | null>(null);
  const [progressoRenach, setProgressoRenach] = useState<{
    exame_medico_concluido?: boolean;
    curso_teorico_conclusao?: string | null;
    exame_teorico_resultado?: string | null;
    aulas_praticas_conclusao?: string | null;
    exame_pratico_resultado?: string | null;
    prova_teorica_detran_aprovada?: boolean | null;
  } | null>(null);
  const [practicalHours, setPracticalHours] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => setProfile(data));

      // Buscar progresso completo do RENACH e próxima aula
      supabase
        .from('alunos')
        .select('id, horas_praticas_completadas')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(async ({ data: aluno }) => {
          if (aluno) {
            setPracticalHours(aluno.horas_praticas_completadas || 0);
            
            const { data: progresso } = await supabase
              .from('progresso_renach')
              .select('curso_teorico_conclusao, exame_teorico_resultado, aulas_praticas_conclusao, exame_pratico_resultado, prova_teorica_detran_aprovada')
              .eq('aluno_id', aluno.id)
              .maybeSingle();
            
            setProgressoRenach({
              exame_medico_concluido: true,
              ...progresso
            });

            // Buscar próxima aula confirmada
            const { data: aulas } = await supabase
              .from('aulas')
              .select(`
                id,
                data_hora,
                duracao_minutos,
                ponto_encontro,
                valor,
                instrutor_id
              `)
              .eq('aluno_id', aluno.id)
              .eq('status', 'confirmada')
              .gte('data_hora', new Date().toISOString())
              .order('data_hora', { ascending: true })
              .limit(1);

            if (aulas && aulas.length > 0) {
              const aula = aulas[0];
              
              // Buscar dados do instrutor
              const { data: instrutor } = await supabase
                .from('instrutores_publico_cache')
                .select('nome, foto')
                .eq('id', aula.instrutor_id)
                .maybeSingle();

              const dataAula = new Date(aula.data_hora);
              const hoje = new Date();
              const amanha = new Date(hoje);
              amanha.setDate(amanha.getDate() + 1);

              let dateLabel = dataAula.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
              if (dataAula.toDateString() === hoje.toDateString()) {
                dateLabel = 'Hoje';
              } else if (dataAula.toDateString() === amanha.toDateString()) {
                dateLabel = 'Amanhã';
              }

              setProximaAula({
                id: aula.id,
                instructor: instrutor?.nome || 'Instrutor',
                photo: instrutor?.foto || null,
                date: dateLabel,
                time: dataAula.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                location: aula.ponto_encontro || 'Local a definir',
                duration: `${aula.duracao_minutos} min`,
                valor: aula.valor,
                instructorId: aula.instrutor_id
              });
            }
          }
        });
    }
  }, [user]);
  
  const minRequiredHours = 2; // Mínimo obrigatório pela Res. 1.020/2024
  
  // Status derivados do progresso real
  const exameMedicoCompleto = progressoRenach?.exame_medico_concluido ?? false;
  const cursoTeoricoCompleto = !!progressoRenach?.curso_teorico_conclusao;
  const exameTeoricoAprovado = progressoRenach?.prova_teorica_detran_aprovada ?? (progressoRenach?.exame_teorico_resultado === 'aprovado');
  const aulasPraticasCompletas = !!progressoRenach?.aulas_praticas_conclusao || practicalHours >= minRequiredHours;
  const examePraticoAprovado = progressoRenach?.exame_pratico_resultado === 'aprovado';
  
  // Calcular progresso total baseado nas etapas
  const completedSteps = [exameMedicoCompleto, cursoTeoricoCompleto, exameTeoricoAprovado, aulasPraticasCompletas, examePraticoAprovado].filter(Boolean).length;
  const totalProgress = Math.round((completedSteps / 7) * 100);

  // Função para determinar status da etapa baseado nas anteriores
  const getStepStatus = (stepCompleted: boolean, previousCompleted: boolean): "completed" | "current" | "locked" => {
    if (stepCompleted) return "completed";
    if (previousCompleted) return "current";
    return "locked";
  };

  const steps = [
    { 
      id: 1, 
      name: "Exame Médico/Psicológico", 
      icon: Stethoscope, 
      status: exameMedicoCompleto ? "completed" : "current" as const,
      progress: exameMedicoCompleto ? 100 : 0,
      detail: "Avaliação médica e psicológica obrigatória"
    },
    { 
      id: 2, 
      name: "Preparação Teórica (EAD)", 
      icon: BookOpen, 
      status: getStepStatus(cursoTeoricoCompleto, exameMedicoCompleto),
      progress: cursoTeoricoCompleto ? 100 : 0, 
      link: exameMedicoCompleto ? "/aluno/curso-teorico" : undefined,
      subtitle: cursoTeoricoCompleto ? "Concluído" : (exameMedicoCompleto ? "Concluir agora" : undefined),
      detail: "Estudo completo + simulados de prova · EAD grátis · Certificado emitido · Treine aqui antes da prova oficial DETRAN",
      infoText: "Esta preparação é complemento para treinar. A prova oficial é feita no DETRAN-SP. Após aprovação, volte aqui e envie o certificado para liberar as aulas práticas."
    },
    { 
      id: 3, 
      name: "Exame Teórico (Prova DETRAN)", 
      icon: ClipboardCheck, 
      status: getStepStatus(exameTeoricoAprovado, cursoTeoricoCompleto),
      progress: exameTeoricoAprovado ? 100 : 0,
      detail: "30 questões · Mínimo 21 acertos (70%)",
      showActions: cursoTeoricoCompleto && !exameTeoricoAprovado,
      showUploadAction: cursoTeoricoCompleto && !exameTeoricoAprovado
    },
    { 
      id: 4, 
      name: "Aulas Práticas", 
      icon: Car, 
      status: getStepStatus(aulasPraticasCompletas, exameTeoricoAprovado),
      progress: Math.round((practicalHours / minRequiredHours) * 100), 
      subtitle: exameTeoricoAprovado && !aulasPraticasCompletas ? "Em andamento" : undefined,
      detail: `${practicalHours}h de ${minRequiredHours}h mínimas obrigatórias (Res. 1.020/2024)`, 
      link: exameTeoricoAprovado ? "/aluno/buscar" : undefined
    },
    { 
      id: 5, 
      name: "Exame Prático", 
      icon: Trophy, 
      status: getStepStatus(examePraticoAprovado, aulasPraticasCompletas),
      progress: examePraticoAprovado ? 100 : 0, 
      link: aulasPraticasCompletas ? "/aluno/exame-pratico" : undefined,
      detail: "Prova prática de direção veicular"
    },
    { 
      id: 6, 
      name: "Permissão para Dirigir (PPD)", 
      icon: FileText, 
      status: getStepStatus(false, examePraticoAprovado),
      progress: 0,
      detail: "Válida por 12 meses após aprovação"
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Compliance Banner */}
      <ComplianceBanner variant="full" dismissible />

      {/* Header */}
      <header className="gradient-hero text-primary-foreground px-6 pt-6 pb-20">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Foto" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-primary-foreground/30"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <span className="text-lg font-bold">{profile?.full_name?.charAt(0) || 'A'}</span>
                </div>
              )}
              <div>
                <p className="text-primary-foreground/80 text-sm">Olá,</p>
                <h1 className="text-xl font-bold">{profile?.full_name || 'Aluno'} 👋</h1>
              </div>
            </div>
            <NotificationBell />
          </div>

          {/* RENACH Progress Card */}
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Progresso RENACH</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold">{practicalHours}h</span>
                <span className="text-primary-foreground/80"> / {minRequiredHours}h práticas</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-primary-foreground/60">Validadas GPS/QR</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Card */}
      <div className="px-6 -mt-12">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-3xl shadow-elevated p-6">
            <div className="flex items-center gap-6">
              <ProgressRing progress={totalProgress} size={100} strokeWidth={8}>
                <div className="text-center">
                  <span className="text-2xl font-bold text-foreground">{totalProgress}%</span>
                </div>
              </ProgressRing>
              <div className="flex-1">
                <h2 className="font-semibold text-foreground mb-1">Seu progresso</h2>
                <p className="text-sm text-muted-foreground mb-3">Categoria B - Primeira Habilitação</p>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="font-medium text-primary">
                    Falta {minRequiredHours - practicalHours}h de aula prática
                  </span>
                </div>
              </div>
            </div>

            {/* PPD Card - Destacado */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="relative overflow-hidden flex items-center gap-4 p-4 bg-gradient-to-r from-primary/15 to-emerald-500/15 rounded-2xl border border-primary/30">
                {/* Ícone destacado */}
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                
                {/* Conteúdo */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Objetivo Final
                    </span>
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    PPD automática após aprovação
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    1 ano sem infrações graves = CNH definitiva
                  </p>
                </div>
                
                {/* Seta indicativa */}
                <ChevronRight className="w-5 h-5 text-primary/50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="px-6 mt-6">
        <div className="max-w-md mx-auto">
          <h3 className="font-semibold text-foreground mb-4">Etapas da habilitação</h3>
          <div className="space-y-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = step.status === "completed";
              const isCurrent = step.status === "current";
              const isLocked = step.status === "locked";

              const content = (
                <div
                  className={cn(
                    "bg-card rounded-2xl p-4 border-2 transition-all",
                    isCurrent && "border-primary shadow-card",
                    isCompleted && "border-primary/30",
                    isLocked && "border-border opacity-60"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      isCompleted && "bg-primary text-primary-foreground",
                      isCurrent && "bg-primary/10 text-primary",
                      isLocked && "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">{step.name}</h4>
                        {step.subtitle ? (
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            isCompleted && "bg-primary/10 text-primary",
                            isCurrent && "bg-primary text-primary-foreground"
                          )}>
                            {step.subtitle}
                          </span>
                        ) : (
                          <>
                            {isCompleted && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                Concluído
                              </span>
                            )}
                            {isCurrent && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                                Em andamento
                              </span>
                            )}
                          </>
                        )}
                      </div>
                      {step.detail && (
                        <p className="text-xs text-muted-foreground mt-1">{step.detail}</p>
                      )}
                    </div>
                    {!isLocked && (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  {/* Barra de progresso apenas para Aulas Práticas */}
                  {step.name === "Aulas Práticas" && (isCurrent || isCompleted) && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-primary"
                          style={{ width: `${Math.min(step.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {/* Texto explicativo para Preparação Teórica */}
                  {'infoText' in step && step.infoText && isCurrent && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-3">
                        <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">
                          {step.infoText}
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Botões de ação para Exame Teórico */}
                  {'showActions' in step && step.showActions && (
                    <div className="mt-3 pt-3 border-t border-border space-y-3">
                      <div className="flex gap-2">
                        <Link to="/aluno/simulado" className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Play className="w-4 h-4 mr-2" />
                            Simular prova
                          </Button>
                        </Link>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            window.open('https://www.detran.sp.gov.br/wps/portal/portaldetran/cidadao/habilitacao/fichaservicos/agendarProvaTeorica', '_blank');
                          }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Agendar prova
                        </Button>
                      </div>
                      
                      {/* Botão de upload de certificado */}
                      {'showUploadAction' in step && step.showUploadAction && (
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="w-full bg-[#00c853] hover:bg-[#00a843]"
                          onClick={() => setShowUploadModal(true)}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Já fui aprovado - Enviar certificado
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );

              if (step.link && !isLocked) {
                return (
                  <Link key={step.id} to={step.link}>
                    {content}
                  </Link>
                );
              }

              return <div key={step.id}>{content}</div>;
            })}
          </div>
        </div>
      </div>

      {/* Next Lesson */}
      {proximaAula ? (
        <div className="px-6 mt-6">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Próxima aula</h3>
              <Link to="/aluno/agenda" className="text-sm text-primary font-medium">
                Ver agenda
              </Link>
            </div>

            <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
              <div className="flex items-center gap-4 mb-4">
                {proximaAula.photo ? (
                  <img
                    src={proximaAula.photo}
                    alt={proximaAula.instructor}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                    <span className="text-lg font-bold text-muted-foreground">
                      {proximaAula.instructor.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-foreground">{proximaAula.instructor}</h4>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>4.9</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">{proximaAula.date}</p>
                  <p className="text-sm text-muted-foreground">{proximaAula.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{sharedLocation?.address || proximaAula.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{proximaAula.duration}</span>
                </div>
              </div>

              {/* Location Share Section */}
              {!locationShared ? (
                <LocationShareButton
                  className="w-full mb-3"
                  onLocationShared={(loc) => {
                    setLocationShared(true);
                    setSharedLocation(loc);
                    toast.success("Localização enviada ao instrutor!");
                  }}
                />
              ) : (
                <RouteMapCard
                  originAddress={sharedLocation?.address || "Sua localização"}
                  destinationAddress={proximaAula.location}
                  distance="3.2 km"
                  eta="8 min"
                  showNavButton={false}
                  className="mb-3"
                />
              )}

              {/* Payment and Action Buttons */}
              <div className="flex gap-3">
                {!isPaid ? (
                  <>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        toast.info("Reagendamento solicitado", {
                          description: "Reembolso de 80% será processado via PIX"
                        });
                      }}
                    >
                      Reagendar
                    </Button>
                    <Button 
                      onClick={() => setShowPayment(true)}
                      className="flex-1 bg-[#4CAF50] hover:bg-[#45a049] text-white"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pagar R${proximaAula.valor}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" className="flex-1">
                      <Navigation className="w-4 h-4 mr-2" />
                      Ver Rota
                    </Button>
                    <Link to={`/aluno/validacao-aula?id=${proximaAula.id}`} className="flex-1">
                      <Button className="w-full">
                        Iniciar Aula
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-6 mt-6">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Próxima aula</h3>
              <Link to="/aluno/agenda" className="text-sm text-primary font-medium">
                Ver agenda
              </Link>
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 text-center">
              <Car className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground mb-4">Nenhuma aula agendada</p>
              <Link to="/aluno/buscar">
                <Button>Agendar aula prática</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Payment Checkout Modal */}
      {proximaAula && (
        <PaymentCheckout
          open={showPayment}
          onClose={() => setShowPayment(false)}
          onPaymentComplete={() => {
            setShowPayment(false);
            setIsPaid(true);
            toast.success("Pagamento confirmado!");
          }}
          amount={proximaAula.valor}
          duration={parseInt(proximaAula.duration) || 60}
          instructorName={proximaAula.instructor}
          lessonDate={proximaAula.date}
        />
      )}

      {/* Upload Certificado Modal */}
      <UploadCertificadoModal
        open={showUploadModal}
        onOpenChange={setShowUploadModal}
        onSuccess={() => {
          // Recarregar dados do progresso
          if (user) {
            supabase
              .from('alunos')
              .select('id')
              .eq('user_id', user.id)
              .maybeSingle()
              .then(async ({ data: aluno }) => {
                if (aluno) {
                  const { data: progresso } = await supabase
                    .from('progresso_renach')
                    .select('curso_teorico_conclusao, exame_teorico_resultado, aulas_praticas_conclusao, exame_pratico_resultado, prova_teorica_detran_aprovada')
                    .eq('aluno_id', aluno.id)
                    .maybeSingle();
                  
                  setProgressoRenach({
                    exame_medico_concluido: true,
                    ...progresso
                  });
                }
              });
          }
        }}
      />

      <BottomNav />
    </div>
  );
}
