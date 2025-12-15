import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ChevronRight, 
  BookOpen, 
  Car, 
  ClipboardCheck, 
  Trophy,
  Calendar,
  Clock,
  MapPin,
  Star,
  Shield,
  Timer,
  FileText,
  Leaf,
  Building2
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { BottomNav } from "@/components/layout/BottomNav";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { ContadorTransicao } from "@/components/transicao/ContadorTransicao";
import { IndicadorModo } from "@/components/transicao/IndicadorModo";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useModoTransicao } from "@/contexts/ModoTransicaoContext";
import { cn } from "@/lib/utils";

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
  const { modo, config, isSP, diasRestantes } = useModoTransicao();
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => setProfile(data));
    }
  }, [user]);
  
  // Valores baseados no modo
  const requiredHours = config.horasPraticasMinimas;
  const practicalHours = 1;
  const totalProgress = modo === "nova_lei" ? 75 : 62;

  // Steps adaptados ao modo
  const steps = [
    { id: 1, name: "Exame Médico/Psico", icon: FileText, status: "completed", progress: 100 },
    { 
      id: 2, 
      name: modo === "nova_lei" ? "Curso Teórico 100% EAD" : "Curso Teórico 45h", 
      icon: BookOpen, 
      status: "completed", 
      progress: 100, 
      link: "/aluno/curso-teorico",
      detail: modo === "nova_lei" ? "Sem carga horária fixa" : "45 horas presenciais"
    },
    { id: 3, name: "Exame Teórico", icon: ClipboardCheck, status: "completed", progress: 100 },
    { 
      id: 4, 
      name: "Aulas Práticas", 
      icon: Car, 
      status: "current", 
      progress: Math.round((practicalHours / requiredHours) * 100), 
      detail: `${practicalHours}h de ${requiredHours}h ${modo === "nova_lei" ? "mínimas" : "obrigatórias"}`, 
      link: "/aluno/buscar" 
    },
    { 
      id: 5, 
      name: "Exame Prático", 
      icon: Trophy, 
      status: "locked", 
      progress: 0, 
      link: "/aluno/exame-pratico",
      detail: modo === "nova_lei" ? "2ª tentativa grátis" : undefined
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Compliance Banner */}
      <ComplianceBanner variant="full" dismissible />

      {/* Header */}
      <header className={cn(
        "text-primary-foreground px-6 pt-6 pb-20",
        modo === "nova_lei" ? "gradient-nova-lei" : modo === "atual" ? "gradient-modo-atual" : "gradient-hero"
      )}>
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-primary-foreground/80 text-sm">Olá,</p>
              <h1 className="text-xl font-bold">{profile?.full_name || 'Aluno'} 👋</h1>
            </div>
            <NotificationBell />
          </div>

          {/* Indicador do Modo de Transição */}
          {isSP && modo && (
            <div className="flex items-center justify-between mb-4 bg-primary-foreground/10 backdrop-blur-sm rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                {modo === "nova_lei" ? (
                  <Leaf className="w-4 h-4" />
                ) : (
                  <Building2 className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">{config.label}</span>
              </div>
              <div className="text-xs text-primary-foreground/80">
                {diasRestantes}d restantes
              </div>
            </div>
          )}

          {/* RENACH Progress Card */}
          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Progresso RENACH</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold">{practicalHours}h</span>
                <span className="text-primary-foreground/80"> / {requiredHours}h práticas</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-primary-foreground/60">Validadas GPS/QR</p>
              </div>
            </div>
            
            {/* Economia no modo nova lei */}
            {modo === "nova_lei" && (
              <div className="mt-3 pt-3 border-t border-primary-foreground/20">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary-foreground/80">Economia estimada</span>
                  <span className="font-bold text-primary-foreground">
                    ~R$ {config.precoSugerido.max - config.precoSugerido.min + 1400}
                  </span>
                </div>
              </div>
            )}
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
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    modo === "nova_lei" ? "bg-primary" : "bg-secondary"
                  )} />
                  <span className={cn(
                    "font-medium",
                    modo === "nova_lei" ? "text-primary" : "text-secondary"
                  )}>
                    Falta {requiredHours - practicalHours}h de aula prática
                  </span>
                </div>
              </div>
            </div>

            {/* PPD Counter ou info do modo */}
            <div className="mt-4 pt-4 border-t border-border">
              {modo === "nova_lei" ? (
                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl">
                  <Leaf className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Você está na Nova Lei</p>
                    <p className="text-sm font-semibold text-foreground">
                      {config.carroProprioPermitido ? "Pode usar carro próprio" : "Use o carro do instrutor"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-secondary/5 rounded-xl">
                  <Timer className="w-5 h-5 text-secondary" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">PPD automática após aprovação</p>
                    <p className="text-sm font-semibold text-foreground">1 ano sem infrações graves</p>
                  </div>
                </div>
              )}
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
                    isCurrent && modo === "nova_lei" && "border-primary shadow-card",
                    isCurrent && modo === "atual" && "border-secondary shadow-card",
                    isCurrent && !modo && "border-primary shadow-card",
                    isCompleted && "border-primary/30",
                    isLocked && "border-border opacity-60"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      isCompleted && "bg-primary text-primary-foreground",
                      isCurrent && modo === "nova_lei" && "bg-primary/10 text-primary",
                      isCurrent && modo === "atual" && "bg-secondary/10 text-secondary",
                      isCurrent && !modo && "bg-primary/10 text-primary",
                      isLocked && "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-foreground">{step.name}</h4>
                        {isCompleted && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Concluído
                          </span>
                        )}
                        {isCurrent && (
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full",
                            modo === "nova_lei" 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-secondary text-secondary-foreground"
                          )}>
                            Em andamento
                          </span>
                        )}
                      </div>
                      {step.detail && (
                        <p className="text-sm text-muted-foreground">{step.detail}</p>
                      )}
                    </div>
                    {!isLocked && (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  {isCurrent && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            modo === "nova_lei" ? "bg-primary" : "bg-secondary"
                          )}
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
                  {modo === "nova_lei" && nextLesson.isMEI && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                      MEI
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>4.9</span>
                </div>
              </div>
              <div className="text-right">
                <p className={cn(
                  "font-semibold",
                  modo === "nova_lei" ? "text-primary" : "text-secondary"
                )}>{nextLesson.date}</p>
                <p className="text-sm text-muted-foreground">{nextLesson.time}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{nextLesson.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{nextLesson.duration}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <Button variant="outline" className="flex-1">
                Reagendar
              </Button>
              <Link to="/aluno/validacao-aula" className="flex-1">
                <Button 
                  className={cn(
                    "w-full",
                    modo === "nova_lei" 
                      ? "bg-primary hover:bg-primary/90" 
                      : "bg-secondary hover:bg-secondary/90"
                  )}
                >
                  Iniciar Aula
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mt-6">
        <div className="max-w-md mx-auto">
          <h3 className="font-semibold text-foreground mb-4">Ações rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/aluno/buscar"
              className={cn(
                "rounded-2xl p-4 transition-colors",
                modo === "nova_lei" 
                  ? "bg-primary/5 hover:bg-primary/10" 
                  : "bg-secondary/5 hover:bg-secondary/10"
              )}
            >
              <Car className={cn(
                "w-8 h-8 mb-2",
                modo === "nova_lei" ? "text-primary" : "text-secondary"
              )} />
              <h4 className="font-medium text-foreground">Agendar aula</h4>
              <p className="text-xs text-muted-foreground">
                {modo === "nova_lei" ? "Instrutores MEI disponíveis" : "Encontre instrutores"}
              </p>
            </Link>
            <Link
              to="/aluno/simulado"
              className="bg-amber-500/5 hover:bg-amber-500/10 rounded-2xl p-4 transition-colors"
            >
              <BookOpen className="w-8 h-8 text-amber-600 mb-2" />
              <h4 className="font-medium text-foreground">Simulado</h4>
              <p className="text-xs text-muted-foreground">30 questões DETRAN</p>
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
