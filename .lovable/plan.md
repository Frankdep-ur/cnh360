
# Plano: Notificação via WhatsApp para Instrutor após Pagamento Confirmado

## Objetivo

Quando o aluno completar o pagamento de uma aula, enviar automaticamente uma mensagem via WhatsApp para o instrutor com todos os detalhes da aula e um deep link para o chat dentro do app.

## Análise do Sistema Atual

### O que já existe
| Componente | Status |
|------------|--------|
| Campo `phone` na tabela `profiles` | Disponível |
| Edge Function `send-lesson-notification` | Envia email + notificação in-app |
| Edge Function `check-payment-status-pagarme` | Atualiza status quando pagamento confirmado |
| URL publicada | `https://cnh360.lovable.app` |

### Fluxo atual de pagamento
1. Aluno seleciona instrutor e aula
2. Aluno paga via PIX ou Cartão
3. `check-payment-status-pagarme` detecta pagamento confirmado
4. Status da aula muda para "confirmada"
5. Instrutor recebe **apenas** notificação in-app + email

## Opções de Implementação WhatsApp

### Opção A: API Oficial (Twilio/WhatsApp Business)
- Mensagens 100% automáticas sem intervenção
- Custo: ~$0.05-0.10 por mensagem
- Requer configuração de conta Twilio + aprovação de template

### Opção B: Link wa.me (Sem custo de API)
- Gera link clicável que abre WhatsApp pré-preenchido
- Usuário precisa clicar para enviar (pode ser automatizado via webhook)
- Zero custo, implementação rápida

**Recomendação**: Começar com **Opção A (Twilio)** para experiência profissional e automação completa.

## Arquivos a Modificar/Criar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/send-whatsapp-notification/index.ts` | **Nova** Edge Function para enviar WhatsApp via Twilio |
| `supabase/functions/check-payment-status-pagarme/index.ts` | Chamar send-whatsapp quando pagamento confirmado |
| `supabase/config.toml` | Adicionar configuração da nova função |

## Secrets Necessários

Para usar Twilio, precisaremos adicionar:
- `TWILIO_ACCOUNT_SID` - ID da conta Twilio
- `TWILIO_AUTH_TOKEN` - Token de autenticação
- `TWILIO_WHATSAPP_NUMBER` - Número WhatsApp Business (formato: +5511999999999)

## Implementação Detalhada

### 1. Nova Edge Function: send-whatsapp-notification

