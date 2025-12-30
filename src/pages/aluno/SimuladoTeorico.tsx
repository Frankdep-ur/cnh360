import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Trophy,
  RotateCcw,
  AlertTriangle,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { BottomNav } from "@/components/layout/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { selecionarQuestoesAleatorias, type QuestaoSimulado } from "@/data/questoesSimulado";

export default function SimuladoTeorico() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(30).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [questions] = useState<QuestaoSimulado[]>(() => selecionarQuestoesAleatorias(30));
  const [saving, setSaving] = useState(false);
  const [alreadySaved, setAlreadySaved] = useState(false);

  // Timer funcional
  useEffect(() => {
    if (!started || showResult) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowResult(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, showResult]);

  const handleAnswer = useCallback((optionIndex: number) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[currentQuestion] = optionIndex;
      return newAnswers;
    });
  }, [currentQuestion]);

  const calculateScore = useCallback(() => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].respostaCorreta) {
        correct++;
      }
    });
    return correct;
  }, [answers, questions]);

  const getScoreByCategory = useCallback(() => {
    const categories: Record<string, { correct: number; total: number }> = {};
    
    questions.forEach((q, index) => {
      if (!categories[q.categoria]) {
        categories[q.categoria] = { correct: 0, total: 0 };
      }
      categories[q.categoria].total++;
      if (answers[index] === q.respostaCorreta) {
        categories[q.categoria].correct++;
      }
    });
    
    return categories;
  }, [answers, questions]);

  // Salvar resultado no banco de dados
  const saveResult = useCallback(async () => {
    if (!user || saving || alreadySaved) return;
    
    setSaving(true);
    try {
      // Buscar aluno_id
      const { data: aluno } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!aluno) {
        toast.error('Perfil de aluno não encontrado');
        return;
      }

      const score = calculateScore();
      const tempoGasto = (45 * 60) - timeLeft;
      const categories = getScoreByCategory();

      const { error } = await supabase
        .from('simulados_historico')
        .insert({
          aluno_id: aluno.id,
          nota: Math.round((score / questions.length) * 100),
          total_questoes: questions.length,
          acertos: score,
          tempo_gasto_segundos: tempoGasto,
          aprovado: score >= 21,
          detalhes_categorias: categories
        });

      if (error) throw error;
      
      setAlreadySaved(true);
      toast.success('Resultado salvo no seu histórico!');
    } catch (error) {
      console.error('Erro ao salvar resultado:', error);
      toast.error('Não foi possível salvar o resultado');
    } finally {
      setSaving(false);
    }
  }, [user, saving, alreadySaved, calculateScore, getScoreByCategory, timeLeft, questions.length]);

  // Salvar automaticamente quando mostrar resultado
  useEffect(() => {
    if (showResult && !alreadySaved) {
      saveResult();
    }
  }, [showResult, alreadySaved, saveResult]);

  const finishExam = () => {
    setShowResult(true);
  };

  const restartExam = () => {
    setAnswers(new Array(30).fill(null));
    setCurrentQuestion(0);
    setShowResult(false);
    setShowReview(false);
    setStarted(false);
    setTimeLeft(45 * 60);
  };

  const score = calculateScore();
  const percentage = Math.round((score / questions.length) * 100);
  const passed = percentage >= 70;
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = answers.filter(a => a !== null).length;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  // Tela de revisão das respostas
  if (showReview) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-card border-b border-border px-6 pt-6 pb-4 sticky top-0 z-10">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowReview(false)}
                className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold text-foreground">Revisão das Respostas</h1>
            </div>
          </div>
        </header>

        <div className="px-6 py-4">
          <div className="max-w-md mx-auto space-y-4">
            {questions.map((q, index) => {
              const userAnswer = answers[index];
              const isCorrect = userAnswer === q.respostaCorreta;
              
              return (
                <div 
                  key={q.id}
                  className={cn(
                    "bg-card rounded-2xl p-4 border-2",
                    isCorrect ? "border-primary/30" : "border-destructive/30"
                  )}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                      isCorrect ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"
                    )}>
                      {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">{q.categoria}</span>
                      <p className="text-sm font-medium text-foreground">{q.pergunta}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 ml-11">
                    {q.opcoes.map((opt, optIndex) => (
                      <div
                        key={optIndex}
                        className={cn(
                          "text-sm py-1 px-2 rounded",
                          optIndex === q.respostaCorreta && "bg-primary/10 text-primary font-medium",
                          optIndex === userAnswer && optIndex !== q.respostaCorreta && "bg-destructive/10 text-destructive line-through"
                        )}
                      >
                        {String.fromCharCode(65 + optIndex)}) {opt}
                        {optIndex === q.respostaCorreta && " ✓"}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 ml-11 p-2 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      <strong>Explicação:</strong> {q.explicacao}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <BottomNav />
      </div>
    );
  }

  // Tela inicial
  if (!started) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-card border-b border-border px-6 pt-6 pb-4">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold text-foreground">Simulado Teórico DETRAN</h1>
            </div>
          </div>
        </header>

        <div className="px-6 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-secondary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Pronto para o Simulado?
            </h2>
            <p className="text-muted-foreground mb-8">
              30 questões • Igual ao DETRAN • 70% para aprovar
            </p>

            <div className="bg-card rounded-2xl p-6 border border-border mb-6 text-left">
              <h3 className="font-semibold text-foreground mb-4">Informações da Prova:</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-sm text-foreground">45 minutos de duração</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-sm text-foreground">Mínimo 21 acertos (70%)</span>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span className="text-sm text-foreground">Tempo esgotado = prova finalizada</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-2">Distribuição:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>• Legislação: 8 questões</span>
                  <span>• Direção Defensiva: 7 questões</span>
                  <span>• Primeiros Socorros: 5 questões</span>
                  <span>• Sinalização: 5 questões</span>
                  <span>• Meio Ambiente: 3 questões</span>
                  <span>• Mecânica: 2 questões</span>
                </div>
              </div>
            </div>

            <Button variant="hero" size="xl" className="w-full" onClick={() => setStarted(true)}>
              Iniciar Simulado
            </Button>
          </div>
        </div>
        
        <BottomNav />
      </div>
    );
  }

  // Tela de resultado
  if (showResult) {
    const categoryScores = getScoreByCategory();
    
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-card border-b border-border px-6 pt-6 pb-4">
          <div className="max-w-md mx-auto">
            <h1 className="text-lg font-bold text-foreground text-center">Resultado do Simulado</h1>
          </div>
        </header>

        <div className="px-6 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className={cn(
              "w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6",
              passed ? "bg-primary" : "bg-destructive"
            )}>
              {passed ? (
                <Trophy className="w-14 h-14 text-primary-foreground" />
              ) : (
                <XCircle className="w-14 h-14 text-destructive-foreground" />
              )}
            </div>

            <h2 className={cn(
              "text-3xl font-bold mb-2",
              passed ? "text-primary" : "text-destructive"
            )}>
              {passed ? "APROVADO!" : "REPROVADO"}
            </h2>
            <p className="text-muted-foreground mb-6">
              Você acertou <strong>{score}</strong> de <strong>{questions.length}</strong> questões ({percentage}%)
            </p>
            
            <p className="text-sm text-muted-foreground mb-6">
              {passed 
                ? "Parabéns! Você está preparado para a prova real do DETRAN." 
                : "Continue estudando! Você precisa de pelo menos 21 acertos (70%) para ser aprovado."}
            </p>

            {/* Score por categoria */}
            <div className="bg-card rounded-2xl p-4 border border-border mb-6 text-left">
              <h3 className="font-semibold text-foreground mb-3">Desempenho por Categoria:</h3>
              <div className="space-y-2">
                {Object.entries(categoryScores).map(([category, data]) => {
                  const catPercentage = Math.round((data.correct / data.total) * 100);
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              catPercentage >= 70 ? "bg-primary" : "bg-destructive"
                            )}
                            style={{ width: `${catPercentage}%` }}
                          />
                        </div>
                        <span className={cn(
                          "text-xs font-medium w-16 text-right",
                          catPercentage >= 70 ? "text-primary" : "text-destructive"
                        )}>
                          {data.correct}/{data.total} ({catPercentage}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{score}</div>
                  <p className="text-xs text-muted-foreground">Acertos</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-destructive">{questions.length - score}</div>
                  <p className="text-xs text-muted-foreground">Erros</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">{percentage}%</div>
                  <p className="text-xs text-muted-foreground">Aproveit.</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button variant="outline" size="xl" className="w-full" onClick={() => setShowReview(true)}>
                <BookOpen className="w-5 h-5 mr-2" />
                Ver Gabarito Comentado
              </Button>
              <Button variant="hero" size="xl" className="w-full" onClick={restartExam}>
                <RotateCcw className="w-5 h-5 mr-2" />
                Fazer Novo Simulado
              </Button>
              <Button variant="ghost" size="xl" className="w-full" onClick={() => navigate("/aluno")}>
                Voltar ao Dashboard
              </Button>
            </div>
          </div>
        </div>
        
        <BottomNav />
      </div>
    );
  }

  // Tela de questões
  const question = questions[currentQuestion];
  const isTimeWarning = timeLeft <= 5 * 60; // Últimos 5 minutos

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="bg-card border-b border-border px-6 pt-6 pb-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                if (confirm("Deseja sair do simulado? Seu progresso será perdido.")) {
                  navigate(-1);
                }
              }}
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-foreground">
              {currentQuestion + 1} / {questions.length}
            </span>
            <div className={cn(
              "flex items-center gap-1 px-3 py-1 rounded-full",
              isTimeWarning ? "bg-destructive/10 text-destructive" : "text-muted-foreground"
            )}>
              <Clock className="w-4 h-4" />
              <span className="text-sm font-mono">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{answeredCount} respondidas</span>
            <span>{questions.length - answeredCount} restantes</span>
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        <div className="max-w-md mx-auto">
          <span className="text-xs text-primary font-medium">{question.categoria}</span>
          <h2 className="text-lg font-semibold text-foreground mb-6 mt-1">
            {question.pergunta}
          </h2>

          <div className="space-y-3">
            {question.opcoes.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={cn(
                  "w-full p-4 rounded-2xl border-2 text-left transition-all",
                  answers[currentQuestion] === index
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium text-sm flex-shrink-0",
                    answers[currentQuestion] === index
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted-foreground text-muted-foreground"
                  )}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-foreground">{option}</span>
                </div>
              </button>
            ))}
          </div>
          
          {/* Navegação por questões */}
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={cn(
                  "w-8 h-8 rounded-lg text-xs font-medium transition-all",
                  idx === currentQuestion && "ring-2 ring-primary",
                  answers[idx] !== null 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            variant="outline"
            size="xl"
            className="flex-1"
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion(prev => prev - 1)}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Anterior
          </Button>
          {currentQuestion === questions.length - 1 ? (
            <Button
              variant="hero"
              size="xl"
              className="flex-1"
              onClick={() => {
                if (answeredCount < questions.length) {
                  if (confirm(`Você ainda tem ${questions.length - answeredCount} questões sem resposta. Deseja finalizar mesmo assim?`)) {
                    finishExam();
                  }
                } else {
                  finishExam();
                }
              }}
            >
              Finalizar
            </Button>
          ) : (
            <Button
              variant="hero"
              size="xl"
              className="flex-1"
              onClick={() => setCurrentQuestion(prev => prev + 1)}
            >
              Próxima
              <ChevronRight className="w-5 h-5 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}