
# Diagnóstico: Status "Recusado" do Lucas Felipe

## Problema Identificado

Há uma **inconsistência de estado** entre o banco de dados local e a Pagar.me:

```text
┌──────────────────────────────────────────────────────────────┐
│  Banco de Dados Local                                        │
│  kyc_status = 'approved' ✅                                  │
│  (atualizado pelo teste de webhook simulado)                 │
├──────────────────────────────────────────────────────────────┤
│  API Real da Pagar.me                                        │
│  status = 'refused' ❌                                       │
│  (recebedor foi recusado em 27/01/2026)                      │
└──────────────────────────────────────────────────────────────┘
```

## Por que isso acontece?

1. O recebedor `re_cmkx1axuk8zii0l9tr13bvg5c` foi **recusado pela Pagar.me** no dia 27/01/2026
2. Quando fizemos o **teste de simulação** do webhook, atualizamos o banco local para `approved`
3. Mas a **API real** da Pagar.me ainda retorna `refused` - porque o recebedor continua recusado lá
4. A Edge Function corretamente consulta a **fonte verdadeira** (API Pagar.me) e mostra "recusado"

## Ação Necessária

O Lucas Felipe precisa **recadastrar seus dados bancários**:
1. Isso criará um **novo recebedor** na Pagar.me
2. O novo recebedor passará pelo processo de verificação
3. Quando aprovado via webhook, o status será sincronizado

## Correções no Sistema

Para evitar confusão futura, precisamos:

### 1. Sincronizar o banco de dados local com a Pagar.me
Quando a Edge Function detectar que o status da Pagar.me é diferente do banco local, atualizar automaticamente:

```typescript
// Na get-instructor-balance-pagarme
if (recipientStatus !== kycStatusLocal) {
  // Mapear e atualizar banco local
  const mappedStatus = mapPagarmeStatus(recipientStatus);
  await supabase
    .from("instrutores")
    .update({ kyc_status: mappedStatus })
    .eq("id", instrutorData.id);
}
```

### 2. Corrigir o status do Lucas Felipe agora
Atualizar manualmente o banco de dados para refletir a realidade:

```sql
UPDATE instrutores 
SET kyc_status = 'refused' 
WHERE id = 'a9b56ebf-4830-4104-924e-e987dbe7abce';
```

### 3. UI para recadastro
Quando status é `refused`, mostrar botão claro para "Recadastrar dados bancários" que:
- Limpa o `pagarme_recipient_id` antigo
- Abre o formulário `BankAccountSetup` para criar novo recebedor

---

## Seção Técnica

### Mapeamento de Status

| Pagar.me API | Banco Local | Ação |
|--------------|-------------|------|
| `active` | `approved` | Saques liberados |
| `affiliation` | `in_review` | Aguardando verificação |
| `refused` | `refused` | Precisa recadastrar |
| `suspended` | `refused` | Contatar suporte |

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/get-instructor-balance-pagarme/index.ts` | Adicionar sincronização automática de status |
| `src/components/instrutor/InstructorBalanceCard.tsx` | Adicionar botão "Recadastrar" quando refused |
| `src/components/instrutor/BankAccountSetup.tsx` | Permitir recadastro limpando recipient_id antigo |

### SQL para Corrigir Agora

```sql
-- Sincronizar com status real da Pagar.me
UPDATE instrutores 
SET kyc_status = 'refused', kyc_updated_at = now() 
WHERE id = 'a9b56ebf-4830-4104-924e-e987dbe7abce';
```

