import axios from 'axios';
import * as cheerio from 'cheerio';

export interface AggregatedEvent {
  title: string;
  date: Date;
  venue: string;
  lineup: string[];
  isAfterparty: boolean;
  coordinates?: { lat: number; lng: number };
  source: string;
  originalLink?: string;
  image?: string;
}

export async function fetchLiveResidentAdvisorEvents(): Promise<AggregatedEvent[]> {
  console.log("Attempting live GraphQL fetch of RA.co events...");
  try {
    // Resident Advisor uses GraphQL on their public frontend.
    // Detroit Area ID is 27
    const query = `
      query GetEvents(\$indices: [String!], \$pageSize: Int) {
        eventListings(indices: \$indices, pageSize: \$pageSize) {
          results {
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
      }
    `;

    const { data } = await axios.post('https://ra.co/graphql', { 
        query,
        variables: {
            indices: ["/events/us/detroit"],
            pageSize: 10
        }
    }, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });

    const events: AggregatedEvent[] = [];

    if (data && data.data && data.data.eventListings && data.data.eventListings.results) {
      data.data.eventListings.results.forEach((event: any) => {
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
    console.error("Live fetch for RA failed or blocked:", error);
    return [
      {
        title: "Detroit Techno Night",
        venue: "TV Lounge",
        date: new Date(),
        lineup: ["Carl Craig", "Stacey Pullen"],
        isAfterparty: false,
        source: "RA Mock",
        originalLink: "https://ra.co/events/mock1"
      },
      {
        title: "Underground Resistance Showcase",
        venue: "Submerge",
        date: new Date(Date.now() + 86400000),
        lineup: ["Mad Mike", "Scan 7"],
        isAfterparty: true,
        source: "RA Mock",
        originalLink: "https://ra.co/events/mock2"
      }
    ];
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
    console.error("Live scrape for Movement Parties failed or blocked:", error);
    return [
      {
        title: "Movement Official Afterparty",
        venue: "Spot Lite Detroit",
        date: new Date(),
        lineup: ["Seth Troxler", "DJ Holographic"],
        isAfterparty: true,
        source: "Movement Mock",
        coordinates: { lat: 42.353, lng: -83.028 }
      }
    ];
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
    console.error("Live scrape for Tectroit failed or blocked:", error);
    return [
      {
        title: "Tectroit Summer Series",
        venue: "Hart Plaza",
        date: new Date(Date.now() + 172800000),
        lineup: ["Detroit Techno Militia"],
        isAfterparty: false,
        source: "Tectroit Mock"
      }
    ];
  }
}
