import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check, Clock, QrCode, Loader2, CheckCircle2, CreditCard, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PIX_DISCOUNT_PERCENTAGE } from "@/lib/pagarme";

interface PaymentCheckoutProps {
  open: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
  amount: number;
  lessonId: string;
  instructorName?: string;
  lessonDate?: string;
}

interface PixData {
  qrCode: string;
  qrCodeUrl: string;
  expiresAt: string;
  transactionId: string;
}

export function PaymentCheckout({
  open,
  onClose,
  onPaymentComplete,
  amount,
  lessonId,
  instructorName,
  lessonDate,
}: PaymentCheckoutProps) {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<"pix" | "card">("pix");
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "pending" | "processing" | "success" | "expired">("idle");
  const [error, setError] = useState<string | null>(null);

  const pixAmount = amount * (1 - PIX_DISCOUNT_PERCENTAGE / 100);
  const discount = amount - pixAmount;

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setPaymentStatus("idle");
      setPixData(null);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  // Poll for payment status
  useEffect(() => {
    if (!pixData?.transactionId || paymentStatus !== "pending") return;

    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke("check-payment-status-pagarme", {
          body: { transactionId: pixData.transactionId, aulaId: lessonId },
        });

        if (error) {
          console.error("[PaymentCheckout] Error checking payment status:", error);
          return;
        }

        if (data?.status === "succeeded" || data?.status === "paid") {
          setPaymentStatus("success");
          clearInterval(interval);
          
          toast({
            title: "Pagamento confirmado!",
            description: "Sua aula está confirmada.",
          });
          
          setTimeout(() => {
            onPaymentComplete();
          }, 2000);
        }
      } catch (err) {
        console.error("[PaymentCheckout] Error polling payment:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pixData, paymentStatus, lessonId]);

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
    setPaymentStatus("processing");

    try {
      console.log("[PaymentCheckout] Generating PIX for lesson:", lessonId);
      
      // Get lesson details for PIX generation
      const { data: aula, error: aulaError } = await supabase
        .from("aulas")
        .select("instrutor_id, duracao_minutos, usa_carro_aluno, ponto_encontro, data_hora, latitude_aluno, longitude_aluno")
        .eq("id", lessonId)
        .single();

      if (aulaError || !aula) {
        throw new Error("Aula não encontrada");
      }

      const { data, error: invokeError } = await supabase.functions.invoke("create-pix-payment-pagarme", {
        body: {
          amount,
          duration: aula.duracao_minutos,
          instructorId: aula.instrutor_id,
          useOwnCar: aula.usa_carro_aluno || false,
          meetingPoint: aula.ponto_encontro || "",
          scheduledDate: aula.data_hora,
          studentLat: aula.latitude_aluno,
          studentLng: aula.longitude_aluno,
          existingLessonId: lessonId, // Use existing lesson instead of creating new
        },
      });

      if (invokeError) {
        console.error("[PaymentCheckout] Error generating PIX:", invokeError);
        throw new Error("Erro ao gerar pagamento PIX");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.qrCode) {
        setPixData({
          qrCode: data.qrCode,
          qrCodeUrl: data.qrCodeUrl,
          expiresAt: data.expiresAt,
          transactionId: data.transactionId,
        });
        setPaymentStatus("pending");
      } else {
        throw new Error("Não foi possível gerar o QR Code PIX");
      }
    } catch (err: any) {
      console.error("[PaymentCheckout] Error:", err);
      setError(err.message || "Erro ao gerar pagamento");
      setPaymentStatus("idle");
      toast({
        title: "Erro no pagamento",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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
    if (paymentStatus === "success") {
      onPaymentComplete();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Pagamento da Aula
          </DialogTitle>
        </DialogHeader>

        {/* Lesson Info */}
        {(instructorName || lessonDate) && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm">
            {instructorName && <p className="font-medium">{instructorName}</p>}
            {lessonDate && <p className="text-muted-foreground">{lessonDate}</p>}
          </div>
        )}

        {paymentStatus === "success" ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground">Pagamento Confirmado!</h3>
              <p className="text-muted-foreground mt-1">Sua aula está confirmada.</p>
            </div>
          </div>
        ) : (
          <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "pix" | "card")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pix" className="flex items-center gap-2">
                <QrCode className="w-4 h-4" />
                PIX
              </TabsTrigger>
              <TabsTrigger value="card" className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Cartão
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pix" className="space-y-4 mt-4">
              {/* PIX Discount Badge */}
              <div className="flex items-center justify-center">
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  🎉 {PIX_DISCOUNT_PERCENTAGE}% de desconto no PIX!
                </Badge>
              </div>

              {/* Amount Summary */}
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Valor original</span>
                  <span className="line-through text-muted-foreground">
                    R$ {amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Desconto PIX</span>
                  <span>-R$ {discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-border pt-2">
                  <span>Total</span>
                  <span className="text-primary">R$ {pixAmount.toFixed(2)}</span>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {paymentStatus === "idle" && (
                <Button 
                  onClick={generatePixPayment} 
                  className="w-full" 
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Gerando PIX...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 mr-2" />
                      Gerar QR Code PIX
                    </>
                  )}
                </Button>
              )}

              {paymentStatus === "pending" && pixData && (
                <div className="space-y-4">
                  {/* QR Code */}
                  <div className="flex flex-col items-center gap-4">
                    {pixData.qrCodeUrl ? (
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
                        Copiar código PIX
                      </>
                    )}
                  </Button>

                  {/* Waiting indicator */}
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Aguardando pagamento...</span>
                  </div>
                </div>
              )}

              {paymentStatus === "expired" && (
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
              )}
            </TabsContent>

            <TabsContent value="card" className="space-y-4 mt-4">
              {/* Card Amount */}
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total no cartão</span>
                  <span className="text-primary">R$ {amount.toFixed(2)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Sem desconto no cartão de crédito
                </p>
              </div>

              {/* Card Payment Notice */}
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-center">
                <Smartphone className="w-8 h-8 mx-auto text-amber-600 mb-2" />
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Pagamento por cartão em breve!
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
                  Por enquanto, use o PIX para um desconto de {PIX_DISCOUNT_PERCENTAGE}%
                </p>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setPaymentMethod("pix")}
              >
                <QrCode className="w-4 h-4 mr-2" />
                Pagar com PIX ({PIX_DISCOUNT_PERCENTAGE}% off)
              </Button>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
