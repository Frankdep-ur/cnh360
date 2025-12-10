import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Bell, 
  ChevronRight, 
  BookOpen, 
  Car, 
  ClipboardCheck, 
  Trophy,
  Calendar,
  Clock,
  MapPin,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { BottomNav } from "@/components/layout/BottomNav";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, name: "Curso Teórico", icon: BookOpen, status: "completed", progress: 100 },
  { id: 2, name: "Exame Teórico", icon: ClipboardCheck, status: "completed", progress: 100 },
  { id: 3, name: "Aulas Práticas", icon: Car, status: "current", progress: 50, detail: "1h de 2h" },
  { id: 4, name: "Exame Prático", icon: Trophy, status: "locked", progress: 0 },
];

const nextLesson = {
  instructor: "Carlos Silva",
  photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  date: "Amanhã",
  time: "14:00",
  location: "Av. Brasil, 1234",
  duration: "1 hora",
};

export default function AlunoDashboard() {
  const [showContent, setShowContent] = useState(true);
  const totalProgress = 62;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground px-6 pt-8 pb-20 safe-top">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-primary-foreground/80 text-sm">Olá,</p>
              <h1 className="text-xl font-bold">Maria Santos 👋</h1>
            </div>
            <button className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
            </button>
          </div>

          <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-sm text-primary-foreground/80 mb-1">Nova lei CONTRAN</p>
            <p className="font-medium">Apenas 2h de aula prática obrigatória!</p>
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
                  <span className="text-primary font-medium">Falta 1h de aula prática</span>
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

              return (
                <div
                  key={step.id}
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
                        {isCompleted && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Concluído
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
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
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
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
                <h4 className="font-semibold text-foreground">{nextLesson.instructor}</h4>
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
              <Button variant="hero" className="flex-1">
                Iniciar chat
              </Button>
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
              className="bg-primary/5 hover:bg-primary/10 rounded-2xl p-4 transition-colors"
            >
              <Car className="w-8 h-8 text-primary mb-2" />
              <h4 className="font-medium text-foreground">Agendar aula</h4>
              <p className="text-xs text-muted-foreground">Encontre instrutores</p>
            </Link>
            <Link
              to="/aluno/simulado"
              className="bg-secondary/5 hover:bg-secondary/10 rounded-2xl p-4 transition-colors"
            >
              <BookOpen className="w-8 h-8 text-secondary mb-2" />
              <h4 className="font-medium text-foreground">Simulado</h4>
              <p className="text-xs text-muted-foreground">Pratique para o exame</p>
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
