import { NextResponse } from "next/server";
import { syncEvents } from "@/lib/aggregator/sync";

export const maxDuration = 60; // Allow 60 seconds for scraping on Vercel

export async function GET(request: Request) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await syncEvents();
    return NextResponse.json({ success: true, message: "Sync complete" });
  } catch (error: any) {
    console.error("Cron sync failed", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
