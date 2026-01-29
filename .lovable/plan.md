

# Plano: Correção e Teste do Fluxo Completo de Aula

## Diagnóstico do Problema

A aula de teste (ID `12253018-1fb6-4e7e-967e-5aedf0ff6057`) está **travada** porque:

1. O instrutor Frank Alexandre clicou "Cheguei" **antes** do deploy da Edge Function atualizada
2. O `qr_code_inicio_data` está **NULL** - não foi gerado
3. O aluno não consegue ver o QR Code para mostrar ao instrutor
4. O instrutor não consegue escanear nada para iniciar a aula

### Estado Atual

| Campo | Valor | Problema |
|-------|-------|----------|
| Status | `aguardando_confirmacao` | ✓ Correto |
| `qr_code_inicio_data` | NULL | ❌ Deveria ter QR |
| `aluno_pronto_para_aula` | false | Aguardando aluno |
| `payment_confirmed` | true | ✓ Pagamento OK |
| `transaction_id` | `or_PKNvRoGuMXh4rJwz` | ✓ Pagar.me |

---

## Solução em 3 Etapas

### Etapa 1: Reimplantar Edge Function

Verificar e reimplantar a `lesson-workflow` Edge Function para garantir que a versão com geração de QR Code de início está ativa.

### Etapa 2: Resetar Aula para Re-Teste

Para testar o fluxo completo corretamente, preciso:

1. **Reverter o status** da aula para `em_rota`
2. **Limpar os flags** de chegada
3. O instrutor clica "Cheguei" **novamente** (agora com Edge Function correta)
4. O QR Code será gerado corretamente

**Atualização SQL necessária:**
```sql
UPDATE aulas SET 
  status = 'em_rota',
  instrutor_chegou = false,
  qr_code_inicio_data = NULL,
  qr_code_inicio_expires_at = NULL,
  aluno_pronto_para_aula = false
WHERE id = '12253018-1fb6-4e7e-967e-5aedf0ff6057';
```

### Etapa 3: Testar Fluxo Completo

Após o reset, testar:

1. **Instrutor**: Clica "Cheguei no local"
   - QR Code gerado e salvo no banco
   - Status muda para `aguardando_confirmacao`
   
2. **Aluno**: Vê modal bloqueante
   - Confirma início
   - QR Code exibido na tela

3. **Instrutor**: Escaneia QR do aluno
   - Aula inicia
   - Status muda para `em_andamento`
   - Cronômetro ativa

4. **Após duração mínima**: Instrutor finaliza
   - Novo QR Code gerado (de fim)
   - Instrutor escaneia QR do aluno
   
5. **Pagamento capturado**
   - `capture-payment-pagarme` chamado
   - Split 50/50 aplicado
   - Valor creditado na carteira do instrutor

---

## Verificação de Pagamento (Split)

O fluxo de captura de pagamento está correto no código:

```typescript
// lesson-workflow linha 642-646
if (releasePayment && aula.transaction_id) {
  await supabase.functions.invoke("capture-payment-pagarme", {
    body: { aulaId: aula_id }
  });
}
```

E o `capture-payment-pagarme` calcula:

```typescript
const valorBruto = Number(aulaData.valor);      // R$ 10,00
const taxaPlataforma = valorBruto * 0.50;       // R$ 5,00 (50%)
const valorInstrutor = valorBruto - taxaPlataforma; // R$ 5,00 (50%)
```

### Verificação de Saldo do Instrutor

O saldo do instrutor Frank Alexandre pode ser verificado via:
- Edge Function `get-instructor-balance-pagarme`
- Dashboard do instrutor em `/instrutor/perfil`

---

## Arquivos a Modificar

### 1. Nenhuma modificação de código necessária

O código está correto. O problema foi **timing de deploy**.

### 2. Ação necessária: Reset da aula

Executar SQL para reverter status e permitir re-teste com Edge Function atualizada.

---

## Fluxo de Teste Final

```text
[Instrutor]                    [Sistema]                    [Aluno]
     |                              |                           |
     |--"Cheguei"----------------->|                           |
     |                              |--QR Inicio gerado         |
     |                              |--Notificação------------->|
     |                              |                           |
     |                              |<--Modal aparece-----------|
     |                              |<--"Confirmar início"------|
     |                              |--aluno_pronto = true      |
     |<--"Escaneie QR do aluno"----|                           |
     |                              |                           |--QR Code exibido
     |--Scan QR-------------------->|                           |
     |                              |--status = em_andamento    |
     |                              |--Cronômetro inicia------->|
     |                              |                           |
   (50 min de aula)                |                           |
     |                              |                           |
     |--"Finalizar"--------------->|                           |
     |                              |--QR Fim gerado            |
     |                              |                           |--QR Code aparece
     |--Scan QR Final------------->|                           |
     |                              |--status = concluida       |
     |                              |--capture-payment          |
     |                              |--Split 50/50              |
     |<--"Pagamento liberado!"-----|                           |
```

---

## Seção Técnica

### Edge Function `lesson-workflow` - Ações Relevantes

| Action | Ator | Efeito |
|--------|------|--------|
| `cheguei` | Instrutor | Gera `qr_code_inicio_data`, status → `aguardando_confirmacao` |
| `confirmar_inicio_aluno` | Aluno | `aluno_pronto_para_aula = true` |
| `validar_qr_inicio` | Instrutor | Valida QR, status → `em_andamento` |
| `finalizar_aula` | Instrutor | Gera `qr_code_data`, status → `aguardando_qr` |
| `validar_qr` | Instrutor | `capture-payment-pagarme`, status → `concluida` |

### Pagar.me Recipient ID do Frank

```
re_cmkx1ob1cy0mz0l9tjhxp6lcf
```

Este ID é usado no split de pagamento para direcionar 50% do valor para a conta do instrutor.

