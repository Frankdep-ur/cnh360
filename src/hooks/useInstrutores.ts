import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Instrutor {
  id: string;
  user_id: string;
  nome: string;
  foto: string | null;
  email: string | null;
  nota_media: number;
  total_avaliacoes: number;
  preco_hora: number;
  bio: string | null;
  is_mei_autonomo: boolean;
  aceita_carro_proprio: boolean;
  ativo: boolean;
  veiculo: {
    modelo: string;
    transmissao: string;
  } | null;
}

export function useInstrutores() {
  const [instrutores, setInstrutores] = useState<Instrutor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInstrutores();
  }, []);

  async function fetchInstrutores() {
    try {
      setLoading(true);
      setError(null);

      // Fetch instructors from public cache (doesn't require auth)
      const { data: instrutoresData, error: instrutoresError } = await supabase
        .from("instrutores_publico_cache")
        .select("*")
        .eq("ativo", true);

      if (instrutoresError) {
        console.error("Error fetching instructors cache:", instrutoresError);
        throw instrutoresError;
      }

      // For each instructor, get their profile and vehicle info
      const instrutoresCompletos: Instrutor[] = [];

      for (const inst of instrutoresData || []) {
        // Get vehicle info using the public function
        const { data: veiculoData } = await supabase
          .rpc("get_vehicle_display_info", { p_instrutor_id: inst.id });

        const veiculo = veiculoData && veiculoData.length > 0
          ? {
              modelo: veiculoData[0].modelo,
              transmissao: veiculoData[0].transmissao === "automatico" ? "Automático" : "Manual",
            }
          : null;

        instrutoresCompletos.push({
          id: inst.id,
          user_id: inst.id, // Will be fetched when needed
          nome: `Instrutor ${inst.id.slice(0, 4)}`, // Placeholder - will get real name when logged in
          foto: null,
          email: null,
          nota_media: Number(inst.nota_media) || 5.0,
          total_avaliacoes: inst.total_avaliacoes || 0,
          preco_hora: Number(inst.preco_hora) || 80,
          bio: inst.bio,
          is_mei_autonomo: true, // Assume MEI for now since we're showing autonomous instructors
          aceita_carro_proprio: true,
          ativo: inst.ativo || true,
          veiculo,
        });
      }

      setInstrutores(instrutoresCompletos);
    } catch (err: any) {
      console.error("Error in fetchInstrutores:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { instrutores, loading, error, refetch: fetchInstrutores };
}
