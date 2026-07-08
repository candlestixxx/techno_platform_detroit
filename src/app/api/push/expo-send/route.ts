import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Expo } from "expo-server-sdk";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

const expo = new Expo();

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
    const { message, title, targetUserId } = body;

    let users = [];
    if (targetUserId) {
       users = await prisma.user.findMany({ where: { id: targetUserId, expoPushToken: { not: null } } });
    } else {
       users = await prisma.user.findMany({ where: { expoPushToken: { not: null } } });
    }

    if (users.length === 0) {
       return NextResponse.json({ success: true, message: "No registered devices found.", sent: 0 });
    }

    const messages = [];
    for (const u of users) {
      if (!Expo.isExpoPushToken(u.expoPushToken)) {
        console.error(`Push token ${u.expoPushToken} is not a valid Expo push token`);
        continue;
      }
      messages.push({
        to: u.expoPushToken,
        sound: "default",
        title: title || "Detroit Underground Hub",
        body: message,
        data: { },
      });
    }

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("Error sending chunk", error);
      }
    }

    return NextResponse.json({ success: true, sent: messages.length });
  } catch (error: any) {
    console.error("Expo Push Send Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
