import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle2,
  XCircle,
  ChevronRight,
  ChevronLeft,
  Trophy,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const questions = [
  {
    id: 1,
    question: "Qual é o limite de velocidade em vias urbanas sem sinalização?",
    options: ["40 km/h", "50 km/h", "60 km/h", "80 km/h"],
    correct: 2,
  },
  {
    id: 2,
    question: "O que significa a placa de fundo amarelo com borda vermelha?",
    options: ["Regulamentação", "Advertência", "Indicação", "Educativa"],
    correct: 1,
  },
  {
    id: 3,
    question: "Qual documento é obrigatório portar ao dirigir?",
    options: ["RG", "CPF", "CNH e CRLV", "Certidão de nascimento"],
    correct: 2,
  },
  {
    id: 4,
    question: "Qual a distância mínima segura para o veículo da frente?",
    options: ["1 segundo", "2 segundos", "3 segundos", "5 segundos"],
    correct: 1,
  },
  {
    id: 5,
    question: "Em caso de acidente com vítima, qual o primeiro passo?",
    options: ["Fugir do local", "Sinalizar o local", "Mover a vítima", "Ligar para família"],
    correct: 1,
  },
  {
    id: 6,
    question: "Quantas horas práticas são obrigatórias pela Res. CONTRAN 1.020/2025?",
    options: ["10 horas", "5 horas", "2 horas", "20 horas"],
    correct: 2,
  },
  {
    id: 7,
    question: "O uso do cinto de segurança é obrigatório para:",
    options: ["Apenas o motorista", "Motorista e passageiro da frente", "Todos os ocupantes", "Ninguém"],
    correct: 2,
  },
  {
    id: 8,
    question: "Qual a penalidade para dirigir usando celular?",
    options: ["Advertência", "Infração leve", "Infração média", "Infração gravíssima"],
    correct: 3,
  },
];

export default function SimuladoTeorico() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes

  const handleAnswer = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const calculateScore = () => {
    let correct = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].correct) {
        correct++;
      }
    });
    return correct;
  };

  const finishExam = () => {
    setShowResult(true);
  };

  const restartExam = () => {
    setAnswers(new Array(questions.length).fill(null));
    setCurrentQuestion(0);
    setShowResult(false);
    setStarted(false);
  };

  const score = calculateScore();
  const percentage = Math.round((score / questions.length) * 100);
  const passed = percentage >= 70;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (!started) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border px-6 pt-6 pb-4">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold text-foreground">Simulado Teórico</h1>
            </div>
          </div>
        </header>

        <div className="px-6 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-secondary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Pronto para o Simulado?
            </h2>
            <p className="text-muted-foreground mb-8">
              {questions.length} questões • Igual ao DETRAN • 70% para aprovar
            </p>

            <div className="bg-card rounded-2xl p-6 border border-border mb-6 text-left">
              <h3 className="font-semibold text-foreground mb-4">Informações:</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">30 minutos de duração</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Acerte pelo menos 70% ({Math.ceil(questions.length * 0.7)} questões)</span>
                </div>
              </div>
            </div>

            <Button variant="hero" size="xl" className="w-full" onClick={() => setStarted(true)}>
              Iniciar Simulado
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border px-6 pt-6 pb-4">
          <div className="max-w-md mx-auto">
            <h1 className="text-lg font-bold text-foreground text-center">Resultado</h1>
          </div>
        </header>

        <div className="px-6 py-8">
          <div className="max-w-md mx-auto text-center">
            <div className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6",
              passed ? "bg-primary" : "bg-destructive"
            )}>
              {passed ? (
                <Trophy className="w-12 h-12 text-primary-foreground" />
              ) : (
                <XCircle className="w-12 h-12 text-destructive-foreground" />
              )}
            </div>

            <h2 className={cn(
              "text-3xl font-bold mb-2",
              passed ? "text-primary" : "text-destructive"
            )}>
              {passed ? "APROVADO!" : "REPROVADO"}
            </h2>
            <p className="text-muted-foreground mb-6">
              Você acertou {score} de {questions.length} questões ({percentage}%)
            </p>

            <div className="bg-card rounded-2xl p-6 border border-border mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{score}</div>
                  <p className="text-xs text-muted-foreground">Acertos</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-destructive">{questions.length - score}</div>
                  <p className="text-xs text-muted-foreground">Erros</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button variant="hero" size="xl" className="w-full" onClick={restartExam}>
                <RotateCcw className="w-5 h-5 mr-2" />
                Tentar Novamente
              </Button>
              <Button variant="outline" size="xl" className="w-full" onClick={() => navigate("/aluno")}>
                Voltar ao Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-background pb-32">
      <header className="bg-card border-b border-border px-6 pt-6 pb-4 sticky top-0 z-10">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-foreground">
              {currentQuestion + 1} / {questions.length}
            </span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      <div className="px-6 py-6">
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
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
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center font-medium text-sm",
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
              onClick={finishExam}
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
