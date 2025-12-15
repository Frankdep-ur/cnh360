import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Wifi, WifiOff, Volume2 } from "lucide-react";
import { requestNotificationPermission, playNotificationSound } from "@/lib/notificationSound";
import { toast } from "sonner";

interface OnlineStatusToggleProps {
  isOnline: boolean;
  onToggle: (online: boolean) => void;
}

export function OnlineStatusToggle({ isOnline, onToggle }: OnlineStatusToggleProps) {
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleToggle = async (checked: boolean) => {
    console.log("[OnlineToggle] Toggle alterado para:", checked);
    
    if (checked) {
      // Request notification permission when going online
      const granted = await requestNotificationPermission();
      console.log("[OnlineToggle] Permissão de notificação:", granted ? "concedida" : "negada");
      
      if (granted) {
        setNotificationPermission("granted");
      } else if (notificationPermission !== "granted") {
        toast.info("Ative as notificações do navegador para receber alertas sonoros!");
      }
      
      // Test sound immediately when activating
      console.log("[OnlineToggle] Tocando som de teste...");
      playNotificationSound();
    }
    
    onToggle(checked);
    
    if (checked) {
      toast.success("🔔 Sistema de notificações ATIVO! Som de teste tocado.", {
        icon: "🟢",
        description: "Você receberá alertas sonoros quando alunos solicitarem aulas.",
        duration: 5000,
      });
    } else {
      toast.info("Você está offline. Não receberá notificações.", {
        icon: "🔴",
      });
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
        isOnline
          ? "bg-green-50 dark:bg-green-950 border-2 border-green-500"
          : "bg-muted border-2 border-muted"
      }`}
    >
      <div className="flex items-center gap-3">
        {isOnline ? (
          <div className="relative">
            <Wifi className="h-6 w-6 text-green-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
          </div>
        ) : (
          <WifiOff className="h-6 w-6 text-muted-foreground" />
        )}
        <div>
          <Label
            htmlFor="online-status"
            className={`font-semibold text-base ${
              isOnline ? "text-green-700 dark:text-green-400" : "text-muted-foreground"
            }`}
          >
            {isOnline ? "Estou disponível para aulas" : "Estou offline"}
          </Label>
          <p className="text-sm text-muted-foreground">
            {isOnline
              ? "Recebendo notificações de novos pedidos"
              : "Ative para receber solicitações"}
          </p>
        </div>
      </div>
      <Switch
        id="online-status"
        checked={isOnline}
        onCheckedChange={handleToggle}
        className="data-[state=checked]:bg-green-600"
      />
    </div>
  );
}
