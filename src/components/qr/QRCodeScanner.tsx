import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, X, Loader2, AlertCircle } from 'lucide-react';

interface QRCodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function QRCodeScanner({ open, onClose, onScan, isLoading, error }: QRCodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING
          await scannerRef.current.stop();
        }
      } catch (e) {
        console.log("Scanner stop error:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!open) {
      stopScanner();
      return;
    }

    const startScanner = async () => {
      setIsInitializing(true);
      setCameraError(null);

      try {
        // Small delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 50));

        if (!containerRef.current) return;

        scannerRef.current = new Html5Qrcode("qr-reader", {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });

        await scannerRef.current.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
              const size = Math.floor(Math.min(viewfinderWidth, viewfinderHeight) * 0.7);
              return { width: size, height: size };
            },
            disableFlip: true,
          } as any,
          (decodedText) => {
            console.log("QR scanned:", decodedText);
            onScan(decodedText);
          },
          () => {
            // QR code not found - silent
          }
        );

        setIsInitializing(false);
      } catch (err: any) {
        console.error("Camera error:", err);
        setIsInitializing(false);
        
        if (err.name === 'NotAllowedError') {
          setCameraError("Permissão de câmera negada. Habilite nas configurações do navegador.");
        } else if (err.name === 'NotFoundError') {
          setCameraError("Nenhuma câmera encontrada no dispositivo.");
        } else {
          setCameraError("Erro ao acessar câmera. Tente novamente.");
        }
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [open, onScan, stopScanner]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Escanear QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          {isInitializing && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg z-10">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Iniciando câmera...</p>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg z-10">
              <div className="text-center p-4">
                <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="text-sm text-destructive">{cameraError}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute bottom-4 left-4 right-4 bg-destructive/90 text-destructive-foreground p-3 rounded-lg z-20">
              <p className="text-sm text-center">{error}</p>
            </div>
          )}

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Validando...</p>
              </div>
            </div>
          )}

          <div 
            ref={containerRef}
            id="qr-reader" 
            className="w-full aspect-square rounded-lg overflow-hidden bg-muted"
          />
        </div>

        <div className="flex justify-center">
          <Button variant="outline" onClick={onClose} className="w-full">
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          Aponte a câmera para o QR Code no celular do aluno
        </p>
      </DialogContent>
    </Dialog>
  );
}
