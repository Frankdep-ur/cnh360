import { useState, useMemo, memo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, MapPin, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InstructorCard } from "@/components/cards/InstructorCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { InstructorListSkeleton } from "@/components/skeletons/InstructorCardSkeleton";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const filters = [
  { id: "disponivel", label: "Disponível agora" },
  { id: "automatico", label: "Automático" },
  { id: "manual", label: "Manual" },
  { id: "mulher", label: "Instrutora mulher" },
  { id: "noite", label: "Aulas à noite" },
  { id: "fds", label: "Fim de semana" },
];

interface InstructorData {
  id: string;
  name: string;
  photo: string;
  rating: number;
  reviews: number;
  price: number;
  distance: string;
  carType: string;
  available: boolean;
  verified: boolean;
  isMEI: boolean;
  aceitaCarroProprio: boolean;
  tags: string[];
  email: string | null;
}

// Mock data fallback for demo (empty - uses real data from database)
const mockInstructors: InstructorData[] = [];

// Fetch all instructors with vehicles in a single optimized query
async function fetchInstructorsWithVehicles(): Promise<InstructorData[]> {
  // Fetch instructors from cache
  const { data: cacheData, error: cacheError } = await supabase
    .from("instrutores_publico_cache")
    .select("*")
    .eq("ativo", true);

  if (cacheError) {
    console.error("Error fetching instructors:", cacheError);
    return mockInstructors;
  }

  if (!cacheData || cacheData.length === 0) {
    return mockInstructors;
  }

  // Get all instructor IDs for batch vehicle fetch
  const instructorIds = cacheData.map((inst) => inst.id);

  // Fetch all vehicles at once (single query instead of N queries)
  const { data: allVehicles } = await supabase
    .from("veiculos")
    .select("instrutor_id, modelo, transmissao")
    .in("instrutor_id", instructorIds)
    .eq("ativo", true);

  // Create a map for quick vehicle lookup
  const vehicleMap = new Map<string, { modelo: string; transmissao: string }>();
  allVehicles?.forEach((v) => {
    if (!vehicleMap.has(v.instrutor_id)) {
      vehicleMap.set(v.instrutor_id, v);
    }
  });

  // Transform data to UI format
  return cacheData.map((inst) => {
    const veiculo = vehicleMap.get(inst.id);
    const carType = veiculo
      ? `${veiculo.modelo} - ${veiculo.transmissao === "automatico" ? "Automático" : "Manual"}`
      : "Veículo não informado";

    return {
      id: inst.id,
      name: inst.nome || "Instrutor",
      photo: inst.foto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
      rating: Number(inst.nota_media) || 5.0,
      reviews: inst.total_avaliacoes || 0,
      price: Number(inst.preco_hora) || 80,
      distance: `${inst.raio_atendimento_km || 10} km`,
      carType,
      available: true,
      verified: true,
      isMEI: true,
      aceitaCarroProprio: true,
      tags: inst.bio ? [inst.bio.slice(0, 20)] : ["Experiente"],
      email: null,
    };
  });
}

// Memoized filter button
const FilterButton = memo(function FilterButton({
  filter,
  isActive,
  onToggle,
}: {
  filter: { id: string; label: string };
  isActive: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
        isActive
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      )}
    >
      {filter.label}
    </button>
  );
});

export default function BuscarInstrutores() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  // TEMPORÁRIO: Verificação de certificado desabilitada para testes de pagamento
  // TODO: Restaurar após testes - ver código original em git history

  // Use React Query for data fetching with caching
  const { data: instructors = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.INSTRUTORES_PUBLIC,
    queryFn: fetchInstructorsWithVehicles,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true,
  });

  const toggleFilter = (filterId: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((f) => f !== filterId)
        : [...prev, filterId]
    );
  };

  // Memoize filtered results
  const filteredInstructors = useMemo(() => {
    return instructors.filter((instructor) => {
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

      return true;
    });
  }, [instructors, searchQuery, activeFilters]);

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
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Encontre seu instrutor
          </h1>

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
            {filters.map((filter) => (
              <FilterButton
                key={filter.id}
                filter={filter}
                isActive={activeFilters.includes(filter.id)}
                onToggle={() => toggleFilter(filter.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="px-6 py-3 bg-muted/50">
          <div className="max-w-md mx-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filtros:</span>
            <div className="flex flex-wrap gap-1">
              {activeFilters.map((filterId) => {
                const filter = filters.find((f) => f.id === filterId);
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
              className="text-sm font-medium ml-auto text-primary"
            >
              Limpar
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="px-6 py-6">
        <div className="max-w-md mx-auto">
          {isLoading ? (
            <InstructorListSkeleton count={3} />
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {filteredInstructors.length} instrutor{filteredInstructors.length !== 1 ? "es" : ""} encontrado{filteredInstructors.length !== 1 ? "s" : ""}
              </p>

              <div className="space-y-4">
                {filteredInstructors.map((instructor) => (
                  <InstructorCard 
                    key={instructor.id} 
                    {...instructor}
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
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
