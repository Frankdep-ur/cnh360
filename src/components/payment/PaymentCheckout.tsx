import { useState } from 'react';
import { CreditCard, QrCode, Check, Loader2, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface PaymentCheckoutProps {
  open: boolean;
  onClose: () => void;
  onPaymentComplete?: (paymentMethod: string) => void;
  amount: number;
  duration: number;
  instructorName: string;
  lessonDate: string;
}

type PaymentMethod = 'pix' | 'card';
type PaymentStatus = 'idle' | 'processing' | 'success';

export function PaymentCheckout({
  open,
  onClose,
  onPaymentComplete,
  amount,
  duration,
  instructorName,
  lessonDate,
}: PaymentCheckoutProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('pix');
  const [status, setStatus] = useState<PaymentStatus>('idle');

  const handlePayment = async () => {
    setStatus('processing');
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setStatus('success');
    toast.success('Pagamento confirmado!', {
      description: `R$ ${amount.toFixed(2)} - ${selectedMethod === 'pix' ? 'PIX' : 'Cartão'}`,
    });
    
    setTimeout(() => {
      onPaymentComplete?.(selectedMethod);
      onClose();
      setStatus('idle');
    }, 1500);
  };

  const pixDiscount = amount * 0.05;
  const finalAmount = selectedMethod === 'pix' ? amount - pixDiscount : amount;

  if (status === 'success') {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 rounded-full bg-[#4CAF50] flex items-center justify-center mb-4 animate-in zoom-in duration-300">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Pagamento Confirmado!</h2>
            <p className="text-muted-foreground text-center">
              Sua aula com {instructorName} está confirmada
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#4CAF50]" />
            Pagamento Seguro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Lesson Summary */}
          <Card className="p-4 bg-muted/50">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-foreground">{instructorName}</p>
                <p className="text-sm text-muted-foreground">{lessonDate}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Duração</p>
                <p className="font-semibold text-foreground">{duration} min</p>
              </div>
            </div>
          </Card>

          {/* Payment Methods */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Forma de pagamento</p>
            
            <button
              onClick={() => setSelectedMethod('pix')}
              className={cn(
                "w-full p-4 rounded-xl border-2 transition-all text-left",
                selectedMethod === 'pix'
                  ? "border-[#4CAF50] bg-[#4CAF50]/5"
                  : "border-border hover:border-muted-foreground/50"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#4CAF50]/10 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-[#4CAF50]" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">PIX</p>
                    <p className="text-xs text-[#4CAF50] font-medium">5% de desconto</p>
                  </div>
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  selectedMethod === 'pix' ? "border-[#4CAF50] bg-[#4CAF50]" : "border-muted-foreground/50"
                )}>
                  {selectedMethod === 'pix' && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedMethod('card')}
              className={cn(
                "w-full p-4 rounded-xl border-2 transition-all text-left",
                selectedMethod === 'card'
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-muted-foreground/50"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Cartão de Crédito</p>
                    <p className="text-xs text-muted-foreground">Parcele em até 3x</p>
                  </div>
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                  selectedMethod === 'card' ? "border-primary bg-primary" : "border-muted-foreground/50"
                )}>
                  {selectedMethod === 'card' && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
            </button>
          </div>

          {/* PIX QR Code (shown when PIX selected) */}
          {selectedMethod === 'pix' && (
            <Card className="p-4 bg-muted/50">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-white rounded-lg p-2 mb-3">
                  {/* Mock QR Code */}
                  <div className="w-full h-full bg-gradient-to-br from-foreground/5 to-foreground/20 rounded flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-foreground/30" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Válido por 10 minutos</span>
                </div>
              </div>
            </Card>
          )}

          {/* Price Summary */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valor da aula</span>
              <span className="text-foreground">R$ {amount.toFixed(2)}</span>
            </div>
            {selectedMethod === 'pix' && (
              <div className="flex justify-between text-sm">
                <span className="text-[#4CAF50]">Desconto PIX (5%)</span>
                <span className="text-[#4CAF50]">-R$ {pixDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
              <span className="text-foreground">Total</span>
              <span className="text-[#4CAF50]">R$ {finalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Pay Button */}
          <Button
            onClick={handlePayment}
            disabled={status === 'processing'}
            className="w-full bg-[#4CAF50] hover:bg-[#45a049] text-white h-12 text-lg"
          >
            {status === 'processing' ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                Pagar R$ {finalAmount.toFixed(2)}
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            🔒 Pagamento processado com segurança via Stripe
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
