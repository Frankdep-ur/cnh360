import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Trophy,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/layout/BottomNav";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { cn } from "@/lib/utils";

const examLocations = [
  { id: 1, name: "CIRETRAN Regional", address: "Av. Brasília, 1500 - Centro", available: true },
  { id: 2, name: "DETRAN Birigui", address: "Rua São Paulo, 800", available: true },
  { id: 3, name: "CIRETRAN Penápolis", address: "Av. Brasil, 2200", available: false },
];

const availableDates = [
  { date: "15/01", weekday: "Seg", slots: 3 },
  { date: "16/01", weekday: "Ter", slots: 5 },
  { date: "17/01", weekday: "Qua", slots: 2 },
  { date: "18/01", weekday: "Qui", slots: 0 },
  { date: "19/01", weekday: "Sex", slots: 4 },
];

const availableTimes = ["08:00", "09:30", "11:00", "14:00", "15:30"];

export default function ExamePratico() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"info" | "schedule" | "result">("info");
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [examResult, setExamResult] = useState<"pending" | "approved" | "failed" | null>(null);
  const [examScore, setExamScore] = useState<number | null>(null);
  const [canRetry, setCanRetry] = useState(true);

  const practicalHoursCompleted = 2;
  const requiredHours = 2;
  const canScheduleExam = practicalHoursCompleted >= requiredHours;

  const handleScheduleExam = () => {
    // Mock scheduling
    setStep("result");
    setExamResult("pending");
  };

  const handleShowResult = (result: "approved" | "failed") => {
    setExamResult(result);
    setExamScore(result === "approved" ? 7 : 12);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <ComplianceBanner variant="full" />
      
      {/* Header */}
      <header className="bg-card border-b border-border px-6 pt-4 pb-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/aluno")}
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground">Exame Prático</h1>
              <p className="text-sm text-muted-foreground">Pontuação objetiva • Máx. 10 pontos</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-6">
        <div className="max-w-md mx-auto space-y-6">
          {/* Requirements Card */}
          <div className={cn(
            "rounded-2xl p-5 border-2",
            canScheduleExam 
              ? "bg-primary/5 border-primary" 
              : "bg-muted border-border"
          )}>
            <div className="flex items-center gap-4 mb-4">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center",
                canScheduleExam ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
              )}>
                <Trophy className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-foreground">Requisitos</h2>
                <p className="text-sm text-muted-foreground">
                  {canScheduleExam ? "Você está apto!" : "Complete as aulas práticas"}
                </p>
              </div>
              {canScheduleExam && (
                <CheckCircle2 className="w-8 h-8 text-primary" />
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                <span className="text-sm text-foreground">Aulas práticas</span>
                <span className={cn(
                  "text-sm font-bold",
                  canScheduleExam ? "text-primary" : "text-muted-foreground"
                )}>
                  {practicalHoursCompleted}h / {requiredHours}h
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                <span className="text-sm text-foreground">Exame teórico</span>
                <span className="text-sm font-bold text-primary flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Aprovado
                </span>
              </div>
            </div>
          </div>

          {/* Scoring Info */}
          <div className="bg-card rounded-2xl p-5 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-5 h-5 text-secondary" />
              <h3 className="font-semibold text-foreground">Sistema de Pontuação</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Conforme Res. CONTRAN 1.020/2025, o exame usa pontuação objetiva:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-primary/5 rounded-xl text-center">
                <span className="text-2xl font-bold text-primary">≤10</span>
                <p className="text-xs text-muted-foreground">pontos = Aprovado</p>
              </div>
              <div className="p-3 bg-destructive/5 rounded-xl text-center">
                <span className="text-2xl font-bold text-destructive">&gt;10</span>
                <p className="text-xs text-muted-foreground">pontos = Reprovado</p>
              </div>
            </div>
          </div>

          {/* Free Retry Banner */}
          <div className="bg-gradient-to-r from-secondary/10 to-primary/10 rounded-2xl p-4 border border-secondary/20">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-secondary" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground text-sm">2ª Tentativa Grátis</h3>
                <p className="text-xs text-muted-foreground">
                  Nova lei: se reprovar, remarque no mesmo dia sem custo!
                </p>
              </div>
            </div>
          </div>

          {step === "info" && canScheduleExam && (
            <Button 
              variant="hero" 
              size="xl" 
              className="w-full"
              onClick={() => setStep("schedule")}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Agendar Exame no DETRAN
            </Button>
          )}

          {step === "schedule" && (
            <div className="space-y-6 animate-fade-in">
              {/* Location Selection */}
              <div>
                <h3 className="font-semibold text-foreground mb-3">Local do Exame</h3>
                <div className="space-y-2">
                  {examLocations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => location.available && setSelectedLocation(location.id)}
                      disabled={!location.available}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 text-left transition-all",
                        selectedLocation === location.id
                          ? "border-primary bg-primary/5"
                          : location.available
                          ? "border-border hover:border-primary/50"
                          : "border-border opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className={cn(
                          "w-5 h-5",
                          selectedLocation === location.id ? "text-primary" : "text-muted-foreground"
                        )} />
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground text-sm">{location.name}</h4>
                          <p className="text-xs text-muted-foreground">{location.address}</p>
                        </div>
                        {!location.available && (
                          <span className="text-xs text-destructive">Indisponível</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Selection */}
              {selectedLocation && (
                <div className="animate-fade-in">
                  <h3 className="font-semibold text-foreground mb-3">Data</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {availableDates.map((date) => (
                      <button
                        key={date.date}
                        onClick={() => date.slots > 0 && setSelectedDate(date.date)}
                        disabled={date.slots === 0}
                        className={cn(
                          "flex-shrink-0 w-16 p-3 rounded-xl border-2 text-center transition-all",
                          selectedDate === date.date
                            ? "border-primary bg-primary/5"
                            : date.slots > 0
                            ? "border-border hover:border-primary/50"
                            : "border-border opacity-50 cursor-not-allowed"
                        )}
                      >
                        <p className="text-xs text-muted-foreground">{date.weekday}</p>
                        <p className="font-bold text-foreground">{date.date}</p>
                        <p className={cn(
                          "text-[10px]",
                          date.slots > 0 ? "text-primary" : "text-destructive"
                        )}>
                          {date.slots > 0 ? `${date.slots} vagas` : "Lotado"}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Time Selection */}
              {selectedDate && (
                <div className="animate-fade-in">
                  <h3 className="font-semibold text-foreground mb-3">Horário</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimes.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={cn(
                          "p-3 rounded-xl border-2 text-center transition-all",
                          selectedTime === time
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <Clock className={cn(
                          "w-4 h-4 mx-auto mb-1",
                          selectedTime === time ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className="font-medium text-foreground text-sm">{time}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedTime && (
                <Button 
                  variant="hero" 
                  size="xl" 
                  className="w-full animate-fade-in"
                  onClick={handleScheduleExam}
                >
                  Confirmar Agendamento
                </Button>
              )}
            </div>
          )}

          {step === "result" && examResult === "pending" && (
            <div className="animate-fade-in">
              <div className="bg-card rounded-2xl p-6 border border-border text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-secondary" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Exame Agendado!</h2>
                <p className="text-muted-foreground mb-4">
                  {selectedDate} às {selectedTime}
                </p>
                <div className="p-3 bg-muted rounded-xl text-sm text-muted-foreground">
                  {examLocations.find(l => l.id === selectedLocation)?.name}
                </div>
              </div>

              {/* Demo buttons */}
              <div className="mt-6 space-y-2">
                <p className="text-xs text-muted-foreground text-center">Demo: Simular resultado</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleShowResult("approved")}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1 text-primary" />
                    Aprovado
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleShowResult("failed")}
                  >
                    <XCircle className="w-4 h-4 mr-1 text-destructive" />
                    Reprovado
                  </Button>
                </div>
              </div>
            </div>
          )}

          {examResult === "approved" && (
            <div className="animate-fade-in">
              <div className="bg-primary/5 rounded-2xl p-6 border-2 border-primary text-center">
                <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-10 h-10 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-primary mb-2">APROVADO! 🎉</h2>
                <p className="text-muted-foreground mb-4">
                  Pontuação: <span className="font-bold text-foreground">{examScore} pontos</span>
                </p>
                <div className="p-4 bg-background rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">PPD ativa automaticamente</p>
                  <p className="text-lg font-bold text-foreground">1 ano sem infrações graves</p>
                </div>
              </div>
            </div>
          )}

          {examResult === "failed" && (
            <div className="animate-fade-in">
              <div className="bg-destructive/5 rounded-2xl p-6 border-2 border-destructive/30 text-center">
                <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-10 h-10 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold text-destructive mb-2">Não foi dessa vez</h2>
                <p className="text-muted-foreground mb-4">
                  Pontuação: <span className="font-bold text-foreground">{examScore} pontos</span> (máx. 10)
                </p>
                {canRetry && (
                  <Button 
                    variant="hero" 
                    size="xl" 
                    className="w-full"
                    onClick={() => {
                      setStep("schedule");
                      setExamResult(null);
                      setCanRetry(false);
                    }}
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    2ª Tentativa Grátis
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
