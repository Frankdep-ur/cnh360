import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ActiveLesson } from "@/hooks/useActiveLessonBanner";
import { Car, Radio, Clock, QrCode, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActiveLessonBannerProps {
  lesson: ActiveLesson;
}

const STATUS_CONFIG: Record<string, {
  label: string;
  sublabel: string;
  icon: React.ElementType;
  bgClass: string;
  pulseClass: string;
}> = {
  confirmada: {
    label: "Aula Confirmada",
    sublabel: "Iniciar rota até o aluno",
    icon: CheckCircle2,
    bgClass: "bg-blue-600",
    pulseClass: "",
  },
  em_rota: {
    label: "A Caminho",
    sublabel: "Navegando até o ponto de encontro",
    icon: Car,
    bgClass: "bg-blue-600",
    pulseClass: "animate-pulse",
  },
  aguardando_confirmacao: {
    label: "Aguardando Aluno",
    sublabel: "Confirmar chegada do aluno",
    icon: Clock,
    bgClass: "bg-amber-600",
    pulseClass: "animate-pulse",
  },
  em_andamento: {
    label: "AULA AO VIVO",
    sublabel: "",
    icon: Radio,
    bgClass: "bg-emerald-600",
    pulseClass: "animate-pulse",
  },
  aguardando_qr: {
    label: "Finalizar Aula",
    sublabel: "Escanear QR Code do aluno",
    icon: QrCode,
    bgClass: "bg-violet-600",
    pulseClass: "animate-pulse",
  },
};

function ElapsedTimer({ startTime }: { startTime: string }) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    const update = () => {
      const start = new Date(startTime).getTime();
      const now = Date.now();
      const diffMs = Math.max(0, now - start);
      const hours = Math.floor(diffMs / 3_600_000);
      const minutes = Math.floor((diffMs % 3_600_000) / 60_000);
      const seconds = Math.floor((diffMs % 60_000) / 1_000);

      if (hours > 0) {
        setElapsed(`${hours}h ${String(minutes).padStart(2, "0")}min`);
      } else {
        setElapsed(`${minutes}:${String(seconds).padStart(2, "0")}`);
      }
    };

    update();
    const interval = setInterval(update, 1_000);
    return () => clearInterval(interval);
  }, [startTime]);

  return <span className="font-mono font-bold text-lg">{elapsed}</span>;
}

export function ActiveLessonBanner({ lesson }: ActiveLessonBannerProps) {
  const navigate = useNavigate();
  const config = STATUS_CONFIG[lesson.status] || STATUS_CONFIG.confirmada;
  const Icon = config.icon;

  const handleClick = () => {
    // Navigate based on status
    if (lesson.status === "em_andamento" || lesson.status === "aguardando_qr") {
      navigate(`/instrutor/aula/${lesson.id}`);
    } else if (lesson.status === "em_rota") {
      navigate(`/instrutor/a-caminho/${lesson.id}`);
    } else if (lesson.status === "confirmada") {
      navigate(`/instrutor/aulas`);
    } else {
      navigate(`/instrutor/aula/${lesson.id}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full rounded-2xl p-4 text-white shadow-lg transition-transform active:scale-[0.98]",
        config.bgClass,
        config.pulseClass && "relative overflow-hidden"
      )}
    >
      {/* Pulse overlay for live statuses */}
      {config.pulseClass && (
        <div className={cn(
          "absolute inset-0 rounded-2xl opacity-30",
          config.bgClass,
          "animate-ping"
        )} style={{ animationDuration: "2s" }} />
      )}

      <div className="relative z-10 flex items-center gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 p-2 rounded-xl bg-white/20">
          <Icon className="w-6 h-6" />
        </div>

        {/* Info */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2">
            {lesson.status === "em_andamento" && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white" />
              </span>
            )}
            <span className="font-bold text-sm tracking-wide">{config.label}</span>
          </div>

          <p className="text-white/90 text-xs truncate mt-0.5">
            {lesson.aluno_nome}
            {config.sublabel && ` · ${config.sublabel}`}
          </p>

          {/* Timer for em_andamento */}
          {lesson.status === "em_andamento" && lesson.aula_inicio && (
            <div className="mt-1">
              <ElapsedTimer startTime={lesson.aula_inicio} />
            </div>
          )}
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 p-1.5 rounded-full bg-white/20">
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    </button>
  );
}
