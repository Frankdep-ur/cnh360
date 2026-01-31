import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { 
  QrCode, 
  X, 
  Loader2, 
  User, 
  Clock, 
  MapPin,
  Camera,
  CheckCircle2,
  Scan,
  AlertTriangle,
  Timer,
  PartyPopper
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalInstructorLessonMonitor, ScanType } from '@/hooks/useGlobalInstructorLessonMonitor';
import { differenceInSeconds, differenceInMinutes } from 'date-fns';

type ScannerPhase = 'confirmation' | 'scanning' | 'validating' | 'success';

export function GlobalInstructorQRScanner() {
  const { 
    activeLesson, 
    needsQRScan, 
    scanType,
    isScanning: isValidating, 
    scanQR,
    dismissScanner 
  } = useGlobalInstructorLessonMonitor();
  
  const [phase, setPhase] = useState<ScannerPhase>('confirmation');
  const [scanError, setScanError] = useState<string | null>(null);
  const [qrExpiryCountdown, setQrExpiryCountdown] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  // Determine which QR expiry to use based on scan type
  const qrExpiresAt = useMemo(() => {
    if (!activeLesson) return null;
    return scanType === 'inicio' 
      ? activeLesson.qr_code_inicio_expires_at 
      : activeLesson.qr_code_expires_at;
  }, [activeLesson, scanType]);

  // Calculate elapsed time for finalization
  const elapsedTime = useMemo(() => {
    if (!activeLesson?.aula_inicio) return null;
    const startTime = new Date(activeLesson.aula_inicio);
    const endTime = activeLesson.aula_fim ? new Date(activeLesson.aula_fim) : new Date();
    const minutes = differenceInMinutes(endTime, startTime);
    return `${minutes} min`;
  }, [activeLesson?.aula_inicio, activeLesson?.aula_fim]);

  // Reset to confirmation phase when modal opens
  useEffect(() => {
    if (needsQRScan) {
      setPhase('confirmation');
      setScanError(null);
      setCameraError(null);
    }
  }, [needsQRScan]);

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
    if (!qrExpiresAt || !needsQRScan) return;

    const updateCountdown = () => {
      const expiresAt = new Date(qrExpiresAt);
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
  }, [qrExpiresAt, needsQRScan]);

  // Stop scanner when not in scanning phase
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING
          await scannerRef.current.stop();
        }
      } catch (e) {
        console.log('Scanner stop error:', e);
      }
      scannerRef.current = null;
    }
  }, []);

  // Cleanup on unmount or phase change
  useEffect(() => {
    if (phase !== 'scanning') {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [phase, stopScanner]);

  // Handle QR scan result
  const handleScanResult = useCallback(async (decodedText: string) => {
    console.log('QR scanned by instructor:', decodedText);
    setScanError(null);
    setPhase('validating');
    
    // Stop scanner before processing
    await stopScanner();
    
    const success = await scanQR(decodedText);
    
    if (success) {
      setPhase('success');
    } else {
      const errorMsg = scanType === 'inicio'
        ? 'QR Code inválido ou expirado. Peça ao aluno para atualizar.'
        : 'QR Code inválido ou expirado. Peça ao aluno para gerar novo.';
      setScanError(errorMsg);
      setPhase('confirmation');
    }
  }, [scanQR, stopScanner, scanType]);

  // Start camera when entering scanning phase
  const startCamera = useCallback(async () => {
    setPhase('scanning');
    setScanError(null);
    setCameraError(null);

    // Wait for DOM to be ready
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      scannerRef.current = new Html5Qrcode('instructor-qr-reader');

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        handleScanResult,
        () => {
          // QR code not found - silent
        }
      );
    } catch (err: any) {
      console.error('Camera error:', err);
      
      if (err.name === 'NotAllowedError') {
        setCameraError('Permissão de câmera negada. Habilite nas configurações do navegador.');
      } else if (err.name === 'NotFoundError') {
        setCameraError('Nenhuma câmera encontrada no dispositivo.');
      } else {
        setCameraError('Erro ao acessar câmera. Verifique as permissões.');
      }
      
      setPhase('confirmation');
    }
  }, [handleScanResult]);

  // Handle dismiss
  const handleDismiss = useCallback(() => {
    stopScanner();
    setPhase('confirmation');
    dismissScanner();
  }, [stopScanner, dismissScanner]);

  // Handle back to confirmation
  const handleBackToConfirmation = useCallback(() => {
    stopScanner();
    setPhase('confirmation');
  }, [stopScanner]);

  if (!needsQRScan || !activeLesson) return null;

  // Determine UI based on scan type
  const isStartScan = scanType === 'inicio';
  const headerTitle = isStartScan ? 'Iniciar Aula' : 'Concluir Aula';
  const headerSubtitle = isStartScan 
    ? 'O aluno está pronto para a aula' 
    : 'Escaneie para finalizar e liberar pagamento';
  const headerIcon = isStartScan ? QrCode : PartyPopper;
  const HeaderIconComponent = headerIcon;
  const headerBgColor = isStartScan ? 'bg-primary' : 'bg-green-500';
  const buttonText = isStartScan 
    ? 'Escanear QR Code do Aluno' 
    : 'Escanear QR para CONCLUIR';
  const successTitle = isStartScan ? 'Aula Iniciada!' : 'Aula Concluída!';
  const successMessage = isStartScan 
    ? 'O cronômetro começou. Boa aula!' 
    : 'Pagamento liberado! Parabéns pela aula.';

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", headerBgColor)}>
            {phase === 'scanning' ? (
              <Camera className="w-5 h-5 text-white" />
            ) : (
              <HeaderIconComponent className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h1 className="font-bold text-foreground">
              {phase === 'scanning' ? 'Escaneando...' : headerTitle}
            </h1>
            <p className="text-xs text-muted-foreground">
              {phase === 'scanning' 
                ? 'Aponte para o QR Code do aluno' 
                : headerSubtitle}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={phase === 'scanning' ? handleBackToConfirmation : handleDismiss}
          className="text-muted-foreground"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content based on phase */}
      {phase === 'confirmation' && (
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Student Info Card */}
          <div className="px-4 py-6">
            <div className="bg-card rounded-2xl p-6 shadow-elevated border border-border">
              <div className="flex items-center gap-4 mb-6">
                {activeLesson.aluno_foto ? (
                  <img
                    src={activeLesson.aluno_foto}
                    alt={activeLesson.aluno_nome}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                    <User className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-foreground">{activeLesson.aluno_nome}</h3>
                  <div className={cn(
                    "flex items-center gap-1 text-sm mt-1",
                    isStartScan ? "text-green-600" : "text-primary"
                  )}>
                    {isStartScan ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Presença confirmada</span>
                      </>
                    ) : (
                      <>
                        <Timer className="w-4 h-4" />
                        <span>Duração: {elapsedTime || `${activeLesson.duracao_minutos} min`}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground">{activeLesson.duracao_minutos} minutos</span>
                </div>
                
                {activeLesson.ponto_encontro && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground truncate">{activeLesson.ponto_encontro}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                <span className="text-muted-foreground">Valor da aula</span>
                <span className="text-2xl font-bold text-primary">
                  R$ {activeLesson.valor.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>

          {/* QR Expiry Warning */}
          {qrExpiryCountdown && (
            <div className="px-4 pb-4">
              <div className={cn(
                "flex items-center justify-center gap-2 py-3 rounded-xl",
                qrExpiryCountdown === 'Expirado' 
                  ? "bg-destructive/10 text-destructive" 
                  : "bg-amber-500/10 text-amber-600"
              )}>
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {qrExpiryCountdown === 'Expirado' 
                    ? 'QR do aluno expirou. Peça para atualizar.' 
                    : `QR Code expira em ${qrExpiryCountdown}`}
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {(scanError || cameraError) && (
            <div className="px-4 pb-4">
              <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <p className="text-sm text-destructive font-medium">
                    {cameraError || scanError}
                  </p>
                  {cameraError && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Verifique as permissões do navegador e tente novamente.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="px-4 pb-4">
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Scan className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Como funciona
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    1. Clique no botão abaixo<br />
                    2. Aponte a câmera para o celular do aluno<br />
                    {isStartScan 
                      ? '3. A aula iniciará automaticamente após a validação'
                      : '3. O pagamento será liberado automaticamente'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Action Button */}
          <div className="px-4 pb-8 safe-bottom">
            <Button
              variant="hero"
              size="xl"
              className={cn("w-full", !isStartScan && "bg-green-600 hover:bg-green-700")}
              onClick={startCamera}
              disabled={qrExpiryCountdown === 'Expirado'}
            >
              <Camera className="w-5 h-5 mr-2" />
              {buttonText}
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              className="w-full mt-3 text-muted-foreground"
              onClick={handleDismiss}
            >
              Fazer depois
            </Button>
          </div>
        </div>
      )}

      {phase === 'scanning' && (
        <div className="flex-1 flex flex-col bg-black relative">
          {/* Camera View */}
          <div 
            ref={scannerContainerRef}
            id="instructor-qr-reader" 
            className="flex-1 w-full"
          />

          {/* Overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col">
            {/* Top overlay */}
            <div className="flex-1 bg-black/50" />
            
            {/* Middle section with cutout */}
            <div className="flex">
              <div className="flex-1 bg-black/50" />
              <div className="w-64 h-64 relative">
                {/* Corner decorations */}
                <div className={cn(
                  "absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg",
                  isStartScan ? "border-primary" : "border-green-500"
                )} />
                <div className={cn(
                  "absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg",
                  isStartScan ? "border-primary" : "border-green-500"
                )} />
                <div className={cn(
                  "absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg",
                  isStartScan ? "border-primary" : "border-green-500"
                )} />
                <div className={cn(
                  "absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-lg",
                  isStartScan ? "border-primary" : "border-green-500"
                )} />
                
                {/* Scanning animation line */}
                <div className={cn(
                  "absolute inset-x-4 top-1/2 h-0.5 bg-gradient-to-r from-transparent to-transparent animate-pulse",
                  isStartScan ? "via-primary" : "via-green-500"
                )} />
              </div>
              <div className="flex-1 bg-black/50" />
            </div>
            
            {/* Bottom overlay with instructions */}
            <div className="flex-1 bg-black/50 flex flex-col items-center justify-start pt-8">
              <p className="text-white text-center text-sm font-medium px-4">
                {isStartScan 
                  ? 'Posicione o QR Code do aluno dentro do quadro'
                  : 'Escaneie o QR Code para CONCLUIR a aula'}
              </p>
              <p className="text-white/60 text-center text-xs mt-2 px-4">
                A câmera irá detectar automaticamente
              </p>
            </div>
          </div>

          {/* Cancel button at bottom */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center safe-bottom">
            <Button
              variant="secondary"
              size="lg"
              onClick={handleBackToConfirmation}
              className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {phase === 'validating' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Validando...</h2>
          <p className="text-muted-foreground text-center">
            {isStartScan 
              ? 'Verificando QR Code e iniciando a aula'
              : 'Concluindo aula e liberando pagamento'}
          </p>
        </div>
      )}

      {phase === 'success' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center mb-6",
            isStartScan ? "bg-green-500" : "bg-green-500"
          )}>
            {isStartScan ? (
              <CheckCircle2 className="w-12 h-12 text-white" />
            ) : (
              <PartyPopper className="w-12 h-12 text-white" />
            )}
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">{successTitle}</h2>
          <p className="text-muted-foreground text-center">
            {successMessage}
          </p>
          {!isStartScan && (
            <div className="mt-4 px-6 py-3 bg-green-500/10 rounded-xl">
              <p className="text-green-600 font-bold text-lg">
                R$ {activeLesson.valor.toFixed(2).replace('.', ',')}
              </p>
              <p className="text-green-600 text-sm">creditado na sua conta</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
