import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type WorkflowAction = 'em_rota' | 'cheguei' | 'confirmar_chegada' | 'iniciar_aula' | 'finalizar_aula' | 'validar_qr';

interface GPSData {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
}

interface UseLessonWorkflowReturn {
  executeAction: (aulaId: string, action: WorkflowAction, qrData?: string, gpsData?: GPSData) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function useLessonWorkflow(): UseLessonWorkflowReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeAction = useCallback(async (
    aulaId: string, 
    action: WorkflowAction, 
    qrData?: string,
    gpsData?: GPSData
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('lesson-workflow', {
        body: {
          aula_id: aulaId,
          action,
          qr_data: qrData,
          latitude: gpsData?.latitude,
          longitude: gpsData?.longitude,
          accuracy: gpsData?.accuracy,
          device_info: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            timestamp: new Date().toISOString()
          }
        }
      });

      if (fnError) {
        console.error('Workflow error:', fnError);
        const errorMessage = fnError.message || 'Erro ao executar ação';
        setError(errorMessage);
        toast.error(errorMessage);
        return false;
      }

      if (data?.error) {
        setError(data.error);
        toast.error(data.error);
        return false;
      }

      const successMessages: Record<WorkflowAction, string> = {
        em_rota: 'Você está a caminho! Aluno foi notificado.',
        cheguei: 'Chegada registrada! Aguardando confirmação do aluno.',
        confirmar_chegada: 'Presença confirmada! Instrutor pode iniciar a aula.',
        iniciar_aula: 'Aula iniciada! Cronômetro ativado.',
        finalizar_aula: 'Aula finalizada! Aguardando validação por QR Code.',
        validar_qr: 'Aula validada com sucesso! Pagamento liberado.',
      };

      toast.success(successMessages[action]);
      return true;

    } catch (err: any) {
      console.error('Workflow exception:', err);
      const errorMessage = err.message || 'Erro inesperado';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    executeAction,
    isLoading,
    error
  };
}
