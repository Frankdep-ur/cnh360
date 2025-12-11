import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type ModoTransicao = "atual" | "nova_lei" | null;

interface ModoTransicaoConfig {
  horasPraticasMinimas: number;
  horasPraticasMaximas: number;
  cursoTeoricoHoras: number | null;
  cursoTeoricoEAD: boolean;
  instrutoresMEI: boolean;
  carroProprioPermitido: boolean;
  segundaTentativaGratis: boolean;
  precoSugerido: { min: number; max: number };
  corTema: "primary" | "secondary";
  label: string;
  descricao: string;
}

interface ModoTransicaoContextType {
  modo: ModoTransicao;
  setModo: (modo: ModoTransicao) => Promise<void>;
  isLoading: boolean;
  isSP: boolean;
  config: ModoTransicaoConfig;
  diasRestantes: number;
  dataFimTransicao: Date;
}

const dataFimTransicao = new Date("2026-06-10"); // 180 dias a partir de 10/12/2025

const configModoAtual: ModoTransicaoConfig = {
  horasPraticasMinimas: 20,
  horasPraticasMaximas: 25,
  cursoTeoricoHoras: 45,
  cursoTeoricoEAD: false,
  instrutoresMEI: false,
  carroProprioPermitido: false,
  segundaTentativaGratis: false,
  precoSugerido: { min: 2200, max: 3000 },
  corTema: "secondary",
  label: "Modo Tradicional",
  descricao: "Procedimentos antigos vigentes até junho/2026"
};

const configNovaLei: ModoTransicaoConfig = {
  horasPraticasMinimas: 2,
  horasPraticasMaximas: 2,
  cursoTeoricoHoras: null,
  cursoTeoricoEAD: true,
  instrutoresMEI: true,
  carroProprioPermitido: true,
  segundaTentativaGratis: true,
  precoSugerido: { min: 799, max: 1200 },
  corTema: "primary",
  label: "Modo Nova Lei",
  descricao: "Resolução CONTRAN 1.020/2025 - Já disponível!"
};

const ModoTransicaoContext = createContext<ModoTransicaoContextType | undefined>(undefined);

export function ModoTransicaoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [modo, setModoState] = useState<ModoTransicao>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSP, setIsSP] = useState(false);

  // Calcular dias restantes
  const hoje = new Date();
  const diasRestantes = Math.max(0, Math.ceil((dataFimTransicao.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)));

  // Detectar se está em SP (por geolocalização ou CEP)
  useEffect(() => {
    const detectarSP = async () => {
      // Por enquanto, assumir SP para teste em Araçatuba
      // Em produção, usar API de geolocalização ou CEP
      setIsSP(true);
    };
    detectarSP();
  }, []);

  // Carregar modo do usuário do banco
  useEffect(() => {
    const carregarModo = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Primeiro tentar pegar do aluno
        const { data: alunoData } = await supabase
          .from("alunos")
          .select("modo_transicao")
          .eq("user_id", user.id)
          .maybeSingle();

        if (alunoData?.modo_transicao) {
          setModoState(alunoData.modo_transicao as ModoTransicao);
        } else {
          // Tentar do perfil
          const { data: profileData } = await supabase
            .from("profiles")
            .select("modo_transicao")
            .eq("id", user.id)
            .maybeSingle();

          if (profileData?.modo_transicao) {
            setModoState(profileData.modo_transicao as ModoTransicao);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar modo transição:", error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarModo();
  }, [user]);

  const setModo = async (novoModo: ModoTransicao) => {
    setModoState(novoModo);

    if (user) {
      try {
        // Atualizar perfil
        await supabase
          .from("profiles")
          .update({ modo_transicao: novoModo })
          .eq("id", user.id);

        // Se for aluno, atualizar também na tabela alunos
        const { data: alunoData } = await supabase
          .from("alunos")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (alunoData) {
          await supabase
            .from("alunos")
            .update({ 
              modo_transicao: novoModo,
              horas_praticas_total: novoModo === "nova_lei" ? 2 : 20
            })
            .eq("user_id", user.id);
        }
      } catch (error) {
        console.error("Erro ao salvar modo transição:", error);
      }
    }
  };

  const config = modo === "nova_lei" ? configNovaLei : configModoAtual;

  return (
    <ModoTransicaoContext.Provider value={{
      modo,
      setModo,
      isLoading,
      isSP,
      config,
      diasRestantes,
      dataFimTransicao
    }}>
      {children}
    </ModoTransicaoContext.Provider>
  );
}

export function useModoTransicao() {
  const context = useContext(ModoTransicaoContext);
  if (!context) {
    throw new Error("useModoTransicao deve ser usado dentro de ModoTransicaoProvider");
  }
  return context;
}
