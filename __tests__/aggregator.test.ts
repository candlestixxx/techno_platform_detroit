import { syncEvents } from "../src/lib/aggregator/sync";
import * as liveScrapers from "../src/lib/aggregator/live-scrapers";

// Mock the scrapers
jest.mock("../src/lib/aggregator/live-scrapers", () => {
  const originalModule = jest.requireActual("../src/lib/aggregator/live-scrapers");
  return {
    __esModule: true,
    ...originalModule,
    scrapeLiveMovementParties: jest.fn(originalModule.scrapeLiveMovementParties),
    scrapeLiveTectroit: jest.fn(originalModule.scrapeLiveTectroit),
    fetchLiveResidentAdvisorEvents: jest.fn(originalModule.fetchLiveResidentAdvisorEvents),
  };
});

describe("Event Aggregator Sync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should sync events from all sources", async () => {
    // Force mock behavior to prevent actual network calls during test
    (liveScrapers.scrapeLiveMovementParties as jest.Mock).mockResolvedValueOnce([{ source: "Movement" }]);
    (liveScrapers.scrapeLiveTectroit as jest.Mock).mockResolvedValueOnce([{ source: "Tectroit" }]);
    (liveScrapers.fetchLiveResidentAdvisorEvents as jest.Mock).mockResolvedValueOnce([{ source: "RA" }]);

    const events = await syncEvents();

    expect(liveScrapers.scrapeLiveMovementParties).toHaveBeenCalled();
    expect(liveScrapers.scrapeLiveTectroit).toHaveBeenCalled();
    expect(liveScrapers.fetchLiveResidentAdvisorEvents).toHaveBeenCalled();

    expect(events.length).toBe(3);
    expect(events.some((e) => e.source === "Movement")).toBe(true);
    expect(events.some((e) => e.source === "Tectroit")).toBe(true);
    expect(events.some((e) => e.source === "RA")).toBe(true);
  });

  it("should handle errors gracefully without failing the entire sync", async () => {
    // Force one scraper to fail entirely
    (liveScrapers.scrapeLiveMovementParties as jest.Mock).mockResolvedValueOnce([{ source: "Movement" }]);
    (liveScrapers.scrapeLiveTectroit as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
    (liveScrapers.fetchLiveResidentAdvisorEvents as jest.Mock).mockResolvedValueOnce([{ source: "RA" }]);

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const events = await syncEvents();

    expect(liveScrapers.scrapeLiveMovementParties).toHaveBeenCalled();
    expect(liveScrapers.scrapeLiveTectroit).toHaveBeenCalled();
    expect(liveScrapers.fetchLiveResidentAdvisorEvents).toHaveBeenCalled();

    // The other two should still succeed
    expect(events.length).toBe(2);
    expect(events.some((e) => e.source === "Movement")).toBe(true);
    expect(events.some((e) => e.source === "RA")).toBe(true);
    expect(events.some((e) => e.source === "Tectroit")).toBe(false);

    expect(consoleSpy).toHaveBeenCalledWith("Error scraping Tectroit:", expect.any(Error));
    consoleSpy.mockRestore();
  });
});
