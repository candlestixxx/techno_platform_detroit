import { scrapeLiveMovementParties, scrapeLiveTectroit, fetchLiveResidentAdvisorEvents, AggregatedEvent } from "./live-scrapers";
import { prisma } from "@/lib/prisma";

export async function syncEvents() {
  console.log("Starting event aggregation sync...");

  const allEvents: AggregatedEvent[] = [];

  try {
    const movementEvents = await scrapeLiveMovementParties();
    allEvents.push(...movementEvents);
  } catch (error) {
    console.error("Error scraping Movement Parties:", error);
  }

  try {
    const tectroitEvents = await scrapeLiveTectroit();
    allEvents.push(...tectroitEvents);
  } catch (error) {
    console.error("Error scraping Tectroit:", error);
  }

  try {
    const raEvents = await fetchLiveResidentAdvisorEvents();
    allEvents.push(...raEvents);
  } catch (error) {
    console.error("Error fetching RA events:", error);
  }

  console.log(`Successfully synced ${allEvents.length} events. Attempting database injection...`);

  // We are using a basic create loop for the scaffold. In production, an upsert based on a unique hash (like Title+Date) is preferred.
  let insertedCount = 0;
  for (const event of allEvents) {
    try {
      await prisma.event.create({
        data: {
          title: event.title,
          venue: event.venue,
          date: event.date,
          lineup: event.lineup,
          source: event.source,
          isAfterparty: event.isAfterparty,
          coordinates: event.coordinates ? (event.coordinates as any) : undefined,
          originalLink: event.originalLink,
        },
      });
      insertedCount++;
    } catch (e) {
      // Ignore duplicates or specific Prisma insertion errors during sync loop
    }
  }

  console.log(`Successfully inserted ${insertedCount} new events into the database.`);
  return allEvents;
}
