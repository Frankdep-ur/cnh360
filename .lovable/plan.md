

# Plano: Correção da Consulta de Saldo do Instrutor

## Diagnóstico

| Status Atual | Dados |
|-------------|-------|
| Pagamento no banco | ✅ R$ 4,52 para Frank Alexandre |
| Saldo Pagar.me | ❌ R$ 0,00 (retornando zero) |
| Status do Recipient | `"affiliation"` (em processo de ativação) |

### Por Que o Saldo Mostra Zero

A Pagar.me **não libera fundos** enquanto o recipient estiver em status `affiliation`. Isso significa que mesmo com pagamentos processados via split, o saldo na API mostra R$ 0,00 até que a conta seja totalmente ativada.

A Edge Function `get-instructor-balance-pagarme` consulta **apenas** a API da Pagar.me, ignorando os pagamentos já registrados no banco de dados.

---

## Solução: Saldo Híbrido (Pagar.me + Banco Local)

A função vai consultar **duas fontes**:

1. **Pagar.me** - Saldo oficial quando a conta estiver ativa
2. **Banco de dados local** - Soma dos `valor_instrutor` da tabela `pagamentos` quando a conta estiver em processo de ativação

```text
┌─────────────────────────────────────────────────────────────┐
│  get-instructor-balance-pagarme                             │
├─────────────────────────────────────────────────────────────┤
│  1. Consulta saldo na Pagar.me                              │
│  2. Verifica status do recipient                            │
│     ├── status = "active"                                   │
│     │   └── Retorna saldo da Pagar.me ✅                    │
│     └── status = "affiliation" / "refused"                  │
│         └── Consulta soma de pagamentos no banco local      │
│             └── Retorna como "pendente de liberação" 🔄     │
└─────────────────────────────────────────────────────────────┘
```

---

## Arquivos a Modificar

### 1. `supabase/functions/get-instructor-balance-pagarme/index.ts`

Adicionar consulta ao banco de dados quando a conta estiver em processo de ativação:

```typescript
// Após obter dados do recipient...
const recipientStatus = balanceData.recipient?.status || "unknown";

// Se a conta ainda não está ativa, buscar ganhos do banco local
if (recipientStatus !== "active" || balance.available === 0) {
  const { data: pagamentosData } = await supabase
    .from("pagamentos")
    .select("valor_instrutor, status")
    .eq("instrutor_id", instrutorData.id)
    .eq("status", "aprovado");

  const ganhosPendentes = pagamentosData?.reduce(
    (sum, p) => sum + (p.valor_instrutor || 0), 0
  ) || 0;

  // Adicionar aos waiting_funds (a receber)
  balance.waitingFunds = ganhosPendentes;
}
```

### 2. Adicionar Campo `recipientStatus` na Resposta

Para mostrar o aviso correto na interface:

```typescript
return new Response(JSON.stringify({
  success: true,
  balance,
  recipientId,
  recipientStatus,  // NOVO: "active", "affiliation", etc.
  message: recipientStatus === "affiliation" 
    ? "Sua conta está em processo de ativação. Os ganhos serão liberados em breve."
    : null
}));
```

### 3. `src/components/instrutor/InstructorBalanceCard.tsx`

Exibir aviso quando a conta estiver em processo de ativação:

```tsx
{recipientStatus === "affiliation" && (
  <Alert className="border-amber-200 bg-amber-50">
    <Clock className="w-4 h-4 text-amber-600" />
    <AlertDescription className="text-amber-700">
      Sua conta bancária está em processo de ativação na operadora de pagamentos. 
      Os valores serão liberados para saque em até 48 horas.
    </AlertDescription>
  </Alert>
)}
```

### 4. `src/pages/instrutor/InstrutorGanhos.tsx`

Adicionar estado para o `recipientStatus` e exibir valores corretos:

```tsx
const [recipientStatus, setRecipientStatus] = useState<string | null>(null);

// Na função fetchBalance:
if (data?.recipientStatus) {
  setRecipientStatus(data.recipientStatus);
}
```

---

## Interface Atualizada

```text
┌────────────────────────────────────────────┐
│  💰 Meus Ganhos                            │
├────────────────────────────────────────────┤
│  ⚠️ Sua conta está em ativação             │
│  Os valores serão liberados em até 48h.    │
├────────────────────────────────────────────┤
│                                            │
│  Saldo Disponível                          │
│  R$ 0,00                                   │
│  Liberado para saque                       │
│                                            │
│  ┌──────────────┐ ┌──────────────┐        │
│  │   Pendente   │ │   Este mês   │        │
│  │   R$ 4,52    │ │   R$ 4,52    │        │
│  │   Liberação  │ │   Líquido    │        │
│  │   em 48h     │ │              │        │
│  └──────────────┘ └──────────────┘        │
│                                            │
└────────────────────────────────────────────┘
```

---

## Resumo das Mudanças

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `get-instructor-balance-pagarme/index.ts` | **MODIFICAR** | Consultar banco local + retornar status do recipient |
| `InstructorBalanceCard.tsx` | **MODIFICAR** | Exibir aviso de conta em ativação |
| `InstrutorGanhos.tsx` | **MODIFICAR** | Tratar recipientStatus e mostrar valores corretos |

---

## Seção Técnica

### Query para Calcular Ganhos Locais

```sql
SELECT 
  SUM(valor_instrutor) as total_pendente,
  COUNT(*) as total_aulas
FROM pagamentos
WHERE instrutor_id = '2cf27a10-3034-431a-bb92-89b08f90adf5'
  AND status = 'aprovado';
```

Resultado esperado para Frank Alexandre: **R$ 4,52** (1 aula concluída)

### Status do Recipient na Pagar.me

| Status | Significado | Ação no App |
|--------|-------------|-------------|
| `active` | Conta ativa | Mostra saldo real da Pagar.me |
| `affiliation` | Em processo de ativação | Mostra ganhos locais como "pendente" |
| `refused` | Conta recusada | Solicita recadastro bancário |
| `suspended` | Conta suspensa | Mostra aviso de contato suporte |

### Lógica de Prioridade

```typescript
// Ordem de prioridade para mostrar saldo:
// 1. Se Pagar.me available > 0 → mostrar available
// 2. Se status = affiliation → mostrar soma do banco como waitingFunds
// 3. Se status = refused → mostrar erro e pedir recadastro
```

