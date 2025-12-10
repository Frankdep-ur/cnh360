import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Play, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  Lock,
  Clock,
  Award,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/layout/BottomNav";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const modules = [
  { 
    id: 1, 
    title: "Legislação de Trânsito", 
    lessons: 12, 
    completed: 12, 
    duration: "2h 30min",
    status: "completed" 
  },
  { 
    id: 2, 
    title: "Direção Defensiva", 
    lessons: 10, 
    completed: 10, 
    duration: "2h",
    status: "completed" 
  },
  { 
    id: 3, 
    title: "Primeiros Socorros", 
    lessons: 8, 
    completed: 5, 
    duration: "1h 30min",
    status: "current" 
  },
  { 
    id: 4, 
    title: "Meio Ambiente e Cidadania", 
    lessons: 6, 
    completed: 0, 
    duration: "1h",
    status: "locked" 
  },
  { 
    id: 5, 
    title: "Mecânica Básica", 
    lessons: 5, 
    completed: 0, 
    duration: "45min",
    status: "locked" 
  },
];

export default function CursoTeoricoEAD() {
  const navigate = useNavigate();
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons, 0);
  const completedLessons = modules.reduce((acc, m) => acc + m.completed, 0);
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="min-h-screen bg-background pb-24">
      <ComplianceBanner variant="full" />
      
      {/* Header */}
      <header className="bg-card border-b border-border px-6 pt-4 pb-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground">Curso Teórico EAD</h1>
              <p className="text-sm text-muted-foreground">100% Online • Sem carga horária fixa</p>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Overview */}
      <div className="px-6 py-6">
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl p-5 border border-secondary/20">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl gradient-secondary flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-secondary-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-foreground text-lg">Seu Progresso</h2>
                <p className="text-sm text-muted-foreground">
                  {completedLessons} de {totalLessons} aulas concluídas
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-secondary">{progressPercent}%</span>
              </div>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>

          {/* SENATRAN Integration */}
          <a 
            href="https://www.gov.br/senatran" 
            target="_blank" 
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-foreground text-sm">Plataforma SENATRAN</h3>
              <p className="text-xs text-muted-foreground">Acesse o curso gratuito do governo</p>
            </div>
            <ExternalLink className="w-4 h-4 text-muted-foreground" />
          </a>
        </div>
      </div>

      {/* Modules */}
      <div className="px-6">
        <div className="max-w-md mx-auto">
          <h3 className="font-semibold text-foreground mb-4">Módulos do Curso</h3>
          <div className="space-y-3">
            {modules.map((module) => {
              const isCompleted = module.status === "completed";
              const isCurrent = module.status === "current";
              const isLocked = module.status === "locked";
              const moduleProgress = Math.round((module.completed / module.lessons) * 100);

              return (
                <div
                  key={module.id}
                  className={cn(
                    "bg-card rounded-2xl p-4 border-2 transition-all",
                    isCurrent && "border-secondary shadow-card",
                    isCompleted && "border-primary/30",
                    isLocked && "border-border opacity-60"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                      isCompleted && "bg-primary text-primary-foreground",
                      isCurrent && "bg-secondary/10 text-secondary",
                      isLocked && "bg-muted text-muted-foreground"
                    )}>
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : isLocked ? (
                        <Lock className="w-5 h-5" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground text-sm">{module.title}</h4>
                        {isCompleted && (
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Concluído
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {module.lessons} aulas
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {module.duration}
                        </span>
                      </div>
                      {isCurrent && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{module.completed}/{module.lessons} aulas</span>
                            <span className="text-secondary font-medium">{moduleProgress}%</span>
                          </div>
                          <Progress value={moduleProgress} className="h-1.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Simulado CTA */}
      <div className="px-6 mt-6">
        <div className="max-w-md mx-auto">
          <Link to="/aluno/simulado">
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">Simulado Teórico</h3>
                  <p className="text-sm opacity-90">30 questões como no DETRAN</p>
                </div>
                <Button variant="secondary" size="sm">
                  Iniciar
                </Button>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
