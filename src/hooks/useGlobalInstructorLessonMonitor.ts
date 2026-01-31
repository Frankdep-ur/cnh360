import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLessonWorkflow } from '@/hooks/useLessonWorkflow';
import { toast } from 'sonner';

interface ActiveLesson {
  id: string;
  status: string;
  aluno_nome: string;
  aluno_foto: string | null;
  aluno_pronto_para_aula: boolean;
  qr_code_inicio_data: string | null;
  qr_code_inicio_expires_at: string | null;
  qr_code_data: string | null;
  qr_code_expires_at: string | null;
  ponto_encontro: string | null;
  valor: number;
  duracao_minutos: number;
  data_hora: string;
  aula_inicio: string | null;
  aula_fim: string | null;
}

export type ScanType = 'inicio' | 'fim' | null;

interface UseGlobalInstructorLessonMonitorReturn {
  activeLesson: ActiveLesson | null;
  needsQRScan: boolean;
  scanType: ScanType;
  isScanning: boolean;
  isLoading: boolean;
  scanQR: (qrData: string) => Promise<boolean>;
  dismissScanner: () => void;
}

export function useGlobalInstructorLessonMonitor(): UseGlobalInstructorLessonMonitorReturn {
  const { user } = useAuth();
  const { executeAction, isLoading: isWorkflowLoading } = useLessonWorkflow();
  const [activeLesson, setActiveLesson] = useState<ActiveLesson | null>(null);
  const [needsQRScan, setNeedsQRScan] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [instrutorId, setInstrutorId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  // Check if user is instructor
  useEffect(() => {
    if (!user?.id) {
      setInstrutorId(null);
      setActiveLesson(null);
      setIsLoading(false);
      return;
    }

    const checkRole = async () => {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'instrutor')
        .maybeSingle();

      if (roles) {
        const { data: instrutor } = await supabase
          .from('instrutores')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        setInstrutorId(instrutor?.id || null);
      } else {
        setInstrutorId(null);
      }
      setIsLoading(false);
    };

    checkRole();
  }, [user?.id]);

  // Fetch active lesson
  const fetchActiveLesson = useCallback(async () => {
    if (!instrutorId) return;

    try {
      // Monitor both 'aguardando_confirmacao' (start) and 'aguardando_qr' (end)
      const { data: aulas, error } = await supabase
        .from('aulas')
        .select(`
          id,
          status,
          aluno_pronto_para_aula,
          qr_code_inicio_data,
          qr_code_inicio_expires_at,
          qr_code_data,
          qr_code_expires_at,
          ponto_encontro,
          valor,
          duracao_minutos,
          data_hora,
          aula_inicio,
          aula_fim,
          alunos!inner(
            id,
            user_id
          )
        `)
        .eq('instrutor_id', instrutorId)
        .in('status', ['aguardando_confirmacao', 'aguardando_qr'])
        .order('data_hora', { ascending: true })
        .limit(1);

      if (error) {
        console.error('Error fetching instructor lesson:', error);
        return;
      }

      if (aulas && aulas.length > 0) {
        const aula = aulas[0];
        
        // Get student profile
        const { data: alunoProfile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', (aula.alunos as any).user_id)
          .maybeSingle();

        const lesson: ActiveLesson = {
          id: aula.id,
          status: aula.status,
          aluno_nome: alunoProfile?.full_name || 'Aluno',
          aluno_foto: alunoProfile?.avatar_url || null,
          aluno_pronto_para_aula: aula.aluno_pronto_para_aula || false,
          qr_code_inicio_data: aula.qr_code_inicio_data,
          qr_code_inicio_expires_at: aula.qr_code_inicio_expires_at,
          qr_code_data: aula.qr_code_data,
          qr_code_expires_at: aula.qr_code_expires_at,
          ponto_encontro: aula.ponto_encontro,
          valor: Number(aula.valor),
          duracao_minutos: aula.duracao_minutos,
          data_hora: aula.data_hora,
          aula_inicio: aula.aula_inicio,
          aula_fim: aula.aula_fim,
        };

        setActiveLesson(lesson);

        // Check if needs QR scan
        // Case 1: Start scan - aguardando_confirmacao with aluno_pronto
        // Case 2: End scan - aguardando_qr
        if (!dismissed) {
          if (aula.status === 'aguardando_confirmacao' && aula.aluno_pronto_para_aula) {
            setNeedsQRScan(true);
          } else if (aula.status === 'aguardando_qr') {
            setNeedsQRScan(true);
          } else {
            setNeedsQRScan(false);
          }
        } else {
          setNeedsQRScan(false);
        }
      } else {
        setActiveLesson(null);
        setNeedsQRScan(false);
        setDismissed(false);
      }
    } catch (err) {
      console.error('Error in fetchActiveLesson:', err);
    }
  }, [instrutorId, dismissed]);

  // Initial fetch and polling
  useEffect(() => {
    if (!instrutorId) return;

    fetchActiveLesson();

    // Polling every 3 seconds
    const interval = setInterval(fetchActiveLesson, 3000);

    return () => clearInterval(interval);
  }, [instrutorId, fetchActiveLesson]);

  // Realtime subscription
  useEffect(() => {
    if (!instrutorId) return;

    const channel = supabase
      .channel(`instructor-lesson-${instrutorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'aulas',
          filter: `instrutor_id=eq.${instrutorId}`,
        },
        (payload) => {
          console.log('Instructor lesson update:', payload);
          fetchActiveLesson();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [instrutorId, fetchActiveLesson]);

  // Determine scan type based on lesson status
  const currentScanType: ScanType = (() => {
    if (!activeLesson) return null;
    if (activeLesson.status === 'aguardando_confirmacao' && activeLesson.aluno_pronto_para_aula) {
      return 'inicio';
    }
    if (activeLesson.status === 'aguardando_qr') {
      return 'fim';
    }
    return null;
  })();

  // Scan QR Code
  const scanQR = useCallback(async (qrData: string): Promise<boolean> => {
    if (!activeLesson) return false;
    
    setIsScanning(true);
    
    try {
      // Use different action based on scan type
      const action = currentScanType === 'inicio' ? 'validar_qr_inicio' : 'validar_qr';
      const success = await executeAction(activeLesson.id, action, qrData);
      
      if (success) {
        setNeedsQRScan(false);
        setActiveLesson(null);
        setDismissed(false);
      }
      
      return success;
    } catch (err) {
      console.error('Error scanning QR:', err);
      toast.error('Erro ao validar QR Code');
      return false;
    } finally {
      setIsScanning(false);
    }
  }, [activeLesson, executeAction, currentScanType]);

  // Dismiss scanner (temporary)
  const dismissScanner = useCallback(() => {
    setDismissed(true);
    setNeedsQRScan(false);
  }, []);

  return {
    activeLesson,
    needsQRScan,
    scanType: currentScanType,
    isScanning: isScanning || isWorkflowLoading,
    isLoading,
    scanQR,
    dismissScanner,
  };
}
