import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, 
  Star, 
  Shield, 
  MapPin, 
  Car, 
  Clock, 
  Calendar,
  MessageCircle,
  Phone,
  ChevronRight,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const instructor = {
  id: "1",
  name: "Carlos Silva",
  photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  rating: 4.9,
  reviews: 127,
  price: 80,
  distance: "1.2 km",
  car: {
    model: "VW Polo 2023",
    transmission: "Automático",
    features: ["Ar condicionado", "Direção elétrica", "Câmera de ré"],
  },
  verified: true,
  bio: "Instrutor credenciado há 8 anos, especializado em alunos iniciantes. Paciente e dedicado a ensinar da melhor forma possível.",
  totalLessons: 1250,
  responseTime: "5 min",
  tags: ["Paciente", "Pontual", "Experiente", "Aulas noturnas"],
  availability: [
    { day: "Seg", slots: ["08:00", "09:00", "14:00", "15:00", "16:00"] },
    { day: "Ter", slots: ["08:00", "09:00", "10:00", "14:00", "15:00"] },
    { day: "Qua", slots: ["14:00", "15:00", "16:00", "17:00"] },
    { day: "Qui", slots: ["08:00", "09:00", "14:00", "15:00", "16:00"] },
    { day: "Sex", slots: ["08:00", "09:00", "10:00", "11:00"] },
  ],
  recentReviews: [
    { id: 1, name: "Mariana L.", rating: 5, text: "Excelente instrutor! Muito paciente e didático.", date: "2 dias atrás" },
    { id: 2, name: "João P.", rating: 5, text: "Passei de primeira graças ao Carlos. Recomendo!", date: "1 semana atrás" },
    { id: 3, name: "Ana C.", rating: 4, text: "Ótimas aulas, pontual e profissional.", date: "2 semanas atrás" },
  ],
};

export default function InstrutorPerfil() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedDay, setSelectedDay] = useState(instructor.availability[0].day);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const selectedDaySlots = instructor.availability.find((d) => d.day === selectedDay)?.slots || [];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header Image */}
      <div className="relative h-72">
        <img
          src={instructor.photo}
          alt={instructor.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-lg safe-top"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Verified Badge */}
        {instructor.verified && (
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium safe-top">
            <Shield className="w-4 h-4" />
            Verificado
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="px-6 -mt-16 relative">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-3xl shadow-elevated p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{instructor.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    <span className="font-semibold">{instructor.rating}</span>
                  </div>
                  <span className="text-muted-foreground">({instructor.reviews} avaliações)</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-primary">R$ {instructor.price}</span>
                <p className="text-sm text-muted-foreground">/hora</p>
              </div>
            </div>

            <p className="text-muted-foreground mb-4">{instructor.bio}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-2xl mb-4">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{instructor.totalLessons}</p>
                <p className="text-xs text-muted-foreground">Aulas dadas</p>
              </div>
              <div className="text-center border-x border-border">
                <p className="text-lg font-bold text-foreground">{instructor.distance}</p>
                <p className="text-xs text-muted-foreground">Distância</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{instructor.responseTime}</p>
                <p className="text-xs text-muted-foreground">Resposta</p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {instructor.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Vehicle */}
          <div className="mt-6">
            <h2 className="font-semibold text-foreground mb-3">Veículo</h2>
            <div className="bg-card rounded-2xl p-4 border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{instructor.car.model}</h3>
                  <p className="text-sm text-muted-foreground">Câmbio {instructor.car.transmission}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {instructor.car.features.map((feature) => (
                  <span
                    key={feature}
                    className="flex items-center gap-1 text-xs text-muted-foreground"
                  >
                    <Check className="w-3 h-3 text-primary" />
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="mt-6">
            <h2 className="font-semibold text-foreground mb-3">Disponibilidade</h2>
            <div className="bg-card rounded-2xl p-4 border border-border">
              {/* Days */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {instructor.availability.map((day) => (
                  <button
                    key={day.day}
                    onClick={() => {
                      setSelectedDay(day.day);
                      setSelectedTime(null);
                    }}
                    className={cn(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap",
                      selectedDay === day.day
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {day.day}
                  </button>
                ))}
              </div>

              {/* Time Slots */}
              <div className="grid grid-cols-4 gap-2">
                {selectedDaySlots.map((time) => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={cn(
                      "py-2 rounded-lg text-sm font-medium transition-all",
                      selectedTime === time
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted/50 text-foreground hover:bg-muted"
                    )}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-foreground">Avaliações</h2>
              <button className="text-sm text-primary font-medium flex items-center gap-1">
                Ver todas
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {instructor.recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-card rounded-2xl p-4 border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{review.name}</span>
                    <div className="flex items-center gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{review.text}</p>
                  <p className="text-xs text-muted-foreground/70">{review.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent safe-bottom">
        <div className="max-w-md mx-auto flex gap-3">
          <Button variant="outline" size="lg" className="w-14">
            <MessageCircle className="w-5 h-5" />
          </Button>
          <Button
            variant="hero"
            size="lg"
            className="flex-1"
            disabled={!selectedTime}
            onClick={() => navigate(`/aluno/agendar/${id}?day=${selectedDay}&time=${selectedTime}`)}
          >
            {selectedTime
              ? `Agendar ${selectedDay} às ${selectedTime}`
              : "Selecione um horário"}
          </Button>
        </div>
      </div>
    </div>
  );
}
