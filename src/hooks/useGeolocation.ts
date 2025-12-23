import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  loading: boolean;
  error: string | null;
}

interface UseGeolocationReturn extends GeolocationState {
  getCurrentLocation: () => Promise<{ latitude: number; longitude: number; address: string } | null>;
  clearLocation: () => void;
}

// Real reverse geocoding using Google Maps API via Edge Function
const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
  try {
    // Get current session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      console.warn('No auth session, falling back to coordinates');
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    const { data, error } = await supabase.functions.invoke('geocode-address', {
      body: { latitude: lat, longitude: lng },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      console.error('Geocode error:', error);
      throw error;
    }

    return data.address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (err) {
    console.error('Geocoding failed, using coordinates:', err);
    // Fallback to coordinates if API fails
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

export function useGeolocation(): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    address: null,
    loading: false,
    error: null,
  });

  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState(prev => ({ ...prev, error: 'Geolocalização não suportada pelo navegador' }));
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    return new Promise<{ latitude: number; longitude: number; address: string } | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const address = await reverseGeocode(latitude, longitude);
            
            setState({
              latitude,
              longitude,
              address,
              loading: false,
              error: null,
            });
            
            resolve({ latitude, longitude, address });
          } catch (err) {
            setState(prev => ({ 
              ...prev, 
              latitude,
              longitude,
              address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
              loading: false,
            }));
            resolve({ latitude, longitude, address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` });
          }
        },
        (error) => {
          let errorMessage = 'Erro ao obter localização';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permissão de localização negada';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tempo esgotado ao obter localização';
              break;
          }
          
          setState(prev => ({ ...prev, loading: false, error: errorMessage }));
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  const clearLocation = useCallback(() => {
    setState({
      latitude: null,
      longitude: null,
      address: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    getCurrentLocation,
    clearLocation,
  };
}
