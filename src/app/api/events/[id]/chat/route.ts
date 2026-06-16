import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const eventId = (await params).id;

    // In a real Server-Sent Events (SSE) setup, we would return a stream here.
    // Since we are limited by standard Vercel serverless functions, we will return a standard REST payload
    // that the client will short-poll, or we would connect this to a dedicated WebSocket service.

    const messages = await prisma.eventMessage.findMany({
      where: { eventId },
      include: {
        author: {
          select: { name: true, role: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Failed to fetch event messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.content) {
      return NextResponse.json({ error: "Missing message content" }, { status: 400 });
    }

    const newMessage = await prisma.eventMessage.create({
      data: {
        content: body.content,
        eventId: (await params).id,
        authorId: (session.user as any).id,
      },
      include: {
        author: {
          select: { name: true, role: true },
        }
      }
    });

    return NextResponse.json({ success: true, message: newMessage }, { status: 201 });
  } catch (error) {
    console.error("Failed to create event message:", error);
    return NextResponse.json({ error: "Failed to create message" }, { status: 500 });
  }
}
