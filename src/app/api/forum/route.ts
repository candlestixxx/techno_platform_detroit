import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const topics = await prisma.forumTopic.findMany({
      include: {
        author: {
          select: { name: true, role: true },
        },
        _count: {
          select: { replies: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json(topics);
  } catch (error) {
    console.error("Failed to fetch forum topics:", error);
    return NextResponse.json({ error: "Failed to fetch topics" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.title || !body.content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newTopic = await prisma.forumTopic.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: (session.user as any).id,
      },
      include: {
        author: {
          select: { name: true, role: true },
        },
        _count: {
          select: { replies: true },
        },
      }
    });

    return NextResponse.json({ success: true, topic: newTopic }, { status: 201 });
  } catch (error) {
    console.error("Failed to create forum topic:", error);
    return NextResponse.json({ error: "Failed to create topic" }, { status: 500 });
  }
}
