import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLessonWorkflow } from '@/hooks/useLessonWorkflow';

interface LessonAwaitingConfirmation {
  id: string;
  ponto_encontro: string | null;
  valor: number;
  duracao_minutos: number;
  data_hora: string;
  qr_code_inicio_data: string | null;
  qr_code_inicio_expires_at: string | null;
  aluno_pronto_para_aula: boolean;
  instrutor_nome: string;
  instrutor_foto: string | null;
}

interface UseGlobalLessonMonitorReturn {
  activeLesson: LessonAwaitingConfirmation | null;
  isConfirming: boolean;
  confirmStart: () => Promise<void>;
  rejectStart: () => void;
}

/**
 * Hook global que monitora as aulas do aluno em tempo real.
 * Detecta quando o instrutor chega (status = 'aguardando_confirmacao')
 * e dispara o modal bloqueante independente da página atual.
 */
export function useGlobalLessonMonitor(): UseGlobalLessonMonitorReturn {
  const { user } = useAuth();
  const { executeAction, isLoading } = useLessonWorkflow();
  const [activeLesson, setActiveLesson] = useState<LessonAwaitingConfirmation | null>(null);
  const [alunoId, setAlunoId] = useState<string | null>(null);

  // Fetch aluno_id on mount
  useEffect(() => {
    if (!user) {
      setAlunoId(null);
      setActiveLesson(null);
      return;
    }

    const fetchAlunoId = async () => {
      const { data } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setAlunoId(data.id);
      }
    };

    fetchAlunoId();
  }, [user]);

  // Check for lessons awaiting confirmation
  const checkForAwaitingLesson = useCallback(async () => {
    if (!alunoId) return;

    try {
      // Find lesson in 'aguardando_confirmacao' status where student hasn't confirmed yet
      const { data: aulas, error } = await supabase
        .from('aulas')
        .select(`
          id,
          ponto_encontro,
          valor,
          duracao_minutos,
          data_hora,
          qr_code_inicio_data,
          qr_code_inicio_expires_at,
          aluno_pronto_para_aula,
          instrutor_id
        `)
        .eq('aluno_id', alunoId)
        .eq('status', 'aguardando_confirmacao')
        .order('data_hora', { ascending: true })
        .limit(1);

      if (error) {
        console.error('[GlobalLessonMonitor] Error fetching lessons:', error);
        return;
      }

      if (aulas && aulas.length > 0) {
        const aula = aulas[0];
        
        // Get instructor data
        const { data: instrutorCache } = await supabase
          .from('instrutores_publico_cache')
          .select('nome, foto')
          .eq('id', aula.instrutor_id)
          .maybeSingle();

        setActiveLesson({
          id: aula.id,
          ponto_encontro: aula.ponto_encontro,
          valor: aula.valor,
          duracao_minutos: aula.duracao_minutos,
          data_hora: aula.data_hora,
          qr_code_inicio_data: aula.qr_code_inicio_data,
          qr_code_inicio_expires_at: aula.qr_code_inicio_expires_at,
          aluno_pronto_para_aula: aula.aluno_pronto_para_aula || false,
          instrutor_nome: instrutorCache?.nome || 'Instrutor',
          instrutor_foto: instrutorCache?.foto || null,
        });
      } else {
        // No lessons awaiting confirmation
        setActiveLesson(null);
      }
    } catch (err) {
      console.error('[GlobalLessonMonitor] Exception:', err);
    }
  }, [alunoId]);

  // Initial check + polling fallback
  useEffect(() => {
    if (!alunoId) return;

    // Initial check
    checkForAwaitingLesson();

    // Polling every 3 seconds as fallback
    const pollInterval = setInterval(checkForAwaitingLesson, 3000);

    return () => clearInterval(pollInterval);
  }, [alunoId, checkForAwaitingLesson]);

  // Real-time subscription for aulas changes
  useEffect(() => {
    if (!alunoId) return;

    const channel = supabase
      .channel(`global-lesson-monitor-${alunoId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'aulas',
        },
        (payload) => {
          const newData = payload.new as any;
          const oldData = payload.old as any;
          
          // Check if this lesson belongs to our student
          if (newData?.aluno_id === alunoId || oldData?.aluno_id === alunoId) {
            console.log('[GlobalLessonMonitor] Aula change detected:', newData?.status);
            
            // If status changed to aguardando_confirmacao, check immediately
            if (newData?.status === 'aguardando_confirmacao') {
              checkForAwaitingLesson();
            }
            
            // If status changed away from aguardando_confirmacao, clear modal
            if (oldData?.status === 'aguardando_confirmacao' && newData?.status !== 'aguardando_confirmacao') {
              setActiveLesson(null);
            }
            
            // If aluno confirmed (aluno_pronto_para_aula changed to true), update state
            if (newData?.aluno_pronto_para_aula && activeLesson?.id === newData.id) {
              setActiveLesson(prev => prev ? {
                ...prev,
                aluno_pronto_para_aula: true,
                qr_code_inicio_data: newData.qr_code_inicio_data,
                qr_code_inicio_expires_at: newData.qr_code_inicio_expires_at,
              } : null);
            }

            // If lesson transitioned to em_andamento (QR scanned), close modal
            if (newData?.status === 'em_andamento' && activeLesson?.id === newData.id) {
              setActiveLesson(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [alunoId, activeLesson, checkForAwaitingLesson]);

  // Confirm start action
  const confirmStart = useCallback(async () => {
    if (!activeLesson) return;
    
    const success = await executeAction(activeLesson.id, 'confirmar_inicio_aluno');
    
    if (success) {
      // Update local state immediately (realtime will also update)
      setActiveLesson(prev => prev ? { ...prev, aluno_pronto_para_aula: true } : null);
      // Refetch to get QR code data
      setTimeout(checkForAwaitingLesson, 500);
    }
  }, [activeLesson, executeAction, checkForAwaitingLesson]);

  // Reject start action
  const rejectStart = useCallback(() => {
    if (!activeLesson) return;
    executeAction(activeLesson.id, 'recusar_inicio_aluno');
  }, [activeLesson, executeAction]);

  return {
    activeLesson,
    isConfirming: isLoading,
    confirmStart,
    rejectStart,
  };
}
