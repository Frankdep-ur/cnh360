import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 30 * 60 * 1000, // 30 minutes - cache garbage collection
      refetchOnWindowFocus: false, // Don't refetch on tab focus
      retry: (failureCount, error: unknown) => {
        // Don't retry on authentication errors
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorCode = (error as { code?: string })?.code;
        
        if (errorMessage.includes('JWT expired') || errorCode === 'PGRST303') {
          console.log('JWT expirado - não tentar novamente');
          return false;
        }
        return failureCount < 2;
      },
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
