import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock123", {
  apiVersion: "2024-04-10" as any, // Cast as any to bypass TS error
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let stripeAccountId = user.stripeAccountId;

    // Create a new connected account if they don't have one
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      stripeAccountId = account.id;

      // Save the account ID to the user in the database
      await prisma.user.update({
        where: { id: userId },
        data: { stripeAccountId },
      });
    }

    // Create an account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${request.headers.get("origin")}/marketplace?onboarding_refresh=true`,
      return_url: `${request.headers.get("origin")}/marketplace?onboarding_return=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error("Stripe Onboarding Error:", error);

    // Fallback for mocked environment
    if (error.message.includes("Invalid API Key provided")) {
        console.warn("Returning mock onboarding URL since real Stripe credentials are not present.");
        return NextResponse.json({ url: `/marketplace?mock_onboarding=true` });
    }

    return NextResponse.json({ error: error.message || "Failed to create onboarding session" }, { status: 500 });
  }
}
