import { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Shield, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { STRIPE_PUBLISHABLE_KEY } from "@/lib/stripe";

// Initialize Stripe with centralized key
const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onError: (error: string) => void;
  instructorName: string;
}

function PaymentForm({ amount, onSuccess, onError, instructorName }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  console.log("[PaymentForm] Mounted, stripe ready:", !!stripe, "elements ready:", !!elements);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[PaymentForm] Submit clicked");

    if (!stripe || !elements) {
      console.error("[PaymentForm] Stripe or elements not loaded");
      setMessage("Carregando sistema de pagamento...");
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      console.log("[PaymentForm] Calling stripe.confirmPayment...");
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/aluno/aula-confirmada`,
        },
        redirect: "if_required",
      });

      console.log("[PaymentForm] confirmPayment result:", { error, paymentIntent });

      if (error) {
        console.error("[PaymentForm] Payment error:", error);
        const errorMsg = error.message || "Ocorreu um erro no pagamento.";
        setMessage(errorMsg);
        onError(errorMsg);
        setIsProcessing(false);
      } else if (paymentIntent) {
        console.log("[PaymentForm] PaymentIntent status:", paymentIntent.status);
        
        if (paymentIntent.status === "requires_capture") {
          // Payment authorized successfully (manual capture)
          console.log("[PaymentForm] Payment authorized successfully!");
          onSuccess();
        } else if (paymentIntent.status === "succeeded") {
          // Payment completed (if capture_method was automatic)
          console.log("[PaymentForm] Payment succeeded!");
          onSuccess();
        } else {
          setMessage(`Status: ${paymentIntent.status}. Aguarde ou tente novamente.`);
          setIsProcessing(false);
        }
      }
    } catch (err: any) {
      console.error("[PaymentForm] Exception:", err);
      const errorMsg = err.message || "Erro inesperado no pagamento";
      setMessage(errorMsg);
      onError(errorMsg);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement 
        onReady={() => {
          console.log("[PaymentElement] Ready");
          setIsReady(true);
        }}
        onChange={(e) => {
          console.log("[PaymentElement] Changed:", e.complete ? "complete" : "incomplete");
        }}
        options={{
          layout: "tabs",
          wallets: {
            applePay: "auto",
            googlePay: "auto",
          },
          paymentMethodOrder: ["apple_pay", "google_pay", "card"],
        }}
      />
      
      {message && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        variant="hero"
        size="xl"
        className="w-full"
        disabled={!stripe || !isReady || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Processando...
          </>
        ) : !isReady ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Carregando...
          </>
        ) : (
          `Autorizar R$ ${amount.toFixed(2)}`
        )}
      </Button>

      <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
        <Shield className="w-4 h-4" />
        <span>Pagamento seguro via Stripe • Apple Pay • Google Pay</span>
      </div>
    </form>
  );
}

interface StripePaymentModalProps {
  open: boolean;
  onClose: () => void;
  clientSecret: string | null;
  amount: number;
  instructorName: string;
  onSuccess: () => void;
}

export function StripePaymentModal({
  open,
  onClose,
  clientSecret,
  amount,
  instructorName,
  onSuccess,
}: StripePaymentModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      console.log("[StripePaymentModal] Opened with clientSecret:", clientSecret ? "present" : "missing");
      setPaymentStatus("idle");
      setErrorMessage(null);
    }
  }, [open, clientSecret]);

  const handleSuccess = () => {
    console.log("[StripePaymentModal] Payment success!");
    setPaymentStatus("success");
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  const handleError = (error: string) => {
    console.error("[StripePaymentModal] Payment error:", error);
    setPaymentStatus("error");
    setErrorMessage(error);
  };

  if (!clientSecret) {
    console.warn("[StripePaymentModal] No clientSecret provided");
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Confirmar Pagamento</DialogTitle>
          <DialogDescription className="space-y-2">
            <span className="block">Aula com {instructorName}</span>
          </DialogDescription>
        </DialogHeader>

        {paymentStatus === "success" ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Pagamento Processado!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Seu cartão foi pré-autorizado. O valor só será cobrado quando o instrutor aceitar a aula.
              </p>
            </div>
          </div>
        ) : (
          <>
            <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                <strong>Pagamento seguro:</strong> O valor só será cobrado se o instrutor aceitar a aula. Se recusar, o hold é liberado automaticamente.
              </AlertDescription>
            </Alert>

            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#0ea5e9",
                    borderRadius: "12px",
                  },
                },
              }}
            >
              <PaymentForm
                amount={amount}
                instructorName={instructorName}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </Elements>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
