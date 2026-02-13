import { type NextRequest, NextResponse } from "next/server";

const N8N_WEBHOOK_URL =
  "https://clickcannabis.app.n8n.cloud/webhook/27e503be-99d6-4395-a8fb-17ca1424f2b0";

/**
 * Webhook that receives WhatsApp Flow responses from GupShup.
 * Forwards the payload to n8n for processing.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log(
      "[Flow Response] Received from GupShup:",
      JSON.stringify(body).substring(0, 1000),
    );

    // Forward to n8n
    const n8nRes = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    console.log("[Flow Response] n8n response:", n8nRes.status);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Flow Response] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
