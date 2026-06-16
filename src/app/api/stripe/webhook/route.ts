import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock123", {
  apiVersion: "2024-04-10" as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const body = await request.text();
  const sig = headers().get("stripe-signature");

  let event: Stripe.Event;

  try {
    if (!sig && process.env.NODE_ENV === "production") {
        throw new Error("Missing stripe-signature header");
    }
    
    if (webhookSecret && sig) {
        event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
        // In local dev without a secret, we parse the body directly for testing
        event = JSON.parse(body);
        console.warn("⚠️ WEBHOOK: Running without signature verification. Use only in local development.");
    }
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutSessionCompleted(session);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log(`Processing completed checkout session: ${session.id}`);

  // Retrieve metadata or custom data passed during session creation
  // For this to work robustly, we should have passed userId and productId in the metadata
  const userId = session.metadata?.userId;
  const productId = session.metadata?.productId;

  if (userId && productId) {
    try {
      // Create a redemption or record the sale
      await prisma.couponRedemption.create({
        data: {
          userId,
          productId,
        }
      });
      console.log(`Successfully recorded redemption for User ${userId} and Product ${productId}`);
    } catch (error) {
      console.error("Failed to record redemption in database:", error);
    }
  } else {
    console.warn("Webhook received checkout.session.completed but metadata (userId/productId) was missing.");
  }
}
