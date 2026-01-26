import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SystemMessageProps {
  content: string;
  timestamp: string;
  className?: string;
}

export function SystemMessage({ content, timestamp, className }: SystemMessageProps) {
  // Parse markdown-like bold text
  const renderContent = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index}>{part}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={cn("flex justify-center my-4", className)}>
      <div className="bg-primary/10 text-primary px-4 py-2.5 rounded-xl max-w-[85%] text-center">
        <p className="text-sm">
          {renderContent(content)}
        </p>
        <span className="text-[10px] text-primary/70 mt-1 block">
          {format(new Date(timestamp), 'HH:mm', { locale: ptBR })}
        </span>
      </div>
    </div>
  );
}
