import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ComplianceBanner } from "@/components/layout/ComplianceBanner";
import { BottomNav } from "@/components/layout/BottomNav";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock,
  ChevronRight,
  Star,
  MessagesSquare,
  Archive,
  MessageCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChatView } from "@/components/chat/ChatView";
import { InitialsAvatar } from "@/components/ui/InitialsAvatar";

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
  mensagens_count: number;
}

type ChatTab = 'ativas' | 'historico';
type StatusAula = "aguardando_confirmacao" | "aguardando_qr" | "cancelada" | "concluida" | "confirmada" | "em_andamento" | "em_rota" | "pendente";

const ACTIVE_STATUSES: StatusAula[] = ['confirmada', 'em_andamento', 'em_rota', 'aguardando_confirmacao', 'aguardando_qr'];

export default function AlunoChat() {
  const { user } = useAuth();
  const location = useLocation();
  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAulaId, setSelectedAulaId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ChatTab>('ativas');

  // Abrir chat automaticamente se vier com openAulaId no state
  useEffect(() => {
    const openAulaId = location.state?.openAulaId as string | undefined;
    if (openAulaId && !loading && conversas.length > 0) {
      const conversaExiste = conversas.find(c => c.aula_id === openAulaId);
      if (conversaExiste) {
        setSelectedAulaId(openAulaId);
        // Set the right tab based on the conversation status
        if (conversaExiste.status === 'concluida') {
          setActiveTab('historico');
        } else {
          setActiveTab('ativas');
        }
        // Limpar o state para evitar reabrir ao navegar
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, loading, conversas]);

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

      // Fetch aulas that can have chat (confirmada, em_andamento, or concluida)
      const { data: aulasData, error } = await supabase
        .from('aulas')
        .select(`
          id,
          data_hora,
          status,
          instrutor_id
        `)
        .eq('aluno_id', aluno.id)
        .in('status', [...ACTIVE_STATUSES, 'concluida'])
        .order('data_hora', { ascending: false });

      if (error) {
        console.error('Error fetching aulas:', error);
        setLoading(false);
        return;
      }

      // Get instrutor info and last message for each aula
      const conversasData = await Promise.all(
        (aulasData || []).map(async (aula) => {
          // Get instrutor info from public cache (no RLS restrictions)
          const { data: instrutorData } = await supabase
            .from('instrutores_publico_cache')
            .select('nome, foto, nota_media')
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

          // Count unread messages (messages from instrutor that haven't been read)
          const { count: unreadCount } = await supabase
            .from('mensagens_aula')
            .select('*', { count: 'exact', head: true })
            .eq('aula_id', aula.id)
            .neq('sender_id', user.id)
            .is('read_at', null);

          // Count total messages
          const { count: totalCount } = await supabase
            .from('mensagens_aula')
            .select('*', { count: 'exact', head: true })
            .eq('aula_id', aula.id);

          return {
            aula_id: aula.id,
            instrutor_id: aula.instrutor_id,
            instrutor_nome: instrutorData?.nome || 'Instrutor',
            instrutor_foto: instrutorData?.foto,
            instrutor_nota: instrutorData?.nota_media,
            data_hora: aula.data_hora,
            status: aula.status,
            ultima_mensagem: mensagemData?.content || null,
            ultima_mensagem_hora: mensagemData?.created_at || null,
            mensagens_nao_lidas: unreadCount || 0,
            mensagens_count: totalCount || 0
          };
        })
      );

      setConversas(conversasData);
      setLoading(false);
    };

    fetchConversas();
  }, [user]);

  const selectedConversa = conversas.find(c => c.aula_id === selectedAulaId);
  
  // Filter conversations based on active tab
  const filteredConversas = conversas.filter(c => {
    if (activeTab === 'ativas') {
      return ACTIVE_STATUSES.includes(c.status as StatusAula);
    } else {
      return c.status === 'concluida';
    }
  });

  // Count for tabs
  const activeCount = conversas.filter(c => ACTIVE_STATUSES.includes(c.status as StatusAula)).length;
  const historyCount = conversas.filter(c => c.status === 'concluida').length;

  if (selectedAulaId && selectedConversa) {
    const isReadOnly = selectedConversa.status === 'concluida';
    return (
      <ChatView 
        aulaId={selectedAulaId} 
        contactName={selectedConversa.instrutor_nome || 'Instrutor'}
        contactPhoto={selectedConversa.instrutor_foto}
        onBack={() => setSelectedAulaId(null)} 
        readOnly={isReadOnly}
      />
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

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ChatTab)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ativas" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Ativas
              {activeCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs px-1.5">
                  {activeCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="historico" className="flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Arquivo
              {historyCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs px-1.5">
                  {historyCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

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
        ) : filteredConversas.length === 0 ? (
          <Card className="p-8 shadow-card text-center">
            <MessagesSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-semibold text-foreground mb-1">
              {activeTab === 'ativas' ? 'Nenhuma conversa ativa' : 'Nenhuma conversa arquivada'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {activeTab === 'ativas' 
                ? 'Você poderá conversar com instrutores quando tiver aulas confirmadas'
                : 'Conversas de aulas concluídas aparecerão aqui'}
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredConversas.map((conversa) => (
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
                      <InitialsAvatar name={conversa.instrutor_nome || 'Instrutor'} size="w-12 h-12" className="rounded-full" />
                    )}
                    {conversa.status === 'em_andamento' && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />
                    )}
                    {conversa.status === 'concluida' && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-muted rounded-full border-2 border-card flex items-center justify-center">
                        <Archive className="w-2.5 h-2.5 text-muted-foreground" />
                      </div>
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
                      {activeTab === 'ativas' && conversa.mensagens_nao_lidas > 0 && (
                        <Badge className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 min-w-[20px] text-center">
                          {conversa.mensagens_nao_lidas}
                        </Badge>
                      )}
                      {activeTab === 'historico' && conversa.mensagens_count > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {conversa.mensagens_count} msg
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {activeTab === 'ativas' ? 'Aula: ' : ''}
                        {format(new Date(conversa.data_hora), "dd/MM 'às' HH:mm", { locale: ptBR })}
                      </span>
                      {conversa.status === 'concluida' && (
                        <Badge variant="outline" className="ml-2 text-xs py-0">
                          Concluída
                        </Badge>
                      )}
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
