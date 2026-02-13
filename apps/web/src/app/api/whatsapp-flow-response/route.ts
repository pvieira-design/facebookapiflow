import { type NextRequest, NextResponse } from "next/server";
import prisma from "@faceapiads/db";

const HEALTH_CHECK_URL =
  "https://app-click-health-check.vercel.app/api/whatsapp";

const GUPSHUP_API_URL = "https://api.gupshup.io/wa/api/v1/msg";
const GUPSHUP_API_KEY = "40x2rzk1huslegq8lze0zdcttjvcm4ve";
const GUPSHUP_SOURCE = "5521993686082";

/**
 * Webhook that receives WhatsApp Flow responses from GupShup.
 *
 * 1. Extracts phone, name and answers from GupShup payload
 * 2. Forwards to health-check API to generate the results page
 * 3. Sends the results link to the patient via WhatsApp
 * 4. Saves everything to the database
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Extract flow response from GupShup payload
    const flowData = extractFlowData(body);

    if (!flowData) {
      // Not a flow response (status callback, etc.) — ignore
      return NextResponse.json({ success: true, skipped: true });
    }

    // Forward to health-check API
    const healthCheckRes = await fetch(HEALTH_CHECK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telefone: flowData.telefone,
        nome: flowData.nome,
        respostas: flowData.respostas,
      }),
    });

    const healthCheckData = await healthCheckRes.json();

    console.log(
      "[Flow Response] Health check result:",
      JSON.stringify(healthCheckData),
    );

    // Send results link via WhatsApp
    if (healthCheckData.link) {
      await sendWhatsAppMessage(
        flowData.telefone,
        flowData.nome,
        healthCheckData.link,
      );
    }

    // Save to database
    const record = await prisma.flowResponse.create({
      data: {
        payload: {
          telefone: flowData.telefone,
          nome: flowData.nome,
          respostas: flowData.respostas,
          healthCheck: healthCheckData,
        },
      },
    });

    console.log("[Flow Response] Saved:", record.id);

    return NextResponse.json({ success: true, id: record.id, ...healthCheckData });
  } catch (error) {
    console.error("[Flow Response] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function sendWhatsAppMessage(
  telefone: string,
  nome: string,
  link: string,
) {
  const firstName = nome.split(" ")[0] || "Olá";

  const message = JSON.stringify({
    type: "cta_url",
    body: `${firstName}, sua análise personalizada de sono está pronta! 🌙\n\nCom base nas suas respostas, preparamos um relatório completo com insights sobre o seu padrão de sono e recomendações específicas para o seu caso.\n\nToque no botão abaixo para acessar:`,
    display_text: "Ver minha análise de sono 📊",
    url: link,
  });

  const params = new URLSearchParams({
    source: GUPSHUP_SOURCE,
    destination: telefone,
    channel: "whatsapp",
    message,
  });

  const res = await fetch(GUPSHUP_API_URL, {
    method: "POST",
    headers: {
      apikey: GUPSHUP_API_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  console.log("[Flow Response] WhatsApp message sent:", res.status);
}

function extractFlowData(body: Record<string, unknown>) {
  try {
    const entry = (body.entry as Array<Record<string, unknown>>)?.[0];
    const changes = (entry?.changes as Array<Record<string, unknown>>)?.[0];
    const value = changes?.value as Record<string, unknown>;

    const messages = (value?.messages as Array<Record<string, unknown>>)?.[0];
    if (!messages || messages.type !== "interactive") return null;

    const interactive = messages.interactive as Record<string, unknown>;
    const nfmReply = interactive?.nfm_reply as Record<string, unknown>;
    if (!nfmReply?.response_json) return null;

    const respostas = JSON.parse(nfmReply.response_json as string);
    delete respostas.flow_token;

    const contacts = (value?.contacts as Array<Record<string, unknown>>)?.[0];
    const profile = contacts?.profile as Record<string, unknown>;

    return {
      telefone: (messages.from as string) ?? "",
      nome: (profile?.name as string) ?? "",
      respostas,
    };
  } catch {
    return null;
  }
}
