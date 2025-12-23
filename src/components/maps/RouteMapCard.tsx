import { useEffect, useState, useMemo } from 'react';
import { MapPin, Navigation, Clock, Car, Loader2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRoute } from '@/hooks/useRoute';
import { supabase } from '@/integrations/supabase/client';

interface RouteMapCardProps {
  originAddress: string;
  destinationAddress: string;
  originCoords?: { lat: number; lng: number };
  destinationCoords?: { lat: number; lng: number };
  distance?: string;
  eta?: string;
  showNavButton?: boolean;
  onNavigate?: () => void;
  className?: string;
}

export function RouteMapCard({
  originAddress,
  destinationAddress,
  originCoords,
  destinationCoords,
  distance: initialDistance,
  eta: initialEta,
  showNavButton = true,
  onNavigate,
  className,
}: RouteMapCardProps) {
  const { route, loading, calculateRoute } = useRoute();
  const [distance, setDistance] = useState(initialDistance || "Calculando...");
  const [eta, setEta] = useState(initialEta || "...");
  const [mapUrl, setMapUrl] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(false);

  // Generate Google Maps Static API URL
  const generateStaticMapUrl = async () => {
    try {
      setMapLoading(true);
      setMapError(false);

      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.warn('No auth session for map generation');
        setMapError(true);
        setMapLoading(false);
        return;
      }

      // Build the static map URL using edge function to keep API key secure
      const { data, error } = await supabase.functions.invoke('generate-static-map', {
        body: {
          originAddress: originCoords 
            ? `${originCoords.lat},${originCoords.lng}` 
            : originAddress,
          destinationAddress: destinationCoords 
            ? `${destinationCoords.lat},${destinationCoords.lng}` 
            : destinationAddress,
          width: 600,
          height: 300,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error) throw error;
      
      if (data?.mapUrl) {
        setMapUrl(data.mapUrl);
      } else {
        throw new Error('No map URL returned');
      }
    } catch (err) {
      console.error('Error generating static map:', err);
      setMapError(true);
    } finally {
      setMapLoading(false);
    }
  };

  useEffect(() => {
    // Calculate route if we have coordinates
    if (originCoords && destinationCoords) {
      calculateRoute(originCoords, destinationCoords).then((result) => {
        if (result) {
          setDistance(result.distance.text);
          setEta(`${result.eta_minutes} min`);
        }
      });
    } else if (originAddress && destinationAddress) {
      // Use addresses directly
      calculateRoute(originAddress, destinationAddress).then((result) => {
        if (result) {
          setDistance(result.distance.text);
          setEta(`${result.eta_minutes} min`);
        }
      });
    }

    // Generate static map
    if ((originCoords || originAddress) && (destinationCoords || destinationAddress)) {
      generateStaticMapUrl();
    }
  }, [originCoords, destinationCoords, originAddress, destinationAddress]);

  const handleNavigate = () => {
    // Open Google Maps with directions
    const destination = destinationCoords 
      ? `${destinationCoords.lat},${destinationCoords.lng}`
      : encodeURIComponent(destinationAddress);
    const origin = originCoords
      ? `${originCoords.lat},${originCoords.lng}`
      : encodeURIComponent(originAddress);
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    window.open(url, '_blank');
    onNavigate?.();
  };

  // Fallback SVG map when real map fails
  const FallbackMap = () => (
    <svg className="w-full h-full" viewBox="0 0 400 160">
      <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-muted-foreground/20" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <path
        d="M 60 120 Q 120 60 200 80 T 340 40"
        fill="none"
        stroke="#4CAF50"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="12 6"
        className="animate-pulse"
      />
      <circle cx="60" cy="120" r="12" fill="#4CAF50" />
      <circle cx="60" cy="120" r="6" fill="white" />
      <circle cx="340" cy="40" r="12" fill="#f44336" />
      <circle cx="340" cy="40" r="6" fill="white" />
      <g transform="translate(180, 75)">
        <circle r="14" fill="white" />
        <text x="0" y="5" textAnchor="middle" fontSize="14">🚗</text>
      </g>
    </svg>
  );

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Map Preview */}
      <div className="relative h-40 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full">
            {(loading || mapLoading) && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            
            {/* Real Google Maps Static Image */}
            {mapUrl && !mapError ? (
              <img 
                src={mapUrl} 
                alt="Mapa da rota"
                className="w-full h-full object-cover"
                onError={() => setMapError(true)}
              />
            ) : (
              <FallbackMap />
            )}

            {mapError && (
              <div className="absolute bottom-2 left-2 right-2 bg-destructive/10 text-destructive text-xs px-2 py-1 rounded flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                <span>Mapa indisponível</span>
              </div>
            )}
          </div>
        </div>
        
        {/* ETA Badge */}
        <div className="absolute top-3 right-3 bg-background/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#4CAF50]" />
            <span className="font-bold text-foreground">{eta}</span>
          </div>
        </div>
        
        {/* Distance Badge */}
        <div className="absolute top-3 left-3 bg-background/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-lg">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-primary" />
            <span className="font-bold text-foreground">{distance}</span>
          </div>
        </div>
      </div>
      
      {/* Addresses */}
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[#4CAF50]/10 flex items-center justify-center flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-[#4CAF50]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Origem</p>
            <p className="text-sm font-medium text-foreground truncate">{originAddress}</p>
          </div>
        </div>
        
        {/* Dotted line connector */}
        <div className="ml-4 h-4 border-l-2 border-dashed border-muted-foreground/30" />
        
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-4 h-4 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">Destino</p>
            <p className="text-sm font-medium text-foreground truncate">{destinationAddress}</p>
          </div>
        </div>
        
        {showNavButton && (
          <Button 
            onClick={handleNavigate}
            className="w-full mt-3 bg-[#4CAF50] hover:bg-[#45a049] text-white"
          >
            <Navigation className="w-4 h-4 mr-2" />
            Navegar com Google Maps
          </Button>
        )}
      </div>
    </Card>
  );
}
