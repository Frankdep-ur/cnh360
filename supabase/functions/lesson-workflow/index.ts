import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface WorkflowRequest {
  aula_id: string;
  action: 'em_rota' | 'cheguei' | 'confirmar_chegada' | 'iniciar_aula' | 'finalizar_aula' | 'validar_qr' | 'regenerar_qr' | 'confirmar_inicio_aluno' | 'validar_qr_inicio' | 'recusar_inicio_aluno' | 'regenerar_qr_inicio' | 'cancelar_aula_aluno' | 'regenerar_qr_aluno';
  qr_data?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  device_info?: Record<string, unknown>;
}

// Helper function to insert audit record
async function insertAuditRecord(
  supabase: any,
  aulaId: string,
  evento: string,
  userId: string,
  latitude?: number,
  longitude?: number,
  accuracy?: number,
  deviceInfo?: Record<string, unknown>,
  dadosAdicionais?: Record<string, unknown>
) {
  try {
    const { error } = await supabase.from("aulas_auditoria").insert({
      aula_id: aulaId,
      evento,
      user_id: userId,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      precisao_metros: accuracy ?? null,
      device_info: deviceInfo ?? null,
      dados_adicionais: dadosAdicionais ?? null,
    });
    if (error) {
      console.error("Failed to insert audit record:", error);
    } else {
      console.log(`Audit record inserted: ${evento} for aula ${aulaId}`);
    }
  } catch (error) {
    console.error("Failed to insert audit record:", error);
    // Don't fail the request for audit errors
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse body first so we can log the action even if auth fails
    const body: WorkflowRequest = await req.json();
    const { aula_id, action, qr_data, latitude, longitude, accuracy, device_info } = body;

    console.log(`[lesson-workflow] ▶ Received request: action=${action}, aula_id=${aula_id}`);

    // Get user from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error(`[lesson-workflow] ✗ Missing authorization header for action=${action}, aula_id=${aula_id}`);
      return new Response(JSON.stringify({ error: "Sessão não encontrada. Faça login novamente." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      console.error(`[lesson-workflow] ✗ Auth failed for action=${action}, aula_id=${aula_id}, error=${userError?.message || 'no user'}`);
      return new Response(JSON.stringify({ error: "Sessão expirada. Faça login novamente." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[lesson-workflow] ✓ Authenticated: user_id=${user.id}, action=${action}, aula_id=${aula_id}`);

    // Use service role for operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!aula_id || !action) {
      return new Response(JSON.stringify({ error: "Missing aula_id or action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch lesson with participant info
    const { data: aula, error: aulaError } = await supabase
      .from("aulas")
      .select(`
        *,
        alunos!inner(id, user_id),
        instrutores!inner(id, user_id)
      `)
      .eq("id", aula_id)
      .single();

    if (aulaError || !aula) {
      console.error("Aula not found:", aulaError);
      return new Response(JSON.stringify({ error: "Aula não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isInstrutor = aula.instrutores.user_id === user.id;
    const isAluno = aula.alunos.user_id === user.id;

    if (!isInstrutor && !isAluno) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let updateData: Record<string, unknown> = {};
    let systemMessage = "";
    let notificationTitle = "";
    let notificationBody = "";
    let notifyUserId = "";
    let releasePayment = false;
    let auditEvento = "";
    let auditDadosAdicionais: Record<string, unknown> = {};

    switch (action) {
      case "em_rota":
        if (!isInstrutor) {
          return new Response(JSON.stringify({ error: "Apenas instrutor pode executar" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aula.status !== "confirmada") {
          return new Response(JSON.stringify({ error: "Status inválido para esta ação" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        updateData = { status: "em_rota", instrutor_a_caminho: true };
        systemMessage = "🚗 **CNH360:** Instrutor está a caminho!";
        notificationTitle = "Instrutor a caminho! 🚗";
        notificationBody = "O instrutor está se deslocando até você.";
        notifyUserId = aula.alunos.user_id;
        auditEvento = "em_rota";
        break;

      case "cheguei":
        if (!isInstrutor) {
          return new Response(JSON.stringify({ error: "Apenas instrutor pode executar" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aula.status !== "em_rota") {
          return new Response(JSON.stringify({ error: "Status inválido para esta ação" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Generate QR Code for start
        const qrInicioTimestamp = new Date().toISOString();
        const qrInicioPayload = JSON.stringify({
          aulaId: aula_id,
          timestamp: qrInicioTimestamp,
          type: "inicio",
          version: 2
        });
        const qrInicioEncoder = new TextEncoder();
        const qrInicioData = qrInicioEncoder.encode(qrInicioPayload + Deno.env.get("EDGE_FUNCTION_SECRET"));
        const qrInicioHashBuffer = await crypto.subtle.digest("SHA-256", qrInicioData);
        const qrInicioHashArray = Array.from(new Uint8Array(qrInicioHashBuffer));
        const qrInicioHashHex = qrInicioHashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        
        const qrCodeInicioData = JSON.stringify({
          aulaId: aula_id,
          timestamp: qrInicioTimestamp,
          hash: qrInicioHashHex,
          type: "inicio",
          version: 2
        });

        updateData = { 
          status: "aguardando_confirmacao", 
          instrutor_chegou: true,
          qr_code_inicio_data: qrCodeInicioData,
          qr_code_inicio_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          aluno_pronto_para_aula: false
        };
        systemMessage = "📍 **CNH360:** Instrutor chegou no local. Confirme sua presença no app!";
        notificationTitle = "Instrutor chegou! 📍";
        notificationBody = "Confirme sua presença para iniciar a aula.";
        notifyUserId = aula.alunos.user_id;
        auditEvento = "cheguei";
        break;

      case "confirmar_chegada":
        if (!isAluno) {
          return new Response(JSON.stringify({ error: "Apenas aluno pode confirmar" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aula.status !== "aguardando_confirmacao") {
          return new Response(JSON.stringify({ error: "Status inválido para esta ação" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        // Calculate wait time
        const chegadaEvent = await supabase
          .from("aulas_auditoria")
          .select("timestamp")
          .eq("aula_id", aula_id)
          .eq("evento", "cheguei")
          .order("timestamp", { ascending: false })
          .limit(1)
          .single();
        
        let tempoEspera = 0;
        if (chegadaEvent.data) {
          tempoEspera = Math.round((Date.now() - new Date(chegadaEvent.data.timestamp).getTime()) / 1000);
        }
        
        updateData = { aluno_confirmou_chegada: true };
        systemMessage = "✅ **CNH360:** Aluno confirmou presença. Instrutor pode iniciar a aula!";
        notificationTitle = "Aluno confirmou! ✅";
        notificationBody = "O aluno está pronto. Inicie a aula.";
        notifyUserId = aula.instrutores.user_id;
        auditEvento = "confirmacao_aluno";
        auditDadosAdicionais = { tempo_espera_segundos: tempoEspera };
        break;

      case "confirmar_inicio_aluno":
        if (!isAluno) {
          return new Response(JSON.stringify({ error: "Apenas aluno pode confirmar início" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aula.status !== "aguardando_confirmacao") {
          return new Response(JSON.stringify({ error: "Status inválido para esta ação" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        updateData = { 
          aluno_pronto_para_aula: true,
          aluno_confirmou_chegada: true
        };
        systemMessage = "✅ **CNH360:** Aluno confirmou presença. Escaneie o QR Code do aluno!";
        notificationTitle = "Aluno pronto! ✅";
        notificationBody = "Escaneie o QR Code no celular do aluno para iniciar.";
        notifyUserId = aula.instrutores.user_id;
        auditEvento = "aluno_confirmou_inicio";
        break;

      case "recusar_inicio_aluno":
        if (!isAluno) {
          return new Response(JSON.stringify({ error: "Apenas aluno pode recusar" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aula.status !== "aguardando_confirmacao") {
          return new Response(JSON.stringify({ error: "Status inválido para esta ação" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        // Don't change status, just log the refusal
        updateData = { aluno_pronto_para_aula: false };
        systemMessage = "❌ **CNH360:** Aluno informou que não está no local.";
        notificationTitle = "Aluno não está no local ❌";
        notificationBody = "O aluno informou que não pode iniciar a aula agora.";
        notifyUserId = aula.instrutores.user_id;
        auditEvento = "aluno_recusou_inicio";
        break;

      case "validar_qr_inicio":
        if (!isInstrutor) {
          return new Response(JSON.stringify({ error: "Apenas instrutor pode validar QR de início" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aula.status !== "aguardando_confirmacao") {
          return new Response(JSON.stringify({ error: "Status inválido para esta ação" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (!aula.aluno_pronto_para_aula) {
          return new Response(JSON.stringify({ error: "Aluno ainda não confirmou presença" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (!qr_data) {
          return new Response(JSON.stringify({ error: "QR code data required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Validate QR expiration
        if (aula.qr_code_inicio_expires_at && new Date(aula.qr_code_inicio_expires_at) < new Date()) {
          return new Response(JSON.stringify({ error: "QR Code expirado. Peça ao aluno para confirmar novamente." }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Validate QR data
        let qrInicioHash = "";
        try {
          const scannedQR = JSON.parse(qr_data);
          const storedQR = JSON.parse(aula.qr_code_inicio_data);
          
          if (scannedQR.type !== "inicio") {
            return new Response(JSON.stringify({ error: "Tipo de QR Code inválido. Use o QR de início." }), {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          
          if (scannedQR.aulaId !== storedQR.aulaId || scannedQR.hash !== storedQR.hash) {
            return new Response(JSON.stringify({ error: "QR Code inválido" }), {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          qrInicioHash = scannedQR.hash;
        } catch {
          return new Response(JSON.stringify({ error: "Formato de QR inválido" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        updateData = { 
          status: "em_andamento",
          qr_inicio_validado: true,
          aula_inicio: new Date().toISOString(),
          instrutor_a_caminho: false
        };
        systemMessage = "🎓 **CNH360:** Aula iniciada! Cronômetro ativado.";
        notificationTitle = "Aula iniciada! 🎓";
        notificationBody = "Boa aula! O cronômetro está rodando.";
        notifyUserId = aula.alunos.user_id;
        auditEvento = "qr_inicio_validado";
        auditDadosAdicionais = { hash: qrInicioHash };
        break;

      case "iniciar_aula":
        // LEGACY: Keep for backward compatibility, but prefer validar_qr_inicio
        if (!isInstrutor) {
          return new Response(JSON.stringify({ error: "Apenas instrutor pode iniciar" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        // Check if we have the new QR flow active
        if (aula.qr_code_inicio_data && !aula.qr_inicio_validado) {
          return new Response(JSON.stringify({ error: "Escaneie o QR Code do aluno para iniciar" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (!aula.aluno_confirmou_chegada && !aula.aluno_pronto_para_aula) {
          return new Response(JSON.stringify({ error: "Aluno ainda não confirmou presença" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        updateData = { 
          status: "em_andamento", 
          aula_inicio: new Date().toISOString(),
          instrutor_a_caminho: false 
        };
        systemMessage = "🎓 **CNH360:** Aula iniciada! Cronômetro ativado.";
        notificationTitle = "Aula iniciada! 🎓";
        notificationBody = "Boa aula! O cronômetro está rodando.";
        notifyUserId = aula.alunos.user_id;
        auditEvento = "inicio";
        break;

      case "finalizar_aula":
        if (!isInstrutor) {
          return new Response(JSON.stringify({ error: "Apenas instrutor pode finalizar" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aula.status !== "em_andamento") {
          return new Response(JSON.stringify({ error: "Status inválido para esta ação" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        
        // Validate minimum duration
        let duracaoSegundos = 0;
        if (aula.aula_inicio) {
          const startTime = new Date(aula.aula_inicio).getTime();
          const now = Date.now();
          duracaoSegundos = Math.round((now - startTime) / 1000);
          const elapsedMinutes = duracaoSegundos / 60;
          const minDuration = aula.duracao_minutos * 0.9; // Allow 10% tolerance
          
          if (elapsedMinutes < minDuration) {
            return new Response(JSON.stringify({ 
              error: `Tempo mínimo não atingido. Faltam ${Math.ceil(minDuration - elapsedMinutes)} minutos.` 
            }), {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }

        // Generate QR code data
        const qrTimestamp = new Date().toISOString();
        const qrPayload = JSON.stringify({
          aulaId: aula_id,
          timestamp: qrTimestamp,
          version: 1
        });
        const encoder = new TextEncoder();
        const data = encoder.encode(qrPayload + Deno.env.get("EDGE_FUNCTION_SECRET"));
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        
        const qrCodeData = JSON.stringify({
          aulaId: aula_id,
          timestamp: qrTimestamp,
          hash: hashHex,
          version: 1
        });

        updateData = { 
          status: "aguardando_qr",
          aula_fim: new Date().toISOString(),
          qr_code_data: qrCodeData,
          qr_code_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        };
        systemMessage = "📱 **CNH360:** Aula finalizada! Aluno, mostre o QR Code para o instrutor.";
        notificationTitle = "Mostre o QR Code! 📱";
        notificationBody = "Apresente o QR Code no app para o instrutor escanear.";
        notifyUserId = aula.alunos.user_id;
        auditEvento = "fim";
        auditDadosAdicionais = { duracao_segundos: duracaoSegundos };
        break;

      case "validar_qr":
        if (!isInstrutor) {
          return new Response(JSON.stringify({ error: "Apenas instrutor pode validar" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aula.status !== "aguardando_qr") {
          return new Response(JSON.stringify({ error: "Status inválido para esta ação" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (!qr_data) {
          return new Response(JSON.stringify({ error: "QR code data required" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Validate QR expiration
        if (aula.qr_code_expires_at && new Date(aula.qr_code_expires_at) < new Date()) {
          return new Response(JSON.stringify({ error: "QR Code expirado. Peça ao aluno para gerar novo." }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Validate QR data
        let qrHash = "";
        try {
          const scannedQR = JSON.parse(qr_data);
          const storedQR = JSON.parse(aula.qr_code_data);
          
          if (scannedQR.aulaId !== storedQR.aulaId || scannedQR.hash !== storedQR.hash) {
            return new Response(JSON.stringify({ error: "QR Code inválido" }), {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          qrHash = scannedQR.hash;
        } catch {
          return new Response(JSON.stringify({ error: "Formato de QR inválido" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        updateData = { 
          status: "concluida",
          qr_validado: true,
          validada_em: new Date().toISOString()
        };
        systemMessage = "🎉 **CNH360:** Aula concluída com sucesso! Pagamento liberado.";
        notificationTitle = "Aula concluída! 🎉";
        notificationBody = `Parabéns! A aula foi validada com sucesso.`;
        notifyUserId = aula.alunos.user_id;
        releasePayment = true;
        auditEvento = "qr_validado";
        auditDadosAdicionais = { hash: qrHash };
        break;

      case "regenerar_qr":
        if (!isInstrutor) {
          return new Response(JSON.stringify({ error: "Apenas instrutor pode regenerar QR" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aula.status !== "aguardando_qr") {
          return new Response(JSON.stringify({ error: "Status inválido para esta ação" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Generate new QR code data
        const newQrTimestamp = new Date().toISOString();
        const newQrPayload = JSON.stringify({
          aulaId: aula_id,
          timestamp: newQrTimestamp,
          version: 1
        });
        const newEncoder = new TextEncoder();
        const newData = newEncoder.encode(newQrPayload + Deno.env.get("EDGE_FUNCTION_SECRET"));
        const newHashBuffer = await crypto.subtle.digest("SHA-256", newData);
        const newHashArray = Array.from(new Uint8Array(newHashBuffer));
        const newHashHex = newHashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        
        const newQrCodeData = JSON.stringify({
          aulaId: aula_id,
          timestamp: newQrTimestamp,
          hash: newHashHex,
          version: 1
        });

        updateData = { 
          qr_code_data: newQrCodeData,
          qr_code_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        };
        systemMessage = "🔄 **CNH360:** Novo QR Code gerado! Aluno, mostre para o instrutor.";
        notificationTitle = "Novo QR Code! 📱";
        notificationBody = "Um novo código foi gerado. Apresente ao instrutor.";
        notifyUserId = aula.alunos.user_id;
        auditEvento = "regenerar_qr";
        break;

      case "regenerar_qr_inicio":
        if (!isAluno) {
          return new Response(JSON.stringify({ error: "Apenas aluno pode regenerar QR de início" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aula.status !== "aguardando_confirmacao") {
          return new Response(JSON.stringify({ error: "Status inválido para esta ação" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (!aula.aluno_pronto_para_aula) {
          return new Response(JSON.stringify({ error: "Aluno não confirmou presença ainda" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Generate new start QR code
        const regenQrInicioTimestamp = new Date().toISOString();
        const regenQrInicioPayload = JSON.stringify({
          aulaId: aula_id,
          timestamp: regenQrInicioTimestamp,
          type: "inicio",
          version: 2
        });
        const regenQrInicioEncoder = new TextEncoder();
        const regenQrInicioData = regenQrInicioEncoder.encode(regenQrInicioPayload + Deno.env.get("EDGE_FUNCTION_SECRET"));
        const regenQrInicioHashBuffer = await crypto.subtle.digest("SHA-256", regenQrInicioData);
        const regenQrInicioHashArray = Array.from(new Uint8Array(regenQrInicioHashBuffer));
        const regenQrInicioHashHex = regenQrInicioHashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        
        const regenQrCodeInicioData = JSON.stringify({
          aulaId: aula_id,
          timestamp: regenQrInicioTimestamp,
          hash: regenQrInicioHashHex,
          type: "inicio",
          version: 2
        });

        updateData = { 
          qr_code_inicio_data: regenQrCodeInicioData,
          qr_code_inicio_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        };
        systemMessage = "🔄 **CNH360:** Novo QR Code de início gerado!";
        notificationTitle = "Novo QR Code! 📱";
        notificationBody = "O aluno gerou um novo QR Code. Escaneie para iniciar a aula.";
        notifyUserId = aula.instrutores.user_id;
        auditEvento = "regenerar_qr_inicio";
        break;

      case "cancelar_aula_aluno":
        if (!isAluno) {
          return new Response(JSON.stringify({ error: "Apenas aluno pode cancelar neste momento" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (!["aguardando_confirmacao", "em_rota"].includes(aula.status)) {
          return new Response(JSON.stringify({ error: "Não é possível cancelar neste momento" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        updateData = { 
          status: "cancelada",
          aluno_pronto_para_aula: false,
          qr_code_inicio_data: null,
          qr_code_inicio_expires_at: null
        };
        systemMessage = "❌ **CNH360:** Aula cancelada pelo aluno.";
        notificationTitle = "Aula cancelada ❌";
        notificationBody = "O aluno cancelou a aula.";
        notifyUserId = aula.instrutores.user_id;
        auditEvento = "cancelar_aula_aluno";
        break;

      case "regenerar_qr_aluno":
        // Allow student to regenerate finalization QR code
        if (!isAluno) {
          return new Response(JSON.stringify({ error: "Apenas aluno pode regenerar QR de finalização" }), {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aula.status !== "aguardando_qr") {
          return new Response(JSON.stringify({ error: "Status inválido para esta ação" }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Generate new finalization QR code
        const regenQrAlunoTimestamp = new Date().toISOString();
        const regenQrAlunoPayload = JSON.stringify({
          aulaId: aula_id,
          timestamp: regenQrAlunoTimestamp,
          version: 1
        });
        const regenQrAlunoEncoder = new TextEncoder();
        const regenQrAlunoData = regenQrAlunoEncoder.encode(regenQrAlunoPayload + Deno.env.get("EDGE_FUNCTION_SECRET"));
        const regenQrAlunoHashBuffer = await crypto.subtle.digest("SHA-256", regenQrAlunoData);
        const regenQrAlunoHashArray = Array.from(new Uint8Array(regenQrAlunoHashBuffer));
        const regenQrAlunoHashHex = regenQrAlunoHashArray.map(b => b.toString(16).padStart(2, "0")).join("");
        
        const regenQrCodeAlunoData = JSON.stringify({
          aulaId: aula_id,
          timestamp: regenQrAlunoTimestamp,
          hash: regenQrAlunoHashHex,
          version: 1
        });

        updateData = { 
          qr_code_data: regenQrCodeAlunoData,
          qr_code_expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        };
        systemMessage = "🔄 **CNH360:** Novo QR Code de finalização gerado!";
        notificationTitle = "Novo QR Code! 📱";
        notificationBody = "O aluno gerou um novo QR Code de finalização. Escaneie para concluir.";
        notifyUserId = aula.instrutores.user_id;
        auditEvento = "regenerar_qr_aluno";
        break;

      default:
        return new Response(JSON.stringify({ error: "Ação inválida" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    // Update aula
    const { error: updateError } = await supabase
      .from("aulas")
      .update(updateData)
      .eq("id", aula_id);

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(JSON.stringify({ error: "Erro ao atualizar aula" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Insert audit record
    if (auditEvento) {
      await insertAuditRecord(
        supabase,
        aula_id,
        auditEvento,
        user.id,
        latitude,
        longitude,
        accuracy,
        device_info,
        Object.keys(auditDadosAdicionais).length > 0 ? auditDadosAdicionais : undefined
      );
    }

    // Insert system message in chat
    if (systemMessage) {
      await supabase.from("mensagens_aula").insert({
        aula_id,
        sender_id: user.id,
        content: systemMessage,
        is_system: true
      });
    }

    // Insert notification for the other participant
    if (notifyUserId && notificationTitle) {
      await supabase.from("notifications").insert({
        user_id: notifyUserId,
        title: notificationTitle,
        body: notificationBody,
        type: "lesson_status",
        reference_id: aula_id
      });

      // Send push notification
      try {
        await supabase.functions.invoke("send-push-notification", {
          body: {
            user_id: notifyUserId,
            title: notificationTitle,
            body: notificationBody,
            data: { aula_id, action }
          }
        });
      } catch (pushError) {
        console.log("Push notification failed (non-blocking):", pushError);
      }
    }

    // Release payment if QR validated
    if (releasePayment) {
      try {
        if (aula.transaction_id) {
          // Has gateway transaction — capture via Pagar.me
          console.log("Releasing payment for aula:", aula_id, "transaction:", aula.transaction_id);
          await supabase.functions.invoke("capture-payment-pagarme", {
            body: { aulaId: aula_id }
          });
        } else {
          // No gateway transaction — create payment record directly
          console.log("No transaction_id for aula:", aula_id, "— creating direct payment record");

          // Check if payment already exists
          const { data: existingPayment } = await supabase
            .from("pagamentos")
            .select("id")
            .eq("aula_id", aula_id)
            .single();

          if (!existingPayment) {
            // Fetch instructor KYC status to determine split
            const { data: instrutorData } = await supabase
              .from("instrutores")
              .select("kyc_status")
              .eq("id", aula.instrutor_id)
              .single();

            const kycApproved = instrutorData?.kyc_status === "approved";
            const valorBruto = Number(aula.valor);
            const taxaPlataforma = kycApproved ? valorBruto * 0.50 : valorBruto;
            const valorInstrutor = kycApproved ? valorBruto * 0.50 : 0;

            const { error: pagamentoError } = await supabase
              .from("pagamentos")
              .insert({
                aula_id: aula_id,
                aluno_id: aula.aluno_id,
                instrutor_id: aula.instrutor_id,
                valor_bruto: valorBruto,
                taxa_plataforma: taxaPlataforma,
                valor_instrutor: valorInstrutor,
                metodo: "pix",
                status: "pendente",
                pago_em: new Date().toISOString(),
              });

            if (pagamentoError) {
              console.error("Error creating direct payment record:", pagamentoError);
            } else {
              console.log(`Direct payment record created: bruto=${valorBruto}, plataforma=${taxaPlataforma}, instrutor=${valorInstrutor}, kyc=${instrutorData?.kyc_status}`);
            }
          } else {
            console.log("Payment already exists for aula:", aula_id);
          }
        }

        // Liberar pagamento: atualizar status para aprovado (saldo disponível para saque)
        const { error: liberarError } = await supabase
          .from("pagamentos")
          .update({ status: "aprovado", pago_em: new Date().toISOString() })
          .eq("aula_id", aula_id);

        if (liberarError) {
          console.error("Error updating payment status to aprovado:", liberarError);
        } else {
          console.log("Payment status updated to aprovado for aula:", aula_id);
        }

        // Send WhatsApp notification for payment
        const { data: instrutorProfile } = await supabase
          .from("profiles")
          .select("phone")
          .eq("id", aula.instrutores.user_id)
          .single();

        if (instrutorProfile?.phone) {
          try {
            await supabase.functions.invoke("send-whatsapp-notification", {
              body: {
                phone: instrutorProfile.phone,
                message: `💰 *CNH360 - Pagamento liberado!*\n\nSua aula foi concluída e o pagamento de R$ ${Number(aula.valor).toFixed(2).replace('.', ',')} foi liberado para sua conta!`
              }
            });
          } catch (whatsError) {
            console.log("WhatsApp notification failed (non-blocking):", whatsError);
          }
        }

        // Also notify instructor in-app about payment
        await supabase.from("notifications").insert({
          user_id: aula.instrutores.user_id,
          title: "Pagamento liberado! 💰",
          body: `R$ ${Number(aula.valor).toFixed(2).replace('.', ',')} foi creditado na sua conta.`,
          type: "payment",
          reference_id: aula_id
        });

      } catch (paymentError) {
        console.error("Payment capture error:", paymentError);
        // Don't fail the request, but log the error
      }
    }

    console.log(`Lesson workflow: ${action} completed for aula ${aula_id}`);

    return new Response(JSON.stringify({ 
      success: true, 
      action,
      new_status: updateData.status || aula.status
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Lesson workflow error:", error);
    return new Response(JSON.stringify({ error: "Erro interno" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
