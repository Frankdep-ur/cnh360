
# Plano de Correção: Cálculos de Saldo e Ganhos do Instrutor

## Diagnóstico dos Problemas

### Problema 1: Divisão duplicada por 100 no saldo
- **Edge Function** já converte centavos para reais (linha 140-142):
  ```typescript
  available: (balanceData.available?.amount || 0) / 100
  ```
- **Frontend** divide novamente por 100 (linha 407):
  ```typescript
  {formatCurrency(balance.available / 100, ...)}
  ```
- **Resultado**: Se o saldo é R$ 4,52, mostra R$ 0,04

### Problema 2: Total de ganhos mostrando valor bruto
- A página "Aulas" soma `aula.valor` (valor cheio da aula: R$ 9,03)
- Deveria mostrar apenas a parte do instrutor: 50% = R$ 4,52
- **Resultado**: Estatística inflada mostrando o dobro do real

### Problema 3: Saldo Pagar.me zerado mesmo com pagamento aprovado
- O pagamento local mostra `valor_instrutor: 4.52` com status `aprovado`
- A Pagar.me retorna `available_amount: 0`
- **Causa provável**: O split só credita após D+14 ou D+30 dependendo do plano

---

## Correções a Implementar

### 1. Remover divisão duplicada no InstructorBalanceCard.tsx

**Antes:**
```typescript
{formatCurrency(balance.available / 100, balance.currency)}
{formatCurrency(balance.waitingFunds / 100, balance.currency)}
{formatCurrency(balance.transferred / 100, balance.currency)}
availableBalance={balance?.available ? balance.available / 100 : 0}
```

**Depois:**
```typescript
{formatCurrency(balance.available, balance.currency)}
{formatCurrency(balance.waitingFunds, balance.currency)}
{formatCurrency(balance.transferred, balance.currency)}
availableBalance={balance?.available ?? 0}
```

---

### 2. Corrigir cálculo de "Total ganho" na página InstrutorAulas.tsx

**Opção A - Calcular 50% do valor da aula:**
```typescript
const totalGanhos = aulas
  .filter(a => a.status === 'concluida')
  .reduce((acc, a) => acc + (a.valor * 0.5), 0);
```

**Opção B (mais precisa) - Buscar da tabela pagamentos:**
- Adicionar query para buscar `SUM(valor_instrutor)` da tabela pagamentos
- Isso garante valores exatos mesmo com descontos variáveis

Vou implementar a **Opção B** para maior precisão, já que a tabela `pagamentos` já tem o campo `valor_instrutor` calculado corretamente.

---

### 3. Melhorar display de saldo pendente

Adicionar explicação quando saldo Pagar.me é zero mas há pagamentos locais:
```typescript
{recipientStatus === "active" && balance.waitingFunds > 0 && balance.available === 0 && (
  <p className="text-xs text-muted-foreground mt-1">
    Liberação após processamento (D+14/D+30)
  </p>
)}
```

---

## Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/instrutor/InstructorBalanceCard.tsx` | Remover `/100` duplicado em 4 lugares |
| `src/pages/instrutor/InstrutorAulas.tsx` | Buscar `valor_instrutor` da tabela pagamentos ao invés de calcular |

---

## Seção Técnica

### Alterações no InstructorBalanceCard.tsx

Linhas afetadas:
- **Linha 407**: `balance.available / 100` → `balance.available`
- **Linha 419**: `balance.waitingFunds / 100` → `balance.waitingFunds`  
- **Linha 432**: `balance.transferred / 100` → `balance.transferred`
- **Linha 465**: `balance.available / 100` → `balance.available`

### Alterações no InstrutorAulas.tsx

Adicionar fetch de pagamentos e novo estado:
```typescript
const [totalGanhosReal, setTotalGanhosReal] = useState(0);

// Dentro do useEffect, após buscar aulas:
const { data: pagamentosData } = await supabase
  .from('pagamentos')
  .select('valor_instrutor')
  .eq('instrutor_id', instrutor.id)
  .eq('status', 'aprovado');

const total = pagamentosData?.reduce(
  (sum, p) => sum + (p.valor_instrutor || 0), 0
) ?? 0;
setTotalGanhosReal(total);
```

Display:
```typescript
<p className="text-2xl font-bold text-foreground">
  R${totalGanhosReal.toFixed(2).replace('.', ',')}
</p>
```

### Resultado Esperado

| Métrica | Antes | Depois |
|---------|-------|--------|
| Saldo disponível (display) | R$ 0,04 | R$ 4,52 |
| Saldo pendente (display) | R$ 0,04 | R$ 4,52 |
| Total ganho (aulas) | R$ 9,03 | R$ 4,52 |

---

## Verificação Visual do Fluxo

```text
┌──────────────────────────────────────────────────────────┐
│                    PÁGINA DE AULAS                       │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │ 📚 1            │  │ 📈 R$ 4,52      │  ← CORRIGIDO  │
│  │ Aulas concluídas│  │ Total ganho     │    (era 9,03) │
│  └─────────────────┘  └─────────────────┘               │
│                                                          │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                   CARD DE SALDO                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Disponível para saque                                   │
│  R$ 0,00                       ← Pagar.me real (D+14)    │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐                       │
│  │ A receber   │  │ Transferido │                       │
│  │ R$ 4,52     │  │ R$ 0,00     │  ← CORRIGIDO          │
│  └─────────────┘  └─────────────┘    (antes: 0,04)      │
│                                                          │
│  Liberação após processamento (D+14)                     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```
