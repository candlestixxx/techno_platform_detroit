import { NextResponse } from "next/server";
import Stripe from "stripe";

// Mock stripe initialization since we don't have a real key in this environment.
// In a real application, this would be: new Stripe(process.env.STRIPE_SECRET_KEY!, { ... })
const stripe = new Stripe("sk_test_mock123", {
  apiVersion: "2024-04-10" as any, // Cast as any to bypass TS error when strictly matching Stripe package types
});

export async function POST(request: Request) {
  try {
    const { productId, title, price, quantity = 1 } = await request.json();

    if (!title || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Since we are mocking the environment, we will mock the checkout session creation
    // and return a fake URL to simulate the Stripe redirect flow.
    const mockCheckoutUrl = `/marketplace?success=true&mock_session=${productId}`;

    /*
    // REAL STRIPE IMPLEMENTATION:
    const session = await stripe.checkout.sessions.create({
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
    });

    return NextResponse.json({ url: session.url });
    */

    console.log(`[Mock Stripe] Created session for product: ${title} ($${price})`);

    return NextResponse.json({ url: mockCheckoutUrl });
  } catch (error: any) {
    console.error("Stripe Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 });
  }
}
