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

// 30 questões oficiais baseadas no exame teórico do DETRAN
const allQuestions = [
  // Legislação de Trânsito (8 questões)
  {
    id: 1,
    category: "Legislação",
    question: "Qual é o limite de velocidade em vias urbanas sem sinalização?",
    options: ["40 km/h", "50 km/h", "60 km/h", "80 km/h"],
    correct: 2,
    explanation: "De acordo com o CTB, o limite de velocidade em vias urbanas sem sinalização é de 60 km/h."
  },
  {
    id: 2,
    category: "Legislação",
    question: "Qual documento é obrigatório portar ao dirigir?",
    options: ["RG e CPF", "CNH e CRLV", "Certidão de nascimento", "Título de eleitor"],
    correct: 1,
    explanation: "O condutor deve portar a CNH (Carteira Nacional de Habilitação) e o CRLV (Certificado de Registro e Licenciamento de Veículo)."
  },
  {
    id: 3,
    category: "Legislação",
    question: "O uso do cinto de segurança é obrigatório para:",
    options: ["Apenas o motorista", "Motorista e passageiro da frente", "Todos os ocupantes", "Apenas em rodovias"],
    correct: 2,
    explanation: "O CTB determina que todos os ocupantes do veículo devem usar cinto de segurança."
  },
  {
    id: 4,
    category: "Legislação",
    question: "Qual a penalidade para dirigir usando celular?",
    options: ["Advertência", "Infração leve", "Infração média", "Infração gravíssima"],
    correct: 3,
    explanation: "Dirigir utilizando telefone celular é infração gravíssima, com multa e 7 pontos na CNH."
  },
  {
    id: 5,
    category: "Legislação",
    question: "Quantos pontos suspendem a CNH de um condutor que não exerce atividade remunerada?",
    options: ["20 pontos", "30 pontos", "40 pontos", "50 pontos"],
    correct: 2,
    explanation: "A CNH é suspensa quando o condutor atinge 40 pontos em 12 meses (não profissional)."
  },
  {
    id: 6,
    category: "Legislação",
    question: "Qual a idade mínima para obter a CNH categoria B?",
    options: ["16 anos", "18 anos", "21 anos", "25 anos"],
    correct: 1,
    explanation: "A idade mínima para obter a CNH é 18 anos completos."
  },
  {
    id: 7,
    category: "Legislação",
    question: "O que significa a sigla CTB?",
    options: ["Código de Tráfego Brasileiro", "Código de Trânsito Brasileiro", "Controle de Tráfego Brasileiro", "Conselho de Trânsito Brasileiro"],
    correct: 1,
    explanation: "CTB significa Código de Trânsito Brasileiro, a lei que regulamenta o trânsito no país."
  },
  {
    id: 8,
    category: "Legislação",
    question: "Qual o prazo de validade da CNH para condutores menores de 50 anos?",
    options: ["3 anos", "5 anos", "10 anos", "15 anos"],
    correct: 2,
    explanation: "Para condutores menores de 50 anos, a CNH tem validade de 10 anos."
  },
  // Direção Defensiva (7 questões)
  {
    id: 9,
    category: "Direção Defensiva",
    question: "Qual a distância mínima segura para o veículo da frente?",
    options: ["1 segundo", "2 segundos", "3 segundos", "5 segundos"],
    correct: 1,
    explanation: "A regra dos 2 segundos é a referência mínima para manter distância segura do veículo à frente."
  },
  {
    id: 10,
    category: "Direção Defensiva",
    question: "O que é aquaplanagem?",
    options: ["Derrapagem em curvas", "Perda de aderência em pista molhada", "Falha nos freios", "Pneu furado"],
    correct: 1,
    explanation: "Aquaplanagem é a perda de contato entre os pneus e o asfalto devido à camada de água na pista."
  },
  {
    id: 11,
    category: "Direção Defensiva",
    question: "Qual a principal causa de acidentes no trânsito?",
    options: ["Falha mecânica", "Condições da via", "Falha humana", "Clima adverso"],
    correct: 2,
    explanation: "Estudos mostram que cerca de 90% dos acidentes são causados por falhas humanas."
  },
  {
    id: 12,
    category: "Direção Defensiva",
    question: "O que fazer em caso de ofuscamento por farol alto à noite?",
    options: ["Olhar para o farol do outro veículo", "Piscar farol alto de volta", "Desviar o olhar para a margem direita da via", "Parar imediatamente"],
    correct: 2,
    explanation: "Deve-se desviar o olhar para a margem direita da pista até que o veículo passe."
  },
  {
    id: 13,
    category: "Direção Defensiva",
    question: "Qual o comportamento correto ao se aproximar de uma curva?",
    options: ["Acelerar na curva", "Reduzir antes da curva e manter velocidade constante", "Frear durante a curva", "Manter velocidade alta"],
    correct: 1,
    explanation: "Deve-se reduzir a velocidade antes de entrar na curva e mantê-la constante durante."
  },
  {
    id: 14,
    category: "Direção Defensiva",
    question: "O que é ponto cego do veículo?",
    options: ["Área visível pelos retrovisores", "Área não visível pelos retrovisores", "Farol queimado", "Vidro embaçado"],
    correct: 1,
    explanation: "Ponto cego é a área ao redor do veículo que não é visível pelos retrovisores."
  },
  {
    id: 15,
    category: "Direção Defensiva",
    question: "Qual atitude caracteriza um condutor defensivo?",
    options: ["Dirigir rápido para chegar logo", "Antecipar situações de risco", "Ultrapassar sempre que possível", "Dirigir colado ao veículo da frente"],
    correct: 1,
    explanation: "O condutor defensivo antecipa situações de risco e age preventivamente."
  },
  // Primeiros Socorros (5 questões)
  {
    id: 16,
    category: "Primeiros Socorros",
    question: "Em caso de acidente com vítima, qual o primeiro passo?",
    options: ["Remover a vítima", "Sinalizar o local", "Ligar para família", "Fotografar o acidente"],
    correct: 1,
    explanation: "O primeiro passo é sinalizar o local para evitar novos acidentes."
  },
  {
    id: 17,
    category: "Primeiros Socorros",
    question: "Qual o número do SAMU?",
    options: ["190", "191", "192", "193"],
    correct: 2,
    explanation: "O SAMU (Serviço de Atendimento Móvel de Urgência) atende pelo número 192."
  },
  {
    id: 18,
    category: "Primeiros Socorros",
    question: "Quando NÃO se deve mover uma vítima de acidente?",
    options: ["Quando estiver consciente", "Quando houver suspeita de lesão na coluna", "Quando estiver sangrando", "Quando estiver em pé"],
    correct: 1,
    explanation: "Não se deve mover vítimas com suspeita de lesão na coluna, exceto em risco iminente."
  },
  {
    id: 19,
    category: "Primeiros Socorros",
    question: "O que é a posição lateral de segurança?",
    options: ["Vítima de costas", "Vítima de bruços", "Vítima de lado para evitar asfixia", "Vítima sentada"],
    correct: 2,
    explanation: "A posição lateral de segurança previne asfixia em vítimas inconscientes que respiram."
  },
  {
    id: 20,
    category: "Primeiros Socorros",
    question: "Em caso de hemorragia, qual a primeira ação?",
    options: ["Aplicar torniquete", "Fazer compressão direta no local", "Lavar com água", "Aguardar socorro"],
    correct: 1,
    explanation: "A compressão direta com pano limpo é a primeira medida para conter hemorragias."
  },
  // Sinalização (5 questões)
  {
    id: 21,
    category: "Sinalização",
    question: "O que significa a placa de fundo amarelo com borda vermelha?",
    options: ["Regulamentação", "Advertência", "Indicação", "Obras"],
    correct: 1,
    explanation: "Placas amarelas com borda vermelha são de advertência, alertando sobre perigos."
  },
  {
    id: 22,
    category: "Sinalização",
    question: "Qual a cor das placas de regulamentação?",
    options: ["Amarela", "Verde", "Branca com borda vermelha", "Azul"],
    correct: 2,
    explanation: "Placas de regulamentação são brancas com borda vermelha e símbolo preto."
  },
  {
    id: 23,
    category: "Sinalização",
    question: "O que significa a placa R-1 (PARE)?",
    options: ["Reduzir velocidade", "Parada obrigatória", "Preferência", "Proibido parar"],
    correct: 1,
    explanation: "A placa R-1 (PARE) indica parada obrigatória antes de entrar na via."
  },
  {
    id: 24,
    category: "Sinalização",
    question: "Qual o significado da faixa contínua amarela no centro da pista?",
    options: ["Pode ultrapassar", "Proibido ultrapassar", "Área de estacionamento", "Faixa de pedestres"],
    correct: 1,
    explanation: "Faixa contínua amarela indica proibição de ultrapassagem."
  },
  {
    id: 25,
    category: "Sinalização",
    question: "O que indica o semáforo amarelo?",
    options: ["Pode passar", "Pare imediatamente", "Atenção, vermelho próximo", "Defeito no semáforo"],
    correct: 2,
    explanation: "O amarelo indica atenção e que o vermelho está próximo, prepare-se para parar."
  },
  // Meio Ambiente (3 questões)
  {
    id: 26,
    category: "Meio Ambiente",
    question: "Qual a principal causa de poluição sonora no trânsito?",
    options: ["Motores silenciosos", "Buzinas e escapamentos", "Conversas", "Música baixa"],
    correct: 1,
    explanation: "O uso excessivo de buzinas e escapamentos adulterados causam poluição sonora."
  },
  {
    id: 27,
    category: "Meio Ambiente",
    question: "Como contribuir para reduzir a poluição veicular?",
    options: ["Acelerar bruscamente", "Manter o veículo regulado", "Usar gasolina adulterada", "Não fazer manutenção"],
    correct: 1,
    explanation: "A manutenção regular do veículo reduz a emissão de poluentes."
  },
  {
    id: 28,
    category: "Meio Ambiente",
    question: "O que fazer com óleo usado do motor?",
    options: ["Jogar no esgoto", "Queimar", "Destinar a postos de coleta", "Jogar no lixo comum"],
    correct: 2,
    explanation: "O óleo usado deve ser levado a postos de coleta para reciclagem adequada."
  },
  // Mecânica Básica (2 questões)
  {
    id: 29,
    category: "Mecânica",
    question: "O que indica a luz do óleo acesa no painel?",
    options: ["Trocar óleo em breve", "Pressão de óleo baixa - pare imediatamente", "Óleo cheio", "Tudo normal"],
    correct: 1,
    explanation: "A luz do óleo indica pressão baixa, deve-se parar e verificar imediatamente."
  },
  {
    id: 30,
    category: "Mecânica",
    question: "Qual a função do radiador?",
    options: ["Lubrificar o motor", "Resfriar o motor", "Alimentar o motor", "Dar partida no motor"],
    correct: 1,
    explanation: "O radiador é responsável por resfriar o motor, evitando superaquecimento."
  }
];

