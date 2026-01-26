import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AuditoriaEvento {
  id: string;
  aula_id: string;
  evento: string;
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  precisao_metros: number | null;
  device_info: Record<string, unknown> | null;
  user_id: string;
  dados_adicionais: Record<string, unknown> | null;
  created_at: string;
}

export interface AulaComAuditoria {
  id: string;
  data_hora: string;
  duracao_minutos: number;
  status: string;
  valor: number;
  ponto_encontro: string | null;
  aula_inicio: string | null;
  aula_fim: string | null;
  qr_validado: boolean | null;
  aluno_nome?: string;
  aluno_foto?: string | null;
  instrutor_nome?: string;
  instrutor_foto?: string | null;
  auditoria: AuditoriaEvento[];
}

export function useAulaAuditoria(aulaId?: string) {
  const [auditoria, setAuditoria] = useState<AuditoriaEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!aulaId) {
      setLoading(false);
      return;
    }

    const fetchAuditoria = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("aulas_auditoria")
        .select("*")
        .eq("aula_id", aulaId)
        .order("timestamp", { ascending: true });

      if (fetchError) {
        console.error("Error fetching auditoria:", fetchError);
        setError(fetchError.message);
        setAuditoria([]);
      } else {
        setAuditoria((data as AuditoriaEvento[]) || []);
      }

      setLoading(false);
    };

    fetchAuditoria();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`auditoria-${aulaId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "aulas_auditoria",
          filter: `aula_id=eq.${aulaId}`,
        },
        (payload) => {
          setAuditoria((prev) => [...prev, payload.new as AuditoriaEvento]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [aulaId]);

  return { auditoria, loading, error };
}

export function useAulasConcluidas(role: "instrutor" | "aluno") {
  const [aulas, setAulas] = useState<AulaComAuditoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAulasConcluidas = async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setLoading(false);
        return;
      }

      let query;

      if (role === "instrutor") {
        // Get instructor ID first
        const { data: instrutor } = await supabase
          .from("instrutores")
          .select("id")
          .eq("user_id", userData.user.id)
          .single();

        if (!instrutor) {
          setLoading(false);
          return;
        }

        query = supabase
          .from("aulas")
          .select(`
            id,
            data_hora,
            duracao_minutos,
            status,
            valor,
            ponto_encontro,
            aula_inicio,
            aula_fim,
            qr_validado,
            aluno_id
          `)
          .eq("instrutor_id", instrutor.id)
          .eq("status", "concluida")
          .order("data_hora", { ascending: false });
      } else {
        // Get student ID first
        const { data: aluno } = await supabase
          .from("alunos")
          .select("id")
          .eq("user_id", userData.user.id)
          .single();

        if (!aluno) {
          setLoading(false);
          return;
        }

        query = supabase
          .from("aulas")
          .select(`
            id,
            data_hora,
            duracao_minutos,
            status,
            valor,
            ponto_encontro,
            aula_inicio,
            aula_fim,
            qr_validado,
            instrutor_id
          `)
          .eq("aluno_id", aluno.id)
          .eq("status", "concluida")
          .order("data_hora", { ascending: false });
      }

      const { data: aulasData, error } = await query;

      if (error) {
        console.error("Error fetching aulas concluidas:", error);
        setLoading(false);
        return;
      }

      // Fetch participant names and audit data for each lesson
      const aulasEnriquecidas = await Promise.all(
        (aulasData || []).map(async (aula) => {
          // Get participant info
          let participantInfo = { nome: "", foto: null as string | null };
          
          if (role === "instrutor" && "aluno_id" in aula) {
            const { data: alunoData } = await supabase
              .from("alunos_seguros")
              .select("full_name, avatar_url")
              .eq("id", aula.aluno_id)
              .single();
            participantInfo = {
              nome: alunoData?.full_name || "Aluno",
              foto: alunoData?.avatar_url || null,
            };
          } else if (role === "aluno" && "instrutor_id" in aula) {
            const { data: instrutorData } = await supabase
              .from("instrutores_publico_cache")
              .select("nome, foto")
              .eq("id", (aula as { instrutor_id: string }).instrutor_id)
              .single();
            participantInfo = {
              nome: instrutorData?.nome || "Instrutor",
              foto: instrutorData?.foto || null,
            };
          }

          // Get audit events
          const { data: auditoriaData } = await supabase
            .from("aulas_auditoria")
            .select("*")
            .eq("aula_id", aula.id)
            .order("timestamp", { ascending: true });

          return {
            ...aula,
            ...(role === "instrutor"
              ? { aluno_nome: participantInfo.nome, aluno_foto: participantInfo.foto }
              : { instrutor_nome: participantInfo.nome, instrutor_foto: participantInfo.foto }),
            auditoria: (auditoriaData as AuditoriaEvento[]) || [],
          } as AulaComAuditoria;
        })
      );

      setAulas(aulasEnriquecidas);
      setLoading(false);
    };

    fetchAulasConcluidas();
  }, [role]);

  return { aulas, loading };
}
