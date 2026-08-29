import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, pin, name } = body;

    const targetCustomerId = (customerId || "SBK001").trim().toUpperCase();
    const targetPin = pin || "1234";

    let user = await db.demoUser.findUnique({
      where: { customerId: targetCustomerId },
    });

    if (!user) {
      // If user doesn't exist, create one dynamically
      user = await db.demoUser.create({
        data: {
          customerId: targetCustomerId,
          pinHash: targetPin,
          name: name?.trim() || "Aarav Sharma",
          balance: 25430.0,
          savingsBalance: 20430.0,
          pendingBalance: 1500.0,
        },
      });
    } else if (name && name.trim().length > 0) {
      // Update the user's name to their custom entered name
      user = await db.demoUser.update({
        where: { id: user.id },
        data: { name: name.trim() },
      });
    }

    if (user.pinHash !== targetPin) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials. PIN must be 1234." },
        { status: 401 }
      );
    }

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set("demo_user_id", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 2, // 2 hours
      path: "/",
    });
    
    // Also set customer name in a client-accessible cookie
    cookieStore.set("customer_name", user.name, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 2,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        customerId: user.customerId,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, error: "Authentication system failure." },
      { status: 500 }
    );
  }
}