export default function SimuladoTeorico() {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(30).fill(null));
  const [showResult, setShowResult] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutos
  const [questions] = useState(() => allQuestions.slice(0, 30));

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
      if (answer === questions[index].correct) {
        correct++;
      }
    });
    return correct;
  }, [answers, questions]);

  const getScoreByCategory = useCallback(() => {
    const categories: Record<string, { correct: number; total: number }> = {};
    
    questions.forEach((q, index) => {
      if (!categories[q.category]) {
        categories[q.category] = { correct: 0, total: 0 };
      }
      categories[q.category].total++;
      if (answers[index] === q.correct) {
        categories[q.category].correct++;
      }
    });
    
    return categories;
  }, [answers, questions]);

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
              const isCorrect = userAnswer === q.correct;
              
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
                      <span className="text-xs text-muted-foreground">{q.category}</span>
                      <p className="text-sm font-medium text-foreground">{q.question}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 ml-11">
                    {q.options.map((opt, optIndex) => (
                      <div
                        key={optIndex}
                        className={cn(
                          "text-sm py-1 px-2 rounded",
                          optIndex === q.correct && "bg-primary/10 text-primary font-medium",
                          optIndex === userAnswer && optIndex !== q.correct && "bg-destructive/10 text-destructive line-through"
                        )}
                      >
                        {String.fromCharCode(65 + optIndex)}) {opt}
                        {optIndex === q.correct && " ✓"}
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-3 ml-11 p-2 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      <strong>Explicação:</strong> {q.explanation}
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
          <span className="text-xs text-primary font-medium">{question.category}</span>
          <h2 className="text-lg font-semibold text-foreground mb-6 mt-1">
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