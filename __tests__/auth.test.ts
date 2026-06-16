import { authOptions } from "../src/app/api/auth/[...nextauth]/route";
import { prisma } from "../src/lib/prisma";

jest.mock("../src/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe("NextAuth Configuration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Credentials Provider Authorization", () => {
    // Extract the authorize function from the provider
    const credentialsProvider = authOptions.providers.find((p: any) => p.name === "Credentials") as any;
    const authorize = credentialsProvider.options.authorize;

    it("should return null if credentials are missing", async () => {
      const result = await authorize({ email: "", password: "" }, null);
      expect(result).toBeNull();
    });

    it("should return existing user if found in database and password matches", async () => {
      // Mocking bcrypt logic implies we pass a properly hashed password for the test
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash("password", 10);
      const mockUser = { id: "1", email: "test@test.com", role: "USER", password: hashedPassword };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await authorize({ email: "test@test.com", password: "password" }, null);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "test@test.com" } });
      expect(result).toEqual(mockUser);
    });

    it("should create and return a mock user with hashed password if not found in database", async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      const newMockUser = { id: "2", email: "new@test.com", name: "new", role: "USER" };
      (prisma.user.create as jest.Mock).mockResolvedValue(newMockUser);

      const result = await authorize({ email: "new@test.com", password: "password" }, null);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: "new@test.com" } });
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: "new@test.com",
          name: "new",
          role: "USER",
          password: expect.any(String), // We expect a generated bcrypt hash string
        })
      });
      expect(result).toEqual(newMockUser);
    });
  });

  describe("Callbacks", () => {
    it("should append user data to JWT token", async () => {
      const jwtCallback = authOptions.callbacks?.jwt as any;
      const token = await jwtCallback({
        token: { name: "Test" },
        user: { id: "user-123", role: "ARTIST" }
      });

      expect(token.id).toBe("user-123");
      expect(token.role).toBe("ARTIST");
    });

    it("should append token data to session", async () => {
      const sessionCallback = authOptions.callbacks?.session as any;
      const session = await sessionCallback({
        session: { user: { name: "Test" } },
        token: { id: "user-123", role: "BUSINESS" }
      });

      expect(session.user.id).toBe("user-123");
      expect(session.user.role).toBe("BUSINESS");
    });
  });
});
