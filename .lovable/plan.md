
# Análise e Correção: Prazo de Liberação D+14 vs Saque no Mesmo Dia

## Diagnóstico do Problema

### O que está acontecendo?

1. **Pagamento do Frank Alexandre**: R$ 4,52 aprovado em 31/01/2026
2. **Status atual da Pagar.me**: 
   - Disponível: R$ 0,00
   - A receber: R$ 4,52
3. **Teste de saque**: Retornou "Saldo insuficiente para saque"

### Causa raiz: Antecipação NÃO está ativa na sua conta

A Pagar.me tem dois modos de liberação de pagamentos de cartão:

| Modo | Prazo | Requisito |
|------|-------|-----------|
| **Sem antecipação** (padrão) | D+29 a D+31 | Nenhum |
| **Com antecipação automática** | D+0 a D+1 | Precisa de liberação manual pela Pagar.me |

O código já envia a configuração correta:
```typescript
automatic_anticipation_settings: {
  enabled: true,
  type: "full",
  volume_percentage: 100
}
```

**Porém**, a documentação da Pagar.me diz:
> "Para utilizar configurações de antecipação automática é necessário realizar a liberação junto a Pagar.me."

Ou seja, você precisa **entrar em contato com a Pagar.me** para habilitar a antecipação automática na sua conta.

---

## Solução: Contatar Pagar.me para Habilitar Antecipação

### Passo 1: Enviar e-mail para relacionamento@pagar.me

**Assunto**: Habilitação de Antecipação Automática - Marketplace CNH360

**Corpo**:
```
Olá,

Somos a plataforma CNH360 e precisamos habilitar a antecipação automática 
para nossos recebedores (instrutores de autoescola).

Dados da conta:
- E-mail da conta: [seu-email@cnh360.com]
- CNPJ: [seu-cnpj]

Configuração desejada:
- Tipo: Full (100% do volume)
- Prazo: D+0 ou D+1 (mesma dia ou próximo dia útil)
- Aplicável a: Todos os recebedores do marketplace

Nosso modelo de negócio é similar a Uber/99, onde instrutores precisam 
receber rapidamente após cada aula concluída.

Aguardo retorno.
```

### Passo 2: Alternativa Temporária (enquanto aguarda liberação)

Enquanto a antecipação não é liberada, podemos melhorar a comunicação ao instrutor:

**Antes**:
```
A receber: R$ 4,52
Liberação D+14
```

**Depois**:
```
A receber: R$ 4,52
Liberação em até 30 dias (antecipação em ativação)
[Link: Saiba mais sobre prazos]
```

---

## Verificação do Botão de Saque

O botão "Sacar Saldo" está funcionando corretamente. O erro retornado:
```json
{"success":false,"error":"Saldo insuficiente para saque. Aguarde a liberação do saldo pendente."}
```

**Este comportamento está correto** porque:
1. O saldo `available` na Pagar.me é R$ 0,00
2. O saldo `waitingFunds` é R$ 4,52 (pendente de liberação)
3. Só é possível sacar valores de `available`, não de `waitingFunds`

Quando a antecipação for ativada, o valor cairá em `available` quase instantaneamente e o saque funcionará.

---

## Melhorias na UI (opcional)

### 1. Atualizar mensagem de prazo no card de saldo

Alterar de "D+14" para algo mais preciso e informativo:

```typescript
// InstructorBalanceCard.tsx
{recipientStatus === "active" && balance.waitingFunds > 0 && balance.available === 0 && (
  <div className="text-xs text-muted-foreground mt-1">
    <p>Aguardando liberação do pagamento</p>
    <button 
      className="text-primary underline"
      onClick={() => window.open('https://wa.me/5518981288372?text=Olá, gostaria de saber sobre o prazo de liberação do meu saldo', '_blank')}
    >
      Dúvidas? Fale conosco
    </button>
  </div>
)}
```

### 2. Desabilitar botão de saque quando não há saldo disponível

Atualmente o botão está habilitado mesmo sem saldo disponível. Podemos melhorar:

```typescript
<Button 
  onClick={handleWithdrawClick}
  disabled={!balance || balance.available <= 0}
  className={cn(
    balance?.available > 0 
      ? "bg-[#4CAF50] hover:bg-[#43A047]" 
      : "bg-muted text-muted-foreground"
  )}
>
  {balance?.available > 0 ? "Sacar Saldo" : "Sem saldo disponível"}
</Button>
```

---

## Resumo das Ações

| Ação | Responsável | Urgência |
|------|-------------|----------|
| Contatar Pagar.me para habilitar antecipação | Você | Alta |
| Atualizar mensagem de prazo no UI | Eu (código) | Média |
| Desabilitar botão de saque quando saldo = 0 | Eu (código) | Baixa |

---

## Seção Técnica

### Arquivos a Modificar (melhorias UI)

| Arquivo | Alteração |
|---------|-----------|
| `src/components/instrutor/InstructorBalanceCard.tsx` | Melhorar mensagem de prazo e desabilitar botão quando saldo = 0 |

### Teste do Fluxo de Saque

O teste foi executado com sucesso:
- **Endpoint**: `POST /request-manual-transfer-pagarme`
- **Resposta**: `400 - Saldo insuficiente para saque`
- **Status**: ✅ Funcionando corretamente (não há saldo disponível)

Quando a Pagar.me liberar a antecipação e o saldo `available` for maior que zero, o saque funcionará.
