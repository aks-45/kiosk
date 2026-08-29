import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("demo_user_id")?.value;

    let user = null;
    if (userId) {
      user = await db.demoUser.findUnique({
        where: { id: userId },
      });
    }

    // Fallback: If no cookie session exists, load default SBK001 profile for offline ease
    if (!user) {
      user = await db.demoUser.findUnique({
        where: { customerId: "SBK001" },
      });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Demo user account not found in database." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        customerId: user.customerId,
        name: user.name,
        balance: user.balance,
        savingsBalance: user.savingsBalance,
        pendingBalance: user.pendingBalance,
      },
    });
  } catch (error: any) {
    console.error("Account GET API error:", error);
    return NextResponse.json(
      { success: false, error: "Database query failed." },
      { status: 500 }
    );
  }
}
