import { useState, useCallback } from 'react';

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

// Mock geocoding - in production would use Google Maps Geocoding API
const mockReverseGeocode = async (lat: number, lng: number): Promise<string> => {
  // Simulating Araçatuba addresses
  const addresses = [
    "Rua São Paulo, 1234 - Centro, Araçatuba - SP",
    "Av. Brasil, 567 - Vila Industrial, Araçatuba - SP",
    "Rua Marechal Deodoro, 890 - Jardim Sumaré, Araçatuba - SP",
    "Av. dos Bandeirantes, 321 - Centro, Araçatuba - SP",
    "Rua Floriano Peixoto, 456 - Vila Mendonça, Araçatuba - SP",
  ];
  
  // Return a pseudo-random address based on coordinates
  const index = Math.floor((lat + lng) * 1000) % addresses.length;
  return addresses[Math.abs(index)];
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
            const address = await mockReverseGeocode(latitude, longitude);
            
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
