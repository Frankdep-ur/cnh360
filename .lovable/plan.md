
# Plano: Checkout Simplificado de Cartão de Crédito

## Diagnóstico do Problema

O checkout atual usa o **checkout hosted** da Pagar.me que redireciona para a página externa deles. Esse checkout sempre exige endereço completo (CEP, logradouro, número, bairro, cidade, UF) e não há como desabilitar esses campos na configuração da API.

## Solução Proposta

Migrar de **checkout hosted** para **checkout transparente** já existente no sistema.

### Comparação dos Fluxos

| Checkout Hosted (atual) | Checkout Transparente (proposto) |
|-------------------------|----------------------------------|
| Redireciona para página Pagar.me | Formulário próprio no app |
| Exige endereço completo | Apenas dados do cartão |
| Sem controle visual | Design personalizado |
| UX fragmentada | UX integrada |

## Campos do Checkout Simplificado

**Cartão de Crédito (4 campos apenas):**
- Número do cartão
- Nome no cartão  
- Validade (mês/ano)
- CVV

**PIX (já simplificado):**
- Apenas gera QR Code automaticamente

## Alterações Técnicas

### 1. Modificar `AgendarAula.tsx`

Quando usuário seleciona "Cartão de Crédito":
- **Antes:** Chama `create-lesson-payment-pagarme` → redireciona para checkout hosted
- **Depois:** Cria aula pendente → abre modal `PaymentCheckout` → processa via checkout transparente

### 2. Ajustar Fluxo de Criação de Aula

Criar a aula com status `pendente` antes do pagamento, permitindo usar o `PaymentCheckout` existente que já recebe o `lessonId`.

### 3. Arquivos Modificados

```text
src/pages/aluno/AgendarAula.tsx
├── Remover redirecionamento para checkout hosted
├── Adicionar abertura do modal PaymentCheckout para cartão
└── Criar aula antes do pagamento (igual ao PIX)
```

## Fluxo Simplificado

```text
Usuário seleciona Cartão
         ↓
  Cria aula (pendente)
         ↓
 Abre modal PaymentCheckout
         ↓
┌─────────────────────────────┐
│  Número do cartão           │
│  Nome no cartão             │
│  Validade    CVV            │
│                             │
│     [Pagar R$ 10,00]        │
│                             │
│  🔒 Dados criptografados    │
└─────────────────────────────┘
         ↓
 Tokeniza via SDK Pagar.me
         ↓
 Envia cardHash criptografado
         ↓
   Pagamento autorizado
         ↓
  Redireciona para confirmação
```

## Vantagens

- Reduz de 8+ campos para apenas 4 campos
- Elimina fricção do redirecionamento externo
- Mantém conformidade PCI (tokenização no frontend)
- Melhora taxa de conversão
- UX consistente com o design do app

## Conformidade e Segurança

A solução mantém total conformidade com PCI-DSS:
- Dados sensíveis são tokenizados via SDK Pagar.me no navegador
- Apenas o `cardHash` criptografado vai para o backend
- Número do cartão e CVV nunca trafegam em texto plano
