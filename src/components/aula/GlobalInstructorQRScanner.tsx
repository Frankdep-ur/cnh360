import { useState, useEffect, useCallback } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { 
  QrCode, 
  X, 
  Loader2, 
  User, 
  Clock, 
  MapPin,
  Camera,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalInstructorLessonMonitor } from '@/hooks/useGlobalInstructorLessonMonitor';
import { differenceInSeconds } from 'date-fns';

export function GlobalInstructorQRScanner() {
  const { 
    activeLesson, 
    needsQRScan, 
    isScanning, 
    scanQR,
    dismissScanner 
  } = useGlobalInstructorLessonMonitor();
  
  const [scannerReady, setScannerReady] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [qrExpiryCountdown, setQrExpiryCountdown] = useState<string>('');

  // Block body scroll when modal is open
  useEffect(() => {
    if (needsQRScan) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [needsQRScan]);

  // QR Code expiration countdown
  useEffect(() => {
    if (!activeLesson?.qr_code_inicio_expires_at || !needsQRScan) return;

    const updateCountdown = () => {
      const expiresAt = new Date(activeLesson.qr_code_inicio_expires_at!);
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
  }, [activeLesson?.qr_code_inicio_expires_at, needsQRScan]);

  // Initialize scanner
  useEffect(() => {
    if (!needsQRScan || !activeLesson) {
      setScannerReady(false);
      return;
    }

    let scanner: Html5QrcodeScanner | null = null;

    const initScanner = () => {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById('instructor-qr-scanner');
        if (!element) return;

        scanner = new Html5QrcodeScanner(
          'instructor-qr-scanner',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
            rememberLastUsedCamera: true,
            showTorchButtonIfSupported: true,
          },
          false
        );

        scanner.render(
          async (decodedText) => {
            console.log('QR scanned by instructor:', decodedText);
            setScanError(null);
            
            // Stop scanner before processing
            if (scanner) {
              try {
                await scanner.clear();
              } catch (e) {
                console.log('Scanner clear error:', e);
              }
            }
            
            const success = await scanQR(decodedText);
            if (!success) {
              setScanError('QR Code inválido. Tente novamente.');
              // Reinitialize scanner after error
              setTimeout(initScanner, 1000);
            }
          },
          (error) => {
            // Ignore scan errors (camera not pointed at QR)
          }
        );

        setScannerReady(true);
      }, 300);
    };

    initScanner();

    return () => {
      if (scanner) {
        try {
          scanner.clear();
        } catch (e) {
          console.log('Scanner cleanup error:', e);
        }
      }
    };
  }, [needsQRScan, activeLesson, scanQR]);

  if (!needsQRScan || !activeLesson) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Camera className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-foreground">Escanear QR Code</h1>
            <p className="text-xs text-muted-foreground">Aponte para o celular do aluno</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={dismissScanner}
          className="text-muted-foreground"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Student Info Card */}
      <div className="px-4 py-3 bg-muted/30">
        <div className="flex items-center gap-3">
          {activeLesson.aluno_foto ? (
            <img
              src={activeLesson.aluno_foto}
              alt={activeLesson.aluno_nome}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <User className="w-6 h-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">{activeLesson.aluno_nome}</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {activeLesson.duracao_minutos} min
              </span>
              <span className="text-primary font-medium">
                R$ {activeLesson.valor.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>
          {qrExpiryCountdown && (
            <div className={cn(
              "px-2 py-1 rounded-full text-xs font-mono font-bold",
              qrExpiryCountdown === 'Expirado' 
                ? "bg-destructive/10 text-destructive" 
                : "bg-primary/10 text-primary"
            )}>
              {qrExpiryCountdown}
            </div>
          )}
        </div>
        {activeLesson.ponto_encontro && (
          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{activeLesson.ponto_encontro}</span>
          </div>
        )}
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        {isScanning ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Validando QR Code...</p>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            <div 
              id="instructor-qr-scanner" 
              className="rounded-2xl overflow-hidden bg-black"
            />
            
            {scanError && (
              <div className="mt-4 p-3 bg-destructive/10 rounded-lg text-center">
                <p className="text-sm text-destructive">{scanError}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="px-6 pb-8 safe-bottom">
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <QrCode className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Escaneie o QR Code do aluno
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                O aluno deve mostrar o QR Code exibido no app dele. 
                Após o scan, a aula iniciará automaticamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
