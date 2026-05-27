import { syncEvents } from "../src/lib/aggregator/sync";
import * as mockScrapers from "../src/lib/aggregator/mock-scrapers";

// Mock the scrapers
jest.mock("../src/lib/aggregator/mock-scrapers", () => {
  const originalModule = jest.requireActual("../src/lib/aggregator/mock-scrapers");
  return {
    __esModule: true,
    ...originalModule,
    scrapeMovementParties: jest.fn(originalModule.scrapeMovementParties),
    scrapeTectroit: jest.fn(originalModule.scrapeTectroit),
    fetchResidentAdvisorEvents: jest.fn(originalModule.fetchResidentAdvisorEvents),
  };
});

describe("Event Aggregator Sync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should sync events from all sources", async () => {
    const events = await syncEvents();

    expect(mockScrapers.scrapeMovementParties).toHaveBeenCalled();
    expect(mockScrapers.scrapeTectroit).toHaveBeenCalled();
    expect(mockScrapers.fetchResidentAdvisorEvents).toHaveBeenCalled();

    expect(events.length).toBe(3);
    expect(events.some((e) => e.source === "Movement")).toBe(true);
    expect(events.some((e) => e.source === "Tectroit")).toBe(true);
    expect(events.some((e) => e.source === "RA")).toBe(true);
  });

  it("should handle errors gracefully without failing the entire sync", async () => {
    // Force one scraper to fail
    (mockScrapers.scrapeTectroit as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const events = await syncEvents();

    expect(mockScrapers.scrapeMovementParties).toHaveBeenCalled();
    expect(mockScrapers.scrapeTectroit).toHaveBeenCalled();
    expect(mockScrapers.fetchResidentAdvisorEvents).toHaveBeenCalled();

    // The other two should still succeed
    expect(events.length).toBe(2);
    expect(events.some((e) => e.source === "Movement")).toBe(true);
    expect(events.some((e) => e.source === "RA")).toBe(true);
    expect(events.some((e) => e.source === "Tectroit")).toBe(false);

    expect(consoleSpy).toHaveBeenCalledWith("Error scraping Tectroit:", expect.any(Error));
    consoleSpy.mockRestore();
  });
});
