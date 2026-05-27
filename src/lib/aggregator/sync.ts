import { scrapeMovementParties, scrapeTectroit, fetchResidentAdvisorEvents, AggregatedEvent } from "./mock-scrapers";

export async function syncEvents() {
  console.log("Starting event aggregation sync...");

  const allEvents: AggregatedEvent[] = [];

  try {
    const movementEvents = await scrapeMovementParties();
    allEvents.push(...movementEvents);
  } catch (error) {
    console.error("Error scraping Movement Parties:", error);
  }

  try {
    const tectroitEvents = await scrapeTectroit();
    allEvents.push(...tectroitEvents);
  } catch (error) {
    console.error("Error scraping Tectroit:", error);
  }

  try {
    const raEvents = await fetchResidentAdvisorEvents();
    allEvents.push(...raEvents);
  } catch (error) {
    console.error("Error fetching RA events:", error);
  }

  console.log(`Successfully synced ${allEvents.length} events.`);

  // In a real implementation, you would save these to the database using Prisma here.
  // Example:
  // await prisma.event.createMany({ data: allEvents });

  return allEvents;
}
