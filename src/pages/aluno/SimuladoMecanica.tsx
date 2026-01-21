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
  Wrench,
  ShieldCheck,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { BottomNav } from "@/components/layout/BottomNav";
import { toast } from "sonner";
import { selecionarQuestoesMecanica, type QuestaoSimulado } from "@/data/questoesSimulado";

export default function SimuladoMecanica() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(15).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20 * 60); // 20 minutos
  const [questions] = useState<QuestaoSimulado[]>(() => selecionarQuestoesMecanica(15));

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

  const finishExam = () => {
    setShowResult(true);
  };

  const restartExam = () => {
    setAnswers(new Array(15).fill(null));
    setCurrentQuestion(0);
    setShowResult(false);
    setShowReview(false);
    setStarted(false);
    setTimeLeft(20 * 60);
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
              <h1 className="text-lg font-bold text-foreground">Revisão - Mecânica</h1>
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
                    {q.baseLegal && (
                      <p className="text-xs text-primary mt-1 font-medium">
                        📖 {q.baseLegal}
                      </p>
                    )}
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
                onClick={() => navigate("/aluno")}
                className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold text-foreground">Mecânica Básica</h1>
            </div>
          </div>
        </header>

        <div className="px-6 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
              <Wrench className="w-12 h-12 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Prática de Mecânica
            </h2>
            <p className="text-muted-foreground mb-4">
              15 questões • Conteúdo Extra • Prática Opcional
            </p>

            {/* Badge de conteúdo extra */}
            <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-2 rounded-full mb-8">
              <Wrench className="w-5 h-5" />
              <span className="text-sm font-medium">Conteúdo complementar (não cai na prova)</span>
            </div>

            <div className="bg-card rounded-2xl p-6 border border-border mb-6 text-left">
              <h3 className="font-semibold text-foreground mb-4">Sobre este Simulado:</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-amber-500" />
                  <span className="text-sm text-foreground">20 minutos de duração</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-amber-500" />
                  <span className="text-sm text-foreground">15 questões de mecânica veicular</span>
                </div>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span className="text-sm text-foreground">Não é conteúdo obrigatório do DETRAN</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-sm font-medium text-foreground mb-2">Tópicos Abordados:</h4>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Sistema de freios, suspensão e direção</p>
                  <p>• Motor, óleo e fluidos</p>
                  <p>• Pneus, bateria e elétrica</p>
                  <p>• Manutenção preventiva</p>
                </div>
              </div>
            </div>

            <Button 
              variant="outline" 
              size="xl" 
              className="w-full border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10" 
              onClick={() => setStarted(true)}
            >
              <Wrench className="w-5 h-5 mr-2" />
              Iniciar Prática de Mecânica
            </Button>
          </div>
        </div>
        
        <BottomNav />
      </div>
    );
  }

  // Tela de resultado
  if (showResult) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="bg-card border-b border-border px-6 pt-6 pb-4">
          <div className="max-w-md mx-auto">
            <h1 className="text-lg font-bold text-foreground text-center">Resultado - Mecânica</h1>
          </div>
        </header>

        <div className="px-6 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className={cn(
              "w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6",
              passed ? "bg-amber-500" : "bg-muted"
            )}>
              {passed ? (
                <Trophy className="w-14 h-14 text-white" />
              ) : (
                <Wrench className="w-14 h-14 text-muted-foreground" />
              )}
            </div>

            <h2 className={cn(
              "text-3xl font-bold mb-2",
              passed ? "text-amber-500" : "text-muted-foreground"
            )}>
              {passed ? "BOM TRABALHO!" : "CONTINUE PRATICANDO"}
            </h2>
            <p className="text-muted-foreground mb-6">
              Você acertou <strong>{score}</strong> de <strong>{questions.length}</strong> questões ({percentage}%)
            </p>
            
            <p className="text-sm text-muted-foreground mb-4">
              {passed 
                ? "Você demonstra bom conhecimento em mecânica básica!" 
                : "Revise os conceitos de mecânica para melhorar seu conhecimento."}
            </p>

            <div className="bg-card rounded-2xl p-6 border border-border mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-amber-500">{score}</div>
                  <p className="text-xs text-muted-foreground">Acertos</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-muted-foreground">{questions.length - score}</div>
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
              <Button 
                variant="outline" 
                size="xl" 
                className="w-full border-amber-500 text-amber-600" 
                onClick={restartExam}
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Praticar Novamente
              </Button>
              <Button variant="ghost" size="xl" className="w-full" onClick={() => navigate("/aluno/simulado")}>
                Ir para Simulado Oficial
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
  const isTimeWarning = timeLeft <= 3 * 60;

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="bg-card border-b border-border px-6 pt-6 pb-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                if (confirm("Deseja sair da prática? Seu progresso será perdido.")) {
                  navigate("/aluno");
                }
              }}
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full",
              isTimeWarning ? "bg-destructive text-destructive-foreground" : "bg-amber-500/10 text-amber-600"
            )}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Questão {currentQuestion + 1} de {questions.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {answeredCount} respondidas
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      <div className="px-6 py-6">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-2xl p-5 border border-border mb-4">
            <span className="inline-block text-xs bg-amber-500/10 text-amber-600 px-2 py-1 rounded-full mb-3">
              {question.categoria}
            </span>
            <p className="text-foreground font-medium leading-relaxed">
              {question.pergunta}
            </p>
          </div>

          <div className="space-y-3">
            {question.opcoes.map((opcao, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border-2 transition-all",
                  answers[currentQuestion] === index
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-border bg-card hover:border-amber-500/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold",
                    answers[currentQuestion] === index
                      ? "bg-amber-500 text-white"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-foreground">{opcao}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-20 left-0 right-0 bg-card border-t border-border px-6 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>
          
          {currentQuestion === questions.length - 1 ? (
            <Button
              variant="hero"
              onClick={finishExam}
              className="flex-1"
              disabled={answeredCount < questions.length}
            >
              Finalizar
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
              className="flex-1"
            >
              Próxima
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
