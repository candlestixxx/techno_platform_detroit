import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { action, tierId } = body;

    if (action === "create") {
      // Mock creating a subscription
      const tier = await prisma.subscriptionTier.findUnique({
        where: { id: tierId },
      });

      if (!tier) {
        return NextResponse.json({ error: "Tier not found" }, { status: 404 });
      }

      // In production, you would call Stripe here to create a real subscription:
      // const subscription = await stripe.subscriptions.create({ ... })
      // For now, we mock it.

      const newSub = await prisma.subscription.create({
        data: {
          userId,
          tierId,
          status: "active",
          stripeSubId: `sub_mock_${Date.now()}`,
        },
      });

      return NextResponse.json(newSub);
    } else if (action === "cancel") {
      const { subscriptionId } = body;

      const sub = await prisma.subscription.findUnique({
        where: { id: subscriptionId },
      });

      if (!sub || sub.userId !== userId) {
         return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
      }

      const canceledSub = await prisma.subscription.update({
        where: { id: subscriptionId },
        data: { status: "canceled" },
      });

      return NextResponse.json(canceledSub);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("Subscription Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
