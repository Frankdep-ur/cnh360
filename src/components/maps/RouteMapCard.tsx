import { MapPin, Navigation, Clock, Car } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RouteMapCardProps {
  originAddress: string;
  destinationAddress: string;
  distance?: string;
  eta?: string;
  showNavButton?: boolean;
  onNavigate?: () => void;
  className?: string;
}

export function RouteMapCard({
  originAddress,
  destinationAddress,
  distance = "3.2 km",
  eta = "8 min",
  showNavButton = true,
  onNavigate,
  className,
}: RouteMapCardProps) {
  // Mock map image - in production would use Google Maps Embed API
  const mapImageUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/pin-s+4CAF50(${-50.4386},${-21.2085}),pin-s+f44336(${-50.4286},${-21.1985})/auto/400x200@2x?access_token=pk.placeholder`;
  
  const handleNavigate = () => {
    // Open Google Maps with directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationAddress)}`;
    window.open(url, '_blank');
    onNavigate?.();
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Map Preview */}
      <div className="relative h-40 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* Simulated map with route line */}
            <svg className="w-full h-full" viewBox="0 0 400 160">
              {/* Background grid pattern */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-muted-foreground/20" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Route line */}
              <path
                d="M 60 120 Q 120 60 200 80 T 340 40"
                fill="none"
                stroke="#4CAF50"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="12 6"
                className="animate-pulse"
              />
              
              {/* Origin marker */}
              <circle cx="60" cy="120" r="12" fill="#4CAF50" />
              <circle cx="60" cy="120" r="6" fill="white" />
              
              {/* Destination marker */}
              <circle cx="340" cy="40" r="12" fill="#f44336" />
              <circle cx="340" cy="40" r="6" fill="white" />
              
              {/* Car icon on route */}
              <g transform="translate(180, 75)">
                <circle r="14" fill="white" className="shadow-lg" />
                <text x="0" y="5" textAnchor="middle" fontSize="14">🚗</text>
              </g>
            </svg>
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
