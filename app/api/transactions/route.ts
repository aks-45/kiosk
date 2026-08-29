import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "ALL";
    const query = searchParams.get("query") || "";

    const cookieStore = await cookies();
    const userId = cookieStore.get("demo_user_id")?.value;

    let user = null;
    if (userId) {
      user = await db.demoUser.findUnique({ where: { id: userId } });
    }

    if (!user) {
      user = await db.demoUser.findUnique({ where: { customerId: "SBK001" } });
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Demo user account not found in database." },
        { status: 404 }
      );
    }

    // Build the query options
    const whereClause: any = {
      userId: user.id,
    };

    if (type === "CREDIT" || type === "DEBIT") {
      whereClause.type = type;
    }

    if (query.trim() !== "") {
      whereClause.OR = [
        { description: { contains: query } },
        { category: { contains: query } },
      ];
    }

    const transactions = await db.transaction.findMany({
      where: whereClause,
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      transactions,
    });
  } catch (error: any) {
    console.error("Transactions GET API error:", error);
    return NextResponse.json(
      { success: false, error: "Database transaction lookup failed." },
      { status: 500 }
    );
  }
}
