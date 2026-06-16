import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prompt, taskType } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    // In a real production implementation, we would proxy this request directly to our running LiteLLM instance
    // Example:
    /*
    const response = await fetch("http://localhost:4000/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.LITELLM_API_KEY}`
      },
      body: JSON.stringify({
        model: "openrouter/owl-alpha", // The best model found during our scripts/litellm_setup.py run
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();
    return NextResponse.json({ result: data.choices[0].message.content });
    */

    // For local dev scaffolding, mock the LiteLLM response based on the intended task type
    let mockResponse = "";

    if (taskType === "FEED_SUMMARY") {
      mockResponse = "Here is a quick summary of the latest Detroit techno events and venue specials based on the requested feed context.";
    } else if (taskType === "VENUE_ANALYSIS") {
      mockResponse = "The analysis indicates a rising trend in minimal techno events at TV Lounge and Spot Lite Detroit over the past week.";
    } else {
      mockResponse = "This is a mock proxy response from the LiteLLM server processing your generic request.";
    }

    console.log(`[LiteLLM Proxy] Task: ${taskType || "GENERIC"} - Processed via mock inference.`);

    return NextResponse.json({ result: mockResponse });
  } catch (error: any) {
    console.error("LiteLLM Proxy Error:", error);
    return NextResponse.json({ error: error.message || "Failed to proxy request to LiteLLM server" }, { status: 500 });
  }
}
