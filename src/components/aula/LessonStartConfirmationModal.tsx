import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  X, 
  MapPin, 
  Clock, 
  User,
  Loader2,
  Car,
  QrCode
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, differenceInSeconds } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface InstructorInfo {
  nome: string;
  foto?: string | null;
}

interface LessonStartConfirmationModalProps {
  isOpen: boolean;
  aula: {
    id: string;
    ponto_encontro?: string | null;
    valor: number;
    duracao_minutos: number;
    data_hora: string;
    qr_code_inicio_data?: string | null;
    qr_code_inicio_expires_at?: string | null;
    aluno_pronto_para_aula?: boolean;
  };
  instrutor: InstructorInfo;
  onConfirm: () => Promise<void>;
  onReject: () => void;
  isConfirming: boolean;
  isWaitingForScan: boolean;
}

export function LessonStartConfirmationModal({
  isOpen,
  aula,
  instrutor,
  onConfirm,
  onReject,
  isConfirming,
  isWaitingForScan,
}: LessonStartConfirmationModalProps) {
  const [qrExpiryCountdown, setQrExpiryCountdown] = useState<string>('');
  const hasConfirmed = aula.aluno_pronto_para_aula;

  // Block body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // QR Code expiration countdown
  useEffect(() => {
    if (!aula.qr_code_inicio_expires_at || !hasConfirmed) return;

    const updateCountdown = () => {
      const expiresAt = new Date(aula.qr_code_inicio_expires_at!);
      const now = new Date();
      const secondsRemaining = differenceInSeconds(expiresAt, now);

      if (secondsRemaining <= 0) {
        setQrExpiryCountdown('Expirado');
        return;
      }

      const minutes = Math.floor(secondsRemaining / 60);
      const seconds = secondsRemaining % 60;
      setQrExpiryCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [aula.qr_code_inicio_expires_at, hasConfirmed]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col">
      {/* Content container */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md text-center">
          {/* Conditional content based on state */}
          {!hasConfirmed ? (
            /* PRE-CONFIRMATION STATE */
            <>
              {/* Icon */}
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mx-auto shadow-glow-primary">
                  <Car className="w-12 h-12 text-primary-foreground" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Instrutor chegou!
              </h1>
              <p className="text-muted-foreground mb-8">
                Confirme sua presença para iniciar a aula
              </p>

              {/* Instructor Info Card */}
              <div className="bg-card rounded-2xl p-6 shadow-elevated mb-8 text-left">
                <div className="flex items-center gap-4 mb-6">
                  {instrutor.foto ? (
                    <img
                      src={instrutor.foto}
                      alt={instrutor.nome}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                      <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{instrutor.nome}</h3>
                    <p className="text-sm text-muted-foreground">está pronto para sua aula</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {aula.ponto_encontro && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-foreground">{aula.ponto_encontro}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground">{aula.duracao_minutos} minutos</span>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                  <span className="text-muted-foreground">Valor</span>
                  <span className="text-2xl font-bold text-primary">
                    R$ {Number(aula.valor).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  variant="hero"
                  size="xl"
                  className="w-full"
                  onClick={onConfirm}
                  disabled={isConfirming}
                >
                  {isConfirming ? (
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5 mr-2" />
                  )}
                  Confirmar início da aula
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={onReject}
                  disabled={isConfirming}
                >
                  <X className="w-5 h-5 mr-2" />
                  Não estou no local
                </Button>
              </div>
            </>
          ) : (
            /* POST-CONFIRMATION STATE - Show QR Code */
            <>
              {/* Icon */}
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-purple-500 flex items-center justify-center mx-auto shadow-lg">
                  <QrCode className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Mostre este QR Code
              </h1>
              <p className="text-muted-foreground mb-6">
                O instrutor irá escanear para iniciar a aula
              </p>

              {/* QR Code */}
              {aula.qr_code_inicio_data && (
                <div className="bg-white p-6 rounded-2xl shadow-elevated inline-block mb-6">
                  <QRCodeSVG
                    value={aula.qr_code_inicio_data}
                    size={200}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              )}

              {/* Expiry countdown */}
              {qrExpiryCountdown && (
                <div className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6",
                  qrExpiryCountdown === 'Expirado' 
                    ? "bg-destructive/10 text-destructive" 
                    : "bg-primary/10 text-primary"
                )}>
                  <Clock className="w-4 h-4" />
                  <span className="font-mono font-bold">
                    {qrExpiryCountdown === 'Expirado' ? 'Expirado' : `Expira em ${qrExpiryCountdown}`}
                  </span>
                </div>
              )}

              {/* Waiting indicator */}
              {isWaitingForScan && (
                <div className="flex items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Aguardando instrutor escanear...</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Safety notice */}
      <div className="px-6 pb-8 safe-bottom">
        <div className="max-w-md mx-auto bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground">
            🔒 A validação por QR Code garante a presença real de ambas as partes
          </p>
        </div>
      </div>
    </div>
  );
}
