import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // If database is empty, return mock data for scaffolding
    if (posts.length === 0) {
      const newPosts = [
        {
          id: `artist-${page}`,
          type: "ARTIST_UPDATE",
          author: { name: "DJ Minx" },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          content: "Just dropped a new mix on SoundCloud. Check it out!",
          embedUrl: "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/123456789",
        },
        {
          id: `event-${page}`,
          type: "EVENT_ANNOUNCEMENT",
          author: { name: "RA.co" },
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          content: "Just Announced: TV Lounge Weekend Lineup.",
          metadata: { venue: "TV Lounge", source: "Resident Advisor" },
        },
        {
          id: `business-${page}`,
          type: "BUSINESS_SPOTLIGHT",
          author: { name: "Spot Lite Detroit" },
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          content: "Come grab a coffee and browse some records. 15% off if you show this post today!",
          metadata: { offerCode: "UNDERGROUND15" },
        },
      ];
      return NextResponse.json({ posts: newPosts, hasMore: page < 5 });
    }

    // Determine if there are more posts to load
    const totalCount = await prisma.post.count();
    const hasMore = skip + limit < totalCount;

    return NextResponse.json({ posts, hasMore });
  } catch (error) {
    console.error("Failed to fetch feed:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}
