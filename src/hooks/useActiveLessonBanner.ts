import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ActiveLesson {
  id: string;
  status: string;
  aluno_nome: string;
  aula_inicio: string | null;
  data_hora: string;
  duracao_minutos: number;
  ponto_encontro: string | null;
}

const STATUS_PRIORITY: Record<string, number> = {
  em_andamento: 1,
  aguardando_qr: 2,
  aguardando_confirmacao: 3,
  em_rota: 4,
  confirmada: 5,
};

const ACTIVE_STATUSES = ["em_andamento", "aguardando_qr", "aguardando_confirmacao", "em_rota", "confirmada"] as const;

export function useActiveLessonBanner() {
  const { user } = useAuth();
  const [activeLesson, setActiveLesson] = useState<ActiveLesson | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchActiveLesson = useCallback(async () => {
    if (!user) {
      setActiveLesson(null);
      setIsLoading(false);
      return;
    }

    try {
      // Get instructor ID
      const { data: instrutorData, error: instrutorError } = await supabase
        .from("instrutores")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (instrutorError || !instrutorData) {
        setActiveLesson(null);
        setIsLoading(false);
        return;
      }

      // Query active lessons
      const { data: aulas, error: aulasError } = await supabase
        .from("aulas")
        .select("id, status, aluno_id, aula_inicio, data_hora, duracao_minutos, ponto_encontro")
        .eq("instrutor_id", instrutorData.id)
        .in("status", ACTIVE_STATUSES)
        .order("data_hora", { ascending: false })
        .limit(10);

      if (aulasError || !aulas || aulas.length === 0) {
        setActiveLesson(null);
        setIsLoading(false);
        return;
      }

      // Pick highest priority lesson
      const sorted = [...aulas].sort(
        (a, b) => (STATUS_PRIORITY[a.status] ?? 99) - (STATUS_PRIORITY[b.status] ?? 99)
      );
      const topAula = sorted[0];

      // Get student name
      let alunoNome = "Aluno";
      const { data: alunoData } = await supabase
        .from("alunos")
        .select("user_id")
        .eq("id", topAula.aluno_id)
        .maybeSingle();

      if (alunoData) {
        const { data: nameData } = await supabase.rpc("get_participant_name", {
          p_user_id: alunoData.user_id,
        });
        if (nameData) alunoNome = nameData;
      }

      setActiveLesson({
        id: topAula.id,
        status: topAula.status,
        aluno_nome: alunoNome,
        aula_inicio: topAula.aula_inicio,
        data_hora: topAula.data_hora,
        duracao_minutos: topAula.duracao_minutos,
        ponto_encontro: topAula.ponto_encontro,
      });
    } catch (err) {
      console.error("[ActiveLessonBanner] Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActiveLesson();

    // Realtime subscription
    const channel = supabase
      .channel("active-lesson-banner")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "aulas" },
        () => fetchActiveLesson()
      )
      .subscribe();

    // Polling fallback every 10s
    const interval = setInterval(fetchActiveLesson, 10_000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchActiveLesson]);

  return { activeLesson, isLoading, refetch: fetchActiveLesson };
}
