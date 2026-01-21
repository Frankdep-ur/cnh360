import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  QrCode,
  CheckCircle2,
  AlertCircle,
  Navigation,
  User,
  Car,
  Shield,
  Loader2,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface LessonStatus {
  gpsValidated: boolean;
  qrCheckin: boolean;
  instructorConfirmed: boolean;
  inProgress: boolean;
  completed: boolean;
  elapsedMinutes: number;
  totalMinutes: number;
}

export default function ValidacaoAula() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<LessonStatus>({
    gpsValidated: false,
    qrCheckin: false,
    instructorConfirmed: false,
    inProgress: false,
    completed: false,
    elapsedMinutes: 0,
    totalMinutes: 60,
  });
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [validatingGPS, setValidatingGPS] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // TODO: Fetch real instructor data from database based on lesson ID
  const [instructor, setInstructor] = useState({
    name: "Instrutor",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    car: "Veículo do instrutor",
  });

  const meetingPoint = {
    address: "Av. Brasil, 1234 - Centro, Araçatuba",
    lat: -21.2090,
    lng: -50.4327,
    radius: 50, // meters
  };

  const validateGPS = async () => {
    setValidatingGPS(true);
    setGpsError(null);
    
    // Simulate GPS validation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock: 80% chance of success
    const success = Math.random() > 0.2;
    
    if (success) {
      setStatus(prev => ({ ...prev, gpsValidated: true }));
    } else {
      setGpsError("Você está fora do raio de 50m do ponto de encontro");
    }
    
    setValidatingGPS(false);
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
    // Simulate scanning
    setTimeout(() => {
      setShowQRScanner(false);
      setStatus(prev => ({ ...prev, qrCheckin: true }));
    }, 2000);
  };

  const startLesson = () => {
    setStatus(prev => ({ 
      ...prev, 
      instructorConfirmed: true,
      inProgress: true 
    }));
  };

  const finishLesson = () => {
    setStatus(prev => ({ 
      ...prev, 
      inProgress: false,
      completed: true,
      elapsedMinutes: prev.totalMinutes
    }));
  };

  // Simulate time passing when lesson is in progress
  useEffect(() => {
    if (status.inProgress && status.elapsedMinutes < status.totalMinutes) {
      const timer = setInterval(() => {
        setStatus(prev => ({
          ...prev,
          elapsedMinutes: Math.min(prev.elapsedMinutes + 1, prev.totalMinutes)
        }));
      }, 1000); // 1 second = 1 minute for demo
      
      return () => clearInterval(timer);
    }
  }, [status.inProgress, status.elapsedMinutes, status.totalMinutes]);

  const progressPercent = (status.elapsedMinutes / status.totalMinutes) * 100;
  const canStartLesson = status.gpsValidated && status.qrCheckin && !status.inProgress && !status.completed;

  return (
    <div className="min-h-screen bg-background pb-8">
      <ComplianceBanner variant="full" />
      
      {/* Header */}
      <header className="bg-card border-b border-border px-6 pt-4 pb-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/aluno/agenda")}
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground">Validação da Aula</h1>
              <p className="text-sm text-muted-foreground">Check-in GPS + QR Code</p>
            </div>
          </div>

          {/* Instructor Info */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
            <img
              src={instructor.photo}
              alt={instructor.name}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{instructor.name}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Car className="w-3 h-3" />
                {instructor.car}
              </p>
            </div>
            {status.instructorConfirmed && (
              <CheckCircle2 className="w-6 h-6 text-primary" />
            )}
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* RENACH Integration Notice */}
          <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-secondary" />
              <div>
                <h3 className="font-medium text-foreground text-sm">Registro Automático RENACH</h3>
                <p className="text-xs text-muted-foreground">
                  Esta aula será registrada automaticamente no sistema do DETRAN
                </p>
              </div>
            </div>
          </div>

          {/* Validation Steps */}
          {!status.completed && (
            <div className="space-y-4">
              {/* Step 1: GPS Validation */}
              <div className={cn(
                "rounded-2xl border-2 p-4 transition-all",
                status.gpsValidated 
                  ? "border-primary bg-primary/5" 
                  : "border-border"
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    status.gpsValidated 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {validatingGPS ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : status.gpsValidated ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <Navigation className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">1. Validação GPS</h3>
                    <p className="text-xs text-muted-foreground">
                      Confirme que está no ponto de encontro (raio: {meetingPoint.radius}m)
                    </p>
                    {gpsError && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                        <XCircle className="w-3 h-3" />
                        {gpsError}
                      </p>
                    )}
                  </div>
                  {!status.gpsValidated && (
                    <Button 
                      size="sm" 
                      onClick={validateGPS}
                      disabled={validatingGPS}
                    >
                      {validatingGPS ? "Validando..." : "Validar"}
                    </Button>
                  )}
                </div>
                
                {/* Meeting Point */}
                <div className="mt-3 p-3 bg-background rounded-xl">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-foreground">{meetingPoint.address}</p>
                      <p className="text-xs text-muted-foreground">Ponto de encontro</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: QR Check-in */}
              <div className={cn(
                "rounded-2xl border-2 p-4 transition-all",
                status.qrCheckin 
                  ? "border-primary bg-primary/5" 
                  : !status.gpsValidated
                  ? "border-border opacity-50"
                  : "border-border"
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    status.qrCheckin 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {showQRScanner ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : status.qrCheckin ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <QrCode className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">2. Check-in QR Code</h3>
                    <p className="text-xs text-muted-foreground">
                      Escaneie o QR do instrutor para confirmar presença
                    </p>
                  </div>
                  {!status.qrCheckin && status.gpsValidated && (
                    <Button 
                      size="sm" 
                      onClick={handleQRScan}
                      disabled={showQRScanner}
                    >
                      Escanear
                    </Button>
                  )}
                </div>
              </div>

              {/* Step 3: Start Lesson */}
              <div className={cn(
                "rounded-2xl border-2 p-4 transition-all",
                status.instructorConfirmed 
                  ? "border-primary bg-primary/5" 
                  : !canStartLesson && !status.inProgress
                  ? "border-border opacity-50"
                  : "border-border"
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    status.instructorConfirmed 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {status.inProgress ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : status.instructorConfirmed ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <User className="w-6 h-6" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">3. Iniciar Aula</h3>
                    <p className="text-xs text-muted-foreground">
                      Aguarde a confirmação do instrutor
                    </p>
                  </div>
                  {canStartLesson && (
                    <Button size="sm" onClick={startLesson}>
                      Iniciar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Lesson In Progress */}
          {status.inProgress && (
            <div className="animate-fade-in">
              <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 text-primary-foreground">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-primary-foreground/80 text-sm">Aula em andamento</p>
                    <h2 className="text-2xl font-bold">
                      {status.elapsedMinutes} / {status.totalMinutes} min
                    </h2>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <Clock className="w-7 h-7" />
                  </div>
                </div>
                
                <Progress value={progressPercent} className="h-3 bg-primary-foreground/20" />
                
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary-foreground animate-pulse" />
                  <span>GPS ativo • Registrando no RENACH</span>
                </div>
              </div>

              {progressPercent >= 100 && (
                <Button 
                  variant="hero" 
                  size="xl" 
                  className="w-full mt-4"
                  onClick={finishLesson}
                >
                  Finalizar Aula
                </Button>
              )}
            </div>
          )}

          {/* Lesson Completed */}
          {status.completed && (
            <div className="animate-fade-in">
              <div className="bg-primary/5 rounded-2xl p-6 border-2 border-primary text-center">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-primary mb-2">Aula Validada!</h2>
                <p className="text-muted-foreground mb-4">
                  {status.totalMinutes} minutos registrados no RENACH
                </p>
                
                <div className="bg-background rounded-xl p-4 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Validação GPS</span>
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Check-in QR</span>
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Assinatura digital</span>
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Log RENACH</span>
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                </div>

                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate("/aluno")}
                >
                  Voltar ao Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
