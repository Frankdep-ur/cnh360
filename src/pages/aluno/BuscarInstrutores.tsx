import { useState } from "react";
import { Search, SlidersHorizontal, MapPin, X, Leaf, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InstructorCard } from "@/components/cards/InstructorCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { IndicadorModo } from "@/components/transicao/IndicadorModo";
import { useModoTransicao } from "@/contexts/ModoTransicaoContext";
import { cn } from "@/lib/utils";

const filters = [
  { id: "disponivel", label: "Disponível agora" },
  { id: "automatico", label: "Automático" },
  { id: "manual", label: "Manual" },
  { id: "mulher", label: "Instrutora mulher" },
  { id: "noite", label: "Aulas à noite" },
  { id: "fds", label: "Fim de semana" },
];

// Filtros exclusivos do modo nova lei
const filtersNovaLei = [
  { id: "mei", label: "Instrutor MEI" },
  { id: "carro_proprio", label: "Aceita carro próprio" },
];

const instructors = [
  {
    id: "1",
    name: "Carlos Silva",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    rating: 4.9,
    reviews: 127,
    price: 80,
    priceNovaLei: 60,
    distance: "1.2 km",
    carType: "VW Polo - Automático",
    available: true,
    verified: true,
    isMEI: true,
    aceitaCarroProprio: true,
    tags: ["Paciente", "Pontual", "Experiente"],
  },
  {
    id: "2",
    name: "Ana Rodrigues",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    rating: 4.8,
    reviews: 89,
    price: 75,
    priceNovaLei: 55,
    distance: "2.5 km",
    carType: "Fiat Argo - Manual",
    available: true,
    verified: true,
    isMEI: false,
    aceitaCarroProprio: false,
    tags: ["Instrutora mulher", "Calma", "Didática"],
  },
  {
    id: "3",
    name: "Roberto Almeida",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    rating: 4.7,
    reviews: 203,
    price: 70,
    priceNovaLei: 50,
    distance: "3.1 km",
    carType: "Chevrolet Onix - Manual",
    available: false,
    verified: true,
    isMEI: true,
    aceitaCarroProprio: true,
    tags: ["Veterano", "Aulas à noite"],
  },
  {
    id: "4",
    name: "Fernanda Costa",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    rating: 5.0,
    reviews: 45,
    price: 85,
    priceNovaLei: 65,
    distance: "0.8 km",
    carType: "Toyota Yaris - Automático",
    available: true,
    verified: true,
    isMEI: true,
    aceitaCarroProprio: true,
    tags: ["Instrutora mulher", "Fim de semana", "Ar condicionado"],
  },
  {
    id: "5",
    name: "Marcos Oliveira",
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    rating: 4.6,
    reviews: 78,
    price: 65,
    priceNovaLei: 45,
    distance: "1.8 km",
    carType: "Hyundai HB20 - Manual",
    available: true,
    verified: true,
    isMEI: false,
    aceitaCarroProprio: false,
    tags: ["CFC Tradicional", "Experiente"],
  },
];

