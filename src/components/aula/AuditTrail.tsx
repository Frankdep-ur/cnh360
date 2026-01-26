import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Car,
  MapPin,
  CheckCircle2,
  GraduationCap,
  Clock,
  QrCode,
  CreditCard,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AuditoriaEvento } from "@/hooks/useAulaAuditoria";

interface AuditTrailProps {
  eventos: AuditoriaEvento[];
  valor?: number;
  className?: string;
}

const eventoConfig: Record<
  string,
  { icon: typeof Car; label: string; color: string }
> = {
  em_rota: {
    icon: Car,
    label: "Em Rota",
    color: "bg-blue-100 text-blue-600 border-blue-200",
  },
  cheguei: {
    icon: MapPin,
    label: "Chegou no local",
    color: "bg-amber-100 text-amber-600 border-amber-200",
  },
  confirmacao_aluno: {
    icon: CheckCircle2,
    label: "Aluno confirmou",
    color: "bg-green-100 text-green-600 border-green-200",
  },
  inicio: {
    icon: GraduationCap,
    label: "Aula iniciada",
    color: "bg-primary/10 text-primary border-primary/20",
  },
  fim: {
    icon: Clock,
    label: "Aula finalizada",
    color: "bg-violet-100 text-violet-600 border-violet-200",
  },
  qr_validado: {
    icon: QrCode,
    label: "QR validado",
    color: "bg-emerald-100 text-emerald-600 border-emerald-200",
  },
  pagamento_liberado: {
    icon: CreditCard,
    label: "Pagamento liberado",
    color: "bg-secondary/10 text-secondary border-secondary/20",
  },
};

export function AuditTrail({ eventos, valor, className }: AuditTrailProps) {
  if (!eventos || eventos.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Nenhum evento registrado</p>
      </div>
    );
  }

  const formatGPS = (lat: number | null, lng: number | null, precision: number | null) => {
    if (lat === null || lng === null) return null;
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}${precision ? ` (±${precision.toFixed(0)}m)` : ""}`;
  };

  const getExtraInfo = (evento: AuditoriaEvento) => {
    const dados = evento.dados_adicionais as Record<string, unknown> | null;
    if (!dados) return null;

    if (evento.evento === "fim" && dados.duracao_segundos) {
      const duracao = Number(dados.duracao_segundos);
      const min = Math.floor(duracao / 60);
      const seg = duracao % 60;
      return `Duração: ${min}min ${seg}seg`;
    }

    if (evento.evento === "qr_validado" && dados.hash) {
      const hash = String(dados.hash);
      return `Hash: ${hash.substring(0, 8)}...${hash.substring(hash.length - 4)}`;
    }

    if (evento.evento === "confirmacao_aluno" && dados.tempo_espera_segundos) {
      return `Tempo de espera: ${Number(dados.tempo_espera_segundos)} segundos`;
    }

    return null;
  };

  return (
    <div className={cn("space-y-0", className)}>
      {eventos.map((evento, index) => {
        const config = eventoConfig[evento.evento] || {
          icon: Navigation,
          label: evento.evento,
          color: "bg-muted text-muted-foreground border-border",
        };
        const Icon = config.icon;
        const gps = formatGPS(evento.latitude, evento.longitude, evento.precisao_metros);
        const extraInfo = getExtraInfo(evento);
        const isLast = index === eventos.length - 1;

        return (
          <div key={evento.id} className="relative flex gap-3">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-border" />
            )}

            {/* Icon */}
            <div
              className={cn(
                "relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0",
                config.color
              )}
            >
              <Icon className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-foreground">{config.label}</span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(evento.timestamp), "HH:mm:ss", { locale: ptBR })}
                </span>
              </div>

              {gps && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  GPS: {gps}
                </p>
              )}

              {extraInfo && (
                <p className="text-xs text-muted-foreground mt-1">{extraInfo}</p>
              )}
            </div>
          </div>
        );
      })}

      {/* Payment released - shown if QR was validated */}
      {eventos.some((e) => e.evento === "qr_validado") && valor && (
        <div className="relative flex gap-3">
          <div
            className={cn(
              "relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center shrink-0",
              eventoConfig.pagamento_liberado.color
            )}
          >
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="flex-1 pb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-foreground">Pagamento liberado</span>
              <span className="text-sm font-bold text-secondary">
                R$ {valor.toFixed(2).replace(".", ",")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
