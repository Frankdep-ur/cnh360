import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatView } from '@/components/chat/ChatView';

interface ChatHistoryButtonProps {
  aulaId: string;
  participantName: string;
  participantPhoto: string | null;
  mensagensCount?: number;
  isInstructor?: boolean;
}

export function ChatHistoryButton({ 
  aulaId, 
  participantName, 
  participantPhoto,
  mensagensCount = 0,
  isInstructor = false
}: ChatHistoryButtonProps) {
  const [showChat, setShowChat] = useState(false);

  if (showChat) {
    return (
      <ChatView
        aulaId={aulaId}
        contactName={participantName}
        contactPhoto={participantPhoto}
        onBack={() => setShowChat(false)}
        isInstructor={isInstructor}
        readOnly
      />
    );
  }

  return (
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={() => setShowChat(true)}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      <span className="flex-1 text-left">Ver Conversa</span>
      {mensagensCount > 0 && (
        <span className="text-xs text-muted-foreground">
          {mensagensCount} {mensagensCount === 1 ? 'mensagem' : 'mensagens'}
        </span>
      )}
    </Button>
  );
}
