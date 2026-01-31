import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLessonWorkflow } from '@/hooks/useLessonWorkflow';

interface LessonAwaitingFinalization {
  id: string;
  ponto_encontro: string | null;
  valor: number;
  duracao_minutos: number;
  data_hora: string;
  qr_code_data: string | null;
  qr_code_expires_at: string | null;
  aula_inicio: string | null;
  aula_fim: string | null;
  instrutor_nome: string;
  instrutor_foto: string | null;
}

interface UseGlobalLessonFinalizationMonitorReturn {
  activeLesson: LessonAwaitingFinalization | null;
  isRefreshing: boolean;
  refreshQR: () => Promise<void>;
}

/**
 * Hook global que monitora aulas em status 'aguardando_qr' para o aluno.
 * Detecta quando o instrutor finaliza a aula e o aluno precisa mostrar
 * o QR Code de conclusão para validação.
 */
export function useGlobalLessonFinalizationMonitor(): UseGlobalLessonFinalizationMonitorReturn {
  const { user } = useAuth();
  const { executeAction, isLoading } = useLessonWorkflow();
  const [activeLesson, setActiveLesson] = useState<LessonAwaitingFinalization | null>(null);
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

  // Check for lessons awaiting finalization QR scan
  const checkForFinalizationLesson = useCallback(async () => {
    if (!alunoId) return;

    try {
      // Find lesson in 'aguardando_qr' status
      const { data: aulas, error } = await supabase
        .from('aulas')
        .select(`
          id,
          ponto_encontro,
          valor,
          duracao_minutos,
          data_hora,
          qr_code_data,
          qr_code_expires_at,
          aula_inicio,
          aula_fim,
          instrutor_id
        `)
        .eq('aluno_id', alunoId)
        .eq('status', 'aguardando_qr')
        .order('data_hora', { ascending: true })
        .limit(1);

      if (error) {
        console.error('[GlobalLessonFinalizationMonitor] Error fetching lessons:', error);
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
          qr_code_data: aula.qr_code_data,
          qr_code_expires_at: aula.qr_code_expires_at,
          aula_inicio: aula.aula_inicio,
          aula_fim: aula.aula_fim,
          instrutor_nome: instrutorCache?.nome || 'Instrutor',
          instrutor_foto: instrutorCache?.foto || null,
        });
      } else {
        // No lessons awaiting finalization
        setActiveLesson(null);
      }
    } catch (err) {
      console.error('[GlobalLessonFinalizationMonitor] Exception:', err);
    }
  }, [alunoId]);

  // Initial check + polling fallback
  useEffect(() => {
    if (!alunoId) return;

    // Initial check
    checkForFinalizationLesson();

    // Polling every 3 seconds as fallback
    const pollInterval = setInterval(checkForFinalizationLesson, 3000);

    return () => clearInterval(pollInterval);
  }, [alunoId, checkForFinalizationLesson]);

  // Real-time subscription for aulas changes
  useEffect(() => {
    if (!alunoId) return;

    const channel = supabase
      .channel(`global-lesson-finalization-monitor-${alunoId}`)
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
            console.log('[GlobalLessonFinalizationMonitor] Aula change detected:', newData?.status);
            
            // If status changed to aguardando_qr, check immediately
            if (newData?.status === 'aguardando_qr') {
              checkForFinalizationLesson();
            }
            
            // If status changed away from aguardando_qr, clear modal
            if (oldData?.status === 'aguardando_qr' && newData?.status !== 'aguardando_qr') {
              setActiveLesson(null);
            }

            // If QR data was updated (regenerated), update state
            if (newData?.status === 'aguardando_qr' && activeLesson?.id === newData.id) {
              if (newData.qr_code_data !== activeLesson.qr_code_data) {
                setActiveLesson(prev => prev ? {
                  ...prev,
                  qr_code_data: newData.qr_code_data,
                  qr_code_expires_at: newData.qr_code_expires_at,
                } : null);
              }
            }

            // If lesson transitioned to concluida (QR validated), close modal
            if (newData?.status === 'concluida' && activeLesson?.id === newData.id) {
              setActiveLesson(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [alunoId, activeLesson, checkForFinalizationLesson]);

  // Refresh QR Code (student can regenerate finalization QR)
  const refreshQR = useCallback(async () => {
    if (!activeLesson) return;
    
    const success = await executeAction(activeLesson.id, 'regenerar_qr_aluno');
    
    if (success) {
      // Refetch to get new QR code data
      setTimeout(checkForFinalizationLesson, 500);
    }
  }, [activeLesson, executeAction, checkForFinalizationLesson]);

  return {
    activeLesson,
    isRefreshing: isLoading,
    refreshQR,
  };
}
