import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    let userId = null;
    const session = await getServerSession(authOptions);

    if (session && session.user && (session.user as any).id) {
        userId = (session.user as any).id;
    } else {
        // Fallback for Mobile JWTs
        const authHeader = request.headers.get("authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.split(" ")[1];
            try {
                const jwt = require("jsonwebtoken");
                const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_scaffolding");
                userId = decoded.id;
            } catch (err) {
                return NextResponse.json({ error: "Invalid token" }, { status: 401 });
            }
        }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        products: true,
        subscriptions: {
          include: {
            tier: {
              include: {
                artist: {
                  select: { name: true, image: true }
                }
              }
            }
          }
        },
        redemptions: {
          include: {
            product: {
              include: {
                seller: {
                  select: { name: true, image: true }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
       return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Strip sensitive fields
    const { password, ...safeUser } = user;

    return NextResponse.json(safeUser);
  } catch (error: any) {
    console.error("Profile Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
