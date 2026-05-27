import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const products = await prisma.product.findMany({
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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description || body.price === undefined || !body.type || !body.sellerId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newProduct = await prisma.product.create({
      data: {
        title: body.title,
        description: body.description,
        price: body.price,
        type: body.type,
        sellerId: body.sellerId,
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
