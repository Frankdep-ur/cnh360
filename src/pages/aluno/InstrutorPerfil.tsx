import { useState, useEffect } from "react";
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
  Check,
  Loader2,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { PageSkeleton } from "@/components/skeletons/PageSkeleton";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

// Default availability slots for display
const defaultAvailability = [
  { day: "Seg", slots: ["08:00", "09:00", "14:00", "15:00", "16:00"] },
  { day: "Ter", slots: ["08:00", "09:00", "10:00", "14:00", "15:00"] },
  { day: "Qua", slots: ["14:00", "15:00", "16:00", "17:00"] },
  { day: "Qui", slots: ["08:00", "09:00", "14:00", "15:00", "16:00"] },
  { day: "Sex", slots: ["08:00", "09:00", "10:00", "11:00"] },
];

// Default reviews for display
const defaultReviews = [
  { id: 1, name: "Aluno", rating: 5, text: "Excelente instrutor! Muito paciente e didático.", date: "Recente" },
  { id: 2, name: "Aluno", rating: 5, text: "Passei de primeira! Recomendo!", date: "Recente" },
  { id: 3, name: "Aluno", rating: 4, text: "Ótimas aulas, pontual e profissional.", date: "Recente" },
];

interface InstructorData {
  id: string;
  name: string;
  photo: string;
  rating: number;
  reviews: number;
  price: number;
  distance: string;
  car: {
    model: string;
    transmission: string;
    features: string[];
  };
  verified: boolean;
  bio: string;
  totalLessons: number;
  responseTime: string;
  tags: string[];
  kycStatus?: string | null;
  pagarmeRecipientId?: string | null;
}

export default function InstrutorPerfil() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [instructor, setInstructor] = useState<InstructorData | null>(null);
  const [selectedDay, setSelectedDay] = useState(defaultAvailability[0].day);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isVerifiedForPayments, setIsVerifiedForPayments] = useState(true);


  useEffect(() => {
    if (id) {
      fetchInstructorData();
    }
  }, [id]);

  async function fetchInstructorData() {
    try {
      setLoading(true);
      
      // Fetch instructor from cache
      const { data: cacheData, error: cacheError } = await supabase
        .from("instrutores_publico_cache")
        .select("*")
        .eq("id", id)
        .single();

      if (cacheError) {
        console.error("Error fetching instructor:", cacheError);
        navigate("/aluno/buscar");
        return;
      }

      // Fetch vehicle info
      const { data: veiculoData } = await supabase.rpc(
        "get_vehicle_display_info",
        { p_instrutor_id: id }
      );

      const veiculo = veiculoData && veiculoData.length > 0 ? veiculoData[0] : null;

      // Fetch kyc_status and recipient_id from instrutores table
      const { data: instrutorPrivate } = await supabase
        .from("instrutores")
        .select("kyc_status, pagarme_recipient_id")
        .eq("id", id)
        .single();

      const kycStatus = instrutorPrivate?.kyc_status || null;
      const pagarmeRecipientId = instrutorPrivate?.pagarme_recipient_id || null;
      
      // Instructor is verified for payments if has recipient AND kyc is approved
      setIsVerifiedForPayments(
        !!pagarmeRecipientId && kycStatus === "approved"
      );

      setInstructor({
        id: id!,
        name: cacheData.nome || "Instrutor",
        photo: cacheData.foto || "",
        rating: Number(cacheData.nota_media) || 5.0,
        reviews: cacheData.total_avaliacoes || 0,
        price: Number(cacheData.preco_hora) || 20,
        distance: `${cacheData.raio_atendimento_km || 10} km`,
        car: {
          model: veiculo?.modelo || "Veículo não informado",
          transmission: veiculo?.transmissao === "automatico" ? "Automático" : "Manual",
          features: ["Ar condicionado", "Direção elétrica"],
        },
        verified: true,
        bio: cacheData.bio || "Instrutor profissional credenciado pelo DETRAN.",
        totalLessons: cacheData.total_aulas || 0,
        responseTime: "5 min",
        tags: ["Paciente", "Pontual", "Experiente"],
        kycStatus,
        pagarmeRecipientId,
      });
    } catch (err) {
      console.error("Error in fetchInstructorData:", err);
      navigate("/aluno/buscar");
    } finally {
      setLoading(false);
    }
  }

  const selectedDaySlots = defaultAvailability.find((d) => d.day === selectedDay)?.slots || [];

  if (loading || !instructor) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header Image */}
      <div className="relative h-72">
        {instructor.photo ? (
          <img
            src={instructor.photo}
            alt={instructor.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
            <span className="text-6xl font-bold text-primary">
              {instructor.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Back Button */}
        <button
          onClick={() => navigate("/aluno/buscar")}
          className="absolute top-6 left-6 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-lg safe-top"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Verified Badge */}
        {instructor.verified && isVerifiedForPayments ? (
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium safe-top">
            <Shield className="w-4 h-4" />
            Verificado
          </div>
        ) : !isVerifiedForPayments ? (
          <div className="absolute top-6 right-6 flex items-center gap-2 bg-amber-500 text-white px-3 py-1.5 rounded-full text-sm font-medium safe-top">
            <AlertTriangle className="w-4 h-4" />
            Verificação pendente
          </div>
        ) : null}
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
                {defaultAvailability.map((day) => (
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
              {defaultReviews.map((review) => (
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
          {!isVerifiedForPayments ? (
            <Button
              variant="outline"
              size="lg"
              className="flex-1 border-amber-500 text-amber-600"
              disabled
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Instrutor em verificação
            </Button>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
