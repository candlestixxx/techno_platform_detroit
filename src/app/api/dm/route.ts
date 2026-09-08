import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

// GET conversations for the current user or a specific conversation if targetUserId is provided
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("targetUserId");

    if (targetUserId) {
        // Fetch specific conversation
        const conversation = await prisma.conversation.findFirst({
            where: {
                OR: [
                    { user1Id: userId, user2Id: targetUserId },
                    { user1Id: targetUserId, user2Id: userId }
                ]
            },
            include: {
                messages: {
                    orderBy: { createdAt: "asc" },
                    include: { sender: { select: { id: true, name: true } } }
                }
            }
        });

        return NextResponse.json(conversation ? conversation.messages : []);
    }

    // Otherwise fetch all conversations for the user
    const conversations = await prisma.conversation.findMany({
        where: {
            OR: [
                { user1Id: userId },
                { user2Id: userId }
            ]
        },
        include: {
            user1: { select: { id: true, name: true, image: true } },
            user2: { select: { id: true, name: true, image: true } },
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1
            }
        },
        orderBy: { updatedAt: "desc" }
    });

    return NextResponse.json(conversations);
  } catch (error: any) {
    console.error("DM Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { targetUserId, content } = await request.json();

    if (!targetUserId || !content) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure we don't message ourselves
    if (userId === targetUserId) {
        return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
    }

    // Order IDs to maintain unique constraint predictability
    const user1Id = userId < targetUserId ? userId : targetUserId;
    const user2Id = userId < targetUserId ? targetUserId : userId;

    let conversation = await prisma.conversation.findUnique({
        where: {
            user1Id_user2Id: { user1Id, user2Id }
        }
    });

    if (!conversation) {
        conversation = await prisma.conversation.create({
            data: {
                user1Id,
                user2Id
            }
        });
    }

    const message = await prisma.directMessage.create({
        data: {
            content,
            senderId: userId,
            conversationId: conversation.id
        },
        include: {
            sender: { select: { id: true, name: true } }
        }
    });

    // Bump conversation timestamp
    await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() }
    });

    return NextResponse.json({ success: true, message }, { status: 201 });

  } catch (error: any) {
    console.error("DM Send Error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}