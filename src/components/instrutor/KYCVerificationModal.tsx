import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Smartphone, Copy, ExternalLink, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { openExternalLink } from "@/lib/openExternalLink";

interface KYCVerificationModalProps {
  open: boolean;
  onClose: () => void;
  kycUrl: string | null;
  isLoading: boolean;
}

export function KYCVerificationModal({ open, onClose, kycUrl, isLoading }: KYCVerificationModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleOpenVerification = () => {
    if (!kycUrl) return;

    try {
      // Use external browser for mobile compatibility
      openExternalLink(kycUrl);
      
      toast({
        title: "Verificação aberta! 📱",
        description: "Complete a selfie e documento no navegador. Volte aqui após finalizar.",
        duration: 8000,
      });
      
      onClose();
    } catch (error) {
      console.error("[KYCModal] Error opening link:", error);
      // Fallback: copy to clipboard
      handleCopyLink();
      toast({
        variant: "destructive",
        title: "Não conseguimos abrir automaticamente",
        description: "O link foi copiado. Cole no seu navegador para continuar.",
        duration: 10000,
      });
    }
  };

  const handleCopyLink = async () => {
    if (!kycUrl) return;

    try {
      await navigator.clipboard.writeText(kycUrl);
      setCopied(true);
      toast({
        title: "Link copiado! 📋",
        description: "Cole no seu navegador (Chrome/Safari) para continuar.",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("[KYCModal] Copy failed:", error);
      toast({
        variant: "destructive",
        title: "Erro ao copiar",
        description: "Tente novamente.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-600" />
            Verificação de Identidade
          </DialogTitle>
          <DialogDescription className="text-left pt-2">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                <span className="text-muted-foreground">Gerando link seguro...</span>
              </div>
            ) : kycUrl ? (
              <div className="space-y-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <p className="text-sm text-emerald-800 dark:text-emerald-200">
                    Vamos abrir o processo de verificação no seu <strong>navegador padrão</strong> (Chrome/Safari).
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-emerald-700 dark:text-emerald-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Complete a selfie e foto do documento lá</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Quando terminar, volte pro app</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Atualizamos automaticamente em alguns minutos!</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleOpenVerification}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    size="lg"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir verificação agora
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={handleCopyLink}
                    className="w-full"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-600" />
                        Link copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar link
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  Se o link não abrir automaticamente, copie e cole no navegador.
                </p>
              </div>
            ) : (
              <div className="py-4 text-center text-muted-foreground">
                Erro ao gerar link. Tente novamente.
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
