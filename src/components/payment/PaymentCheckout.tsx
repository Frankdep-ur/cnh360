import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Copy, Check, Clock, QrCode, Loader2, CheckCircle2, CreditCard, AlertCircle, Shield, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePagarmeToken } from "@/hooks/usePagarmeToken";
import { useWalletPayments } from "@/hooks/useWalletPayments";
import { 
  PIX_DISCOUNT_PERCENTAGE, 
  formatCardNumber, 
  formatExpMonth, 
  formatExpYear, 
  formatCVV, 
  validateCard, 
  getCardBrand,
  getFriendlyPaymentError,
  type CardData 
} from "@/lib/pagarme";

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

  // Card form state
  const [cardData, setCardData] = useState<CardData>({
    number: "",
    holder_name: "",
    exp_month: "",
    exp_year: "",
    cvv: "",
  });
  const [cardErrors, setCardErrors] = useState<string[]>([]);
  const [cardLoading, setCardLoading] = useState(false);

  // Pagar.me tokenization hook
  const { tokenize, isReady: sdkReady, hasPublicKey } = usePagarmeToken();
  
  // Wallet payments (Google Pay / Apple Pay)
  const { 
    googlePayReady, 
    applePayReady, 
    processGooglePay, 
    processApplePay, 
    loading: walletLoading,
    hasWallets 
  } = useWalletPayments(amount);

  const pixAmount = amount * (1 - PIX_DISCOUNT_PERCENTAGE / 100);
  const discount = amount - pixAmount;
  const cardBrand = getCardBrand(cardData.number);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setPaymentStatus("idle");
      setPixData(null);
      setError(null);
      setLoading(false);
      setCardData({ number: "", holder_name: "", exp_month: "", exp_year: "", cvv: "" });
      setCardErrors([]);
      setCardLoading(false);
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
          aulaId: lessonId,
        },
      });

      if (invokeError) {
        console.error("[PaymentCheckout] Error generating PIX:", invokeError);
        throw new Error(getFriendlyPaymentError(invokeError.message));
      }

      if (data?.error) {
        throw new Error(getFriendlyPaymentError(data.error));
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

  async function processCardPayment() {
    setCardLoading(true);
    setCardErrors([]);
    setError(null);

    try {
      // Validate card data
      const validation = validateCard(cardData);
      if (!validation.valid) {
        setCardErrors(validation.errors);
        setCardLoading(false);
        return;
      }

      // Check if SDK is ready
      if (!sdkReady || !hasPublicKey) {
        throw new Error("SDK de pagamento não está pronto. Tente novamente.");
      }

      console.log("[PaymentCheckout] Tokenizing card for lesson:", lessonId);

      // Tokenize card using Pagar.me SDK (card data never leaves browser unencrypted)
      const tokenResult = await tokenize(cardData);
      
      if (!tokenResult.success || !tokenResult.cardHash) {
        throw new Error(tokenResult.error || "Erro ao tokenizar cartão");
      }

      console.log("[PaymentCheckout] Card tokenized, sending to backend");

      // Send only the encrypted card_hash to backend (PCI compliant)
      const { data, error: invokeError } = await supabase.functions.invoke("create-card-payment-pagarme", {
        body: {
          cardHash: tokenResult.cardHash,
          lessonId,
          amount,
        },
      });

      if (invokeError) {
        console.error("[PaymentCheckout] Error processing card:", invokeError);
        throw new Error(getFriendlyPaymentError(invokeError.message));
      }

      if (data?.error) {
        throw new Error(getFriendlyPaymentError(data.error));
      }

      // Check payment status
      if (data?.status === "authorized" || data?.status === "paid" || data?.status === "pending") {
        setPaymentStatus("success");
        toast({
          title: "Pagamento autorizado!",
          description: data.message || "Sua aula está confirmada.",
        });
        setTimeout(() => {
          onPaymentComplete();
        }, 2000);
      } else {
        throw new Error("Pagamento não autorizado");
      }
    } catch (err: any) {
      console.error("[PaymentCheckout] Card error:", err);
      setCardErrors([err.message || "Erro ao processar pagamento"]);
      toast({
        title: "Erro no pagamento",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setCardLoading(false);
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

  const updateCardField = (field: keyof CardData, value: string) => {
    setCardData(prev => ({ ...prev, [field]: value }));
    // Clear errors when user starts typing
    if (cardErrors.length > 0) {
      setCardErrors([]);
    }
  };

  // Handle Google Pay payment
  const handleGooglePay = async () => {
    setCardErrors([]);
    setError(null);

    try {
      const result = await processGooglePay();
      
      if (!result.success) {
        if (result.error !== "Pagamento cancelado") {
          toast({
            title: "Erro no Google Pay",
            description: result.error,
            variant: "destructive",
          });
        }
        return;
      }

      console.log("[PaymentCheckout] Google Pay token received, sending to backend");

      // Send wallet token to backend
      const { data, error: invokeError } = await supabase.functions.invoke("create-card-payment-pagarme", {
        body: {
          walletToken: result.walletToken,
          walletType: result.walletType,
          lessonId,
          amount,
        },
      });

      if (invokeError) {
        throw new Error(getFriendlyPaymentError(invokeError.message));
      }

      if (data?.error) {
        throw new Error(getFriendlyPaymentError(data.error));
      }

      if (data?.status === "authorized" || data?.status === "paid" || data?.status === "pending") {
        setPaymentStatus("success");
        toast({
          title: "Pagamento autorizado!",
          description: "Pagamento via Google Pay confirmado.",
        });
        setTimeout(() => onPaymentComplete(), 2000);
      } else {
        throw new Error("Pagamento não autorizado");
      }
    } catch (err: any) {
      console.error("[PaymentCheckout] Google Pay error:", err);
      setCardErrors([err.message || "Erro ao processar pagamento"]);
      toast({
        title: "Erro no pagamento",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  // Handle Apple Pay payment
  const handleApplePay = async () => {
    setCardErrors([]);
    setError(null);

    try {
      const result = await processApplePay();
      
      if (!result.success) {
        if (result.error !== "Pagamento cancelado") {
          toast({
            title: "Erro no Apple Pay",
            description: result.error,
            variant: "destructive",
          });
        }
        return;
      }

      console.log("[PaymentCheckout] Apple Pay token received, sending to backend");

      // Send wallet token to backend
      const { data, error: invokeError } = await supabase.functions.invoke("create-card-payment-pagarme", {
        body: {
          walletToken: result.walletToken,
          walletType: result.walletType,
          lessonId,
          amount,
        },
      });

      if (invokeError) {
        throw new Error(getFriendlyPaymentError(invokeError.message));
      }

      if (data?.error) {
        throw new Error(getFriendlyPaymentError(data.error));
      }

      if (data?.status === "authorized" || data?.status === "paid" || data?.status === "pending") {
        setPaymentStatus("success");
        toast({
          title: "Pagamento autorizado!",
          description: "Pagamento via Apple Pay confirmado.",
        });
        setTimeout(() => onPaymentComplete(), 2000);
      } else {
        throw new Error("Pagamento não autorizado");
      }
    } catch (err: any) {
      console.error("[PaymentCheckout] Apple Pay error:", err);
      setCardErrors([err.message || "Erro ao processar pagamento"]);
      toast({
        title: "Erro no pagamento",
        description: err.message,
        variant: "destructive",
      });
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
                  Pague com PIX e ganhe {PIX_DISCOUNT_PERCENTAGE}% de desconto
                </p>
              </div>

              {/* Card Form */}
              <div className="space-y-4">
                {/* Card Number */}
                <div className="space-y-2">
                  <Label htmlFor="card-number">Número do cartão</Label>
                  <div className="relative">
                    <Input
                      id="card-number"
                      placeholder="0000 0000 0000 0000"
                      value={cardData.number}
                      onChange={(e) => updateCardField("number", formatCardNumber(e.target.value))}
                      maxLength={19}
                      className="pr-12"
                    />
                    {cardBrand !== "unknown" && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium uppercase text-muted-foreground">
                        {cardBrand}
                      </div>
                    )}
                  </div>
                </div>

                {/* Holder Name */}
                <div className="space-y-2">
                  <Label htmlFor="holder-name">Nome no cartão</Label>
                  <Input
                    id="holder-name"
                    placeholder="NOME COMO ESTÁ NO CARTÃO"
                    value={cardData.holder_name}
                    onChange={(e) => updateCardField("holder_name", e.target.value.toUpperCase())}
                    maxLength={50}
                  />
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="exp-month">Mês</Label>
                    <Input
                      id="exp-month"
                      placeholder="MM"
                      value={cardData.exp_month}
                      onChange={(e) => updateCardField("exp_month", formatExpMonth(e.target.value))}
                      maxLength={2}
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="exp-year">Ano</Label>
                    <Input
                      id="exp-year"
                      placeholder="AA"
                      value={cardData.exp_year}
                      onChange={(e) => updateCardField("exp_year", formatExpYear(e.target.value))}
                      maxLength={2}
                      inputMode="numeric"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="000"
                      value={cardData.cvv}
                      onChange={(e) => updateCardField("cvv", formatCVV(e.target.value))}
                      maxLength={4}
                      type="password"
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </div>

              {/* Card Errors */}
              {cardErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    {cardErrors.map((err, i) => (
                      <div key={i}>{err}</div>
                    ))}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button 
                onClick={processCardPayment} 
                disabled={cardLoading || walletLoading} 
                className="w-full" 
                size="lg"
              >
                {cardLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pagar R$ {amount.toFixed(2)}
                  </>
                )}
              </Button>

              {/* Wallet Payments - disabled until real integration is implemented */}

              {/* Security Note */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-4">
                <Shield className="w-3 h-3 text-green-600" />
                <span>Dados criptografados via Pagar.me SDK</span>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
