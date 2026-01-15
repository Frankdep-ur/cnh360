import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, ChevronRight, BookOpen, HelpCircle, Trophy, AlertCircle, ExternalLink, Upload } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState<'conteudo' | 'quiz'>('conteudo');
  
  // Estado do Quiz
  const [respostas, setRespostas] = useState<{ [key: string]: string }>({});
  const [quizEnviado, setQuizEnviado] = useState(false);
  const [resultado, setResultado] = useState<{ aprovado: boolean; nota: number; acertos?: number; total?: number } | null>(null);
  const [mostrarExplicacoes, setMostrarExplicacoes] = useState(false);

  // Estado da tela de conclusão
  const [mostrarConclusao, setMostrarConclusao] = useState(false);
  const [modulosPendentes, setModulosPendentes] = useState<{ id: string; titulo: string; progresso: number }[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [cursoCompleto, setCursoCompleto] = useState(false);

  // Carregar dados da aula
  useEffect(() => {
    // RESET de todos os estados quando aulaId mudar
    setAula(null);
    setQuiz([]);
    setLoading(true);
    setActiveTab('conteudo');
    setRespostas({});
    setQuizEnviado(false);
    setResultado(null);
    setMostrarExplicacoes(false);

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
    
    // 1. Buscar próxima aula do mesmo módulo
    const { data: proximaAulaMesmoModulo } = await supabase
      .from('curso_aulas')
      .select('id')
      .eq('modulo_id', aula.modulo_id)
      .gt('ordem', aula.ordem)
      .order('ordem')
      .limit(1);

    if (proximaAulaMesmoModulo && proximaAulaMesmoModulo.length > 0) {
      navigate(`/aluno/curso-teorico/aula/${proximaAulaMesmoModulo[0].id}`);
      return;
    }

    // 2. Buscar ordem do módulo atual
    const { data: moduloAtual } = await supabase
      .from('curso_modulos')
      .select('ordem')
      .eq('id', aula.modulo_id)
      .single();

    if (!moduloAtual) {
      navigate(`/aluno/curso-teorico/modulo/${aula.modulo_id}`);
      return;
    }

    // 3. Buscar próximo módulo
    const { data: proximoModulo } = await supabase
      .from('curso_modulos')
      .select('id')
      .gt('ordem', moduloAtual.ordem)
      .order('ordem')
      .limit(1);

    if (proximoModulo && proximoModulo.length > 0) {
      // 4. Buscar primeira aula do próximo módulo
      const { data: primeiraAula } = await supabase
        .from('curso_aulas')
        .select('id')
        .eq('modulo_id', proximoModulo[0].id)
        .order('ordem')
        .limit(1);

      if (primeiraAula && primeiraAula.length > 0) {
        navigate(`/aluno/curso-teorico/aula/${primeiraAula[0].id}`);
        return;
      }
    }

    // 5. Última aula do curso - verificar conclusão completa
    await verificarConclusaoCurso();
  };

  // Verificar se o curso está 100% completo
  const verificarConclusaoCurso = async () => {
    try {
      // Buscar aluno_id do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: aluno } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!aluno) return;

      // Buscar todos os módulos com suas aulas
      const { data: modulos } = await supabase
        .from('curso_modulos')
        .select(`
          id,
          titulo,
          ordem,
          curso_aulas(id)
        `)
        .eq('ativo', true)
        .order('ordem');

      if (!modulos) return;

      // Buscar progresso do aluno
      const { data: progresso } = await supabase
        .from('progresso_aulas')
        .select('aula_id, quiz_aprovado')
        .eq('aluno_id', aluno.id);

      const progressoMap = new Map(
        progresso?.map(p => [p.aula_id, p.quiz_aprovado]) || []
      );

      // Calcular quais módulos estão incompletos
      const pendentes: { id: string; titulo: string; progresso: number }[] = [];

      for (const modulo of modulos) {
        const aulasDoModulo = modulo.curso_aulas || [];
        const totalAulas = aulasDoModulo.length;
        
        if (totalAulas === 0) continue;

        const aulasCompletas = aulasDoModulo.filter(
          (aula: { id: string }) => progressoMap.get(aula.id) === true
        ).length;

        const progressoModulo = Math.round((aulasCompletas / totalAulas) * 100);

        if (progressoModulo < 100) {
          pendentes.push({
            id: modulo.id,
            titulo: modulo.titulo,
            progresso: progressoModulo
          });
        }
      }

      // Mostrar tela de conclusão
      setModulosPendentes(pendentes);
      setCursoCompleto(pendentes.length === 0);
      setMostrarConclusao(true);
    } catch (error) {
      console.error('Erro ao verificar conclusão:', error);
      toast.success('Parabéns! Você completou todo o curso teórico!');
      navigate('/aluno/curso-teorico');
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

  // Tela de conclusão do curso
  if (mostrarConclusao) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          {cursoCompleto ? (
            // Curso 100% completo - Pronto para prova DETRAN
            <div className="space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Parabéns! Você está pronto para a prova oficial. 🎉
                </h1>
                <p className="text-muted-foreground">
                  Você completou todo o curso teórico e os simulados!
                </p>
              </div>

              {/* Card explicativo */}
              <div className="bg-muted/50 rounded-xl p-4 text-left">
                <p className="text-sm text-muted-foreground">
                  Treine quantas vezes quiser no app. Quando estiver confiante, clique abaixo para agendar a prova teórica real no site oficial do DETRAN-SP (30 questões, mínimo 21 acertos).
                </p>
              </div>

              <div className="space-y-3">
                {/* Botão principal DETRAN */}
                <Button
                  onClick={() => window.open('https://www.detran.sp.gov.br/wps/portal/portaldetran/cidadao/habilitacao/fichaservicos/agendarProvaTeorica', '_blank')}
                  className="w-full bg-[#00c853] hover:bg-[#00a843] h-14 text-base"
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Agendar e Fazer Prova Oficial no DETRAN-SP
                </Button>

                {/* Divisor */}
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-xs text-muted-foreground uppercase">ou</span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Já foi aprovado */}
                <p className="text-sm text-muted-foreground">
                  Já fez a prova e foi aprovado?
                </p>
                
                <Button
                  onClick={() => setShowUploadModal(true)}
                  variant="outline"
                  className="w-full h-12"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Enviar Comprovante de Aprovação
                </Button>

              </div>
            </div>
          ) : (
            // Curso incompleto - mostrar módulos pendentes
            <div className="space-y-6">
              <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <AlertCircle className="w-12 h-12 text-white" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Quase lá! 💪
                </h1>
                <p className="text-muted-foreground">
                  Você ainda tem {modulosPendentes.length} {modulosPendentes.length === 1 ? 'módulo pendente' : 'módulos pendentes'} para completar.
                </p>
              </div>

              <div className="bg-card border rounded-xl divide-y">
                {modulosPendentes.map((modulo) => (
                  <div 
                    key={modulo.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground text-sm">{modulo.titulo}</p>
                      <p className="text-xs text-muted-foreground">{modulo.progresso}% concluído</p>
                    </div>
                    <div className="w-16">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#00c853] transition-all"
                          style={{ width: `${modulo.progresso}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => navigate(`/aluno/curso-teorico/modulo/${modulosPendentes[0]?.id}`)}
                  className="w-full bg-[#00c853] hover:bg-[#00a843] h-12"
                >
                  Continuar Estudando
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
                
                <Button
                  onClick={() => navigate('/aluno/curso-teorico')}
                  variant="outline"
                  className="w-full"
                >
                  Ver Todos os Módulos
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

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
              onClick={() => setActiveTab('quiz')}
              className="w-full"
            >
              Fazer Quiz
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
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
