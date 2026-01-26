import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '@/components/ui/card';
import { Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QRCodeDisplayProps {
  qrData: string;
  expiresAt: string | null;
  onRefresh?: () => void;
  className?: string;
}

export function QRCodeDisplay({ qrData, expiresAt, onRefresh, className }: QRCodeDisplayProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!expiresAt) return;

    const updateTimer = () => {
      const now = Date.now();
      const expiry = new Date(expiresAt).getTime();
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
      
      setTimeRemaining(remaining);
      setIsExpired(remaining === 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isExpired) {
    return (
      <Card className={cn("p-6 text-center", className)}>
        <div className="w-48 h-48 mx-auto bg-muted/50 rounded-2xl flex items-center justify-center mb-4">
          <RefreshCw className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">QR Code expirado</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Peça ao instrutor para gerar um novo código
        </p>
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className={cn("p-6 text-center", className)}>
      <div className="bg-white p-4 rounded-2xl inline-block mb-4 shadow-lg">
        <QRCodeSVG
          value={qrData}
          size={200}
          level="H"
          includeMargin={false}
          bgColor="#FFFFFF"
          fgColor="#000000"
        />
      </div>
      
      <h3 className="font-semibold text-foreground mb-2">
        Mostre este QR Code para o instrutor
      </h3>
      
      {expiresAt && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Expira em {formatTime(timeRemaining)}</span>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-4">
        O instrutor irá escanear este código para validar a conclusão da aula
      </p>
    </Card>
  );
}