export default function BuscarInstrutores() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const { modo, config, isSP } = useModoTransicao();

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
  };

  // Combinar filtros baseado no modo
  const availableFilters = modo === "nova_lei" 
    ? [...filtersNovaLei, ...filters]
    : filters;

  const filteredInstructors = instructors.filter((instructor) => {
    // No modo atual, filtrar apenas instrutores de CFC (não MEI)
    if (modo === "atual" && instructor.isMEI) return false;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !instructor.name.toLowerCase().includes(query) &&
        !instructor.carType.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    if (activeFilters.includes("disponivel") && !instructor.available) return false;
    if (activeFilters.includes("automatico") && !instructor.carType.includes("Automático")) return false;
    if (activeFilters.includes("manual") && !instructor.carType.includes("Manual")) return false;
    if (activeFilters.includes("mulher") && !instructor.tags.includes("Instrutora mulher")) return false;
    if (activeFilters.includes("mei") && !instructor.isMEI) return false;
    if (activeFilters.includes("carro_proprio") && !instructor.aceitaCarroProprio) return false;

    return true;
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 pt-8 pb-4 safe-top sticky top-0 z-40">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Araçatuba, SP</span>
            </div>
            {isSP && modo && <IndicadorModo />}
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            {modo === "nova_lei" ? "Instrutores disponíveis" : "Encontre seu instrutor"}
          </h1>
          
          {modo === "nova_lei" && (
            <p className="text-sm text-muted-foreground mb-4">
              Inclui instrutores MEI autônomos • Preços a partir de R$ 45/h
            </p>
          )}

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou veículo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="icon"
              className="h-12 w-12 rounded-xl"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className={cn(
        "bg-card border-b border-border px-6 py-3 overflow-hidden transition-all duration-300",
        showFilters ? "max-h-40" : "max-h-0 py-0 border-b-0"
      )}>
        <div className="max-w-md mx-auto">
          <div className="flex flex-wrap gap-2">
            {availableFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
                  activeFilters.includes(filter.id)
                    ? modo === "nova_lei" 
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                  // Highlight filtros exclusivos nova lei
                  filter.id === "mei" || filter.id === "carro_proprio"
                    ? "border border-primary/30"
                    : ""
                )}
              >
                {(filter.id === "mei" || filter.id === "carro_proprio") && (
                  <Leaf className="w-3 h-3 inline mr-1" />
                )}
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Banner informativo do modo */}
      {isSP && modo && (
        <div className={cn(
          "mx-6 mt-4 p-3 rounded-xl border",
          modo === "nova_lei" 
            ? "bg-primary/5 border-primary/20" 
            : "bg-secondary/5 border-secondary/20"
        )}>
          <div className="max-w-md mx-auto flex items-center gap-3">
            {modo === "nova_lei" ? (
              <>
                <Leaf className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Modo Nova Lei ativo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Você pode contratar instrutores MEI e usar seu carro próprio
                  </p>
                </div>
              </>
            ) : (
              <>
                <Building2 className="w-5 h-5 text-secondary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">
                    Modo Tradicional ativo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Mostrando apenas instrutores vinculados a CFCs
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="px-6 py-3 bg-muted/50">
          <div className="max-w-md mx-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtros:</span>
            <div className="flex flex-wrap gap-1">
              {activeFilters.map((filterId) => {
                const filter = availableFilters.find((f) => f.id === filterId);
                return (
                  <Badge
                    key={filterId}
                    variant="secondary"
                    className="gap-1 cursor-pointer hover:bg-secondary/80"
                    onClick={() => toggleFilter(filterId)}
                  >
                    {filter?.label}
                    <X className="w-3 h-3" />
                  </Badge>
                );
              })}
            </div>
            <button
              onClick={() => setActiveFilters([])}
              className={cn(
                "text-sm font-medium ml-auto",
                modo === "nova_lei" ? "text-primary" : "text-secondary"
              )}
            >
              Limpar
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="px-6 py-6">
        <div className="max-w-md mx-auto">
          <p className="text-sm text-muted-foreground mb-4">
            {filteredInstructors.length} instrutor{filteredInstructors.length !== 1 ? "es" : ""} encontrado{filteredInstructors.length !== 1 ? "s" : ""}
            {modo === "nova_lei" && " • inclui MEIs"}
          </p>

          <div className="space-y-4">
            {filteredInstructors.map((instructor) => (
              <InstructorCard 
                key={instructor.id} 
                {...instructor}
                price={modo === "nova_lei" ? instructor.priceNovaLei : instructor.price}
                showMEIBadge={modo === "nova_lei" && instructor.isMEI}
                showCarroProprio={modo === "nova_lei" && instructor.aceitaCarroProprio}
              />
            ))}
          </div>

          {filteredInstructors.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Nenhum instrutor encontrado</h3>
              <p className="text-sm text-muted-foreground">
                Tente ajustar os filtros ou buscar por outro termo
              </p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
