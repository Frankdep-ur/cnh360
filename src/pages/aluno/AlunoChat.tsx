import { useState, useEffect } from "react";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageCircle,
  Clock,
  ChevronRight,
  Star,
  MessagesSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TripChat } from "@/components/maps/TripChat";

interface Conversa {
  aula_id: string;
  instrutor_id: string;
  instrutor_nome: string | null;
  instrutor_foto: string | null;
  instrutor_nota: number | null;
  data_hora: string;
  status: string;
  ultima_mensagem: string | null;
  ultima_mensagem_hora: string | null;
  mensagens_nao_lidas: number;
}

export default function AlunoChat() {
  const { user } = useAuth();
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAulaId, setSelectedAulaId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchConversas = async () => {
      setLoading(true);
      
      // First get the aluno id
      const { data: aluno } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!aluno) {
        setLoading(false);
        return;
      }

      // Fetch aulas that can have chat (confirmada or em_andamento)
      const { data: aulasData, error } = await supabase
        .from('aulas')
        .select(`
          id,
          data_hora,
          status,
          instrutor_id
        `)
        .eq('aluno_id', aluno.id)
        .in('status', ['confirmada', 'em_andamento'])
        .order('data_hora', { ascending: false });

      if (error) {
        console.error('Error fetching aulas:', error);
        setLoading(false);
        return;
      }

      // Get instrutor info and last message for each aula
      const conversasData = await Promise.all(
        (aulasData || []).map(async (aula) => {
          // Get instrutor info
          const { data: instrutorData } = await supabase
            .from('instrutores_seguros')
            .select('full_name, avatar_url, nota_media')
            .eq('id', aula.instrutor_id)
            .single();

          // Get last message
          const { data: mensagemData } = await supabase
            .from('mensagens_aula')
            .select('content, created_at, sender_id')
            .eq('aula_id', aula.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Count unread messages (messages from instrutor)
          const { count } = await supabase
            .from('mensagens_aula')
            .select('*', { count: 'exact', head: true })
            .eq('aula_id', aula.id)
            .neq('sender_id', user.id);

          return {
            aula_id: aula.id,
            instrutor_id: aula.instrutor_id,
            instrutor_nome: instrutorData?.full_name || 'Instrutor',
            instrutor_foto: instrutorData?.avatar_url,
            instrutor_nota: instrutorData?.nota_media,
            data_hora: aula.data_hora,
            status: aula.status,
            ultima_mensagem: mensagemData?.content || null,
            ultima_mensagem_hora: mensagemData?.created_at || null,
            mensagens_nao_lidas: count || 0
          };
        })
      );

      setConversas(conversasData);
      setLoading(false);
    };

    fetchConversas();
  }, [user]);

  if (selectedAulaId) {
    return (
      <div className="app-container pb-24">
        <ComplianceBanner />
        
        <div className="px-4 py-6 page-enter">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <button 
              onClick={() => setSelectedAulaId(null)}
              className="p-2 rounded-full hover:bg-muted"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <h1 className="text-xl font-bold text-foreground">Chat</h1>
          </div>

          {/* Full screen chat */}
          <div className="fixed inset-0 top-20 bottom-20 z-40 bg-card">
            <TripChat aulaId={selectedAulaId} className="!fixed !inset-0 !top-0 !bottom-0" />
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="app-container pb-24">
      <ComplianceBanner />
      
      <div className="px-4 py-6 page-enter space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Conversas</h1>
        </div>

        {/* Lista de Conversas */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-4 shadow-card">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : conversas.length === 0 ? (
          <Card className="p-8 shadow-card text-center">
            <MessagesSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground mb-1">Nenhuma conversa ativa</h3>
            <p className="text-sm text-muted-foreground">
              Você poderá conversar com instrutores quando tiver aulas confirmadas
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {conversas.map((conversa) => (
              <Card 
                key={conversa.aula_id} 
                className="p-4 shadow-card cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedAulaId(conversa.aula_id)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {conversa.instrutor_foto ? (
                      <img 
                        src={conversa.instrutor_foto} 
                        alt={conversa.instrutor_nome || 'Instrutor'}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-lg font-semibold text-muted-foreground">
                          {(conversa.instrutor_nome || 'I').charAt(0)}
                        </span>
                      </div>
                    )}
                    {conversa.status === 'em_andamento' && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{conversa.instrutor_nome}</h4>
                        {conversa.instrutor_nota && (
                          <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {conversa.instrutor_nota.toFixed(1)}
                          </div>
                        )}
                      </div>
                      {conversa.ultima_mensagem_hora && (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conversa.ultima_mensagem_hora), { 
                            locale: ptBR, 
                            addSuffix: false 
                          })}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground truncate flex-1">
                        {conversa.ultima_mensagem || 'Nenhuma mensagem ainda'}
                      </p>
                      {conversa.mensagens_nao_lidas > 0 && (
                        <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 min-w-[20px] text-center">
                          {conversa.mensagens_nao_lidas}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      <span>Aula: {format(new Date(conversa.data_hora), "dd/MM 'às' HH:mm", { locale: ptBR })}</span>
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
