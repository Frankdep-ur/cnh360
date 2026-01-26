import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UseAulaTimerReturn {
  elapsedSeconds: number;
  elapsedFormatted: string;
  isRunning: boolean;
  canFinish: boolean;
  remainingMinutes: number;
}

export function useAulaTimer(
  aulaId: string | null, 
  aulaInicio: string | null, 
  duracaoMinutos: number
): UseAulaTimerReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  // Calculate initial elapsed time
  useEffect(() => {
    if (!aulaInicio) {
      setElapsedSeconds(0);
      setIsRunning(false);
      return;
    }

    const startTime = new Date(aulaInicio).getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - startTime) / 1000);
    setElapsedSeconds(Math.max(0, elapsed));
    setIsRunning(true);
  }, [aulaInicio]);

  // Timer tick
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Subscribe to aula updates for real-time sync
  useEffect(() => {
    if (!aulaId) return;

    const channel = supabase
      .channel(`aula-timer-${aulaId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'aulas',
          filter: `id=eq.${aulaId}`,
        },
        (payload) => {
          const newData = payload.new as { aula_inicio?: string; status?: string };
          
          if (newData.aula_inicio) {
            const startTime = new Date(newData.aula_inicio).getTime();
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000);
            setElapsedSeconds(Math.max(0, elapsed));
            setIsRunning(true);
          }
          
          if (newData.status === 'aguardando_qr' || newData.status === 'concluida') {
            setIsRunning(false);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [aulaId]);

  // Format time as HH:MM:SS
  const formatTime = useCallback((totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const elapsedMinutes = elapsedSeconds / 60;
  const minDuration = duracaoMinutos * 0.9; // 10% tolerance
  const canFinish = elapsedMinutes >= minDuration;
  const remainingMinutes = Math.max(0, Math.ceil(minDuration - elapsedMinutes));

  return {
    elapsedSeconds,
    elapsedFormatted: formatTime(elapsedSeconds),
    isRunning,
    canFinish,
    remainingMinutes
  };
}
