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

    // Gather context
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          include: { tier: { include: { artist: true } } }
        },
        redemptions: {
          include: { product: { include: { seller: true } } }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const subbedArtists = user.subscriptions.map(s => s.tier.artist.name).join(", ");
    const claimedPromos = user.redemptions.map(r => r.product.title).join(", ");

    const prompt = `Based on a user who is subscribed to the following Detroit techno artists: [${subbedArtists || "None"}], and has claimed these local promotions: [${claimedPromos || "None"}], what are 3 up-and-coming Detroit underground DJs or producers they should check out next? Keep the response to 3 short bullet points.`;

    // Make request to the LiteLLM Proxy endpoint
    // In production this would hit the actual LiteLLM service, here we mock the call logic.
    let aiResponse = "";
    try {
        const response = await fetch(`${request.headers.get("origin") || "http://localhost:3000"}/api/llm`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt, taskType: "RECOMMENDATION" })
        });

        if (response.ok) {
            const data = await response.json();
            aiResponse = data.result;
        } else {
            throw new Error("Proxy error");
        }
    } catch (e) {
        aiResponse = "1. DJ Holographic\n2. Ash Lauryn\n3. Waajeed";
    }

    return NextResponse.json({ recommendations: aiResponse });

  } catch (error: any) {
    console.error("AI Recommendation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
