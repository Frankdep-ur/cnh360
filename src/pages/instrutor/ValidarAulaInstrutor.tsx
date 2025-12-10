import { useState } from "react";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Navigation,
  QrCode,
  Shield,
  AlertTriangle,
  Play,
  Pause,
  Square,
  Camera,
  Mic,
  User
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ValidarAulaInstrutor() {
  const [etapa, setEtapa] = useState<"aguardando" | "em_andamento" | "finalizada">("aguardando");
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  const [gpsValidado, setGpsValidado] = useState(false);
  const [qrValidado, setQrValidado] = useState(false);
  const [gravandoAudio, setGravandoAudio] = useState(false);

  const aula = {
    aluno: "Maria Santos",
    foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    duracao: 60,
    local: "Av. Brasil, 1200 - Centro, Araçatuba",
    valor: 120,
    categoria: "B",
  };

  const handleValidarGPS = () => {
    setTimeout(() => {
      setGpsValidado(true);
    }, 1500);
  };

  const handleScanQR = () => {
    setTimeout(() => {
      setQrValidado(true);
    }, 1000);
  };

  const handleIniciarAula = () => {
    setEtapa("em_andamento");
    // Simular cronômetro
    const interval = setInterval(() => {
      setTempoDecorrido((prev) => {
        if (prev >= aula.duracao) {
          clearInterval(interval);
          return aula.duracao;
        }
        return prev + 1;
      });
    }, 60000); // 1 minuto real = 1 minuto de aula (para demo, seria mais rápido)
  };

  const handleFinalizarAula = () => {
    setEtapa("finalizada");
  };

  const progressoAula = (tempoDecorrido / aula.duracao) * 100;

  return (
    <div className="app-container pb-8">
      <ComplianceBanner />
      
      <div className="px-4 py-6 page-enter space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to="/instrutor/agenda" className="text-muted-foreground hover:text-foreground">
            ← Voltar
          </Link>
          <Badge className="bg-primary/10 text-primary border-0">
            <Shield className="w-3 h-3 mr-1" />
            Validação RENACH
          </Badge>
        </div>

        {/* Info do Aluno */}
        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-4">
            <img 
              src={aula.foto} 
              alt={aula.aluno}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary"
            />
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">{aula.aluno}</h2>
              <p className="text-sm text-muted-foreground">
                Categoria {aula.categoria} | {aula.duracao} minutos
              </p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="truncate">{aula.local}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary">R${aula.valor}</p>
            </div>
          </div>
        </Card>

        {/* Etapa: Aguardando Validação */}
        {etapa === "aguardando" && (
          <>
            <Card className="p-4 shadow-card">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Validação Antifraude
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Para registrar a aula no RENACH, valide sua localização e confirme a presença do aluno.
              </p>

              {/* GPS Validation */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${gpsValidado ? "bg-primary/20" : "bg-muted"}`}>
                      <Navigation className={`w-5 h-5 ${gpsValidado ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Localização GPS</p>
                      <p className="text-xs text-muted-foreground">
                        {gpsValidado ? "Validado - Raio de 50m confirmado" : "Valide sua localização"}
                      </p>
                    </div>
                  </div>
                  {gpsValidado ? (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  ) : (
                    <Button size="sm" onClick={handleValidarGPS}>
                      Validar
                    </Button>
                  )}
                </div>

                {/* QR Code Validation */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${qrValidado ? "bg-primary/20" : "bg-muted"}`}>
                      <QrCode className={`w-5 h-5 ${qrValidado ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Check-in do Aluno</p>
                      <p className="text-xs text-muted-foreground">
                        {qrValidado ? "Presença confirmada" : "Escaneie o QR do aluno"}
                      </p>
                    </div>
                  </div>
                  {qrValidado ? (
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  ) : (
                    <Button size="sm" onClick={handleScanQR} disabled={!gpsValidado}>
                      <Camera className="w-4 h-4 mr-1" />
                      Escanear
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Aviso LGPD */}
            <Card className="p-4 shadow-soft bg-amber-500/10 border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground text-sm">Monitoramento Eletrônico</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Conforme Res. CONTRAN 1.020/2025, esta aula será monitorada via GPS. 
                    Gravação de áudio é opcional e requer consentimento do aluno.
                  </p>
                </div>
              </div>
            </Card>

            {/* Botão Iniciar */}
            <Button 
              size="lg" 
              className="w-full gradient-primary text-primary-foreground shadow-glow-primary"
              disabled={!gpsValidado || !qrValidado}
              onClick={handleIniciarAula}
            >
              <Play className="w-5 h-5 mr-2" />
              Iniciar Aula
            </Button>
          </>
        )}

        {/* Etapa: Em Andamento */}
        {etapa === "em_andamento" && (
          <>
            <Card className="p-6 shadow-card bg-gradient-to-br from-primary/5 to-secondary/5">
              <div className="text-center">
                <Badge className="bg-primary text-primary-foreground mb-4">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse mr-2" />
                  Aula em Andamento
                </Badge>
                
                <div className="text-5xl font-bold text-foreground mb-2">
                  {Math.floor(tempoDecorrido)}:{String(Math.floor((tempoDecorrido % 1) * 60)).padStart(2, '0')}
                </div>
                <p className="text-muted-foreground mb-4">
                  de {aula.duracao} minutos
                </p>
                
                <Progress value={progressoAula} className="h-3 mb-4" />
                
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Navigation className="w-4 h-4 text-primary" />
                  GPS ativo - Monitorando trajeto
                </div>
              </div>
            </Card>

            {/* Controles */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 shadow-card">
                <button 
                  className="w-full flex flex-col items-center gap-2"
                  onClick={() => setGravandoAudio(!gravandoAudio)}
                >
                  <div className={`p-3 rounded-full ${gravandoAudio ? "bg-destructive/20" : "bg-muted"}`}>
                    <Mic className={`w-6 h-6 ${gravandoAudio ? "text-destructive" : "text-muted-foreground"}`} />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {gravandoAudio ? "Gravando..." : "Gravar Áudio"}
                  </span>
                  <span className="text-xs text-muted-foreground">Opcional - LGPD</span>
                </button>
              </Card>
              
              <Card className="p-4 shadow-card">
                <div className="w-full flex flex-col items-center gap-2">
                  <div className="p-3 rounded-full bg-primary/20">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{aula.aluno}</span>
                  <span className="text-xs text-muted-foreground">Categoria {aula.categoria}</span>
                </div>
              </Card>
            </div>

            {/* Info em tempo real */}
            <Card className="p-4 shadow-card">
              <h4 className="font-semibold text-foreground mb-3">Registro RENACH</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Início</span>
                  <span className="font-medium text-foreground">14:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Coordenadas</span>
                  <span className="font-medium text-foreground">-21.2091, -50.4325</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Distância percorrida</span>
                  <span className="font-medium text-foreground">4.2 km</span>
                </div>
              </div>
            </Card>

            {/* Botão Finalizar */}
            <Button 
              size="lg" 
              variant="destructive"
              className="w-full"
              onClick={handleFinalizarAula}
            >
              <Square className="w-5 h-5 mr-2" />
              Finalizar Aula
            </Button>
          </>
        )}

        {/* Etapa: Finalizada */}
        {etapa === "finalizada" && (
          <>
            <Card className="p-6 shadow-card text-center">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10 text-primary" />
              </div>
              
              <h2 className="text-xl font-bold text-foreground mb-2">Aula Registrada!</h2>
              <p className="text-muted-foreground mb-4">
                A aula foi validada e enviada para o RENACH
              </p>
              
              <Badge className="bg-primary/10 text-primary border-0 mb-6">
                <Shield className="w-3 h-3 mr-1" />
                Hash: CNH360-2025-{Math.random().toString(36).substring(7).toUpperCase()}
              </Badge>
            </Card>

            <Card className="p-4 shadow-card">
              <h4 className="font-semibold text-foreground mb-3">Resumo da Aula</h4>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Aluno</span>
                  <span className="font-medium text-foreground">{aula.aluno}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Duração validada</span>
                  <span className="font-medium text-foreground">{aula.duracao} min (1h)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Distância total</span>
                  <span className="font-medium text-foreground">8.7 km</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Valor bruto</span>
                  <span className="font-medium text-foreground">R$ {aula.valor}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Taxa (28%)</span>
                  <span className="font-medium text-destructive">- R$ {(aula.valor * 0.28).toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 bg-primary/5 rounded-lg px-2 -mx-2">
                  <span className="font-semibold text-foreground">Você recebe</span>
                  <span className="font-bold text-primary text-lg">R$ {(aula.valor * 0.72).toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Pagamento liberado em até 24h
              </p>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Link to="/instrutor/agenda">
                <Button variant="outline" className="w-full">
                  <Clock className="w-4 h-4 mr-1" />
                  Ver Agenda
                </Button>
              </Link>
              <Link to="/instrutor/ganhos">
                <Button className="w-full gradient-primary text-primary-foreground">
                  Ver Ganhos
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
