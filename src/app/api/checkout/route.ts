import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// Mock stripe initialization since we don't have a real key in this environment.
// In a real application, this would be: new Stripe(process.env.STRIPE_SECRET_KEY!, { ... })
const stripe = new Stripe("sk_test_mock123", {
  apiVersion: "2024-04-10" as any, // Cast as any to bypass TS error when strictly matching Stripe package types
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const { productId, quantity = 1 } = await request.json();

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    // NEVER trust the client price. Always look it up from the database.
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { seller: true }
    });

    if (!product) {
      // Fallback for mocked products during scaffolding phase when DB is empty
      if (productId === "1" || productId === "2") {
        const mockPrice = productId === "1" ? 25.0 : 0;
        const mockTitle = productId === "1" ? "Underground Resistance Vinyl" : "Half-off Lunch at Cass Cafe";
        console.log(`[Mock Stripe] Created session for mock product: ${mockTitle} ($${mockPrice})`);
        return NextResponse.json({ url: `/marketplace?success=true&mock_session=${productId}` });
      }
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const price = product.price;
    const title = product.title;

    const stripeAccountId = product.seller.stripeAccountId;

    // REAL STRIPE IMPLEMENTATION:
    const sessionPayload: any = {
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: title,
            },
            unit_amount: Math.round(price * 100), // Stripe expects cents
          },
          quantity: quantity,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get("origin")}/marketplace?success=true`,
      cancel_url: `${request.headers.get("origin")}/marketplace?canceled=true`,
      metadata: {
        productId: product.id,
        userId: userId || "anonymous"
      }
    };

    // If the seller has a connected account, transfer the funds
    if (stripeAccountId) {
      sessionPayload.payment_intent_data = {
        application_fee_amount: Math.round((price * 100) * 0.05), // Take a 5% platform fee
        transfer_data: {
          destination: stripeAccountId,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionPayload);

    return NextResponse.json({ url: session.url });

  } catch (error: any) {
    console.error("Stripe Error:", error);

    // Fallback for mocked environment
    if (error.message.includes("Invalid API Key provided")) {
        console.warn("Returning mock checkout URL since real Stripe credentials are not present.");
        return NextResponse.json({ url: `/marketplace?success=true&mock_session=${request.url}` });
    }

    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 });
  }
}
