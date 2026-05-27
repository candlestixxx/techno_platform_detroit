import "dotenv/config";

// The way Prisma 7 handles the export structure changed.
export default {
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env["DATABASE_URL"] || "postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public",
  },
};
