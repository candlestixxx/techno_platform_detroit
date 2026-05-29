import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let userId = null;
    try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_scaffolding");
        userId = (decoded as any).id;
    } catch (err) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { expoPushToken } = await request.json();

    if (!expoPushToken) {
      return NextResponse.json({ error: "Missing Expo push token" }, { status: 400 });
    }

    // Save token to user profile
    await prisma.user.update({
      where: { id: userId },
      data: { expoPushToken },
    });

    return NextResponse.json({ success: true, message: "Token registered successfully" });

  } catch (error: any) {
    console.error("Expo Push Registration Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
