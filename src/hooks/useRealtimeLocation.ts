import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LocationData {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  accuracy?: number;
  updated_at: string;
}

interface UseRealtimeLocationReturn {
  currentLocation: LocationData | null;
  isTracking: boolean;
  error: string | null;
  startTracking: (aulaId: string) => void;
  stopTracking: () => void;
  updateLocation: (aulaId: string) => Promise<void>;
}

export function useRealtimeLocation(): UseRealtimeLocationReturn {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const aulaIdRef = useRef<string | null>(null);

  const updateLocationInDB = useCallback(async (
    latitude: number,
    longitude: number,
    heading?: number,
    speed?: number,
    accuracy?: number
  ) => {
    if (!user || !aulaIdRef.current) return;

    try {
      // Upsert location - update if exists, insert if not
      const { error: upsertError } = await supabase
        .from('localizacao_tempo_real')
        .upsert({
          user_id: user.id,
          aula_id: aulaIdRef.current,
          latitude,
          longitude,
          heading,
          speed,
          accuracy,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,aula_id'
        });

      if (upsertError) {
        // If conflict resolution fails, try delete + insert
        await supabase
          .from('localizacao_tempo_real')
          .delete()
          .eq('user_id', user.id)
          .eq('aula_id', aulaIdRef.current);

        await supabase
          .from('localizacao_tempo_real')
          .insert({
            user_id: user.id,
            aula_id: aulaIdRef.current,
            latitude,
            longitude,
            heading,
            speed,
            accuracy,
          });
      }

      setCurrentLocation({
        latitude,
        longitude,
        heading,
        speed,
        accuracy,
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error updating location:', err);
    }
  }, [user]);

  const startTracking = useCallback((aulaId: string) => {
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada pelo navegador');
      return;
    }

    aulaIdRef.current = aulaId;
    setIsTracking(true);
    setError(null);

    // Watch position with high accuracy
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, heading, speed, accuracy } = position.coords;
        updateLocationInDB(
          latitude,
          longitude,
          heading ?? undefined,
          speed ?? undefined,
          accuracy ?? undefined
        );
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Erro ao obter localização');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Also update every 5 seconds as backup
    intervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, heading, speed, accuracy } = position.coords;
          updateLocationInDB(
            latitude,
            longitude,
            heading ?? undefined,
            speed ?? undefined,
            accuracy ?? undefined
          );
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }, 5000);
  }, [updateLocationInDB]);

  const stopTracking = useCallback(async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Remove location from DB
    if (user && aulaIdRef.current) {
      await supabase
        .from('localizacao_tempo_real')
        .delete()
        .eq('user_id', user.id)
        .eq('aula_id', aulaIdRef.current);
    }

    aulaIdRef.current = null;
    setIsTracking(false);
    setCurrentLocation(null);
  }, [user]);

  const updateLocation = useCallback(async (aulaId: string) => {
    if (!navigator.geolocation) {
      throw new Error('Geolocalização não suportada');
    }

    aulaIdRef.current = aulaId;

    return new Promise<void>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, heading, speed, accuracy } = position.coords;
          await updateLocationInDB(
            latitude,
            longitude,
            heading ?? undefined,
            speed ?? undefined,
            accuracy ?? undefined
          );
          resolve();
        },
        (err) => {
          reject(new Error('Erro ao obter localização'));
        },
        { enableHighAccuracy: true }
      );
    });
  }, [updateLocationInDB]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    currentLocation,
    isTracking,
    error,
    startTracking,
    stopTracking,
    updateLocation,
  };
}

// Hook to subscribe to someone else's location
export function useSubscribeToLocation(aulaId: string | null, userId?: string) {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!aulaId) {
      setLoading(false);
      return;
    }

    // Fetch initial location
    const fetchLocation = async () => {
      let query = supabase
        .from('localizacao_tempo_real')
        .select('*')
        .eq('aula_id', aulaId);
      
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data } = await query.order('updated_at', { ascending: false }).limit(1).single();
      
      if (data) {
        setLocation({
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          heading: data.heading ? Number(data.heading) : undefined,
          speed: data.speed ? Number(data.speed) : undefined,
          accuracy: data.accuracy ? Number(data.accuracy) : undefined,
          updated_at: data.updated_at,
        });
      }
      setLoading(false);
    };

    fetchLocation();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`location-${aulaId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'localizacao_tempo_real',
          filter: `aula_id=eq.${aulaId}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setLocation(null);
          } else {
            const data = payload.new as any;
            if (!userId || data.user_id === userId) {
              setLocation({
                latitude: Number(data.latitude),
                longitude: Number(data.longitude),
                heading: data.heading ? Number(data.heading) : undefined,
                speed: data.speed ? Number(data.speed) : undefined,
                accuracy: data.accuracy ? Number(data.accuracy) : undefined,
                updated_at: data.updated_at,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [aulaId, userId]);

  return { location, loading };
}
