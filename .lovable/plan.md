
# Plano: Página de Exame Médico/Psicológico no Dashboard do Aluno

## Resumo da Tarefa

Atualizar **exclusivamente** o card "Exame Médico/Psicológico" no dashboard do aluno para:
1. Torná-lo clicável, abrindo uma página com guia explicativo
2. Incluir botão de agendamento via WhatsApp
3. Incluir checkbox para marcar como concluído
4. Salvar o progresso no banco de dados
5. Atualizar o status do card dinamicamente

---

## Interface a Ser Criada

```text
┌────────────────────────────────────────────────────────────────┐
│  ◀  Exame Médico e Psicológico                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  🩺  Guia Rápido para Exame Médico e Psicológico              │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  O que é isso?                                           │ │
│  │                                                          │ │
│  │  Essa etapa é obrigatória pra sua CNH e super rápida!    │ │
│  │  O exame médico verifica sua saúde geral (como visão e   │ │
│  │  pressão), e o psicológico avalia atenção e reações.     │ │
│  │                                                          │ │
│  │  São feitos em clínicas credenciadas pelo DETRAN-SP,     │ │
│  │  geralmente no mesmo dia, e duram uns 30-60 minutos      │ │
│  │  cada.                                                   │ │
│  │                                                          │ │
│  │  Pronto pra agendar? Nossa equipe te ajuda com tudo:     │ │
│  │  passos, docs, custos e marcação. É fácil e rápido!      │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  📱  Agendar pelo WhatsApp Agora                         │ │
│  │        (botão #00BFFF grande)                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  ☐  Já fiz os exames e foram aprovados                   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Fluxo de Status do Card

```text
Estado Inicial
     │
     ▼
┌─────────────┐  Clica no card  ┌───────────────────┐
│  Pendente   │ ──────────────▶ │  Abre ExamePage   │
│  (amarelo)  │                 └───────────────────┘
└─────────────┘                          │
                                         ▼
                           ┌─────────────────────────┐
                           │  Marca checkbox         │
                           │  "Já fiz os exames"     │
                           └─────────────────────────┘
                                         │
                                         ▼
                           ┌─────────────────────────┐
                           │  Salva no banco:        │
                           │  exame_medico_concluido │
                           │  = true                 │
                           └─────────────────────────┘
                                         │
                                         ▼
                           ┌─────────────────────────┐
                           │  Card atualiza para     │
                           │  "Concluído" (verde)    │
                           └─────────────────────────┘
```

---

## Arquivos a Serem Modificados

### 1. `src/pages/aluno/AlunoDashboard.tsx`

**Mudanças:**
- Alterar o step do Exame Médico para ser clicável
- Adicionar `link: "/aluno/exame-medico"` ao step
- Carregar o campo `exame_medico_concluido` da tabela `progresso_renach`
- Atualizar a lógica de `getBadgeForStep` para refletir o status real

### 2. Nova Página: `src/pages/aluno/ExameMedico.tsx`

**Conteúdo:**
- Header com botão de voltar
- Título "Guia Rápido para Exame Médico e Psicológico"
- Card com texto explicativo
- Botão grande "Agendar pelo WhatsApp Agora" → abre `https://wa.me/5518981288372`
- Checkbox "Já fiz os exames e foram aprovados"
- Ao marcar, salva no banco e redireciona ao dashboard

### 3. `src/App.tsx`

**Mudanças:**
- Adicionar rota `/aluno/exame-medico` → `ExameMedico`

---

## Banco de Dados

### Migração Necessária

Adicionar coluna `exame_medico_concluido` na tabela `progresso_renach`:

```sql
ALTER TABLE progresso_renach 
ADD COLUMN IF NOT EXISTS exame_medico_concluido BOOLEAN DEFAULT false;
```

Esta coluna armazenará se o aluno já marcou que fez os exames.

---

## Resumo das Mudanças

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `AlunoDashboard.tsx` | **MODIFICAR** | Tornar card clicável + carregar status do banco |
| `ExameMedico.tsx` | **CRIAR** | Nova página com guia + botão WhatsApp + checkbox |
| `App.tsx` | **MODIFICAR** | Adicionar rota `/aluno/exame-medico` |
| `progresso_renach` | **MIGRAÇÃO** | Adicionar coluna `exame_medico_concluido` |

---

## Seção Técnica

### Estrutura do Componente ExameMedico.tsx

```typescript
// Estados principais
const [loading, setLoading] = useState(false);
const [exameConcluido, setExameConcluido] = useState(false);

// Função para salvar no banco
const handleCheckboxChange = async (checked: boolean) => {
  if (!checked) return;
  
  // 1. Buscar aluno_id do usuário atual
  const { data: aluno } = await supabase
    .from('alunos')
    .select('id')
    .eq('user_id', user.id)
    .single();
  
  // 2. Atualizar progresso_renach
  await supabase
    .from('progresso_renach')
    .update({ exame_medico_concluido: true })
    .eq('aluno_id', aluno.id);
  
  // 3. Mostrar toast de sucesso
  toast.success('Exames marcados como concluídos!');
  
  // 4. Redirecionar ao dashboard
  navigate('/aluno');
};

// Função para abrir WhatsApp
const openWhatsApp = () => {
  window.open('https://wa.me/5518981288372', '_blank');
};
```

### Query para Carregar Status no Dashboard

```typescript
// No AlunoDashboard.tsx, dentro do useEffect
const { data: progresso } = await supabase
  .from('progresso_renach')
  .select('exame_medico_concluido, curso_teorico_conclusao, ...')
  .eq('aluno_id', aluno.id)
  .maybeSingle();

setProgressoRenach({
  exame_medico_concluido: progresso?.exame_medico_concluido ?? false,
  ...progresso
});
```

### Estilos do Botão WhatsApp

```typescript
<Button
  onClick={openWhatsApp}
  className="w-full h-14 text-lg font-bold text-white gap-3"
  style={{ backgroundColor: '#00BFFF' }}
>
  <MessageCircle className="w-6 h-6" />
  Agendar pelo WhatsApp Agora
</Button>
```

### Lógica de Badge Atualizada

```typescript
case 1: // Exame Médico
  return exameMedicoCompleto 
    ? { text: "Concluído", color: "bg-green-500 text-white" }
    : { text: "Pendente", color: "bg-amber-100 text-amber-700" };
```
