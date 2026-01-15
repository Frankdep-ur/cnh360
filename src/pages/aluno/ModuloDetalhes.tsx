import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Play, Lock, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BottomNav } from '@/components/layout/BottomNav';
import { useCursoTeorico } from '@/hooks/useCursoTeorico';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { MODULOS_INFO } from '@/data/cursoConteudo';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/ui/page-transition';

interface AulaComProgresso {
  id: string;
  ordem: number;
  titulo: string;
  duracao_minutos: number;
  progresso?: {
    quiz_aprovado: boolean;
    concluida_em: string | null;
  } | null;
}

export default function ModuloDetalhes() {
  const navigate = useNavigate();
  const { moduloId } = useParams();
  const { buscarAulasDoModulo } = useCursoTeorico();
  const [modulo, setModulo] = useState<any>(null);
  const [aulas, setAulas] = useState<AulaComProgresso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDados() {
      if (!moduloId) return;
      
      try {
        // Tentar buscar módulo pelo ID (UUID) ou pelo ordem (número)
        let moduloData;
        
        // Verificar se é um número (ordem) ou UUID
        const isNumero = !isNaN(Number(moduloId));
        
        if (isNumero) {
          const { data } = await supabase
            .from('curso_modulos')
            .select('*')
            .eq('ordem', Number(moduloId))
            .single();
          moduloData = data;
        } else {
          const { data } = await supabase
            .from('curso_modulos')
            .select('*')
            .eq('id', moduloId)
            .single();
          moduloData = data;
        }

        if (moduloData) {
          setModulo(moduloData);
          const aulasData = await buscarAulasDoModulo(moduloData.id);
          setAulas(aulasData);
        }
      } catch (error) {
        console.error('Erro ao carregar módulo:', error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [moduloId, buscarAulasDoModulo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="bg-primary p-6">
          <Skeleton className="h-8 w-3/4 bg-white/20" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!modulo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Módulo não encontrado</p>
          <Button onClick={() => navigate('/aluno/curso-teorico')}>
            Voltar ao Curso
          </Button>
        </div>
      </div>
    );
  }

  const moduloInfo = MODULOS_INFO.find(m => m.titulo === modulo.titulo);
  const IconComponent = moduloInfo?.icone || BookOpen;
  const aulasCompletas = aulas.filter(a => a.progresso?.quiz_aprovado).length;
  const progresso = aulas.length > 0 ? Math.round((aulasCompletas / aulas.length) * 100) : 0;

  const getAulaStatus = (aula: AulaComProgresso, index: number) => {
    // Se já completou o quiz, está concluída
    if (aula.progresso?.quiz_aprovado) return 'concluida';
    
    // Se tem progresso (começou mas não terminou), está em progresso
    if (aula.progresso) return 'em_progresso';
    
    // Primeira aula sempre disponível
    if (index === 0) return 'disponivel';
    
    // Verifica se pelo menos uma aula anterior foi concluída
    // Isso permite flexibilidade caso aulas tenham sido feitas fora de ordem
    const temAulaAnteriorConcluida = aulas.slice(0, index).some(
      a => a.progresso?.quiz_aprovado
    );
    
    // Ou se a aula imediatamente anterior foi concluída (lógica tradicional)
    const aulaAnterior = aulas[index - 1];
    const anteriorConcluida = aulaAnterior?.progresso?.quiz_aprovado;
    
    if (anteriorConcluida || temAulaAnteriorConcluida) return 'disponivel';
    
    return 'bloqueada';
  };

  return (
    <PageTransition className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div 
        className="p-6 text-white"
        style={{ backgroundColor: modulo.cor || '#00c853' }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/aluno/curso-teorico')}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{modulo.titulo}</h1>
            <p className="text-sm text-white/80">Módulo {modulo.ordem}</p>
          </div>
          <div 
            className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"
          >
            <IconComponent className="w-6 h-6" />
          </div>
        </div>

        {/* Progresso do Módulo */}
        <div className="bg-white/10 backdrop-blur rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Progresso</span>
            <span className="font-bold">{aulasCompletas}/{aulas.length} aulas</span>
          </div>
          <Progress value={progresso} className="h-2 bg-white/20" />
        </div>
      </div>

      {/* Lista de Aulas */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Aulas do Módulo</h2>
        <StaggerContainer className="space-y-3" staggerDelay={0.06}>
        
          {aulas.map((aula, index) => {
            const status = getAulaStatus(aula, index);
            const isDisabled = status === 'bloqueada';
            
            return (
              <StaggerItem key={aula.id}>
                <button
                  onClick={() => !isDisabled && navigate(`/aluno/curso-teorico/aula/${aula.id}`)}
                  disabled={isDisabled}
                  className={`w-full bg-card rounded-xl p-4 border transition-all text-left ${
                    isDisabled 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'hover:border-primary/50 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Número da Aula */}
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        status === 'concluida' 
                          ? 'bg-[#00c853] text-white' 
                          : status === 'em_progresso'
                          ? 'bg-blue-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {status === 'concluida' ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : status === 'bloqueada' ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        aula.ordem
                      )}
                    </div>

                    {/* Info da Aula */}
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{aula.titulo}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{aula.duracao_minutos} min</span>
                        {status === 'concluida' && (
                          <span className="text-[#00c853]">• Concluída</span>
                        )}
                        {status === 'em_progresso' && (
                          <span className="text-blue-500">• Em progresso</span>
                        )}
                      </div>
                    </div>

                    {/* Ícone de Ação */}
                    {status === 'disponivel' && (
                      <Play className="w-5 h-5 text-primary" />
                    )}
                    {status === 'em_progresso' && (
                      <Play className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </button>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>

      <BottomNav />
    </PageTransition>
  );
}
