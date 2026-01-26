import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AulaPendingRating {
  id: string;
  instrutor_id: string;
  instrutor_nome: string;
  instrutor_foto: string | null;
  data_hora: string;
}

export function useAulaRating() {
  const { user } = useAuth();
  const [pendingRating, setPendingRating] = useState<AulaPendingRating | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for completed lessons without ratings
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const checkPendingRatings = async () => {
      try {
        // Get aluno_id
        const { data: aluno } = await supabase
          .from("alunos")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!aluno) {
          setLoading(false);
          return;
        }

        // Find completed lessons without ratings
        const { data: aulasCompletas } = await supabase
          .from("aulas")
          .select(`
            id,
            instrutor_id,
            data_hora
          `)
          .eq("aluno_id", aluno.id)
          .eq("status", "concluida")
          .eq("qr_validado", true)
          .order("validada_em", { ascending: false })
          .limit(5);

        if (!aulasCompletas || aulasCompletas.length === 0) {
          setLoading(false);
          return;
        }

        // Check which ones already have ratings
        const aulaIds = aulasCompletas.map(a => a.id);
        const { data: avaliacoesExistentes } = await supabase
          .from("avaliacoes")
          .select("aula_id")
          .in("aula_id", aulaIds);

        const avaliadasIds = new Set(avaliacoesExistentes?.map(a => a.aula_id) || []);
        
        // Find first lesson without rating
        const aulaSemAvaliacao = aulasCompletas.find(a => !avaliadasIds.has(a.id));

        if (!aulaSemAvaliacao) {
          setLoading(false);
          return;
        }

        // Get instructor info
        const { data: instrutorInfo } = await supabase
          .from("instrutores_seguros")
          .select("full_name, avatar_url")
          .eq("id", aulaSemAvaliacao.instrutor_id)
          .maybeSingle();

        setPendingRating({
          id: aulaSemAvaliacao.id,
          instrutor_id: aulaSemAvaliacao.instrutor_id,
          instrutor_nome: instrutorInfo?.full_name || "Instrutor",
          instrutor_foto: instrutorInfo?.avatar_url || null,
          data_hora: aulaSemAvaliacao.data_hora,
        });

        setLoading(false);
      } catch (error) {
        console.error("Error checking pending ratings:", error);
        setLoading(false);
      }
    };

    checkPendingRatings();
  }, [user]);

  const submitRating = async (aulaId: string, instrutorId: string, nota: number, comentario: string) => {
    if (!user) throw new Error("User not authenticated");

    // Get aluno_id
    const { data: aluno } = await supabase
      .from("alunos")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!aluno) throw new Error("Aluno not found");

    // Insert rating
    const { error: insertError } = await supabase
      .from("avaliacoes")
      .insert({
        aula_id: aulaId,
        aluno_id: aluno.id,
        instrutor_id: instrutorId,
        nota,
        comentario: comentario || null,
      });

    if (insertError) {
      console.error("Error inserting rating:", insertError);
      throw insertError;
    }

    // Update instructor stats
    const { data: todasAvaliacoes } = await supabase
      .from("avaliacoes")
      .select("nota")
      .eq("instrutor_id", instrutorId);

    if (todasAvaliacoes && todasAvaliacoes.length > 0) {
      const totalNotas = todasAvaliacoes.reduce((acc, a) => acc + a.nota, 0);
      const mediaNotas = totalNotas / todasAvaliacoes.length;

      await supabase
        .from("instrutores")
        .update({
          nota_media: Number(mediaNotas.toFixed(2)),
          total_avaliacoes: todasAvaliacoes.length,
        })
        .eq("id", instrutorId);
    }

    toast.success("Avaliação enviada!", {
      description: "Obrigado pelo seu feedback!",
    });

    // Clear pending rating
    setPendingRating(null);
  };

  const dismissRating = () => {
    setPendingRating(null);
  };

  return {
    pendingRating,
    loading,
    submitRating,
    dismissRating,
  };
}
