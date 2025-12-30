import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle2, XCircle, ChevronRight, Video, BookOpen, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCursoTeorico } from '@/hooks/useCursoTeorico';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

interface QuizPergunta {
  id: string;
  ordem: number;
  pergunta: string;
  opcoes: any;
  resposta_correta: string;
  explicacao: string | null;
}

export default function AulaConteudo() {
  const navigate = useNavigate();
  const { aulaId } = useParams();
  const { buscarAulaComQuiz, iniciarAula, enviarQuiz } = useCursoTeorico();
  
  const [aula, setAula] = useState<any>(null);
  const [quiz, setQuiz] = useState<QuizPergunta[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'conteudo' | 'video' | 'quiz'>('conteudo');
  
  // Estado do Quiz
  const [respostas, setRespostas] = useState<{ [key: string]: string }>({});
  const [quizEnviado, setQuizEnviado] = useState(false);
  const [resultado, setResultado] = useState<{ aprovado: boolean; nota: number; acertos?: number; total?: number } | null>(null);
  const [mostrarExplicacoes, setMostrarExplicacoes] = useState(false);

  // Carregar dados da aula
  useEffect(() => {
    async function carregarAula() {
      if (!aulaId) return;
      
      try {
        const dados = await buscarAulaComQuiz(aulaId);
        setAula(dados);
        setQuiz(dados.quiz || []);
        
        // Registrar início da aula
        await iniciarAula(aulaId);
        
        // Se já completou, mostrar resultado
        if (dados.progresso?.quiz_aprovado) {
          setQuizEnviado(true);
          setResultado({
            aprovado: true,
            nota: dados.progresso.quiz_nota || 100,
            acertos: 0,
            total: 0
          });
        }
      } catch (error) {
        console.error('Erro ao carregar aula:', error);
        toast.error('Erro ao carregar aula');
      } finally {
        setLoading(false);
      }
    }
    
    carregarAula();
  }, [aulaId]);

  // Extrair ID do vídeo do YouTube
  const getYouTubeVideoId = (url: string) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
  };

  // Enviar quiz
  const handleEnviarQuiz = async () => {
    if (!aulaId) return;
    
    // Verificar se todas as perguntas foram respondidas
    if (Object.keys(respostas).length < quiz.length) {
      toast.error('Responda todas as perguntas antes de enviar');
      return;
    }

    const respostasArray = Object.entries(respostas).map(([perguntaId, resposta]) => ({
      perguntaId,
      resposta
    }));

    const result = await enviarQuiz(aulaId, respostasArray);
    setResultado(result);
    setQuizEnviado(true);
    setMostrarExplicacoes(true);

    if (result.aprovado) {
      toast.success(`Parabéns! Você acertou ${result.nota}% das questões!`);
    } else {
      toast.error(`Você precisa de 70% para aprovar. Tente novamente!`);
    }
  };

  // Refazer quiz
  const handleRefazerQuiz = () => {
    setRespostas({});
    setQuizEnviado(false);
    setResultado(null);
    setMostrarExplicacoes(false);
  };

  // Navegar para próxima aula
  const irParaProximaAula = async () => {
    if (!aula?.modulo_id) return;
    
    // Buscar próxima aula do mesmo módulo
    const { data: aulas } = await supabase
      .from('curso_aulas')
      .select('id, ordem')
      .eq('modulo_id', aula.modulo_id)
      .gt('ordem', aula.ordem)
      .order('ordem')
      .limit(1);

    if (aulas && aulas.length > 0) {
      navigate(`/aluno/curso-teorico/aula/${aulas[0].id}`);
    } else {
      // Voltar para o módulo
      navigate(`/aluno/curso-teorico/modulo/${aula.modulo_id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-primary p-6">
          <Skeleton className="h-8 w-3/4 bg-white/20" />
        </div>
        <div className="p-4">
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (!aula) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Aula não encontrada</p>
          <Button onClick={() => navigate('/aluno/curso-teorico')}>
            Voltar ao Curso
          </Button>
        </div>
      </div>
    );
  }

  const videoId = getYouTubeVideoId(aula.video_url);

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00c853] to-[#00a843] p-4 text-white">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/aluno/curso-teorico/modulo/${aula.modulo_id}`)}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <p className="text-xs text-white/80">Aula {aula.ordem}</p>
            <h1 className="text-lg font-bold leading-tight">{aula.titulo}</h1>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b bg-card sticky top-0 z-10">
        <button
          onClick={() => setActiveTab('conteudo')}
          className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
            activeTab === 'conteudo' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-muted-foreground'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Conteúdo
        </button>
        {videoId && (
          <button
            onClick={() => setActiveTab('video')}
            className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
              activeTab === 'video' 
                ? 'text-primary border-b-2 border-primary' 
                : 'text-muted-foreground'
            }`}
          >
            <Video className="w-4 h-4" />
            Vídeo
          </button>
        )}
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 py-3 px-4 text-sm font-medium flex items-center justify-center gap-2 ${
            activeTab === 'quiz' 
              ? 'text-primary border-b-2 border-primary' 
              : 'text-muted-foreground'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Quiz
          {resultado?.aprovado && <CheckCircle2 className="w-4 h-4 text-[#00c853]" />}
        </button>
      </div>

      {/* Conteúdo */}
      {activeTab === 'conteudo' && (
        <div className="p-4">
          <div 
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: aula.conteudo_texto
                .replace(/^# (.*$)/gm, '<h1 class="text-xl font-bold mt-6 mb-3 text-foreground">$1</h1>')
                .replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold mt-5 mb-2 text-foreground">$1</h2>')
                .replace(/^### (.*$)/gm, '<h3 class="text-base font-medium mt-4 mb-2 text-foreground">$1</h3>')
                .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
                .replace(/\n\n/g, '</p><p class="mb-3 text-muted-foreground">')
                .replace(/^- (.*$)/gm, '<li class="ml-4 text-muted-foreground">$1</li>')
                .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 text-muted-foreground">$1</li>')
                .replace(/\|(.+)\|/g, (match) => {
                  return `<div class="overflow-x-auto my-3"><table class="min-w-full text-sm border">${match}</table></div>`;
                })
            }}
          />
          
          <div className="mt-6">
            <Button 
              onClick={() => setActiveTab(videoId ? 'video' : 'quiz')}
              className="w-full"
            >
              {videoId ? 'Assistir Vídeo' : 'Fazer Quiz'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Vídeo */}
      {activeTab === 'video' && videoId && (
        <div className="p-4">
          <div className="aspect-video bg-black rounded-xl overflow-hidden mb-4">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={aula.titulo}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          
          <p className="text-sm text-muted-foreground mb-4 text-center">
            Fonte: {aula.video_fonte || 'YouTube'}
          </p>
          
          <Button 
            onClick={() => setActiveTab('quiz')}
            className="w-full"
          >
            Fazer Quiz
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Quiz */}
      {activeTab === 'quiz' && (
        <div className="p-4">
          {quiz.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-[#00c853] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aula Concluída!</h3>
              <p className="text-muted-foreground mb-4">
                Esta aula não possui quiz obrigatório.
              </p>
              <Button onClick={irParaProximaAula} className="bg-[#00c853] hover:bg-[#00a843]">
                Próxima Aula
              </Button>
            </div>
          ) : resultado?.aprovado ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-[#00c853] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quiz Aprovado!</h3>
              <p className="text-muted-foreground mb-4">
                Você obteve {resultado.nota}% de aproveitamento.
              </p>
              <Button onClick={irParaProximaAula} className="bg-[#00c853] hover:bg-[#00a843]">
                Próxima Aula
              </Button>
            </div>
          ) : (
            <>
              {resultado && !resultado.aprovado && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                    <XCircle className="w-5 h-5" />
                    <span className="font-semibold">Não aprovado</span>
                  </div>
                  <p className="text-sm text-red-600/80 dark:text-red-400/80">
                    Você acertou {resultado.acertos} de {resultado.total} ({resultado.nota}%). 
                    É necessário 70% para aprovar.
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {quiz.map((pergunta, index) => {
                  const respostaUsuario = respostas[pergunta.id];
                  const estaCorreta = respostaUsuario === pergunta.resposta_correta;
                  
                  return (
                    <div key={pergunta.id} className="bg-card rounded-xl p-4 border">
                      <p className="font-medium mb-3">
                        <span className="text-primary">{index + 1}.</span> {pergunta.pergunta}
                      </p>
                      
                      <RadioGroup
                        value={respostas[pergunta.id] || ''}
                        onValueChange={(value) => {
                          if (!quizEnviado) {
                            setRespostas(prev => ({ ...prev, [pergunta.id]: value }));
                          }
                        }}
                        disabled={quizEnviado}
                      >
                        {pergunta.opcoes.map((opcao) => {
                          const isSelected = respostaUsuario === opcao.letra;
                          const isCorrect = opcao.letra === pergunta.resposta_correta;
                          
                          let optionClass = '';
                          if (mostrarExplicacoes) {
                            if (isCorrect) {
                              optionClass = 'bg-green-50 dark:bg-green-950/30 border-green-500';
                            } else if (isSelected && !isCorrect) {
                              optionClass = 'bg-red-50 dark:bg-red-950/30 border-red-500';
                            }
                          }
                          
                          return (
                            <div 
                              key={opcao.letra} 
                              className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${optionClass}`}
                            >
                              <RadioGroupItem 
                                value={opcao.letra} 
                                id={`${pergunta.id}-${opcao.letra}`}
                              />
                              <Label 
                                htmlFor={`${pergunta.id}-${opcao.letra}`}
                                className="flex-1 cursor-pointer text-sm"
                              >
                                <span className="font-medium">{opcao.letra})</span> {opcao.texto}
                              </Label>
                              {mostrarExplicacoes && isCorrect && (
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                              )}
                              {mostrarExplicacoes && isSelected && !isCorrect && (
                                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </RadioGroup>
                      
                      {mostrarExplicacoes && pergunta.explicacao && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-sm">
                          <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">Explicação:</p>
                          <p className="text-blue-600 dark:text-blue-400">{pergunta.explicacao}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 space-y-3">
                {!quizEnviado ? (
                  <Button 
                    onClick={handleEnviarQuiz}
                    className="w-full bg-[#00c853] hover:bg-[#00a843]"
                    disabled={Object.keys(respostas).length < quiz.length}
                  >
                    Enviar Respostas ({Object.keys(respostas).length}/{quiz.length})
                  </Button>
                ) : (
                  <Button 
                    onClick={handleRefazerQuiz}
                    variant="outline"
                    className="w-full"
                  >
                    Tentar Novamente
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
