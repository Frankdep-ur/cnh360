import { useModoTransicao, ModoTransicao } from "@/contexts/ModoTransicaoContext";
import { Check, Zap, Clock, Car, GraduationCap, Users, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ContadorTransicao } from "./ContadorTransicao";

interface BannerModoTransicaoProps {
  onModoSelecionado?: () => void;
  showFullBanner?: boolean;
}

export function BannerModoTransicao({ onModoSelecionado, showFullBanner = true }: BannerModoTransicaoProps) {
  const { modo, setModo, isSP, config, diasRestantes } = useModoTransicao();

  if (!isSP) return null;

  // Se já tem modo selecionado e não é para mostrar banner completo
  if (modo && !showFullBanner) {
    return (
      <div className={cn(
        "mx-4 mb-4 p-3 rounded-xl border",
        modo === "nova_lei" 
          ? "bg-primary/5 border-primary/20" 
          : "bg-secondary/5 border-secondary/20"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              modo === "nova_lei" ? "bg-primary" : "bg-secondary"
            )} />
            <span className="text-sm font-medium">
              {modo === "nova_lei" ? "Modo Nova Lei" : "Modo Tradicional"}
            </span>
          </div>
          <ContadorTransicao compact />
        </div>
      </div>
    );
  }

  const handleSelecionar = async (novoModo: ModoTransicao) => {
    await setModo(novoModo);
    onModoSelecionado?.();
  };

  const modos = [
    {
      id: "nova_lei" as ModoTransicao,
      titulo: "Modo Nova Lei",
      subtitulo: "CONTRAN 1.020/2025",
      preco: "R$ 799",
      horas: "2h mínimas",
      cor: "primary",
      gradient: "from-primary/10 to-primary/5",
      border: "border-primary/30 hover:border-primary/60",
      features: [
        { icon: Zap, text: "Apenas 2h de aula prática" },
        { icon: Users, text: "Instrutores MEI autônomos" },
        { icon: GraduationCap, text: "Curso teórico 100% EAD" },
        { icon: Car, text: "Use seu próprio carro" },
      ],
      badge: "Recomendado",
      badgeColor: "bg-primary text-primary-foreground"
    },
    {
      id: "atual" as ModoTransicao,
      titulo: "Modo Tradicional",
      subtitulo: "Procedimentos antigos",
      preco: "R$ 2.200-3.000",
      horas: "20-25h obrigatórias",
      cor: "secondary",
      gradient: "from-secondary/10 to-secondary/5",
      border: "border-secondary/30 hover:border-secondary/60",
      features: [
        { icon: Clock, text: "20-25h de aula prática" },
        { icon: Users, text: "Só instrutores de CFC" },
        { icon: GraduationCap, text: "Curso teórico 45h presencial" },
        { icon: Car, text: "Carro da autoescola" },
      ],
      badge: null,
      badgeColor: ""
    }
  ];

  return (
    <div className="bg-gradient-to-b from-amber-50 to-background border-b border-amber-200/50 p-4 pb-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
              TRANSIÇÃO SP
            </span>
          </div>
          <h3 className="text-lg font-bold text-foreground">
            Como você quer tirar sua CNH?
          </h3>
          <p className="text-sm text-muted-foreground">
            Deliberação CETRAN-SP nº 10 • Escolha seu caminho
          </p>
        </div>
        <ContadorTransicao compact />
      </div>

      {/* Cards de Modo */}
      <div className="space-y-3">
        {modos.map((modoItem) => (
          <button
            key={modoItem.id}
            onClick={() => handleSelecionar(modoItem.id)}
            className={cn(
              "w-full p-4 rounded-2xl border-2 text-left transition-all duration-200",
              "bg-gradient-to-br",
              modoItem.gradient,
              modoItem.border,
              modo === modoItem.id && "ring-2 ring-offset-2",
              modo === modoItem.id && modoItem.cor === "primary" && "ring-primary",
              modo === modoItem.id && modoItem.cor === "secondary" && "ring-secondary"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-foreground">{modoItem.titulo}</h4>
                  {modoItem.badge && (
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", modoItem.badgeColor)}>
                      {modoItem.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{modoItem.subtitulo}</p>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-lg font-bold",
                  modoItem.cor === "primary" ? "text-primary" : "text-secondary"
                )}>
                  {modoItem.preco}
                </p>
                <p className="text-xs text-muted-foreground">{modoItem.horas}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {modoItem.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <feature.icon className={cn(
                    "w-3.5 h-3.5",
                    modoItem.cor === "primary" ? "text-primary" : "text-secondary"
                  )} />
                  <span className="text-xs text-foreground/80">{feature.text}</span>
                </div>
              ))}
            </div>

            {modo === modoItem.id && (
              <div className={cn(
                "mt-3 flex items-center justify-center gap-1 text-xs font-semibold py-1.5 rounded-lg",
                modoItem.cor === "primary" ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"
              )}>
                <Check className="w-3.5 h-3.5" />
                Selecionado
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Info adicional */}
      <p className="text-[10px] text-muted-foreground text-center mt-4">
        Você pode mudar sua escolha a qualquer momento nas configurações
      </p>
    </div>
  );
}
