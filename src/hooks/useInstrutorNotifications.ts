import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { 
  playNotificationSound, 
  vibrateDevice, 
  showBrowserNotification, 
  updateBrowserBadge,
  requestNotificationPermission 
} from "@/lib/notificationSound";

export interface AulaPendente {
  id: string;
  aluno_id: string;
  data_hora: string;
  duracao_minutos: number;
  valor: number;
  ponto_encontro: string | null;
  status: string;
  created_at: string;
  aluno_nome?: string;
}

export function useInstrutorNotifications(instrutorId: string | null, isOnline: boolean) {
  const [aulasPendentes, setAulasPendentes] = useState<AulaPendente[]>([]);
  const [novaAula, setNovaAula] = useState<AulaPendente | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const processedIds = useRef<Set<string>>(new Set());
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Fetch pending lessons
  const fetchAulasPendentes = useCallback(async () => {
    if (!instrutorId) {
      console.log("[Notificações] Sem instrutorId, pulando fetch");
      return;
    }

    console.log("[Notificações] Buscando aulas pendentes para instrutor:", instrutorId);

    const { data, error } = await supabase
      .from("aulas")
      .select("*")
      .eq("instrutor_id", instrutorId)
      .eq("status", "pendente")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Notificações] Erro ao buscar aulas:", error);
      return;
    }

    console.log("[Notificações] Aulas pendentes encontradas:", data?.length || 0);

    if (data) {
      // Check for new lessons
      const newLessons = data.filter(aula => !processedIds.current.has(aula.id));
      
      console.log("[Notificações] Novas aulas não processadas:", newLessons.length);
      console.log("[Notificações] IDs já processados:", Array.from(processedIds.current));
      
      if (newLessons.length > 0 && isOnline) {
        // New lesson arrived!
        const newest = newLessons[0];
        console.log("[Notificações] 🚨 NOVA AULA DETECTADA!", newest.id);
        
        // Get student name
        const { data: alunoData } = await supabase
          .from("alunos")
          .select("user_id")
          .eq("id", newest.aluno_id)
          .maybeSingle();

        let alunoNome = "Aluno";
        if (alunoData?.user_id) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", alunoData.user_id)
            .maybeSingle();
          alunoNome = profileData?.full_name || "Aluno";
        }

        const aulaComNome = { ...newest, aluno_nome: alunoNome };
        
        console.log("[Notificações] 🔔 Disparando notificações para:", alunoNome);
        
        // Trigger all notifications
        playNotificationSound();
        vibrateDevice();
        showBrowserNotification(
          "🚗 Novo pedido de aula!",
          `${alunoNome} quer uma aula prática. Toque para aceitar!`,
          () => setShowPopup(true)
        );
        
        setNovaAula(aulaComNome);
        setShowPopup(true);
      }

      // Update processed IDs
      data.forEach(aula => processedIds.current.add(aula.id));
      setAulasPendentes(data);
      updateBrowserBadge(data.length);
    }
  }, [instrutorId, isOnline]);

  // Setup realtime subscription
  useEffect(() => {
    if (!instrutorId) {
      console.log("[Notificações] Aguardando instrutorId...");
      return;
    }
    
    if (!isOnline) {
      console.log("[Notificações] Instrutor OFFLINE - notificações desativadas");
      return;
    }

    console.log("[Notificações] ✅ Instrutor ONLINE - ativando sistema de notificações");
    console.log("[Notificações] InstrutorId:", instrutorId);

    // Initial fetch
    fetchAulasPendentes();

    // Request notification permission
    requestNotificationPermission();

    // Realtime subscription
    console.log("[Notificações] Criando canal realtime...");
    const channel = supabase
      .channel(`aulas-instrutor-${instrutorId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "aulas",
          filter: `instrutor_id=eq.${instrutorId}`,
        },
        async (payload) => {
          console.log("[Notificações] 🚨 REALTIME: Nova aula recebida!", payload);
          
          if (payload.new && payload.new.status === "pendente") {
            const newAula = payload.new as AulaPendente;
            
            // Get student name
            const { data: alunoData } = await supabase
              .from("alunos")
              .select("user_id")
              .eq("id", newAula.aluno_id)
              .maybeSingle();

            let alunoNome = "Aluno";
            if (alunoData?.user_id) {
              const { data: profileData } = await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", alunoData.user_id)
                .maybeSingle();
              alunoNome = profileData?.full_name || "Aluno";
            }

            const aulaComNome = { ...newAula, aluno_nome: alunoNome };

            console.log("[Notificações] 🔔 Disparando notificações via REALTIME para:", alunoNome);

            // Trigger notifications
            playNotificationSound();
            vibrateDevice();
            showBrowserNotification(
              "🚗 Novo pedido de aula!",
              `${alunoNome} quer uma aula prática. Toque para aceitar!`,
              () => setShowPopup(true)
            );

            setNovaAula(aulaComNome);
            setShowPopup(true);
            processedIds.current.add(newAula.id);
            setAulasPendentes(prev => [aulaComNome, ...prev]);
            updateBrowserBadge(aulasPendentes.length + 1);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "aulas",
          filter: `instrutor_id=eq.${instrutorId}`,
        },
        () => {
          console.log("[Notificações] Aula atualizada, refazendo fetch...");
          fetchAulasPendentes();
        }
      )
      .subscribe((status) => {
        console.log("[Notificações] Status do canal realtime:", status);
      });

    // Fallback polling every 3 seconds (mais frequente)
    console.log("[Notificações] Iniciando polling a cada 3 segundos...");
    pollingInterval.current = setInterval(() => {
      console.log("[Notificações] Polling check...");
      fetchAulasPendentes();
    }, 3000);

    return () => {
      console.log("[Notificações] Limpando subscriptions...");
      supabase.removeChannel(channel);
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [instrutorId, isOnline, fetchAulasPendentes]);

  const dismissPopup = () => {
    setShowPopup(false);
    setNovaAula(null);
  };

  return {
    aulasPendentes,
    novaAula,
    showPopup,
    dismissPopup,
    refetch: fetchAulasPendentes,
  };
}
