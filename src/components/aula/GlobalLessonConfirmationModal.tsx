import { useGlobalLessonMonitor } from '@/hooks/useGlobalLessonMonitor';
import { LessonStartConfirmationModal } from './LessonStartConfirmationModal';

/**
 * Global modal component that overlays the entire app when
 * an instructor arrives and is waiting for the student to confirm.
 * 
 * This component should be mounted at the app root level (App.tsx)
 * to ensure it works regardless of which page the student is on.
 */
export function GlobalLessonConfirmationModal() {
  const {
    activeLesson,
    isConfirming,
    confirmStart,
    rejectStart,
  } = useGlobalLessonMonitor();

  // Don't render if no lesson is awaiting confirmation
  if (!activeLesson) {
    return null;
  }

  // Determine if we're showing the initial confirmation or the QR code
  const showQRPhase = activeLesson.aluno_pronto_para_aula;

  return (
    <LessonStartConfirmationModal
      isOpen={true}
      aula={{
        id: activeLesson.id,
        ponto_encontro: activeLesson.ponto_encontro,
        valor: activeLesson.valor,
        duracao_minutos: activeLesson.duracao_minutos,
        data_hora: activeLesson.data_hora,
        qr_code_inicio_data: activeLesson.qr_code_inicio_data,
        qr_code_inicio_expires_at: activeLesson.qr_code_inicio_expires_at,
        aluno_pronto_para_aula: activeLesson.aluno_pronto_para_aula,
      }}
      instrutor={{
        nome: activeLesson.instrutor_nome,
        foto: activeLesson.instrutor_foto,
      }}
      onConfirm={confirmStart}
      onReject={rejectStart}
      isConfirming={isConfirming}
      isWaitingForScan={showQRPhase}
    />
  );
}
