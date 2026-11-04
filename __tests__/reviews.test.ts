jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => () => {}),
}));

jest.mock("../src/lib/prisma", () => ({
  prisma: {
    event: {
      findUnique: jest.fn(),
    },
    eventReview: {
      findMany: jest.fn(),
      upsert: jest.fn(),
    },
  },
}));

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

import { GET, POST } from "../src/app/api/events/[id]/reviews/route";
import { prisma } from "../src/lib/prisma";
import { getServerSession } from "next-auth/next";
import jwt from "jsonwebtoken";

describe("Event Reviews API Route (/api/events/[id]/reviews)", () => {
  const secret = "test_secret_for_reviews";
  beforeAll(() => {
    process.env.NEXTAUTH_SECRET = secret;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/events/[id]/reviews", () => {
    it("returns list of reviews for the requested event id", async () => {
      const mockReviews = [
        {
          id: "rev-1",
          rating: 5,
          content: "Legendary warehouse sound system!",
          author: { id: "user-1", name: "Techno Head", image: null },
          createdAt: new Date().toISOString(),
        },
      ];
      (prisma.eventReview.findMany as jest.Mock).mockResolvedValue(mockReviews);

      const request = new Request("http://localhost/api/events/event-123/reviews");
      const response = await GET(request, { params: Promise.resolve({ id: "event-123" }) });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(prisma.eventReview.findMany).toHaveBeenCalledWith({
        where: { eventId: "event-123" },
        include: {
          author: {
            select: { name: true, image: true, id: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      expect(json).toEqual(mockReviews);
    });

    it("returns empty array when no reviews exist for event", async () => {
      (prisma.eventReview.findMany as jest.Mock).mockResolvedValue([]);

      const request = new Request("http://localhost/api/events/empty-event/reviews");
      const response = await GET(request, { params: Promise.resolve({ id: "empty-event" }) });
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual([]);
    });
  });

  describe("POST /api/events/[id]/reviews", () => {
    it("returns 401 when neither session nor Bearer token is provided", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);

      const request = new Request("http://localhost/api/events/event-1/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: 5, content: "Great vibe!" }),
      });

      const response = await POST(request, { params: Promise.resolve({ id: "event-1" }) });
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toBe("Unauthorized");
    });

    it("returns 400 when rating is less than 1 or greater than 5", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: "user-abc", name: "Alice" },
      });

      const request = new Request("http://localhost/api/events/event-1/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: 6, content: "Over 5 rating" }),
      });

      const response = await POST(request, { params: Promise.resolve({ id: "event-1" }) });
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.error).toBe("Rating must be an integer between 1 and 5");
    });

    it("returns 404 when target event does not exist", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: "user-abc", name: "Alice" },
      });
      (prisma.event.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new Request("http://localhost/api/events/missing-event/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: 4, content: "Solid event" }),
      });

      const response = await POST(request, { params: Promise.resolve({ id: "missing-event" }) });
      const json = await response.json();

      expect(response.status).toBe(404);
      expect(json.error).toBe("Event not found");
    });

    it("successfully creates/updates review using web NextAuth session", async () => {
      (getServerSession as jest.Mock).mockResolvedValue({
        user: { id: "user-web-1", name: "Web DJ" },
      });
      (prisma.event.findUnique as jest.Mock).mockResolvedValue({ id: "event-456", title: "Movement After" });
      const mockCreatedReview = {
        id: "rev-new",
        rating: 5,
        content: "Top tier production",
        authorId: "user-web-1",
        eventId: "event-456",
        author: { id: "user-web-1", name: "Web DJ", image: null },
      };
      (prisma.eventReview.upsert as jest.Mock).mockResolvedValue(mockCreatedReview);

      const request = new Request("http://localhost/api/events/event-456/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: 5, content: "Top tier production" }),
      });

      const response = await POST(request, { params: Promise.resolve({ id: "event-456" }) });
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.review).toEqual(mockCreatedReview);
      expect(prisma.eventReview.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            authorId_eventId: {
              authorId: "user-web-1",
              eventId: "event-456",
            },
          },
        })
      );
    });

    it("successfully creates/updates review using mobile Bearer JWT token", async () => {
      (getServerSession as jest.Mock).mockResolvedValue(null);
      const token = jwt.sign({ id: "user-mobile-99", email: "mobile@test.com" }, secret);

      (prisma.event.findUnique as jest.Mock).mockResolvedValue({ id: "event-789", title: "Underground Basement" });
      const mockCreatedReview = {
        id: "rev-mob-1",
        rating: 4,
        content: "Heavy bass, good crowd",
        authorId: "user-mobile-99",
        eventId: "event-789",
        author: { id: "user-mobile-99", name: "Mobile Raver", image: null },
      };
      (prisma.eventReview.upsert as jest.Mock).mockResolvedValue(mockCreatedReview);

      const request = new Request("http://localhost/api/events/event-789/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: 4, content: "Heavy bass, good crowd" }),
      });

      const response = await POST(request, { params: Promise.resolve({ id: "event-789" }) });
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.review).toEqual(mockCreatedReview);
    });
  });
});
