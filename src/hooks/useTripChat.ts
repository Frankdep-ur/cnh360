import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  isOwn: boolean;
}

interface UseTripChatReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
}

export function useTripChat(aulaId: string | null): UseTripChatReturn {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial messages
  useEffect(() => {
    if (!aulaId) {
      setLoading(false);
      return;
    }

    const fetchMessages = async () => {
      const { data, error: fetchError } = await supabase
        .from('mensagens_aula')
        .select('*')
        .eq('aula_id', aulaId)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('Error fetching messages:', fetchError);
        setError('Erro ao carregar mensagens');
      } else if (data) {
        setMessages(
          data.map((msg) => ({
            id: msg.id,
            sender_id: msg.sender_id,
            content: msg.content,
            created_at: msg.created_at,
            isOwn: msg.sender_id === user?.id,
          }))
        );
      }
      setLoading(false);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${aulaId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensagens_aula',
          filter: `aula_id=eq.${aulaId}`,
        },
        (payload) => {
          const newMsg = payload.new as any;
          setMessages((prev) => {
            // Avoid duplicates
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [
              ...prev,
              {
                id: newMsg.id,
                sender_id: newMsg.sender_id,
                content: newMsg.content,
                created_at: newMsg.created_at,
                isOwn: newMsg.sender_id === user?.id,
              },
            ];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [aulaId, user?.id]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!aulaId || !user || !content.trim()) return;

      const trimmedContent = content.trim();

      const { error: insertError } = await supabase
        .from('mensagens_aula')
        .insert({
          aula_id: aulaId,
          sender_id: user.id,
          content: trimmedContent,
        });

      if (insertError) {
        console.error('Error sending message:', insertError);
        throw new Error('Erro ao enviar mensagem');
      }

      // Send push notification to recipient (fire and forget)
      try {
        supabase.functions.invoke('send-chat-notification', {
          body: {
            aula_id: aulaId,
            sender_id: user.id,
            message_preview: trimmedContent
          }
        }).catch(err => console.log('Push notification error (non-blocking):', err));
      } catch (notifError) {
        // Don't block message sending if notification fails
        console.log('Could not send chat notification:', notifError);
      }
    },
    [aulaId, user]
  );

  return {
    messages,
    loading,
    error,
    sendMessage,
  };
}
