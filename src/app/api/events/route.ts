import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        date: "asc",
      },
      take: 100, // Limit to 100 events for map performance
    });

    const formattedEvents = events.map(event => ({
      ...event,
      lineup: typeof event.lineup === 'string' ? JSON.parse(event.lineup) : event.lineup,
      coordinates: typeof event.coordinates === 'string' ? JSON.parse(event.coordinates) : event.coordinates,
    }));

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
