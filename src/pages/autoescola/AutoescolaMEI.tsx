import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Search, Star, MapPin, Car, Clock, 
  DollarSign, UserCheck, Filter, Award
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AutoescolaBottomNav } from "@/components/layout/AutoescolaBottomNav";
import { cn } from "@/lib/utils";

interface InstrutorMEI {
  id: string;
  nome: string;
  foto: string;
  nota: number;
  totalAulas: number;
  aprovacao: number;
  precoHora: number;
  categoria: string;
  transmissao: string;
  disponivel: boolean;
  distancia: string;
  comissao: number;
}

export default function AutoescolaMEI() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock instrutores MEI
  const instrutores: InstrutorMEI[] = [
    { id: "1", nome: "Ricardo Gomes", foto: "", nota: 4.9, totalAulas: 342, aprovacao: 94, precoHora: 65, categoria: "B", transmissao: "Manual/Auto", disponivel: true, distancia: "2.3 km", comissao: 13 },
    { id: "2", nome: "Fernanda Lima", foto: "", nota: 4.8, totalAulas: 287, aprovacao: 91, precoHora: 70, categoria: "AB", transmissao: "Manual", disponivel: true, distancia: "3.1 km", comissao: 14 },
    { id: "3", nome: "Carlos Eduardo", foto: "", nota: 4.7, totalAulas: 198, aprovacao: 88, precoHora: 60, categoria: "B", transmissao: "Automático", disponivel: false, distancia: "4.5 km", comissao: 12 },
    { id: "4", nome: "Ana Paula", foto: "", nota: 4.9, totalAulas: 456, aprovacao: 96, precoHora: 75, categoria: "B", transmissao: "Manual/Auto", disponivel: true, distancia: "1.8 km", comissao: 15 },
  ];

  const filteredInstrutores = instrutores.filter(i => 
    i.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white px-6 py-6 safe-top">
        <div className="max-w-md mx-auto">
          <button 
            onClick={() => navigate("/autoescola")}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Marketplace MEI</h1>
              <p className="text-white/80">{instrutores.filter(i => i.disponivel).length} instrutores disponíveis</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          {/* Comissão Info */}
          <div className="mt-4 p-3 bg-white/10 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-300" />
              <span className="text-sm">Sua comissão: 20% por aula</span>
            </div>
            <Badge className="bg-amber-400 text-amber-900">Premium</Badge>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 py-4 -mt-2">
        <div className="max-w-md mx-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Buscar instrutor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Instrutores List */}
      <div className="px-6">
        <div className="max-w-md mx-auto space-y-3">
          {/* Top performers */}
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span className="font-semibold">Ranking de aprovação</span>
          </div>

          {filteredInstrutores
            .sort((a, b) => b.aprovacao - a.aprovacao)
            .map((instrutor, index) => (
              <Card 
                key={instrutor.id} 
                className={cn(
                  "hover:shadow-md transition-shadow",
                  !instrutor.disponivel && "opacity-60"
                )}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    {/* Ranking */}
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                      index === 0 ? "bg-amber-100 text-amber-700" :
                      index === 1 ? "bg-gray-100 text-gray-700" :
                      index === 2 ? "bg-orange-100 text-orange-700" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}º
                    </div>

                    {/* Avatar */}
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={instrutor.foto} />
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        {instrutor.nome.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold">{instrutor.nome}</h3>
                        <Badge 
                          variant={instrutor.disponivel ? "default" : "secondary"}
                          className={instrutor.disponivel ? "bg-emerald-500" : ""}
                        >
                          {instrutor.disponivel ? "Disponível" : "Ocupado"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          {instrutor.nota}
                        </div>
                        <span>{instrutor.totalAulas} aulas</span>
                        <span className="text-emerald-600 font-medium">{instrutor.aprovacao}% aprovação</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          <Car className="w-3 h-3 mr-1" />
                          Cat {instrutor.categoria}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {instrutor.transmissao}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="w-3 h-3 mr-1" />
                          {instrutor.distancia}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <div>
                          <span className="text-lg font-bold">R$ {instrutor.precoHora}</span>
                          <span className="text-sm text-muted-foreground">/hora</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-emerald-600">
                            +R$ {instrutor.comissao} p/ você
                          </span>
                          <Button 
                            size="sm" 
                            disabled={!instrutor.disponivel}
                            className="bg-purple-500 hover:bg-purple-600"
                          >
                            Alocar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>

      <AutoescolaBottomNav />
    </div>
  );
}
