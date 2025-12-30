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
  payment_intent_id: string | null;
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
          created_at,
          payment_intent_id
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
        .select("aluno_id, data_hora, duracao_minutos, ponto_encontro, valor, payment_intent_id")
        .eq("id", aulaId)
        .single();

      if (aulaFetchError) throw aulaFetchError;

      // CRITICAL: Verify payment exists before accepting
      if (!aulaData.payment_intent_id) {
        toast({
          title: "⚠️ Aula sem pagamento",
          description: "O aluno não completou o pagamento. A aula será aceita mas sem garantia de pagamento.",
          variant: "destructive",
        });
        // Still allow accepting but warn the instructor
      } else {
        // If there's a payment_intent_id, capture the payment
        toast({
          title: "Processando pagamento...",
          description: "Capturando o pagamento do aluno.",
        });

        const { data: captureData, error: captureError } = await supabase.functions.invoke(
          "capture-payment",
          {
            body: { aulaId },
          }
        );

        if (captureError) {
          console.error("Error capturing payment:", captureError);
          throw new Error("Erro ao capturar pagamento. Tente novamente.");
        }

        console.log("Payment captured:", captureData);
      }

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
          body: `${instrutorNome} aceitou sua aula de ${aulaData.duracao_minutos} minutos para ${dataFormatada}. O pagamento foi confirmado.`,
          type: "aula_confirmada",
          reference_id: aulaId,
        });
      }

      toast({
        title: "Aula aceita!",
        description: aulaData.payment_intent_id 
          ? "Pagamento capturado. O aluno foi notificado." 
          : "O aluno foi notificado.",
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
        .select("aluno_id, data_hora, payment_intent_id")
        .eq("id", aulaId)
        .single();

      if (aulaFetchError) throw aulaFetchError;

      // If there's a payment_intent_id, cancel the payment (release hold)
      if (aulaData.payment_intent_id) {
        toast({
          title: "Liberando pagamento...",
          description: "Cancelando a autorização do cartão do aluno.",
        });

        const { data: cancelData, error: cancelError } = await supabase.functions.invoke(
          "cancel-payment",
          {
            body: { aulaId, reason: "instructor_declined" },
          }
        );

        if (cancelError) {
          console.error("Error canceling payment:", cancelError);
          // Don't throw - we still want to cancel the lesson
        } else {
          console.log("Payment cancelled:", cancelData);
        }
      }

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
          body: aulaData.payment_intent_id
            ? `${instrutorNome} não pôde aceitar sua aula para ${dataFormatada}. O valor foi liberado no seu cartão.`
            : `${instrutorNome} não pôde aceitar sua aula agendada para ${dataFormatada}. Busque outro instrutor disponível.`,
          type: "aula_recusada",
          reference_id: aulaId,
        });
      }

      toast({
        title: "Aula recusada",
        description: aulaData.payment_intent_id 
          ? "O hold foi liberado e o aluno foi notificado." 
          : "O aluno foi notificado.",
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
