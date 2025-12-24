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

// Use the publishable key
const stripePromise = loadStripe("pk_live_51RSkCFE3Lvi1VXvkiLUfJk1qhB2JMEA1JYjU6sJ6NyTDhZfH3A3f5qCvdMfOaM2Ew6A4KdJC6E8Ub7E1hRqPqdR800hV3VLxK8");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href, // Not used since we handle redirect manually
      },
      redirect: "if_required",
    });

    if (error) {
      setMessage(error.message || "Ocorreu um erro no pagamento.");
      onError(error.message || "Erro no pagamento");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "requires_capture") {
      // Payment authorized successfully!
      onSuccess();
    } else if (paymentIntent) {
      // Other status
      setMessage(`Status do pagamento: ${paymentIntent.status}`);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement 
        options={{
          layout: "tabs",
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
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Processando...
          </>
        ) : (
          `Autorizar R$ ${amount.toFixed(2)}`
        )}
      </Button>

      <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
        <Shield className="w-4 h-4" />
        <span>Pagamento seguro via Stripe</span>
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
      setPaymentStatus("idle");
      setErrorMessage(null);
    }
  }, [open]);

  const handleSuccess = () => {
    setPaymentStatus("success");
    setTimeout(() => {
      onSuccess();
    }, 1500);
  };

  const handleError = (error: string) => {
    setPaymentStatus("error");
    setErrorMessage(error);
  };

  if (!clientSecret) {
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
              <h3 className="font-semibold text-lg">Pagamento Autorizado!</h3>
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
