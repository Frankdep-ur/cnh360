
# Plano: Criar Chat do Instrutor para Receber Mensagens dos Alunos

## Problema Identificado

O sistema de chat está funcionando apenas em uma direção:
- **Aluno Milena** → Envia mensagem para Lucas Felipe ✅
- **Instrutor Lucas Felipe** → **NÃO TEM** onde ver/responder a mensagem ❌

O instrutor só consegue acessar o chat quando está na página `/instrutor/a-caminho/:aulaId`, mas essa página é específica para quando ele está indo buscar o aluno. Ele precisa de uma página de chat dedicada, assim como o aluno tem.

---

## Comparação Atual

| Usuário | Menu Chat | Página de Chat | Status |
|---------|-----------|----------------|--------|
| Aluno | ✅ `MessageCircle` | `/aluno/chat` | Funcionando |
| Instrutor | ❌ Não tem | Não existe | **FALTA CRIAR** |

---

## Alterações Necessárias

### 1. Criar Página de Chat do Instrutor

**Novo arquivo**: `src/pages/instrutor/InstrutorChat.tsx`

Criar uma página idêntica ao `AlunoChat.tsx`, mas adaptada para o instrutor:
- Listar todas as aulas confirmadas/em andamento
- Mostrar nome e foto do **aluno** (não do instrutor)
- Usar o mesmo componente `ChatView` para a conversa
- Adaptar o `ChatView` para aceitar também dados do aluno

```typescript
// Buscar aulas do instrutor
const { data: instrutor } = await supabase
  .from('instrutores')
  .select('id')
  .eq('user_id', user.id)
  .single();

// Aulas onde o instrutor participa
const { data: aulas } = await supabase
  .from('aulas')
  .select('id, data_hora, status, aluno_id')
  .eq('instrutor_id', instrutor.id)
  .in('status', ['confirmada', 'em_andamento']);

// Buscar dados do aluno para cada aula
// Usar tabela profiles para nome e avatar
```

### 2. Adicionar Rota no App.tsx

**Arquivo**: `src/App.tsx`

Adicionar a rota para o chat do instrutor:

```typescript
const InstrutorChat = lazy(() => import("./pages/instrutor/InstrutorChat"));

// Na seção de rotas do instrutor:
<Route path="/instrutor/chat" element={
  <ProtectedRoute>
    <InstrutorChat />
  </ProtectedRoute>
} />
```

### 3. Adicionar Chat no Menu de Navegação do Instrutor

**Arquivo**: `src/components/layout/InstructorBottomNav.tsx`

Adicionar o ícone de chat no menu inferior:

```typescript
import { LayoutDashboard, Calendar, Car, MessageCircle, User } from "lucide-react";

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Painel", path: "/instrutor" },
  { icon: Calendar, label: "Agenda", path: "/instrutor/agenda" },
  { icon: Car, label: "Aulas", path: "/instrutor/aulas" },
  { icon: MessageCircle, label: "Chat", path: "/instrutor/chat" },  // NOVO
  { icon: User, label: "Perfil", path: "/instrutor/perfil" },
];
```

**Nota**: Remover "Ganhos" do menu para dar espaço ao Chat (ou reorganizar). O acesso a Ganhos pode ficar no Dashboard ou Perfil.

### 4. Adaptar ChatView para Instrutor

**Arquivo**: `src/components/chat/ChatView.tsx`

Tornar o componente mais genérico para aceitar tanto instrutor quanto aluno:

```typescript
interface ChatViewProps {
  aulaId: string;
  contactName: string;        // Nome do contato (instrutor OU aluno)
  contactPhoto?: string | null;
  onBack: () => void;
}
```

### 5. Criar Cache Público de Alunos (se necessário)

Se houver problemas de RLS ao buscar dados dos alunos, criar uma tabela cache similar à `instrutores_publico_cache`:

```sql
CREATE TABLE alunos_publico_cache (
  id UUID PRIMARY KEY,
  nome TEXT,
  foto TEXT,
  updated_at TIMESTAMP DEFAULT now()
);
```

Ou usar a tabela `profiles` diretamente (que já contém `full_name` e `avatar_url`).

---

## Fluxo Corrigido

```text
┌─────────────────────────────────────────────────────────────────────┐
│  ALUNO MILENA                                                        │
│  Envia mensagem para Lucas Felipe                                   │
│  Via: /aluno/chat                                                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
              ┌────────────────────────────────┐
              │ Tabela: mensagens_aula         │
              │ ├── aula_id                    │
              │ ├── sender_id = milena         │
              │ └── content = "Olá!"           │
              └────────────────┬───────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│  INSTRUTOR LUCAS FELIPE                                              │
│  Recebe notificação / Abre /instrutor/chat                          │
│  Vê mensagem da Milena e responde                                    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Arquivos a Criar/Modificar

| Arquivo | Ação |
|---------|------|
| `src/pages/instrutor/InstrutorChat.tsx` | **CRIAR** - Página de chat do instrutor |
| `src/App.tsx` | Adicionar rota `/instrutor/chat` |
| `src/components/layout/InstructorBottomNav.tsx` | Adicionar ícone de Chat |
| `src/components/chat/ChatView.tsx` | Tornar props mais genéricas |

---

## Resultado Esperado

Após implementação:

1. **Instrutor Lucas Felipe** abre o app
2. Vê ícone de **Chat** no menu inferior
3. Clica e vê lista de conversas com alunos
4. Vê que **Milena** enviou uma mensagem
5. Clica na conversa → **Chat abre direto**
6. Pode responder à Milena
7. Milena recebe a resposta em tempo real

---

## Detalhes Técnicos

### Estrutura da Página InstrutorChat

```typescript
interface Conversa {
  aula_id: string;
  aluno_id: string;
  aluno_nome: string;
  aluno_foto: string | null;
  data_hora: string;
  status: string;
  ultima_mensagem: string | null;
  ultima_mensagem_hora: string | null;
  mensagens_nao_lidas: number;
}

// Buscar dados do aluno via profiles
const { data: alunoProfile } = await supabase
  .from('profiles')
  .select('full_name, avatar_url')
  .eq('id', aluno.user_id)
  .single();
```

### Menu Reorganizado

O menu do instrutor passará a ter:
- Painel
- Agenda
- Aulas
- **Chat** (novo)
- Perfil

O link para "Ganhos" será acessível pelo Dashboard ou Perfil.
