import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RouteInfo {
  distance: {
    text: string;
    value: number;
  };
  duration: {
    text: string;
    value: number;
  };
  eta_minutes: number;
  start_address: string;
  end_address: string;
  polyline: string;
}

interface UseRouteReturn {
  route: RouteInfo | null;
  loading: boolean;
  error: string | null;
  calculateRoute: (origin: { lat: number; lng: number } | string, destination: { lat: number; lng: number } | string) => Promise<RouteInfo | null>;
  clearRoute: () => void;
}

export function useRoute(): UseRouteReturn {
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateRoute = useCallback(async (
    origin: { lat: number; lng: number } | string, 
    destination: { lat: number; lng: number } | string
  ): Promise<RouteInfo | null> => {
    setLoading(true);
    setError(null);

    try {
      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error: fnError } = await supabase.functions.invoke('calculate-route', {
        body: { origin, destination },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (fnError) {
        throw fnError;
      }

      setRoute(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao calcular rota';
      setError(errorMessage);
      console.error('Route calculation error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearRoute = useCallback(() => {
    setRoute(null);
    setError(null);
  }, []);

  return {
    route,
    loading,
    error,
    calculateRoute,
    clearRoute,
  };
}
