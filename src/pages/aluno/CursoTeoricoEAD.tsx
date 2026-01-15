import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  BookOpen, 
  FileText, 
  
  CheckCircle2, 
  Lock,
  Clock,
  ShieldCheck,
  Car,
  Heart,
  Leaf,
  Wrench,
  Scale,
  Info,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/layout/BottomNav";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { useCursoTeorico } from "@/hooks/useCursoTeorico";
import { Skeleton } from "@/components/ui/skeleton";
import { openExternalLink } from "@/lib/openExternalLink";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/page-transition";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
const MODULOS_ICONS: Record<number, React.ElementType> = {
  1: Scale,
  2: Car,
  3: Heart,
  4: Leaf,
  5: Wrench,
};

const DETRAN_PROVA_URL = "https://www.detran.sp.gov.br/detransp/pb/servico/habilitacao/_iniciar_processo_primeira_habilitacao?id=carta_de_servico_iniciar_processo_primeira_habilitacao";

export default function CursoTeoricoEAD() {
  const navigate = useNavigate();
  const { modulos, loading, progressoGeral } = useCursoTeorico();
  const [showDetranAlert, setShowDetranAlert] = useState(false);

  const totalLessons = modulos.reduce((acc, m) => acc + m.totalAulas, 0);
  const completedLessons = modulos.reduce((acc, m) => acc + m.aulasCompletas, 0);

  const handleDetranClick = () => {
    if (progressoGeral < 100) {
      setShowDetranAlert(true);
    } else {
      openExternalLink(DETRAN_PROVA_URL);
    }
  };

  const getModuloStatus = (modulo: typeof modulos[0], index: number) => {
    if (modulo.aulasCompletas === modulo.totalAulas && modulo.totalAulas > 0) {
      return "completed";
    }
    if (modulo.aulasCompletas > 0) {
      return "current";
    }
    // Primeiro módulo sempre disponível, outros dependem do anterior
    if (index === 0) return "current";
    const previousModule = modulos[index - 1];
    if (previousModule && previousModule.aulasCompletas === previousModule.totalAulas) {
      return "current";
    }
    return "locked";
  };

  const handleModuleClick = (modulo: typeof modulos[0], status: string) => {
    if (status !== "locked") {
      navigate(`/aluno/curso-teorico/modulo/${modulo.ordem}`);
    }
  };

  return (
    <PageTransition className="min-h-screen bg-background pb-24">
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
                {loading ? (
                  <Skeleton className="h-4 w-32 mt-1" />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {completedLessons} de {totalLessons} aulas concluídas
                  </p>
                )}
              </div>
              <div className="text-right">
                {loading ? (
                  <Skeleton className="h-9 w-14" />
                ) : (
                  <span className="text-3xl font-bold text-secondary">{progressoGeral}%</span>
                )}
              </div>
            </div>
            <Progress value={progressoGeral} className="h-3" />
          </div>

          {/* Selo de Confiança - Atualizado com resoluções */}
          <div className="mt-4 flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-primary">Conteúdo Oficial</p>
              <p className="text-xs text-muted-foreground">CTB • CONTRAN 789/2020 • 925/2022 • 1.020/2025</p>
            </div>
          </div>

          {/* Seção Sobre esta Preparação */}
          <div className="mt-4 bg-muted/30 rounded-2xl p-4 border border-border">
            <div className="flex items-start gap-3 mb-4">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-foreground mb-1">Sobre esta Preparação</h4>
                <p className="text-sm text-muted-foreground">
                  Esta preparação é um complemento para treinar. A prova oficial é feita no site do DETRAN-SP 
                  através do link disponível abaixo.
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleDetranClick}
              className="w-full bg-[#00c853] hover:bg-[#00a843]"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Agendar Prova Oficial no DETRAN-SP
            </Button>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="px-6">
        <div className="max-w-md mx-auto">
          <h3 className="font-semibold text-foreground mb-4">Módulos do Curso</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : (
            <StaggerContainer className="space-y-3" staggerDelay={0.08}>
              {modulos.map((modulo, index) => {
                const status = getModuloStatus(modulo, index);
                const isCompleted = status === "completed";
                const isCurrent = status === "current";
                const isLocked = status === "locked";
                const moduleProgress = modulo.totalAulas > 0 
                  ? Math.round((modulo.aulasCompletas / modulo.totalAulas) * 100)
                  : 0;
                const IconComponent = MODULOS_ICONS[modulo.ordem] || BookOpen;

                return (
                  <StaggerItem key={modulo.id}>
                    <div
                      onClick={() => handleModuleClick(modulo, status)}
                      className={cn(
                        "bg-card rounded-2xl p-4 border-2 transition-all",
                        isCurrent && "border-secondary shadow-card cursor-pointer hover:bg-muted/50",
                        isCompleted && "border-primary/30 cursor-pointer hover:bg-muted/50",
                        isLocked && "border-border opacity-60 cursor-not-allowed"
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
                            <IconComponent className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground text-sm">{modulo.titulo}</h4>
                            {isCompleted && (
                              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                Concluído
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {modulo.totalAulas} aulas
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {modulo.duracao_estimada_minutos}min
                            </span>
                          </div>
                          {(isCurrent || (isCompleted && moduleProgress < 100)) && modulo.totalAulas > 0 && (
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-muted-foreground">{modulo.aulasCompletas}/{modulo.totalAulas} aulas</span>
                                <span className="text-secondary font-medium">{moduleProgress}%</span>
                              </div>
                              <Progress value={moduleProgress} className="h-1.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          )}
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

      {/* Mecânica Básica CTA - Conteúdo Extra */}
      <div className="px-6 mt-4">
        <div className="max-w-md mx-auto">
          <Link to="/aluno/simulado-mecanica">
            <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-2xl p-5 border border-amber-500/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Wrench className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">Mecânica Básica</h3>
                  <p className="text-sm text-muted-foreground">15 questões extras • Conteúdo opcional</p>
                </div>
                <Button variant="outline" size="sm" className="border-amber-500 text-amber-600">
                  Praticar
                </Button>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* AlertDialog para verificação de conclusão */}
      <AlertDialog open={showDetranAlert} onOpenChange={setShowDetranAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você ainda não concluiu as aulas</AlertDialogTitle>
            <AlertDialogDescription>
              Recomendamos terminar o curso antes de agendar a prova oficial. 
              Deseja concluir as aulas ou prosseguir para o site do DETRAN?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Concluir Aulas</AlertDialogCancel>
            <AlertDialogAction onClick={() => openExternalLink(DETRAN_PROVA_URL)}>
              Prosseguir para DETRAN
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </PageTransition>
  );
}
