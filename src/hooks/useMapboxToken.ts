import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useMapboxToken() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.access_token) {
          setError('Usuário não autenticado');
          setLoading(false);
          return;
        }

        const { data, error: fnError } = await supabase.functions.invoke('get-mapbox-token', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (fnError) {
          throw fnError;
        }

        setToken(data.token);
      } catch (err) {
        console.error('Error fetching Mapbox token:', err);
        setError('Erro ao carregar mapa');
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, []);

  return { token, loading, error };
}
