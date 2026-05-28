import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import webpush from "web-push";

// In production, configure VAPID keys properly
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "dummy_public_key";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "dummy_private_key";

if (vapidPublicKey !== "dummy_public_key" && vapidPrivateKey !== "dummy_private_key") {
  webpush.setVapidDetails(
    "mailto:contact@detroitunderground.com",
    vapidPublicKey,
    vapidPrivateKey
  );
} else {
  console.warn("Push notifications disabled in development without VAPID keys.");
}

export async function POST(request: Request) {
  try {
    // Note: In a real app, this should be a protected admin route or triggered server-side.
    const body = await request.json();
    const { message, title, targetUserId } = body;

    let subs = [];
    if (targetUserId) {
       subs = await prisma.pushSubscription.findMany({ where: { userId: targetUserId } });
    } else {
       subs = await prisma.pushSubscription.findMany(); // Send to all
    }

    const payload = JSON.stringify({ title: title || "New Update", body: message });

    const promises = subs.map((sub) =>
      webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payload
      ).catch(async (error) => {
          if (error.statusCode === 404 || error.statusCode === 410) {
              console.log("Subscription has expired or is no longer valid:", error);
              await prisma.pushSubscription.delete({ where: { id: sub.id } });
          } else {
              throw error;
          }
      })
    );

    await Promise.all(promises);

    return NextResponse.json({ success: true, sent: subs.length });
  } catch (error: any) {
    console.error("Push Send Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
