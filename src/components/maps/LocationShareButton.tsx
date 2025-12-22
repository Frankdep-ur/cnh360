import { useState } from 'react';
import { MapPin, Loader2, Navigation, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGeolocation } from '@/hooks/useGeolocation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface LocationShareButtonProps {
  onLocationShared?: (location: { latitude: number; longitude: number; address: string }) => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export function LocationShareButton({ 
  onLocationShared, 
  className,
  variant = 'default'
}: LocationShareButtonProps) {
  const [shared, setShared] = useState(false);
  const { loading, getCurrentLocation } = useGeolocation();

  const handleShare = async () => {
    const location = await getCurrentLocation();
    
    if (location) {
      setShared(true);
      toast.success('Localização compartilhada!', {
        description: location.address,
      });
      onLocationShared?.(location);
    } else {
      toast.error('Não foi possível obter sua localização', {
        description: 'Verifique as permissões do navegador',
      });
    }
  };

  if (shared) {
    return (
      <Button
        variant="outline"
        className={cn("bg-primary/10 border-primary text-primary", className)}
        disabled
      >
        <Check className="w-4 h-4 mr-2" />
        Localização Enviada
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      onClick={handleShare}
      disabled={loading}
      className={cn(
        "bg-[#4CAF50] hover:bg-[#45a049] text-white",
        className
      )}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Obtendo localização...
        </>
      ) : (
        <>
          <Navigation className="w-4 h-4 mr-2" />
          Compartilhar Localização
        </>
      )}
    </Button>
  );
}
