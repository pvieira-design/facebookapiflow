import { type NextRequest, NextResponse } from "next/server";
import prisma from "@faceapiads/db";

const HEALTH_CHECK_URL =
  "https://app-click-health-check.vercel.app/api/whatsapp";

/**
 * Webhook that receives WhatsApp Flow responses from GupShup.
 *
 * 1. Extracts phone, name and answers from GupShup payload
 * 2. Forwards to health-check API to generate the results page
 * 3. Saves everything to the database
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
