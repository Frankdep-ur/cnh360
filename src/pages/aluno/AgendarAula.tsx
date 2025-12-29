import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Car, 
  Check,
  ChevronRight,
  Loader2,
  Shield,
  CreditCard,
  Smartphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { StripePaymentModal } from "@/components/payment/StripePaymentModal";
import { PixPaymentModal } from "@/components/payment/PixPaymentModal";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { WalletPaymentButtons } from "@/components/payment/WalletPaymentButtons";

// Initialize Stripe
const stripePromise = loadStripe("pk_test_51RVxwm2MzPduPRmkVHxV5VK5C5jFJDcGvxpH6pvbWmkBDPwT5FT4FBL3hYO5RpRiCmGNlxUcxG7F9yc0rZyM2TRZ00XaIZlDaF");

const paymentMethods = [
  { id: "apple_pay", label: "Apple Pay", icon: "🍎", discount: 0, isWallet: true },
  { id: "google_pay", label: "Google Pay", icon: "🔴", discount: 0, isWallet: true },
  { id: "credit", label: "Cartão de Crédito/Débito", icon: "💳", discount: 0 },
  { id: "pix", label: "PIX", icon: "💰", discount: 5, disabled: false },
  { id: "wallet", label: "Saldo CNH 360", icon: "👛", discount: 0, balance: 150, disabled: true, note: "Em breve" },
];

interface InstructorData {
  id: string;
  user_id: string;
  name: string;
  photo: string;
  price: number;
  car: string;
  email: string | null;
}

// Payment Step Content Component (inside Elements provider)
interface PaymentStepContentProps {
  duration: number;
  basePrice: number;
  carDiscount: number;
  paymentDiscount: number;
  totalPrice: number;
  selectedPayment: string | null;
  setSelectedPayment: (id: string) => void;
  walletClientSecret: string | null;
  onWalletPaymentSuccess: () => void;
  onWalletAvailabilityChange: (available: boolean, type: 'applePay' | 'googlePay' | null) => void;
  walletAvailable: { applePay: boolean; googlePay: boolean };
}

