import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface Modulo {
  id: string;
  ordem: number;
  titulo: string;
  descricao: string;
  icone: string;
  duracao_estimada_minutos: number;
  cor: string;
}

interface Aula {
  id: string;
  modulo_id: string;
  ordem: number;
  titulo: string;
  conteudo_texto: string;
  duracao_minutos: number;
}

interface QuizPergunta {
  id: string;
  aula_id: string;
  ordem: number;
  pergunta: string;
  opcoes: { letra: string; texto: string }[];
  resposta_correta: string;
  explicacao: string | null;
}

interface ProgressoAula {
  id: string;
  aluno_id: string;
  aula_id: string;
  iniciada_em: string;
  concluida_em: string | null;
  tempo_visualizado_segundos: number;
  quiz_nota: number | null;
  quiz_aprovado: boolean;
  tentativas_quiz: number;
}

interface ModuloComProgresso extends Modulo {
  aulas: Aula[];
  aulasCompletas: number;
  totalAulas: number;
  progresso: number;
  status: 'concluido' | 'em_progresso' | 'bloqueado' | 'disponivel';
}

export function useCursoTeorico() {
  const { user } = useAuth();
  const [modulos, setModulos] = useState<ModuloComProgresso[]>([]);
  const [loading, setLoading] = useState(true);
  const [alunoId, setAlunoId] = useState<string | null>(null);
  const [progressoGeral, setProgressoGeral] = useState(0);

  // Carregar tudo em um único fluxo sequencial para evitar race condition
  const carregarTudo = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // 1. Buscar alunoId primeiro
      const { data: alunoData } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!alunoData) {
        setLoading(false);
        return;
      }

      const currentAlunoId = alunoData.id;
      setAlunoId(currentAlunoId);

      // 2. Buscar módulos
      const { data: modulosData, error: modulosError } = await supabase
        .from('curso_modulos')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (modulosError) throw modulosError;

      // 3. Buscar aulas
      const { data: aulasData, error: aulasError } = await supabase
        .from('curso_aulas')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (aulasError) throw aulasError;

      // 4. Buscar progresso do aluno
      const { data: progressoData } = await supabase
        .from('progresso_aulas')
        .select('*')
        .eq('aluno_id', currentAlunoId);

      const progressoMap = new Map(
        (progressoData || []).map(p => [p.aula_id, p])
      );

      let totalAulasCompletas = 0;
      let totalAulas = 0;

      // 5. Montar módulos com progresso
      const modulosComProgresso: ModuloComProgresso[] = (modulosData || []).map((modulo, index) => {
        const aulasDoModulo = (aulasData || []).filter(a => a.modulo_id === modulo.id);
        const aulasCompletas = aulasDoModulo.filter(
          a => progressoMap.get(a.id)?.quiz_aprovado === true
        ).length;

        totalAulasCompletas += aulasCompletas;
        totalAulas += aulasDoModulo.length;

        // Determinar status
        let status: 'concluido' | 'em_progresso' | 'bloqueado' | 'disponivel' = 'disponivel';
        
        if (aulasCompletas === aulasDoModulo.length && aulasDoModulo.length > 0) {
          status = 'concluido';
        } else if (aulasCompletas > 0) {
          status = 'em_progresso';
        } else if (index > 0) {
          // Verificar se módulo anterior está completo
          const moduloAnteriorId = modulosData![index - 1].id;
          const aulasModuloAnterior = (aulasData || []).filter(a => a.modulo_id === moduloAnteriorId);
          const completasAnterior = aulasModuloAnterior.filter(
            a => progressoMap.get(a.id)?.quiz_aprovado === true
          ).length;
          
          if (completasAnterior < aulasModuloAnterior.length) {
            status = 'bloqueado';
          }
        }

        return {
          ...modulo,
          aulas: aulasDoModulo,
          aulasCompletas,
          totalAulas: aulasDoModulo.length,
          progresso: aulasDoModulo.length > 0 
            ? Math.round((aulasCompletas / aulasDoModulo.length) * 100) 
            : 0,
          status
        };
      });

      setModulos(modulosComProgresso);
      setProgressoGeral(totalAulas > 0 ? Math.round((totalAulasCompletas / totalAulas) * 100) : 0);
    } catch (error) {
      console.error('Erro ao carregar curso:', error);
      toast.error('Erro ao carregar dados do curso');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    carregarTudo();
  }, [carregarTudo]);

  // Buscar aulas de um módulo específico
  const buscarAulasDoModulo = async (moduloId: string) => {
    const { data: aulas, error: aulasError } = await supabase
      .from('curso_aulas')
      .select('*')
      .eq('modulo_id', moduloId)
      .eq('ativo', true)
      .order('ordem');

    if (aulasError) throw aulasError;

    // Buscar alunoId diretamente se não estiver no estado (evita race condition)
    let currentAlunoId = alunoId;
    if (!currentAlunoId && user) {
      const { data: alunoData } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_id', user.id)
        .single();
      currentAlunoId = alunoData?.id || null;
    }

    if (!currentAlunoId) return aulas || [];

    const { data: progresso } = await supabase
      .from('progresso_aulas')
      .select('*')
      .eq('aluno_id', currentAlunoId);

    const progressoMap = new Map(
      (progresso || []).map(p => [p.aula_id, p])
    );

    return (aulas || []).map(aula => ({
      ...aula,
      progresso: progressoMap.get(aula.id) || null
    }));
  };

  // Buscar aula específica com quiz
  const buscarAulaComQuiz = async (aulaId: string) => {
    const { data: aula, error: aulaError } = await supabase
      .from('curso_aulas')
      .select('*')
      .eq('id', aulaId)
      .single();

    if (aulaError) throw aulaError;

    const { data: quiz } = await supabase
      .from('curso_quiz_perguntas')
      .select('*')
      .eq('aula_id', aulaId)
      .order('ordem');

    let progresso = null;
    if (alunoId) {
      const { data: progressoData } = await supabase
        .from('progresso_aulas')
        .select('*')
        .eq('aluno_id', alunoId)
        .eq('aula_id', aulaId)
        .single();
      
      progresso = progressoData;
    }

    return {
      ...aula,
      quiz: quiz || [],
      progresso
    };
  };

  // Iniciar aula (registrar que começou)
  const iniciarAula = async (aulaId: string) => {
    // Buscar alunoId diretamente se não estiver no estado (evita race condition)
    let currentAlunoId = alunoId;
    if (!currentAlunoId && user) {
      const { data: alunoData } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_id', user.id)
        .single();
      currentAlunoId = alunoData?.id || null;
    }

    if (!currentAlunoId) {
      toast.error('Faça login para acompanhar seu progresso');
      return;
    }

    // Usar upsert para garantir que o registro seja criado
    await supabase
      .from('progresso_aulas')
      .upsert({
        aluno_id: currentAlunoId,
        aula_id: aulaId,
        iniciada_em: new Date().toISOString()
      }, {
        onConflict: 'aluno_id,aula_id',
        ignoreDuplicates: true
      });
  };

  // Registrar tempo visualizado
  const atualizarTempo = async (aulaId: string, segundos: number) => {
    if (!alunoId) return;

    await supabase
      .from('progresso_aulas')
      .update({ tempo_visualizado_segundos: segundos })
      .eq('aluno_id', alunoId)
      .eq('aula_id', aulaId);
  };

  // Enviar resposta do quiz
  const enviarQuiz = async (aulaId: string, respostas: { perguntaId: string; resposta: string }[]) => {
    // Buscar alunoId diretamente se não estiver no estado (evita race condition)
    let currentAlunoId = alunoId;
    if (!currentAlunoId && user) {
      const { data: alunoData } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_id', user.id)
        .single();
      currentAlunoId = alunoData?.id || null;
    }

    if (!currentAlunoId) {
      toast.error('Faça login para responder o quiz');
      return { aprovado: false, nota: 0, acertos: 0, total: 0 };
    }

    // Buscar respostas corretas
    const { data: perguntas } = await supabase
      .from('curso_quiz_perguntas')
      .select('id, resposta_correta')
      .eq('aula_id', aulaId);

    if (!perguntas || perguntas.length === 0) {
      return { aprovado: true, nota: 100, acertos: 0, total: 0 };
    }

    // Calcular nota
    let acertos = 0;
    for (const pergunta of perguntas) {
      const resposta = respostas.find(r => r.perguntaId === pergunta.id);
      if (resposta?.resposta === pergunta.resposta_correta) {
        acertos++;
      }
    }

    const nota = Math.round((acertos / perguntas.length) * 100);
    const aprovado = nota >= 70;

    // Buscar tentativas anteriores
    const { data: progressoAtual } = await supabase
      .from('progresso_aulas')
      .select('tentativas_quiz')
      .eq('aluno_id', currentAlunoId)
      .eq('aula_id', aulaId)
      .maybeSingle();

    const tentativas = (progressoAtual?.tentativas_quiz || 0) + 1;

    // UPSERT em vez de UPDATE - garante que o registro seja criado se não existir
    await supabase
      .from('progresso_aulas')
      .upsert({
        aluno_id: currentAlunoId,
        aula_id: aulaId,
        quiz_nota: nota,
        quiz_aprovado: aprovado,
        tentativas_quiz: tentativas,
        concluida_em: aprovado ? new Date().toISOString() : null,
        iniciada_em: new Date().toISOString()
      }, {
        onConflict: 'aluno_id,aula_id'
      });

    // Recarregar módulos para atualizar progresso geral
    if (aprovado) {
      await carregarTudo();
    }

    return { aprovado, nota, acertos, total: perguntas.length };
  };

  // Verificar se pode agendar aulas práticas
  const podeAgendarAulasPraticas = progressoGeral === 100;

  // Atualizar progresso_renach quando completar o curso
  useEffect(() => {
    async function atualizarProgressoRenach() {
      if (progressoGeral === 100 && alunoId) {
        await supabase
          .from('progresso_renach')
          .update({ curso_teorico_conclusao: new Date().toISOString() })
          .eq('aluno_id', alunoId);
      }
    }
    atualizarProgressoRenach();
  }, [progressoGeral, alunoId]);

  // Pré-fetch do próximo módulo para performance
  const prefetchProximoModulo = async (moduloAtualOrdem: number) => {
    const proximoModulo = modulos.find(m => m.ordem === moduloAtualOrdem + 1);
    if (proximoModulo) {
      // Pré-carregar aulas do próximo módulo em background
      buscarAulasDoModulo(proximoModulo.id).catch(() => {
        // Silently fail - é apenas pré-fetch
      });
    }
  };

  return {
    modulos,
    loading,
    progressoGeral,
    podeAgendarAulasPraticas,
    buscarAulasDoModulo,
    buscarAulaComQuiz,
    iniciarAula,
    atualizarTempo,
    enviarQuiz,
    recarregar: carregarTudo,
    prefetchProximoModulo
  };
}
