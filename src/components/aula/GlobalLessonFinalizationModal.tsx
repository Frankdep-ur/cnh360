import { useGlobalLessonFinalizationMonitor } from '@/hooks/useGlobalLessonFinalizationMonitor';
import { LessonEndConfirmationModal } from './LessonEndConfirmationModal';

/**
 * Global modal component that overlays the entire app when
 * a lesson is in 'aguardando_qr' status, meaning the instructor
 * has finalized and is waiting for the student to show QR.
 * 
 * This component should be mounted at the app root level (App.tsx)
 * to ensure it works regardless of which page the student is on.
 */
export function GlobalLessonFinalizationModal() {
  const {
    activeLesson,
    isRefreshing,
    refreshQR,
  } = useGlobalLessonFinalizationMonitor();

  // Don't render if no lesson is awaiting finalization
  if (!activeLesson) {
    return null;
  }

  return (
    <LessonEndConfirmationModal
      isOpen={true}
      aula={{
        id: activeLesson.id,
        ponto_encontro: activeLesson.ponto_encontro,
        valor: activeLesson.valor,
        duracao_minutos: activeLesson.duracao_minutos,
        qr_code_data: activeLesson.qr_code_data,
        qr_code_expires_at: activeLesson.qr_code_expires_at,
        aula_inicio: activeLesson.aula_inicio,
        aula_fim: activeLesson.aula_fim,
      }}
      instrutor={{
        nome: activeLesson.instrutor_nome,
        foto: activeLesson.instrutor_foto,
      }}
      onRefreshQR={refreshQR}
      isRefreshing={isRefreshing}
    />
  );
}
