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
  Navigation
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const nextLesson = {
  instructor: "Carlos Silva",
  photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  date: "Amanhã",
  time: "14:00",
  location: "Av. Brasil, 1234 - Araçatuba",
  duration: "1 hora",
  isMEI: true,
};

export default function AlunoDashboard() {
  const [showContent, setShowContent] = useState(true);
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);
  const [locationShared, setLocationShared] = useState(false);
  const [sharedLocation, setSharedLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [cursoTeoricoCompleto, setCursoTeoricoCompleto] = useState(false);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => setProfile(data));

      // Buscar progresso do curso teórico
      supabase
        .from('alunos')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(async ({ data: aluno }) => {
          if (aluno) {
            const { data: progresso } = await supabase
              .from('progresso_renach')
              .select('curso_teorico_conclusao')
              .eq('aluno_id', aluno.id)
              .maybeSingle();
            
            setCursoTeoricoCompleto(!!progresso?.curso_teorico_conclusao);
          }
        });
    }
  }, [user]);
  
  const minRequiredHours = 2; // Mínimo obrigatório pela Res. 1.020/2024
  const practicalHours = 1;
  const totalProgress = cursoTeoricoCompleto ? 62 : 40;

  const steps = [
    { id: 1, name: "Exame Médico/Psico", icon: FileText, status: "completed", progress: 100 },
    { 
      id: 2, 
      name: "Curso Teórico (EAD)", 
      icon: BookOpen, 
      status: cursoTeoricoCompleto ? "completed" : "current", 
      progress: cursoTeoricoCompleto ? 100 : 0, 
      link: "/aluno/curso-teorico",
      subtitle: cursoTeoricoCompleto ? "Concluído" : "Concluir agora",
      detail: cursoTeoricoCompleto 
        ? "EAD gratuito · Sem carga horária mínima · Certificado emitido" 
        : "EAD gratuito · Conforme nova lei"
    },
    { 
      id: 3, 
      name: "Exame Teórico", 
      icon: ClipboardCheck, 
      status: cursoTeoricoCompleto ? "completed" : "locked", 
      progress: cursoTeoricoCompleto ? 100 : 0 
    },
    { 
      id: 4, 
      name: "Aulas Práticas", 
      icon: Car, 
      status: cursoTeoricoCompleto ? "current" : "locked", 
      progress: Math.round((practicalHours / minRequiredHours) * 100), 
      subtitle: cursoTeoricoCompleto ? "Em andamento" : undefined,
      detail: `${practicalHours}h de ${minRequiredHours}h mínimas obrigatórias (Res. 1.020/2024)`, 
      link: "/aluno/buscar" 
    },
    { 
      id: 5, 
      name: "Exame Prático", 
      icon: Trophy, 
      status: "locked", 
      progress: 0, 
      link: "/aluno/exame-pratico"
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

            {/* PPD Counter */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-3 p-3 bg-secondary/5 rounded-xl">
                <Timer className="w-5 h-5 text-secondary" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">PPD automática após aprovação</p>
                  <p className="text-sm font-semibold text-foreground">1 ano sem infrações graves</p>
                </div>
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
                  {step.name === "Aulas Práticas" && isCurrent && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-primary"
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
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
              <img
                src={nextLesson.photo}
                alt={nextLesson.instructor}
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">{nextLesson.instructor}</h4>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>4.9</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary">{nextLesson.date}</p>
                <p className="text-sm text-muted-foreground">{nextLesson.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{sharedLocation?.address || nextLesson.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{nextLesson.duration}</span>
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
                destinationAddress={nextLesson.location}
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
                    Pagar R$100
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="flex-1">
                    <Navigation className="w-4 h-4 mr-2" />
                    Ver Rota
                  </Button>
                  <Link to="/aluno/validacao-aula" className="flex-1">
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

      {/* Payment Checkout Modal */}
      <PaymentCheckout
        open={showPayment}
        onClose={() => setShowPayment(false)}
        onPaymentComplete={() => {
          setShowPayment(false);
          setIsPaid(true);
          toast.success("Pagamento confirmado!");
        }}
        amount={100}
        duration={60}
        instructorName={nextLesson.instructor}
        lessonDate={nextLesson.date}
      />

      <BottomNav />
    </div>
  );
}