function PaymentStepContent({
  duration,
  basePrice,
  carDiscount,
  paymentDiscount,
  totalPrice,
  selectedPayment,
  setSelectedPayment,
  walletClientSecret,
  onWalletPaymentSuccess,
  onWalletAvailabilityChange,
  walletAvailable,
}: PaymentStepContentProps) {
  // Filter payment methods based on wallet availability
  const availableMethods = paymentMethods.filter(method => {
    if (method.id === 'apple_pay') return walletAvailable.applePay;
    if (method.id === 'google_pay') return walletAvailable.googlePay;
    return true;
  });

  const handleWalletPayment = (event: any) => {
    console.log("[PaymentStep] Wallet payment completed:", event);
    onWalletPaymentSuccess();
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Pagamento
        </h1>
        <p className="text-muted-foreground">
          Escolha a forma de pagamento
        </p>
      </div>

      {/* Security Notice */}
      <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <Shield className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
          <strong>Pagamento protegido:</strong> O valor só é cobrado após o instrutor aceitar a aula. Se recusar, o hold é liberado automaticamente.
        </AlertDescription>
      </Alert>

      {/* Summary */}
      <div className="bg-muted/50 rounded-2xl p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Aula ({duration}h)</span>
          <span className="font-medium">R$ {basePrice.toFixed(2)}</span>
        </div>
        {carDiscount > 0 && (
          <div className="flex justify-between text-primary">
            <span>Desconto (carro próprio)</span>
            <span>-R$ {carDiscount.toFixed(2)}</span>
          </div>
        )}
        {paymentDiscount > 0 && (
          <div className="flex justify-between text-primary">
            <span>Desconto PIX (5%)</span>
            <span>-R$ {paymentDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-border pt-3 flex justify-between">
          <span className="font-semibold text-foreground">Total</span>
          <span className="text-2xl font-bold text-primary">R$ {totalPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* Native Wallet Button (Apple Pay / Google Pay) */}
      {(walletAvailable.applePay || walletAvailable.googlePay) && walletClientSecret && (
        <div className="space-y-2">
          <WalletPaymentButtons
            amount={totalPrice}
            label="Aula de Direção"
            onPaymentMethod={handleWalletPayment}
            onAvailabilityChange={onWalletAvailabilityChange}
            clientSecret={walletClientSecret}
          />
        </div>
      )}

      {/* Payment Methods */}
      <div className="space-y-3">
        {availableMethods.map((method) => {
          // Skip wallet methods in list if they have native button above
          const isWalletMethod = method.id === 'apple_pay' || method.id === 'google_pay';
          
          return (
            <button
              key={method.id}
              onClick={() => !method.disabled && setSelectedPayment(method.id)}
              disabled={method.disabled}
              className={cn(
                "w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4",
                method.disabled 
                  ? "opacity-50 cursor-not-allowed border-border"
                  : selectedPayment === method.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
              )}
            >
              <span className="text-2xl">{method.icon}</span>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{method.label}</h3>
                  {method.discount > 0 && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                      {method.discount}% OFF
                    </span>
                  )}
                  {method.note && (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                      {method.note}
                    </span>
                  )}
                  {isWalletMethod && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                      Disponível
                    </span>
                  )}
                </div>
                {method.balance !== undefined && (
                  <p className="text-sm text-muted-foreground">Saldo: R$ {method.balance.toFixed(2)}</p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          );
        })}
      </div>

      {/* Card info */}
      {selectedPayment === "credit" && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
          <CreditCard className="w-4 h-4" />
          <span>Aceitamos Visa, Mastercard, Elo, Amex e mais</span>
        </div>
      )}

      {/* Hidden wallet availability check (only when no client secret yet) */}
      {!walletClientSecret && (
        <div className="hidden">
          <WalletPaymentButtons
            amount={totalPrice}
            label="Aula de Direção"
            onPaymentMethod={() => {}}
            onAvailabilityChange={onWalletAvailabilityChange}
          />
        </div>
      )}
    </div>
  );
}


export default function AgendarAula() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const day = searchParams.get("day") || "Seg";
  const time = searchParams.get("time") || "14:00";
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [duration, setDuration] = useState(1);
  const [useOwnCar, setUseOwnCar] = useState(false);
  const [meetingPoint, setMeetingPoint] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<string | null>("credit");
  const [loading, setLoading] = useState(false);
  const [instructor, setInstructor] = useState<InstructorData>({
    id: "",
    user_id: "",
    name: "Instrutor",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    price: 80,
    car: "Veículo não informado",
    email: null,
  });

  // Stripe payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [createdAulaId, setCreatedAulaId] = useState<string | null>(null);
  
  // PIX payment state
  const [showPixModal, setShowPixModal] = useState(false);
  
  // Wallet availability state
  const [walletAvailable, setWalletAvailable] = useState<{
    applePay: boolean;
    googlePay: boolean;
  }>({ applePay: false, googlePay: false });
  const [walletClientSecret, setWalletClientSecret] = useState<string | null>(null);
  const [isPreparingWallet, setIsPreparingWallet] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInstructorData();
    }
  }, [id]);

  async function fetchInstructorData() {
    try {
      if (id?.startsWith("mock-")) {
        setInstructor({
          id: id,
          user_id: "mock-user",
          name: "Carlos Silva",
          photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
          price: 80,
          car: "VW Polo 2023 - Automático",
          email: null,
        });
        return;
      }

      const { data: cacheData, error: cacheError } = await supabase
        .from("instrutores_publico_cache")
        .select("*")
        .eq("id", id)
        .single();

      if (cacheError) {
        console.error("Error fetching instructor:", cacheError);
        return;
      }

      const { data: veiculoData } = await supabase.rpc(
        "get_vehicle_display_info",
        { p_instrutor_id: id }
      );

      const veiculo = veiculoData && veiculoData.length > 0
        ? veiculoData[0]
        : null;

      const carType = veiculo
        ? `${veiculo.modelo} - ${veiculo.transmissao === "automatico" ? "Automático" : "Manual"}`
        : "Veículo não informado";

      setInstructor({
        id: id!,
        user_id: id!,
        name: cacheData.nome || "Instrutor",
        photo: cacheData.foto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
        price: Number(cacheData.preco_hora) || 80,
        car: carType,
        email: null,
      });
    } catch (err) {
      console.error("Error in fetchInstructorData:", err);
    }
  }

  const basePrice = instructor.price * duration;
  const carDiscount = useOwnCar ? basePrice * 0.15 : 0;
  const paymentDiscount = selectedPayment === "pix" ? (basePrice - carDiscount) * 0.05 : 0;
  const totalPrice = basePrice - carDiscount - paymentDiscount;

  const canProceed = () => {
    if (step === 1) return meetingPoint.length > 5;
    if (step === 2) return selectedPayment !== null;
    return false;
  };

  const handleNext = async () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      await createLesson();
    }
  };

  async function createLesson() {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Faça login para agendar uma aula.",
        variant: "destructive",
      });
      navigate("/auth?type=aluno");
      return;
    }

    setLoading(true);
    try {
      const { data: alunoData, error: alunoError } = await supabase
        .from("alunos")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (alunoError) {
        console.error("Error fetching aluno:", alunoError);
        toast({
          title: "Erro",
          description: "Complete seu cadastro de aluno primeiro.",
          variant: "destructive",
        });
        navigate("/onboarding/aluno");
        return;
      }

      const realInstrutorId = instructor.id;

      // Calculate scheduled date/time
      const scheduledDate = new Date();
      const [hours, minutes] = time.split(":").map(Number);
      scheduledDate.setHours(hours, minutes, 0, 0);
      
      const daysMap: { [key: string]: number } = {
        "Dom": 0, "Seg": 1, "Ter": 2, "Qua": 3, "Qui": 4, "Sex": 5, "Sáb": 6
      };
      const targetDay = daysMap[day] ?? 1;
      const currentDay = scheduledDate.getDay();
      const daysToAdd = (targetDay - currentDay + 7) % 7 || 7;
      scheduledDate.setDate(scheduledDate.getDate() + daysToAdd);

      // Get student's current location
      let studentLat: number | null = null;
      let studentLng: number | null = null;
      
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        });
        studentLat = position.coords.latitude;
        studentLng = position.coords.longitude;
      } catch (geoErr) {
        console.log("Could not get location:", geoErr);
      }

      // Create the lesson with pending status
      const { data: aulaData, error: aulaError } = await supabase
        .from("aulas")
        .insert({
          aluno_id: alunoData.id,
          instrutor_id: realInstrutorId,
          data_hora: scheduledDate.toISOString(),
          duracao_minutos: duration * 60,
          ponto_encontro: meetingPoint,
          valor: totalPrice,
          usa_carro_aluno: useOwnCar,
          status: "pendente",
          latitude_aluno: studentLat,
          longitude_aluno: studentLng,
        })
        .select()
        .single();

      if (aulaError) {
        console.error("Error creating lesson:", aulaError);
        throw aulaError;
      }

      console.log("Lesson created:", aulaData);
      setCreatedAulaId(aulaData.id);

      // For card payments (including Apple Pay/Google Pay), create PaymentIntent with manual capture
      if (selectedPayment === "credit" || selectedPayment === "apple_pay" || selectedPayment === "google_pay") {
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
          "create-lesson-payment",
          {
            body: {
              amount: totalPrice,
              duration: duration * 60,
              instructorName: instructor.name,
              instructorId: realInstrutorId,
              aulaId: aulaData.id,
              paymentMethod: selectedPayment === "credit" ? "card" : selectedPayment,
            },
          }
        );

        if (paymentError) {
          console.error("Error creating payment:", paymentError);
          throw new Error("Erro ao criar pagamento");
        }

        if (paymentData?.clientSecret) {
          // For Apple Pay/Google Pay, set wallet client secret for inline payment
          if (selectedPayment === "apple_pay" || selectedPayment === "google_pay") {
            setWalletClientSecret(paymentData.clientSecret);
            setIsPreparingWallet(false);
            // The WalletPaymentButtons component will handle the payment
            toast({
              title: "Pronto para pagar!",
              description: "Toque no botão de pagamento para confirmar.",
            });
            setLoading(false);
            return;
          }
          
          // For regular credit card, show modal
          setClientSecret(paymentData.clientSecret);
          setShowPaymentModal(true);
          setLoading(false);
          return;
        }
      }

      // For PIX payments, show PIX modal
      if (selectedPayment === "pix") {
        setShowPixModal(true);
        setLoading(false);
        return;
      }

      // For wallet balance, just navigate to waiting page
      toast({
        title: "Aula solicitada!",
        description: "Aguardando confirmação do instrutor.",
      });

      navigate(`/aluno/aula-solicitada/${aulaData.id}`);
    } catch (err: any) {
      console.error("Error in createLesson:", err);
      toast({
        title: "Erro ao agendar aula",
        description: err.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const handlePaymentSuccess = () => {
    toast({
      title: "Pagamento autorizado!",
      description: "Seu cartão foi pré-autorizado. Aguardando confirmação do instrutor.",
    });
    setShowPaymentModal(false);
    if (createdAulaId) {
      navigate(`/aluno/aula-solicitada/${createdAulaId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 pt-6 pb-4 safe-top">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
              className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex gap-2">
                {[1, 2].map((s) => (
                  <div
                    key={s}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-all",
                      s <= step ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Instructor Summary */}
          <div className="flex items-center gap-3">
            <img
              src={instructor.photo}
              alt={instructor.name}
              className="w-12 h-12 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">{instructor.name}</h2>
              <p className="text-sm text-muted-foreground">{day} às {time}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-6 py-6">
        <div className="max-w-md mx-auto">
          {/* Step 1: Details */}
          {step === 1 && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Detalhes da aula
                </h1>
                <p className="text-muted-foreground">
                  Configure sua aula prática
                </p>
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Duração da aula
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((h) => (
                    <button
                      key={h}
                      onClick={() => setDuration(h)}
                      className={cn(
                        "py-4 rounded-2xl border-2 transition-all",
                        duration === h
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <Clock className={cn(
                        "w-6 h-6 mx-auto mb-1",
                        duration === h ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className="font-semibold text-foreground">{h}h</span>
                      <p className="text-xs text-muted-foreground">R$ {instructor.price * h}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Own Car Option */}
              <div>
                <button
                  onClick={() => setUseOwnCar(!useOwnCar)}
                  className={cn(
                    "w-full p-4 rounded-2xl border-2 transition-all flex items-center gap-4",
                    useOwnCar
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    useOwnCar ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    <Car className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-foreground">Usar meu próprio carro</h3>
                    <p className="text-sm text-muted-foreground">Economize 15% na aula</p>
                  </div>
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                    useOwnCar ? "border-primary bg-primary" : "border-muted-foreground"
                  )}>
                    {useOwnCar && <Check className="w-4 h-4 text-primary-foreground" />}
                  </div>
                </button>
                {!useOwnCar && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Car className="w-3 h-3" />
                    Veículo do instrutor: {instructor.car}
                  </p>
                )}
              </div>

              {/* Meeting Point */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Local de encontro
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Digite o endereço..."
                    value={meetingPoint}
                    onChange={(e) => setMeetingPoint(e.target.value)}
                    className="pl-10 h-14 rounded-xl"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <Elements stripe={stripePromise}>
              <PaymentStepContent
                duration={duration}
                basePrice={basePrice}
                carDiscount={carDiscount}
                paymentDiscount={paymentDiscount}
                totalPrice={totalPrice}
                selectedPayment={selectedPayment}
                setSelectedPayment={setSelectedPayment}
                walletClientSecret={walletClientSecret}
                onWalletPaymentSuccess={handlePaymentSuccess}
                onWalletAvailabilityChange={(available, type) => {
                  if (type === 'applePay') {
                    setWalletAvailable(prev => ({ ...prev, applePay: available }));
                  } else if (type === 'googlePay') {
                    setWalletAvailable(prev => ({ ...prev, googlePay: available }));
                  }
                }}
                walletAvailable={walletAvailable}
              />
            </Elements>
          )}
        </div>
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-background via-background to-transparent safe-bottom">
        <div className="max-w-md mx-auto">
          <Button
            variant="hero"
            size="xl"
            className="w-full"
            disabled={!canProceed() || loading}
            onClick={handleNext}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : step === 2 ? (
              `Solicitar Aula - R$ ${totalPrice.toFixed(2)}`
            ) : (
              "Continuar"
            )}
          </Button>
        </div>
      </div>

      {/* Stripe Payment Modal */}
      <StripePaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        clientSecret={clientSecret}
        amount={totalPrice}
        instructorName={instructor.name}
        onSuccess={handlePaymentSuccess}
      />

      {/* PIX Payment Modal */}
      {createdAulaId && (
        <PixPaymentModal
          open={showPixModal}
          onClose={() => setShowPixModal(false)}
          amount={totalPrice * 0.95} // Value in reais with 5% discount
          originalAmount={totalPrice} // Original value in reais
          instructorName={instructor.name}
          aulaId={createdAulaId}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
