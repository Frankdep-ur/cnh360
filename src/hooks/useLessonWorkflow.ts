import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type WorkflowAction = 'em_rota' | 'cheguei' | 'confirmar_chegada' | 'iniciar_aula' | 'finalizar_aula' | 'validar_qr' | 'regenerar_qr' | 'confirmar_inicio_aluno' | 'validar_qr_inicio' | 'recusar_inicio_aluno' | 'regenerar_qr_inicio' | 'cancelar_aula_aluno' | 'regenerar_qr_aluno';

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

const successMessages: Record<WorkflowAction, string> = {
  em_rota: 'Você está a caminho! Aluno foi notificado.',
  cheguei: 'Chegada registrada! Aguardando confirmação do aluno.',
  confirmar_chegada: 'Presença confirmada! Instrutor pode iniciar a aula.',
  iniciar_aula: 'Aula iniciada! Cronômetro ativado.',
  finalizar_aula: 'Aula finalizada! Aguardando validação por QR Code.',
  validar_qr: 'Aula validada com sucesso! Pagamento liberado.',
  regenerar_qr: 'Novo QR Code gerado! Peça ao aluno para mostrar.',
  confirmar_inicio_aluno: 'Presença confirmada! Mostre o QR Code para o instrutor.',
  validar_qr_inicio: 'QR validado! Aula iniciada.',
  recusar_inicio_aluno: 'Início recusado. O instrutor foi notificado.',
  regenerar_qr_inicio: 'Novo QR Code gerado! Mostre para o instrutor.',
  cancelar_aula_aluno: 'Aula cancelada.',
  regenerar_qr_aluno: 'Novo QR Code gerado! Mostre para o instrutor.',
};

async function extractErrorMessage(error: any, data: any): Promise<string> {
  // If the function returned data with an error field, use that
  if (data?.error) {
    return data.error;
  }

  // If there's a context (response body) in the FunctionsHttpError
  if (error?.context) {
    try {
      const body = await error.context.json();
      if (body?.error) return body.error;
    } catch {
      // context wasn't JSON, try text
      try {
        const text = await error.context.text();
        if (text) return text;
      } catch {
        // ignore
      }
    }
  }

  // Generic fallback
  return error?.message || 'Erro ao executar ação. Tente novamente.';
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
      // Refresh session to ensure JWT is fresh (prevents 401 on stale mobile sessions)
      console.log(`[LessonWorkflow] Refreshing session before action: ${action}`);
      await supabase.auth.refreshSession();

      const invokePayload = {
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
      };

      console.log(`[LessonWorkflow] Invoking lesson-workflow: action=${action}, aulaId=${aulaId}`);
      const { data, error: fnError } = await supabase.functions.invoke('lesson-workflow', invokePayload);

      // Handle invoke-level errors (network, non-2xx responses)
      if (fnError) {
        console.error('[LessonWorkflow] Function invoke error:', fnError);
        
        const errorMsg = await extractErrorMessage(fnError, data);
        
        // If it looks like a 401/auth error, retry once with fresh session
        if (fnError.message?.includes('non-2xx') || fnError.message?.includes('401')) {
          console.log('[LessonWorkflow] Possible auth error, retrying with fresh session...');
          
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.error('[LessonWorkflow] Session refresh failed:', refreshError);
            setError('Sessão expirada. Faça login novamente.');
            toast.error('Sessão expirada. Faça login novamente.');
            return false;
          }

          // Retry the call
          const { data: retryData, error: retryError } = await supabase.functions.invoke('lesson-workflow', invokePayload);
          
          if (retryError) {
            const retryMsg = await extractErrorMessage(retryError, retryData);
            console.error('[LessonWorkflow] Retry also failed:', retryMsg);
            setError(retryMsg);
            toast.error(retryMsg);
            return false;
          }

          if (retryData?.error) {
            setError(retryData.error);
            toast.error(retryData.error);
            return false;
          }

          // Retry succeeded
          console.log('[LessonWorkflow] Retry succeeded for action:', action);
          toast.success(successMessages[action]);
          return true;
        }

        setError(errorMsg);
        toast.error(errorMsg);
        return false;
      }

      // Handle application-level errors returned in the response body
      if (data?.error) {
        console.error('[LessonWorkflow] Application error:', data.error);
        setError(data.error);
        toast.error(data.error);
        return false;
      }

      console.log('[LessonWorkflow] Action succeeded:', action);
      toast.success(successMessages[action]);
      return true;

    } catch (err: any) {
      console.error('[LessonWorkflow] Unexpected exception:', err);
      const errorMessage = err.message || 'Erro inesperado. Tente novamente.';
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
