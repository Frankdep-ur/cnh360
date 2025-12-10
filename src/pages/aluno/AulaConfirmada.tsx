import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Calendar, Clock, MapPin, MessageCircle, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AulaConfirmada() {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className={cn(
        "max-w-md w-full text-center transition-all duration-700",
        showContent ? "opacity-100 scale-100" : "opacity-0 scale-95"
      )}>
        {/* Success Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center mx-auto shadow-glow-primary animate-bounce-subtle">
            <Check className="w-12 h-12 text-primary-foreground" />
          </div>
          <div className="absolute inset-0 w-24 h-24 rounded-full gradient-primary mx-auto opacity-30 animate-ping" />
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Aula agendada!
        </h1>
        <p className="text-muted-foreground mb-8">
          Sua aula prática foi confirmada com sucesso
        </p>

        {/* Details Card */}
        <div className={cn(
          "bg-card rounded-3xl p-6 shadow-elevated mb-8 text-left transition-all duration-500 delay-200",
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <div className="flex items-center gap-4 mb-6">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
              alt="Carlos Silva"
              className="w-14 h-14 rounded-xl object-cover"
            />
            <div>
              <h3 className="font-semibold text-foreground">Carlos Silva</h3>
              <p className="text-sm text-muted-foreground">VW Polo - Automático</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data</p>
                <p className="font-medium text-foreground">Segunda-feira, 15 de Janeiro</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Horário</p>
                <p className="font-medium text-foreground">14:00 - 15:00 (1 hora)</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Local</p>
                <p className="font-medium text-foreground">Av. Brasil, 1234</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border flex items-center justify-between">
            <span className="text-muted-foreground">Total pago</span>
            <span className="text-2xl font-bold text-primary">R$ 76,00</span>
          </div>
        </div>

        {/* Actions */}
        <div className={cn(
          "space-y-3 transition-all duration-500 delay-400",
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
          <Button variant="hero" size="xl" className="w-full">
            <MessageCircle className="w-5 h-5" />
            Enviar mensagem ao instrutor
          </Button>

          <div className="flex gap-3">
            <Button variant="outline" size="lg" className="flex-1">
              <Share2 className="w-5 h-5" />
              Compartilhar
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="flex-1"
              onClick={() => navigate("/aluno")}
            >
              Ir para o início
            </Button>
          </div>
        </div>

        {/* Tip */}
        <div className={cn(
          "mt-8 p-4 bg-secondary/10 rounded-2xl text-left transition-all duration-500 delay-500",
          showContent ? "opacity-100" : "opacity-0"
        )}>
          <p className="text-sm text-secondary font-medium mb-1">💡 Dica</p>
          <p className="text-sm text-muted-foreground">
            Lembre-se de levar um documento com foto e chegar 5 minutos antes no local combinado.
          </p>
        </div>
      </div>
    </div>
  );
}
