
# Correção: Conta Bancária Recusada e Fluxo KYC

## Diagnóstico do Problema

### Situação Atual

| Instrutor | Recipient ID | KYC Status | Status Pagar.me |
|-----------|--------------|------------|-----------------|
| Lucas Felipe | `re_cmla15zsj21vt0l9tdkclu5cu` | `refused` | **REFUSED** |
| Frank Alexandre | `re_cmkx1ob1cy0mz0l9tjhxp6lcf` | `approved` | **ACTIVE** |

### Por que a conta do Lucas foi recusada?

A recusa da Pagar.me pode ocorrer por:
1. **Dados bancários inválidos** - agência/conta/dígito incorretos
2. **CPF não confere** - o CPF informado não corresponde ao titular da conta bancária
3. **Verificação KYC falhou** - se já passou pelo KYC e a verificação facial/documental falhou
4. **Divergência de dados** - nome no cadastro diferente do nome na conta bancária

### O que funciona vs o que está errado na UI:

**Funciona:**
- O banner vermelho "Cadastro recusado" aparece corretamente
- A mensagem pede para clicar em "Recadastrar dados bancários"

**Problema atual:**
- O banner amarelo "Verificar identidade agora" ainda está aparecendo (visível na imagem)
- Isso confunde o usuário, pois ele não pode fazer verificação se a conta foi recusada
- O botão "Recadastrar dados bancários" pode não estar aparecendo

---

## Plano de Correção

### 1. Corrigir a lógica de exibição do banner KYC

O banner de verificação de identidade não deve aparecer quando o status é `refused`. Atualmente, a variável `showKycBannerBeforeBalance` pode exibir o banner mesmo quando não deveria:

```typescript
// Problema: não verifica se kyc_status é "refused"
const showKycBannerBeforeBalance = hasRecipient && !recipientStatus && !balance;
```

**Correção em `InstructorBalanceCard.tsx`:**

```typescript
// Adicionar verificação de kyc_status local
const [localKycStatus, setLocalKycStatus] = useState<string | null>(null);

// Buscar kyc_status do banco ao montar
useEffect(() => {
  if (hasRecipient) {
    fetchKycStatus();
  }
}, [hasRecipient]);

const fetchKycStatus = async () => {
  const { data } = await supabase
    .from("instrutores")
    .select("kyc_status")
    .single();
  if (data) setLocalKycStatus(data.kyc_status);
};

// Corrigir condição para não exibir banner quando refused
const showKycBannerBeforeBalance = hasRecipient && 
  !recipientStatus && 
  !balance && 
  localKycStatus !== "refused";
```

### 2. Garantir que o botão "Recadastrar" aparece

Na prop `onReRegisterClick`, verificar se está sendo passada corretamente e se o botão está visível quando `recipientStatus === "refused"`.

### 3. Adicionar feedback visual claro sobre o motivo da recusa

Quando a conta é recusada, mostrar:
- Mensagem detalhada sobre o que verificar (agência, conta, titular)
- Botão proeminente para "Recadastrar dados bancários"
- Esconder completamente o botão de verificação KYC

### 4. Melhorar Edge Function para retornar motivo da recusa

Atualmente a Edge Function `get-instructor-balance-pagarme` já retorna `recipientStatus: "refused"`, mas podemos adicionar mais contexto consultando o motivo específico na Pagar.me.

---

## Seção Técnica

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/instrutor/InstructorBalanceCard.tsx` | Corrigir lógica de exibição do banner KYC, esconder quando refused |
| `src/pages/instrutor/InstrutorPerfil.tsx` | Garantir prop `onReRegisterClick` funciona corretamente |

### Lógica de Estados Corrigida

```text
recipientStatus == null (carregando)
    └─ Mostrar skeleton/loading

recipientStatus == "refused"
    ├─ Banner VERMELHO: "Cadastro recusado"
    ├─ Botão: "Recadastrar dados bancários"
    └─ NÃO mostrar banner de verificação KYC

recipientStatus == "affiliation" | outros
    ├─ Banner AMARELO: "Verificação pendente"
    └─ Botão: "Verificar identidade agora"

recipientStatus == "active"
    ├─ Badge VERDE: "Identidade verificada ✓"
    └─ Mostrar saldo e botão de saque
```

### Mudanças Específicas em InstructorBalanceCard.tsx

1. **Linha 264** - Corrigir `showKycBannerInitial`:
```typescript
const showKycBannerInitial = !recipientStatus && 
  hasRecipient && 
  !loading && 
  balance && 
  recipientStatus !== "refused"; // Adicionar verificação
```

2. **Linha 268** - Corrigir `showKycBannerBeforeBalance`:
```typescript
const showKycBannerBeforeBalance = hasRecipient && 
  !recipientStatus && 
  !balance && 
  localKycStatus !== "refused"; // Adicionar verificação com estado local
```

3. **Adicionar estado local para kyc_status** para evitar exibir banner incorreto antes do balance carregar

### Diferença entre Frank Alexandre e Lucas Felipe

**Frank Alexandre:**
- Dados bancários corretos → Pagar.me criou recipient
- Verificação KYC completada → Status mudou para `active`
- Pode fazer saques

**Lucas Felipe:**
- Dados bancários podem estar incorretos (ex: CPF não confere com titular)
- Ou KYC falhou (selfie/documento não validou)
- Precisa recadastrar com dados corretos

### Teste de Validação

1. O usuário Lucas deve clicar em "Recadastrar dados bancários"
2. Preencher novamente com atenção:
   - Banco, Agência (sem dígito se Bradesco), Conta, Dígito da conta
   - CPF deve ser EXATAMENTE o do titular da conta bancária
   - Nome deve coincidir com o nome na conta
3. Após recadastrar, fazer verificação KYC novamente
