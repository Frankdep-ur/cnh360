import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Send, Loader2, MessageCircle, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTripChat } from '@/hooks/useTripChat';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ComplianceBanner } from '@/components/layout/ComplianceBanner';
import { BottomNav } from '@/components/layout/BottomNav';
import { InstructorBottomNav } from '@/components/layout/InstructorBottomNav';
interface ChatViewProps {
  aulaId: string;
  contactName?: string;
  contactPhoto?: string | null;
  instructorName?: string;
  instructorPhoto?: string | null;
  onBack: () => void;
  isInstructor?: boolean;
}

export function ChatView({ 
  aulaId, 
  contactName, 
  contactPhoto,
  instructorName, 
  instructorPhoto, 
  onBack,
  isInstructor = false 
}: ChatViewProps) {
  // Support both old and new prop names
  const displayName = contactName || instructorName || 'Contato';
  const displayPhoto = contactPhoto ?? instructorPhoto;
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { messages, loading, sendMessage, markMessagesAsRead } = useTripChat(aulaId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mark messages as read when chat opens and when new messages arrive
  useEffect(() => {
    if (!loading && messages.length > 0) {
      markMessagesAsRead();
    }
  }, [loading, messages.length, markMessagesAsRead]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!message.trim() || sending) return;

    setSending(true);
    try {
      await sendMessage(message);
      setMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="app-container flex flex-col h-screen">
      <ComplianceBanner />
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-card">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        {displayPhoto ? (
          <img 
            src={displayPhoto} 
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <span className="text-sm font-semibold text-muted-foreground">
              {displayName.charAt(0)}
            </span>
          </div>
        )}
        
        <div>
          <h1 className="font-semibold text-foreground">{displayName}</h1>
          <p className="text-xs text-muted-foreground">Chat da aula</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageCircle className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm font-medium">Nenhuma mensagem ainda</p>
            <p className="text-xs">Envie uma mensagem para começar a conversa</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex flex-col max-w-[80%]',
                msg.isOwn ? 'ml-auto items-end' : 'mr-auto items-start'
              )}
            >
              <div
                className={cn(
                  'px-4 py-2.5 rounded-2xl shadow-sm',
                  msg.isOwn
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-card text-foreground border border-border rounded-bl-md'
                )}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 px-1 flex items-center gap-1">
                {format(new Date(msg.created_at), 'HH:mm', { locale: ptBR })}
                {msg.isOwn && (
                  msg.read_at ? (
                    <CheckCheck className="w-3 h-3 text-blue-500" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )
                )}
              </span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-border bg-card mb-20">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite uma mensagem..."
            className="flex-1 rounded-full bg-muted border-0"
            disabled={sending}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className="rounded-full shrink-0"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {isInstructor ? <InstructorBottomNav /> : <BottomNav />}
    </div>
  );
}
