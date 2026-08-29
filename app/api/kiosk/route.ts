import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const sessionId = searchParams.get("sessionId");

    if (action === "poll" && sessionId) {
      const session = await db.kioskSession.findUnique({
        where: { sessionId },
      });

      if (!session) {
        return NextResponse.json({ success: false, status: "NOT_FOUND" });
      }

      return NextResponse.json({
        success: true,
        status: session.status,
        updatedAt: session.updatedAt,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid parameters." }, { status: 400 });
  } catch (error: any) {
    console.error("Kiosk API GET error:", error);
    return NextResponse.json({ success: false, error: "Polling error." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, sessionId, kioskId = "SBK001" } = body;

    if (action === "create") {
      // Generate a simple 4-character suffix for the session
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let suffix = "";
      for (let i = 0; i < 4; i++) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      const generatedSessionId = `${kioskId}-${suffix}`;

      // Create session in database
      const session = await db.kioskSession.create({
        data: {
          kioskId,
          sessionId: generatedSessionId,
          status: "READY",
        },
      });

      return NextResponse.json({
        success: true,
        sessionId: session.sessionId,
        status: session.status,
      });
    }

    if (action === "connect" && sessionId) {
      // Set status to CONNECTED
      const session = await db.kioskSession.update({
        where: { sessionId },
        data: {
          status: "CONNECTED",
        },
      });

      return NextResponse.json({
        success: true,
        sessionId: session.sessionId,
        status: session.status,
      });
    }

    if ((action === "end" || action === "reset") && sessionId) {
      // Delete session
      await db.kioskSession.delete({
        where: { sessionId },
      });

      return NextResponse.json({
        success: true,
        message: "Session ended successfully.",
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("Kiosk API POST error:", error);
    return NextResponse.json({ success: false, error: "Session operation failed." }, { status: 500 });
  }
}
