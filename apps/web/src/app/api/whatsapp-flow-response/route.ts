import { type NextRequest, NextResponse } from "next/server";
import prisma from "@faceapiads/db";

/**
 * Webhook that receives WhatsApp Flow responses from GupShup.
 * Saves the full payload to the database.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const record = await prisma.flowResponse.create({
      data: { payload: body },
    });

    console.log("[Flow Response] Saved:", record.id);

    return NextResponse.json({ success: true, id: record.id });
  } catch (error) {
    console.error("[Flow Response] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
