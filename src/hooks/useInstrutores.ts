import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS } from "@/lib/queryClient";

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

async function fetchInstrutores(): Promise<Instrutor[]> {
  // Fetch instructors from public cache (doesn't require auth)
  const { data: instrutoresData, error: instrutoresError } = await supabase
    .from("instrutores_publico_cache")
    .select("*")
    .eq("ativo", true);

  if (instrutoresError) {
    console.error("Error fetching instructors cache:", instrutoresError);
    throw instrutoresError;
  }

  if (!instrutoresData || instrutoresData.length === 0) {
    return [];
  }

  // Get all instructor IDs for batch vehicle fetch
  const instructorIds = instrutoresData.map((inst) => inst.id);

  // Fetch all vehicles at once (single query instead of N queries)
  const { data: allVehicles } = await supabase
    .from("veiculos")
    .select("instrutor_id, modelo, transmissao")
    .in("instrutor_id", instructorIds)
    .eq("ativo", true);

  // Create a map for quick vehicle lookup
  const vehicleMap = new Map<string, { modelo: string; transmissao: string }>();
  allVehicles?.forEach((v) => {
    if (!vehicleMap.has(v.instrutor_id)) {
      vehicleMap.set(v.instrutor_id, {
        modelo: v.modelo,
        transmissao: v.transmissao === "automatico" ? "Automático" : "Manual",
      });
    }
  });

  return instrutoresData.map((inst) => ({
    id: inst.id,
    user_id: inst.id,
    nome: inst.nome || `Instrutor ${inst.id.slice(0, 4)}`,
    foto: inst.foto,
    email: null,
    nota_media: Number(inst.nota_media) || 5.0,
    total_avaliacoes: inst.total_avaliacoes || 0,
    preco_hora: Number(inst.preco_hora) || 20,
    bio: inst.bio,
    is_mei_autonomo: true,
    aceita_carro_proprio: true,
    ativo: inst.ativo || true,
    veiculo: vehicleMap.get(inst.id) || null,
  }));
}

export function useInstrutores() {
  const { data: instrutores = [], isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.INSTRUTORES,
    queryFn: fetchInstrutores,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    instrutores,
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}
