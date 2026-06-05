import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Check if user is a business
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== "BUSINESS") {
      return NextResponse.json({ error: "Unauthorized. Must be a business." }, { status: 403 });
    }

    // Get products for this business
    const products = await prisma.product.findMany({
      where: { sellerId: userId },
      include: {
        redemptions: true
      }
    });

    const totalProducts = products.length;
    const totalRedemptions = products.reduce((acc, curr) => acc + curr.redemptions.length, 0);

    return NextResponse.json({
      metrics: {
        totalProducts,
        totalRedemptions,
      },
      products: products.map(p => ({
        id: p.id,
        title: p.title,
        type: p.type,
        redemptionCount: p.redemptions.length,
      }))
    });

  } catch (error: any) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
