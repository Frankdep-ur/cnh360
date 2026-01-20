import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Check, Clock, QrCode, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PixPaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  originalAmount: number;
  instructorName: string;
  instructorId: string;
  duration: number;
  useOwnCar: boolean;
  meetingPoint: string;
  scheduledDate: string;
  studentLat: number | null;
  studentLng: number | null;
  onSuccess: (aulaId: string) => void;
}

interface PixData {
  qrCode: string;
  qrCodeUrl: string;
  expiresAt: string;
  transactionId: string;
  aulaId: string;
}

export function PixPaymentModal({
  open,
  onClose,
  amount,
  originalAmount,
  instructorName,
  instructorId,
  duration,
  useOwnCar,
  meetingPoint,
  scheduledDate,
  studentLat,
  studentLng,
  onSuccess,
}: PixPaymentModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "success" | "expired">("pending");
  const [error, setError] = useState<string | null>(null);

  const discount = originalAmount - amount;
  const discountPercentage = Math.round((discount / originalAmount) * 100);

  // Generate PIX payment
  useEffect(() => {
    if (open && !pixData) {
      generatePixPayment();
    }
  }, [open]);

  // Poll for payment status
  useEffect(() => {
    if (!pixData?.transactionId || paymentStatus !== "pending") return;

    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke("check-payment-status-pagarme", {
          body: { transactionId: pixData.transactionId, aulaId: pixData.aulaId },
        });

        if (error) {
          console.error("[PixModal] Error checking payment status:", error);
          return;
        }

        console.log("[PixModal] Payment status:", data);

        if (data?.status === "succeeded" || data?.status === "paid") {
          setPaymentStatus("success");
          clearInterval(interval);
          
          toast({
            title: "Pagamento PIX confirmado!",
            description: "Aguardando confirmação do instrutor.",
          });
          
          setTimeout(() => {
            onSuccess(pixData.aulaId);
          }, 2000);
        }
      } catch (err) {
        console.error("[PixModal] Error polling payment:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pixData, paymentStatus]);

  // Update countdown timer
  useEffect(() => {
    if (!pixData?.expiresAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiresAt = new Date(pixData.expiresAt).getTime();
      const remaining = Math.floor((expiresAt - now) / 1000);

      if (remaining <= 0) {
        setTimeLeft("Expirado");
        setPaymentStatus("expired");
        return;
      }

      const minutes = Math.floor(remaining / 60);
      const seconds = remaining % 60;
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [pixData?.expiresAt]);

  async function generatePixPayment() {
    setLoading(true);
    setError(null);

    try {
      console.log("[PixModal] Generating PIX payment via Pagar.me...", { amount, instructorId });
      
      const { data, error: invokeError } = await supabase.functions.invoke("create-pix-payment-pagarme", {
        body: {
          amount: originalAmount,
          duration,
          instructorId,
          useOwnCar,
          meetingPoint,
          scheduledDate,
          studentLat,
          studentLng,
        },
      });

      if (invokeError) {
        console.error("[PixModal] Error generating PIX:", invokeError);
        throw new Error(getFriendlyErrorMessage(invokeError.message));
      }

      console.log("[PixModal] PIX generated:", data);

      if (data?.error) {
        throw new Error(getFriendlyErrorMessage(data.error));
      }

      if (data?.qrCode) {
        setPixData({
          qrCode: data.qrCode,
          qrCodeUrl: data.qrCodeUrl,
          expiresAt: data.expiresAt,
          transactionId: data.transactionId,
          aulaId: data.aulaId,
        });
      } else {
        throw new Error("Não foi possível gerar o QR Code PIX. Tente novamente.");
      }
    } catch (err: any) {
      console.error("[PixModal] Error:", err);
      const errorMsg = err.message || "Erro ao gerar PIX. Tente novamente em instantes.";
      setError(errorMsg);
      toast({
        title: "Erro no pagamento PIX",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function getFriendlyErrorMessage(technicalError: string): string {
    const errorMap: Record<string, string> = {
      "Edge Function returned a non-2xx status code": "Não foi possível processar o pagamento. Tente novamente em instantes.",
      "PAGARME_API_KEY não configurada": "Sistema de pagamento temporariamente indisponível. Tente novamente mais tarde.",
      "User not authenticated": "Faça login para continuar com o pagamento.",
      "Aluno não encontrado": "Complete seu cadastro para agendar aulas.",
    };

    for (const [key, friendlyMsg] of Object.entries(errorMap)) {
      if (technicalError.toLowerCase().includes(key.toLowerCase())) {
        return friendlyMsg;
      }
    }

    if (technicalError.includes("non-2xx") || technicalError.includes("500") || technicalError.includes("error")) {
      return "Não foi possível processar o pagamento. Tente novamente em instantes.";
    }

    return technicalError;
  }

  const copyPixCode = async () => {
    if (!pixData?.qrCode) return;

    try {
      await navigator.clipboard.writeText(pixData.qrCode);
      setCopied(true);
      toast({
        title: "Código copiado!",
        description: "Cole no app do seu banco para pagar.",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Error copying:", err);
    }
  };

  const handleClose = () => {
    if (paymentStatus === "success" && pixData?.aulaId) {
      onSuccess(pixData.aulaId);
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Pagamento PIX
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Gerando QR Code PIX...</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={generatePixPayment} className="w-full">
              Tentar novamente
            </Button>
          </div>
        ) : paymentStatus === "success" ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground">Pagamento Confirmado!</h3>
              <p className="text-muted-foreground mt-1">
                Sua aula foi solicitada com sucesso.
              </p>
            </div>
          </div>
        ) : paymentStatus === "expired" ? (
          <div className="space-y-4">
            <Alert>
              <Clock className="w-4 h-4" />
              <AlertDescription>
                O código PIX expirou. Gere um novo código para continuar.
              </AlertDescription>
            </Alert>
            <Button onClick={generatePixPayment} className="w-full">
              Gerar novo código
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Discount Badge */}
            <div className="flex items-center justify-center">
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-sm px-3 py-1">
                🎉 {discountPercentage}% de desconto aplicado!
              </Badge>
            </div>

            {/* Amount Summary */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor original</span>
                <span className="line-through text-muted-foreground">
                  R$ {originalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>Desconto PIX</span>
                <span>-R$ {discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-border pt-2">
                <span>Total a pagar</span>
                <span className="text-primary">R$ {amount.toFixed(2)}</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-4">
              {pixData?.qrCodeUrl ? (
                <img 
                  src={pixData.qrCodeUrl} 
                  alt="QR Code PIX" 
                  className="w-48 h-48 rounded-lg border border-border"
                />
              ) : (
                <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-muted-foreground" />
                </div>
              )}

              {/* Timer */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Expira em: <strong className="text-foreground">{timeLeft}</strong></span>
              </div>
            </div>

            {/* Copy Button */}
            {pixData?.qrCode && (
              <Button
                variant="outline"
                className="w-full"
                onClick={copyPixCode}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Código copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar código PIX (Copia e Cola)
                  </>
                )}
              </Button>
            )}

            {/* Instructions */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-medium text-foreground">Como pagar:</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Abra o app do seu banco</li>
                <li>Escolha pagar com PIX usando QR Code</li>
                <li>Escaneie o código acima ou cole o código copiado</li>
                <li>Confirme o pagamento</li>
              </ol>
            </div>

            {/* Waiting indicator */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Aguardando pagamento...</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
