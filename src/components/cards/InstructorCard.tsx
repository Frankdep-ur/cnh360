import { Star, MapPin, Car, Clock, Shield, Leaf } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface InstructorCardProps {
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
  tags?: string[];
  showMEIBadge?: boolean;
  showCarroProprio?: boolean;
}

export function InstructorCard({
  id,
  name,
  photo,
  rating,
  reviews,
  price,
  distance,
  carType,
  available,
  verified,
  tags = [],
  showMEIBadge = false,
  showCarroProprio = false,
}: InstructorCardProps) {
  return (
    <Link
      to={`/aluno/instrutor/${id}`}
      className="block"
    >
      <div className="bg-card rounded-2xl p-4 shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50">
        <div className="flex gap-4">
          {/* Photo */}
          <div className="relative">
            <img
              src={photo}
              alt={name}
              className="w-20 h-20 rounded-xl object-cover"
            />
            {verified && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-1 rounded-full">
                <Shield className="w-3 h-3" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">{name}</h3>
                {showMEIBadge && (
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                    <Leaf className="w-2.5 h-2.5" />
                    MEI
                  </span>
                )}
              </div>
              <div className={cn(
                "px-2 py-0.5 rounded-full text-xs font-medium shrink-0",
                available 
                  ? "bg-primary/10 text-primary" 
                  : "bg-muted text-muted-foreground"
              )}>
                {available ? "Disponível" : "Ocupado"}
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-sm">{rating.toFixed(1)}</span>
              <span className="text-muted-foreground text-xs">({reviews} avaliações)</span>
            </div>

            {/* Details */}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{distance}</span>
              </div>
              <div className="flex items-center gap-1">
                <Car className="w-3 h-3" />
                <span>{carType}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mt-2">
              {showCarroProprio && (
                <Badge variant="outline" className="text-[10px] px-2 py-0 border-primary/30 text-primary">
                  Aceita carro próprio
                </Badge>
              )}
              {tags.slice(0, showCarroProprio ? 2 : 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] px-2 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
          <div className="flex items-center gap-1 text-muted-foreground text-sm">
            <Clock className="w-4 h-4" />
            <span>Por hora</span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-primary">R$ {price}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
