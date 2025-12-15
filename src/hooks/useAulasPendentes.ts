import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface AulaPendente {
  id: string;
  aluno_id: string;
  aluno_nome: string;
  aluno_foto: string | null;
  data_hora: string;
  duracao_minutos: number;
  ponto_encontro: string | null;
  valor: number;
  usa_carro_aluno: boolean;
  status: string;
  created_at: string;
}

export function useAulasPendentes() {
  const [aulasPendentes, setAulasPendentes] = useState<AulaPendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAulasPendentes();
      // Setup realtime subscription
      const channel = supabase
        .channel("aulas-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "aulas",
          },
          () => {
            fetchAulasPendentes();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  async function fetchAulasPendentes() {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // First get the instructor ID for this user
      const { data: instrutorData, error: instrutorError } = await supabase
        .from("instrutores")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (instrutorError) {
        console.error("Error fetching instructor:", instrutorError);
        throw instrutorError;
      }

      // Get pending lessons for this instructor
      const { data: aulasData, error: aulasError } = await supabase
        .from("aulas")
        .select(`
          id,
          aluno_id,
          data_hora,
          duracao_minutos,
          ponto_encontro,
          valor,
          usa_carro_aluno,
          status,
          created_at
        `)
        .eq("instrutor_id", instrutorData.id)
        .in("status", ["pendente", "confirmada"])
        .order("data_hora", { ascending: true });

      if (aulasError) {
        console.error("Error fetching lessons:", aulasError);
        throw aulasError;
      }

      // Get student names for each lesson
      const aulasComNomes: AulaPendente[] = [];
      for (const aula of aulasData || []) {
        // Get student profile name
        const { data: alunoData } = await supabase
          .from("alunos")
          .select("user_id")
          .eq("id", aula.aluno_id)
          .single();

        let alunoNome = "Aluno";
        let alunoFoto = null;

        if (alunoData) {
          const { data: profileData } = await supabase
            .rpc("get_participant_name", { p_user_id: alunoData.user_id });
          
          if (profileData) {
            alunoNome = profileData;
          }
        }

        aulasComNomes.push({
          ...aula,
          aluno_nome: alunoNome,
          aluno_foto: alunoFoto,
        });
      }

      setAulasPendentes(aulasComNomes);
    } catch (err: any) {
      console.error("Error in fetchAulasPendentes:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function aceitarAula(aulaId: string) {
    try {
      // Get aula data first
      const { data: aulaData, error: aulaFetchError } = await supabase
        .from("aulas")
        .select("aluno_id, data_hora, duracao_minutos, ponto_encontro, valor")
        .eq("id", aulaId)
        .single();

      if (aulaFetchError) throw aulaFetchError;

      // Update status
      const { error } = await supabase
        .from("aulas")
        .update({ status: "confirmada" })
        .eq("id", aulaId);

      if (error) throw error;

      // Get aluno's user_id to send notification
      const { data: alunoData } = await supabase
        .from("alunos")
        .select("user_id")
        .eq("id", aulaData.aluno_id)
        .single();

      if (alunoData) {
        // Get instructor name
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user!.id)
          .single();

        const instrutorNome = profileData?.full_name || "O instrutor";
        const dataFormatada = new Date(aulaData.data_hora).toLocaleString("pt-BR", {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });

        // Create notification for student
        await supabase.from("notifications").insert({
          user_id: alunoData.user_id,
          title: "Aula confirmada! 🎉",
          body: `${instrutorNome} aceitou sua aula de ${aulaData.duracao_minutos} minutos para ${dataFormatada}.`,
          type: "aula_confirmada",
          reference_id: aulaId,
        });
      }

      toast({
        title: "Aula aceita!",
        description: "O aluno foi notificado.",
      });

      fetchAulasPendentes();
    } catch (err: any) {
      console.error("Error accepting lesson:", err);
      toast({
        title: "Erro ao aceitar aula",
        description: err.message,
        variant: "destructive",
      });
    }
  }

  async function recusarAula(aulaId: string) {
    try {
      // Get aula data first
      const { data: aulaData, error: aulaFetchError } = await supabase
        .from("aulas")
        .select("aluno_id, data_hora")
        .eq("id", aulaId)
        .single();

      if (aulaFetchError) throw aulaFetchError;

      // Update status
      const { error } = await supabase
        .from("aulas")
        .update({ status: "cancelada" })
        .eq("id", aulaId);

      if (error) throw error;

      // Get aluno's user_id to send notification
      const { data: alunoData } = await supabase
        .from("alunos")
        .select("user_id")
        .eq("id", aulaData.aluno_id)
        .single();

      if (alunoData) {
        // Get instructor name
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user!.id)
          .single();

        const instrutorNome = profileData?.full_name || "O instrutor";
        const dataFormatada = new Date(aulaData.data_hora).toLocaleString("pt-BR", {
          weekday: "short",
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        });

        // Create notification for student
        await supabase.from("notifications").insert({
          user_id: alunoData.user_id,
          title: "Aula não confirmada",
          body: `${instrutorNome} não pôde aceitar sua aula agendada para ${dataFormatada}. Busque outro instrutor disponível.`,
          type: "aula_recusada",
          reference_id: aulaId,
        });
      }

      toast({
        title: "Aula recusada",
        description: "O aluno foi notificado.",
      });

      fetchAulasPendentes();
    } catch (err: any) {
      console.error("Error declining lesson:", err);
      toast({
        title: "Erro ao recusar aula",
        description: err.message,
        variant: "destructive",
      });
    }
  }

  return {
    aulasPendentes,
    loading,
    error,
    refetch: fetchAulasPendentes,
    aceitarAula,
    recusarAula,
  };
}
