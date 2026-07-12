import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  try {
    // Fetch posts and events in parallel
    const [posts, events] = await Promise.all([
      prisma.post.findMany({
        include: {
          author: { select: { name: true, role: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.event.findMany({
        orderBy: { createdAt: "desc" },
      })
    ]);

    // Combine and format for the unified feed
    let combinedFeed = [
      ...posts.map(p => ({
        id: p.id,
        type: p.type === "ARTIST_UPDATE" ? "ARTIST_POST" : "GENERAL",
        author: p.author?.name || "Anonymous",
        role: p.author?.role || "USER",
        content: p.content,
        createdAt: p.createdAt,
        metadata: p.embedUrl ? { embedUrl: p.embedUrl } : undefined
      })),
      ...events.map(e => ({
        id: e.id,
        type: "EVENT_UPDATE",
        author: e.source, // 'RA', 'Tectroit', etc.
        content: `${e.title} at ${e.venue}. Lineup: ${e.lineup}`,
        createdAt: e.createdAt,
        metadata: { 
          source: e.source, 
          eventDate: e.date,
          venue: e.venue,
          link: e.originalLink 
        }
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // If database is empty, return some mock data to keep the UI functional during scaffolding
    if (combinedFeed.length === 0) {
      combinedFeed = [
        {
          id: "mock-1",
          type: "ARTIST_POST",
          author: "DJ Minx",
          role: "ARTIST",
          content: "Detroit! Can't wait to see you at the afterparty tonight. 313 represent!",
          createdAt: new Date() as any, // Using any because combinedFeed has Date from Prisma
          metadata: { embedUrl: "https://soundcloud.com/djminx" }
        },
        {
          id: "mock-2",
          type: "EVENT_UPDATE",
          author: "RA",
          content: "Sample Event: Techno Underground at TV Lounge. Lineup: Kyle Hall, Anthony 'Shake' Shakir",
          createdAt: new Date() as any,
          metadata: { 
            source: "RA", 
            eventDate: new Date(),
            venue: "TV Lounge",
            link: "https://ra.co/events/123" 
          }
        },
        {
          id: "mock-3",
          type: "GENERAL",
          author: "Community Bot",
          role: "USER",
          content: "Welcome to Detroit Underground! Post your tracks, events, and gear here.",
          createdAt: new Date() as any,
          metadata: undefined
        }
      ];
    }

    // Paginate the combined result
    const paginatedFeed = combinedFeed.slice(skip, skip + limit);
    const hasMore = skip + limit < combinedFeed.length;

    return NextResponse.json({ posts: paginatedFeed, hasMore }, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120"
      }
    });
  } catch (error) {
    console.error("Failed to fetch feed:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.content) {
      return NextResponse.json({ error: "Missing post content" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: (session.user as any).id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const newPost = await prisma.post.create({
      data: {
        content: body.content,
        type: body.type || (user.role === "ARTIST" ? "ARTIST_UPDATE" : user.role === "BUSINESS" ? "BUSINESS_SPOTLIGHT" : "GENERAL"),
        authorId: user.id,
      },
    });

    return NextResponse.json({ success: true, post: newPost }, { status: 201 });
  } catch (error) {
    console.error("Failed to create post:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
