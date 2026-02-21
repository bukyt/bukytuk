import "dotenv/config"; // make sure env vars are loaded
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

// Prisma 7 requires prisma+postgres:// protocol
const connectionString = process.env.DATABASE_URL.replace(
  /^postgres:\/\//,
  "prisma+postgres://"
);

export const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});