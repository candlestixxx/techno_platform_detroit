import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const eventId = (await params).id;

    const reviews = await prisma.eventReview.findMany({
      where: { eventId },
      include: {
        author: {
          select: { name: true, image: true, id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error("Failed to fetch event reviews:", error);
    return NextResponse.json({ error: "Failed to fetch event reviews" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let userId = null;
    const session = await getServerSession(authOptions);

    if (session && session.user && (session.user as any).id) {
      userId = (session.user as any).id;
    } else {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
          if (!process.env.NEXTAUTH_SECRET) throw new Error("Missing NextAuth Secret");
          const jwt = require("jsonwebtoken");
          const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
          userId = decoded.id;
        } catch {
          return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const eventId = (await params).id;
    const { rating, content } = await request.json();

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be an integer between 1 and 5" }, { status: 400 });
    }

    // Check if event exists
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Create or update review
    const review = await prisma.eventReview.upsert({
      where: {
        authorId_eventId: {
          authorId: userId,
          eventId: eventId,
        },
      },
      update: {
        rating,
        content,
      },
      create: {
        rating,
        content,
        authorId: userId,
        eventId: eventId,
      },
      include: {
        author: {
          select: { name: true, image: true, id: true },
        },
      },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    console.error("Failed to submit event review:", error);
    return NextResponse.json({ error: "Failed to submit event review" }, { status: 500 });
  }
}