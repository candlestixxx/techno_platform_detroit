import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // In a real app, you would fetch from Prisma here.
  // const products = await prisma.product.findMany({ include: { seller: true } });

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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // In a real app, validate and create via Prisma
    // const newProduct = await prisma.product.create({ data: { ...body } });

    console.log("Received new product listing:", body);

    return NextResponse.json({ success: true, message: "Listing created", product: body });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }
}
