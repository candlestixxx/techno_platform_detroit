import { GET as getMarketplace } from "../src/app/api/marketplace/route";
import { GET as getFeed } from "../src/app/api/feed/route";
import { prisma } from "../src/lib/prisma";

jest.mock("../src/lib/prisma", () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
    },
    post: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe("API Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Marketplace GET Route", () => {
    it("returns mock data when database is empty", async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([]);

      const request = new Request("http://localhost/api/marketplace");
      const response = await getMarketplace(request);
      const json = await response.json();

      expect(prisma.product.findMany).toHaveBeenCalled();
      expect(json.length).toBe(2);
      expect(json[0].title).toBe("Underground Resistance Vinyl");
    });

    it("returns database data when available", async () => {
      const dbProduct = [{ id: "123", title: "DB Product", price: 10, type: "PHYSICAL_MERCH", seller: { name: "DB Seller" } }];
      (prisma.product.findMany as jest.Mock).mockResolvedValue(dbProduct);

      const request = new Request("http://localhost/api/marketplace");
      const response = await getMarketplace(request);
      const json = await response.json();

      expect(prisma.product.findMany).toHaveBeenCalled();
      expect(json.length).toBe(1);
      expect(json[0].title).toBe("DB Product");
    });
  });

  describe("Feed GET Route", () => {
    it("returns mock data when database is empty", async () => {
      (prisma.post.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.post.count as jest.Mock).mockResolvedValue(0);

      const request = new Request("http://localhost/api/feed?page=1");
      const response = await getFeed(request);
      const json = await response.json();

      expect(prisma.post.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 10 }));
      expect(json.posts.length).toBe(3);
      expect(json.posts[0].author.name).toBe("DJ Minx");
      expect(json.hasMore).toBe(true);
    });

    it("returns database data when available", async () => {
      const dbPost = [{ id: "456", content: "DB Post", type: "GENERAL", author: { name: "DB Author" } }];
      (prisma.post.findMany as jest.Mock).mockResolvedValue(dbPost);
      (prisma.post.count as jest.Mock).mockResolvedValue(15);

      const request = new Request("http://localhost/api/feed?page=1");
      const response = await getFeed(request);
      const json = await response.json();

      expect(prisma.post.findMany).toHaveBeenCalledWith(expect.objectContaining({ skip: 0, take: 10 }));
      expect(json.posts.length).toBe(1);
      expect(json.posts[0].content).toBe("DB Post");
      expect(json.hasMore).toBe(true);
    });
  });
});
