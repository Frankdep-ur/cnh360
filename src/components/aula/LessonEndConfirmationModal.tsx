import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  User, 
  MapPin, 
  ShieldCheck,
  Loader2,
  Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { differenceInSeconds, differenceInMinutes } from 'date-fns';

interface LessonEndConfirmationModalProps {
  isOpen: boolean;
  aula: {
    id: string;
    ponto_encontro: string | null;
    valor: number;
    duracao_minutos: number;
    qr_code_data: string | null;
    qr_code_expires_at: string | null;
    aula_inicio: string | null;
    aula_fim: string | null;
  };
  instrutor: {
    nome: string;
    foto: string | null;
  };
  onRefreshQR: () => Promise<void>;
  isRefreshing: boolean;
}

export function LessonEndConfirmationModal({
  isOpen,
  aula,
  instrutor,
  onRefreshQR,
  isRefreshing,
}: LessonEndConfirmationModalProps) {
  const [countdown, setCountdown] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [elapsedTime, setElapsedTime] = useState<string>('');

  // Calculate elapsed time
  useEffect(() => {
    if (!aula.aula_inicio) return;

    const updateElapsedTime = () => {
      const startTime = new Date(aula.aula_inicio!);
      const endTime = aula.aula_fim ? new Date(aula.aula_fim) : new Date();
      const minutes = differenceInMinutes(endTime, startTime);
      setElapsedTime(`${minutes} min`);
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 30000);
    return () => clearInterval(interval);
  }, [aula.aula_inicio, aula.aula_fim]);

  // QR Code countdown
  useEffect(() => {
    if (!aula.qr_code_expires_at) return;

    const updateCountdown = () => {
      const expiresAt = new Date(aula.qr_code_expires_at!);
      const now = new Date();
      const secondsRemaining = differenceInSeconds(expiresAt, now);

      if (secondsRemaining <= 0) {
        setCountdown('Expirado');
        setIsExpired(true);
        return;
      }

      setIsExpired(false);
      const minutes = Math.floor(secondsRemaining / 60);
      const seconds = secondsRemaining % 60;
      setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [aula.qr_code_expires_at]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center px-4 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">Aula Finalizada!</h1>
            <p className="text-xs text-muted-foreground">
              Mostre o QR Code para o instrutor
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Instructor Info */}
        <div className="px-4 pt-6 pb-4">
          <div className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border">
            {instrutor.foto ? (
              <img
                src={instrutor.foto}
                alt={instrutor.nome}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <User className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1">
              <p className="font-medium text-foreground">{instrutor.nome}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Timer className="w-3 h-3" />
                <span>Duração: {elapsedTime || `${aula.duracao_minutos} min`}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">
                R$ {aula.valor.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
        </div>

        {/* QR Code Area */}
        <div className="px-4 py-2">
          <div className="bg-card rounded-2xl border border-border p-6 flex flex-col items-center">
            {/* QR Code */}
            <div className={cn(
              "bg-white rounded-2xl p-4 shadow-md transition-opacity",
              isExpired && "opacity-50"
            )}>
              {aula.qr_code_data ? (
                <QRCodeSVG
                  value={aula.qr_code_data}
                  size={200}
                  level="H"
                  includeMargin={false}
                />
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center bg-muted rounded-lg">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Expiration Timer */}
            <div className={cn(
              "mt-4 flex items-center gap-2 px-4 py-2 rounded-full",
              isExpired 
                ? "bg-destructive/10 text-destructive" 
                : "bg-amber-500/10 text-amber-600"
            )}>
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isExpired ? 'QR Code expirado' : `Expira em ${countdown}`}
              </span>
            </div>

            {/* Refresh Button */}
            {isExpired && (
              <Button
                variant="outline"
                size="lg"
                className="mt-4 w-full"
                onClick={onRefreshQR}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Atualizar QR Code
              </Button>
            )}

            {/* Waiting message */}
            {!isExpired && (
              <div className="mt-4 flex items-center gap-2 text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm">Aguardando instrutor escanear...</span>
              </div>
            )}
          </div>
        </div>

        {/* Location */}
        {aula.ponto_encontro && (
          <div className="px-4 py-2">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{aula.ponto_encontro}</span>
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer Info */}
        <div className="px-4 pb-8 safe-bottom">
          <div className="bg-muted/50 rounded-xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Validação de segurança
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                O instrutor precisa escanear este QR Code para confirmar a conclusão da aula e liberar o pagamento.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
