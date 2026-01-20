import { useState } from "react";
import { Crown, Check, Loader2, Shield, TrendingDown, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PremiumActivationModalProps {
  open: boolean;
  onClose: () => void;
  onActivate?: () => void;
  currentTax: number;
  taxPaidThisMonth: number;
}

type Status = 'idle' | 'processing' | 'success';

export function PremiumActivationModal({
  open,
  onClose,
  onActivate,
  currentTax = 28,
  taxPaidThisMonth = 1358,
}: PremiumActivationModalProps) {
  const [status, setStatus] = useState<Status>('idle');

  const premiumTax = 18;
  const potentialSavings = Math.round(taxPaidThisMonth * ((currentTax - premiumTax) / currentTax));
  const monthlyFee = 89;

  const handleActivate = async () => {
    setStatus('processing');
    
    // Simulate activation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setStatus('success');
    toast.success('Premium ativado com sucesso!', {
      description: 'Sua taxa agora é de 18%',
    });
    
    setTimeout(() => {
      onActivate?.();
      onClose();
      setStatus('idle');
    }, 1500);
  };

  if (status === 'success') {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center mb-4 animate-in zoom-in duration-300">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Você é Premium!</h2>
            <p className="text-muted-foreground text-center">
              Sua taxa foi reduzida para 18%
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
            <Crown className="w-5 h-5 text-amber-500" />
            Seja Premium
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tax Comparison */}
          <Card className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="text-center flex-1">
                <p className="text-xs text-muted-foreground">Taxa Atual</p>
                <p className="text-2xl font-bold text-destructive">{currentTax}%</p>
              </div>
              <div className="px-4">
                <TrendingDown className="w-6 h-6 text-[#4CAF50]" />
              </div>
              <div className="text-center flex-1">
                <p className="text-xs text-muted-foreground">Taxa Premium</p>
                <p className="text-2xl font-bold text-[#4CAF50]">{premiumTax}%</p>
              </div>
            </div>
            <div className="text-center p-3 bg-[#4CAF50]/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Economia estimada este mês:</p>
              <p className="text-xl font-bold text-[#4CAF50]">R$ {potentialSavings}</p>
            </div>
          </Card>

          {/* Benefits */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Benefícios inclusos:</p>
            
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[#4CAF50]/10 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-[#4CAF50]" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Taxa reduzida</p>
                <p className="text-xs text-muted-foreground">De {currentTax}% para apenas {premiumTax}%</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Prioridade nas buscas</p>
                <p className="text-xs text-muted-foreground">Apareça primeiro para os alunos</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Selo Premium</p>
                <p className="text-xs text-muted-foreground">Destaque visual no seu perfil</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">Suporte prioritário</p>
                <p className="text-xs text-muted-foreground">Atendimento em até 2 horas</p>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="text-center p-4 bg-muted/50 rounded-xl">
            <p className="text-sm text-muted-foreground">Investimento mensal</p>
            <p className="text-3xl font-bold text-foreground">R$ {monthlyFee}<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
            <p className="text-xs text-[#4CAF50] mt-1">
              ✓ Cancele quando quiser
            </p>
          </div>

          {/* Activate Button */}
          <Button
            onClick={handleActivate}
            disabled={status === 'processing'}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white h-12 text-lg"
          >
            {status === 'processing' ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Ativando...
              </>
            ) : (
              <>
                <Crown className="w-5 h-5 mr-2" />
                Ativar Premium
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            🔒 Cobrança segura via Pagar.me
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
