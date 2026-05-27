import axios from 'axios';
import * as cheerio from 'cheerio';
import { AggregatedEvent } from './mock-scrapers';

export async function fetchLiveResidentAdvisorEvents(): Promise<AggregatedEvent[]> {
  console.log("Attempting live GraphQL fetch of RA.co events...");
  try {
    // Resident Advisor uses GraphQL on their public frontend.
    // This is a mocked structure of their payload intended to target Detroit (Region ID often required)
    const query = `
      query GetEvents {
        eventListings(countryId: "192", limit: 10) {
          id
          title
          date
          venue {
            name
          }
          artists {
            name
          }
        }
      }
    `;

    const { data } = await axios.post('https://ra.co/graphql', { query }, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    const events: AggregatedEvent[] = [];

    if (data && data.data && data.data.eventListings) {
      data.data.eventListings.forEach((event: any) => {
        events.push({
          title: event.title,
          venue: event.venue?.name || 'TBA',
          date: new Date(event.date),
          lineup: event.artists ? event.artists.map((a: any) => a.name) : [],
          isAfterparty: event.title.toLowerCase().includes('afterparty'),
          source: 'RA',
          originalLink: `https://ra.co/events/${event.id}`
        });
      });
    }

    if (events.length > 0) return events;
    throw new Error("No events parsed from RA GraphQL.");

  } catch (error) {
    console.warn("Live fetch for RA failed or blocked. Falling back to mock data.");
    const { fetchResidentAdvisorEvents } = await import('./mock-scrapers');
    return fetchResidentAdvisorEvents();
  }
}

export async function scrapeLiveMovementParties(): Promise<AggregatedEvent[]> {
  console.log("Attempting live scrape of movementparties.com...");
  try {
    const { data } = await axios.get('https://movementparties.com/events/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000
    });

    const $ = cheerio.load(data);
    const events: AggregatedEvent[] = [];

    // This is a hypothetical DOM structure based on typical event sites.
    // In a production environment, this needs to be tightly coupled to the actual site structure.
    $('.event-card').each((_, el) => {
      const title = $(el).find('.event-title').text().trim();
      const venue = $(el).find('.event-venue').text().trim();
      const dateStr = $(el).find('.event-date').attr('datetime') || new Date().toISOString();
      const lineup = $(el).find('.event-lineup li').map((i, el) => $(el).text().trim()).get();
      const link = $(el).find('a.event-link').attr('href');

      if (title) {
        events.push({
          title,
          venue: venue || 'Detroit Area',
          date: new Date(dateStr),
          lineup: lineup.length > 0 ? lineup : ['TBA'],
          isAfterparty: title.toLowerCase().includes('afterparty'),
          source: 'Movement',
          originalLink: link ? (link.startsWith('http') ? link : `https://movementparties.com${link}`) : undefined
        });
      }
    });

    if (events.length > 0) return events;
    throw new Error("No events parsed from HTML.");

  } catch (error) {
    console.warn("Live scrape for Movement Parties failed or blocked. Falling back to mock data.");
    const { scrapeMovementParties } = await import('./mock-scrapers');
    return scrapeMovementParties();
  }
}

export async function scrapeLiveTectroit(): Promise<AggregatedEvent[]> {
  console.log("Attempting live scrape of tectroit.com...");
  try {
    const { data } = await axios.get('https://www.tectroit.com/events', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 5000
    });

    const $ = cheerio.load(data);
    const events: AggregatedEvent[] = [];

    $('.event-item').each((_, el) => {
      const title = $(el).find('h3').text().trim();
      const venue = $(el).find('.venue').text().trim();

      if (title) {
        events.push({
          title,
          venue: venue || 'TBA',
          date: new Date(), // Would normally parse from DOM
          lineup: [title], // Sometimes title is the lineup
          isAfterparty: false,
          source: 'Tectroit',
        });
      }
    });

    if (events.length > 0) return events;
    throw new Error("No events parsed from HTML.");

  } catch (error) {
    console.warn("Live scrape for Tectroit failed or blocked. Falling back to mock data.");
    const { scrapeTectroit } = await import('./mock-scrapers');
    return scrapeTectroit();
  }
}
