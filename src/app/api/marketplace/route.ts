import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    let products: any[] = [];
    try {
      products = await prisma.product.findMany({
        include: {
          seller: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (e) {
      console.warn("Prisma error ignored during scaffolding/testing phase for marketplace.");
    }

    // If database is empty, return some mock data to keep the UI functional during scaffolding
    if (products.length === 0) {
      const mockProducts = [
        {
          id: "1",
          title: "Underground Resistance Vinyl",
          description: "Limited edition white label.",
          price: 25.0,
          type: "LIMITED_VINYL",
          delivery: "SHIPPED",
          seller: { name: "UR Records" },
        },
        {
          id: "2",
          title: "Half-off Lunch at Cass Cafe",
          description: "Digital coupon for local lunch.",
          price: 0,
          type: "LOCAL_PROMO_COUPON",
          delivery: "ELECTRONIC_ONLY",
          qrCode: "MOCK_QR_CODE_123",
          seller: { name: "Cass Cafe" },
        },
      ];
      return NextResponse.json(mockProducts);
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description || body.price === undefined || !body.type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        title: body.title,
        description: body.description,
        price: body.price,
        type: body.type,
        sellerId: (session.user as any).id, // Force sellerId to be the authenticated user
        delivery: body.delivery || "SHIPPED",
        qrCode: body.qrCode,
      },
    });

    return NextResponse.json({ success: true, message: "Listing created", product: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Invalid request payload or database error" }, { status: 400 });
  }
}