```typescript
// supabase/functions/send-whatsapp-notification/index.ts

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-edge-secret",
};

interface WhatsAppPayload {
  aulaId: string;
  alunoNome: string;
  instrutorPhone: string;
  instrutorNome: string;
  dataHora: string;
  duracaoMinutos: number;
  pontoEncontro: string;
  valor: number;
  categoria?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const twilioSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioWhatsApp = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

    if (!twilioSid || !twilioToken || !twilioWhatsApp) {
      console.log("Twilio não configurado, pulando WhatsApp");
      return new Response(
        JSON.stringify({ success: false, reason: "twilio_not_configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: WhatsAppPayload = await req.json();
    
    // Formatar data para exibição
    const dataFormatada = new Date(payload.dataHora).toLocaleString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Deep link para o chat da aula
    const chatDeepLink = `https://cnh360.lovable.app/aluno/chat/${payload.aulaId}`;

    // Mensagem formatada para WhatsApp
    const message = `🎉 *Pagamento confirmado!*

👤 *Aluno:* ${payload.alunoNome}
📚 *Aula:* Categoria B - ${payload.duracaoMinutos} min prática
📅 *Data/Hora:* ${dataFormatada}
📍 *Local:* ${payload.pontoEncontro || "A combinar"}
💰 *Valor pago:* R$ ${payload.valor.toFixed(2)}

💬 Acesse o chat no app para falar com o aluno:
${chatDeepLink}

Qualquer dúvida, responde aqui ou no app.
Bora ensinar! 🚗`;

    // Formatar número para WhatsApp (remover caracteres especiais)
    const phoneClean = payload.instrutorPhone.replace(/\D/g, "");
    const whatsappTo = phoneClean.startsWith("55") 
      ? `whatsapp:+${phoneClean}` 
      : `whatsapp:+55${phoneClean}`;

    // Enviar via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
    const twilioAuth = btoa(`${twilioSid}:${twilioToken}`);

    const formData = new URLSearchParams();
    formData.append("From", `whatsapp:${twilioWhatsApp}`);
    formData.append("To", whatsappTo);
    formData.append("Body", message);

    const twilioResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${twilioAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error("Twilio error:", twilioData);
      throw new Error(twilioData.message || "Erro ao enviar WhatsApp");
    }

    console.log("WhatsApp enviado:", twilioData.sid);

    return new Response(
      JSON.stringify({ success: true, messageSid: twilioData.sid }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error sending WhatsApp:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
```

### 2. Modificar check-payment-status-pagarme

Adicionar chamada para enviar WhatsApp quando pagamento for confirmado:

```typescript
// Após linha 107, quando status é "succeeded"
if (simplifiedStatus === "succeeded" && aulaId) {
  // ... código existente de update ...

  // Buscar dados completos para notificação WhatsApp
  const { data: aulaCompleta } = await supabase
    .from("aulas")
    .select(`
      id, data_hora, duracao_minutos, ponto_encontro, valor,
      instrutor_id, aluno_id
    `)
    .eq("id", aulaId)
    .single();

  if (aulaCompleta) {
    // Buscar dados do instrutor
    const { data: instrutor } = await supabase
      .from("instrutores")
      .select("user_id")
      .eq("id", aulaCompleta.instrutor_id)
      .single();

    const { data: instrutorProfile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", instrutor?.user_id)
      .single();

    // Buscar nome do aluno
    const { data: aluno } = await supabase
      .from("alunos")
      .select("user_id")
      .eq("id", aulaCompleta.aluno_id)
      .single();

    const { data: alunoProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", aluno?.user_id)
      .single();

    // Enviar WhatsApp se instrutor tem telefone cadastrado
    if (instrutorProfile?.phone) {
      try {
        await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-whatsapp-notification`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
          },
          body: JSON.stringify({
            aulaId,
            alunoNome: alunoProfile?.full_name || "Aluno",
            instrutorPhone: instrutorProfile.phone,
            instrutorNome: instrutorProfile.full_name || "Instrutor",
            dataHora: aulaCompleta.data_hora,
            duracaoMinutos: aulaCompleta.duracao_minutos,
            pontoEncontro: aulaCompleta.ponto_encontro,
            valor: aulaCompleta.valor,
          }),
        });
        logStep("WhatsApp notification triggered");
      } catch (whatsappError) {
        console.error("Failed to send WhatsApp:", whatsappError);
        // Não falhar o pagamento por causa do WhatsApp
      }
    }
  }
}
```

### 3. Atualizar supabase/config.toml

```toml
[functions.send-whatsapp-notification]
verify_jwt = false
```

## Fluxo Completo Após Implementação

```text
┌─────────────────────────────────────────────────────────────────┐
│ Aluno completa pagamento (PIX ou Cartão)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ check-payment-status-pagarme detecta status "paid"             │
└─────────────────────────────────────────────────────────────────┘
                              │
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                  ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Atualiza aula    │ │ Notificação      │ │ WhatsApp via     │
│ status=confirmada│ │ in-app + email   │ │ Twilio           │
│ payment_confirmed│ │ (existente)      │ │ (NOVO)           │
└──────────────────┘ └──────────────────┘ └──────────────────┘
                                                   │
                                                   ▼
                              ┌─────────────────────────────────────┐
                              │ Instrutor recebe no WhatsApp:       │
                              │                                     │
                              │ 🎉 Pagamento confirmado!             │
                              │ 👤 Aluno: João Silva                │
                              │ 📅 15/02/2026 às 14:00              │
                              │ 📍 Osasco/SP                        │
                              │ 💰 R$ 120,00                        │
                              │ 💬 Link para chat no app            │
                              └─────────────────────────────────────┘
```

## Exemplo da Mensagem WhatsApp

```
🎉 *Pagamento confirmado!*

👤 *Aluno:* João Silva
📚 *Aula:* Categoria B - 60 min prática
📅 *Data/Hora:* sábado, 15/02/2026 às 14:00
📍 *Local:* Av. Brasil, 1000 - Osasco/SP
💰 *Valor pago:* R$ 120,00

💬 Acesse o chat no app para falar com o aluno:
https://cnh360.lovable.app/aluno/chat/uuid-da-aula

Qualquer dúvida, responde aqui ou no app.
Bora ensinar! 🚗
```

## Próximos Passos para Implementação

1. **Criar conta Twilio** e configurar WhatsApp Sandbox (para testes) ou número Business
2. **Adicionar secrets** no Lovable Cloud:
   - TWILIO_ACCOUNT_SID
   - TWILIO_AUTH_TOKEN  
   - TWILIO_WHATSAPP_NUMBER
3. **Criar Edge Function** send-whatsapp-notification
4. **Modificar** check-payment-status-pagarme para chamar a nova função
5. **Testar** com um pagamento de teste

## Custo Estimado

| Volume Mensal | Custo Twilio |
|---------------|--------------|
| 100 mensagens | ~$5-10 |
| 500 mensagens | ~$25-50 |
| 1000 mensagens | ~$50-100 |

## Alternativa Sem Custo (Fallback)

Se preferir não usar Twilio inicialmente, podemos implementar um link `wa.me` que abre o WhatsApp com a mensagem pré-preenchida. O instrutor receberia uma notificação push/in-app pedindo para "Confirmar recebimento via WhatsApp" que abriria o link automaticamente.
