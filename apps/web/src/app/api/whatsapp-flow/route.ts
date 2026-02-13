import { type NextRequest, NextResponse } from "next/server";
import {
  decryptRequest,
  encryptResponse,
} from "@/lib/whatsapp-flow/crypto";
import { handleFlowRequest } from "@/lib/whatsapp-flow/engine";

/**
 * WhatsApp Flow Endpoint
 *
 * Handles encrypted requests from WhatsApp Flows and returns
 * encrypted responses with the next screen + data.
 *
 * Actions handled:
 * - ping: Health check from WhatsApp
 * - INIT: First time user opens the flow
 * - data_exchange: User submitted a screen (dynamic routing)
 * - BACK: User pressed back button
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { decryptedBody, aesKey, iv } = decryptRequest(body);

    console.log(
      "[WhatsApp Flow] action:",
      decryptedBody.action,
      "screen:",
      decryptedBody.screen ?? "(none)",
    );

    // Process the flow logic
    const response = handleFlowRequest(decryptedBody);

    console.log(
      "[WhatsApp Flow] response:",
      JSON.stringify(response).substring(0, 500),
    );

    // Encrypt and return the response
    const encrypted = encryptResponse(response, aesKey, iv);

    return new NextResponse(encrypted, {
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error("[WhatsApp Flow] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
