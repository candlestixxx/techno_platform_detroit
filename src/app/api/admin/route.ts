import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access only." }, { status: 403 });
    }

    // Fetch flagged posts
    const flaggedPosts = await prisma.post.findMany({
      where: { isFlagged: true },
      include: { author: { select: { name: true, email: true } } }
    });

    // Fetch flagged events
    const flaggedEvents = await prisma.event.findMany({
      where: { isFlagged: true }
    });

    // Fetch unapproved businesses
    const unapprovedBusinesses = await prisma.user.findMany({
      where: { isApproved: false, role: "BUSINESS" }
    });

    return NextResponse.json({ flaggedPosts, flaggedEvents, unapprovedBusinesses });

  } catch (error: any) {
    console.error("Admin Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access only." }, { status: 403 });
    }

    const body = await request.json();
    const { action, targetId } = body;

    if (action === "approve_business") {
        await prisma.user.update({ where: { id: targetId }, data: { isApproved: true } });
        return NextResponse.json({ success: true, message: "Business approved." });
    } else if (action === "delete_post") {
        await prisma.post.delete({ where: { id: targetId } });
        return NextResponse.json({ success: true, message: "Post deleted." });
    } else if (action === "unflag_post") {
        await prisma.post.update({ where: { id: targetId }, data: { isFlagged: false } });
        return NextResponse.json({ success: true, message: "Post unflagged." });
    } else if (action === "delete_event") {
        await prisma.event.delete({ where: { id: targetId } });
        return NextResponse.json({ success: true, message: "Event deleted." });
    } else if (action === "unflag_event") {
        await prisma.event.update({ where: { id: targetId }, data: { isFlagged: false } });
        return NextResponse.json({ success: true, message: "Event unflagged." });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error: any) {
    console.error("Admin Action Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
