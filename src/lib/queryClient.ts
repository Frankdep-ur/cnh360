import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 30 * 60 * 1000, // 30 minutes - cache garbage collection
      refetchOnWindowFocus: false, // Don't refetch on tab focus
      retry: 2, // Retry failed requests twice
      refetchOnMount: false, // Don't refetch if data is fresh
    },
  },
});

// Cache keys for static data
export const QUERY_KEYS = {
  INSTRUTORES: ["instrutores"] as const,
  INSTRUTORES_PUBLIC: ["instrutores", "public"] as const,
  CURSO_MODULOS: ["curso", "modulos"] as const,
  CURSO_AULAS: (moduloId: string) => ["curso", "aulas", moduloId] as const,
  QUESTOES_SIMULADO: ["questoes", "simulado"] as const,
  PROFILE: (userId: string) => ["profile", userId] as const,
} as const;
