// src/lib/prisma.ts
//
// Prisma 7: PrismaClient now requires an explicit `adapter` instead of reading
// the connection URL from schema.prisma. We use @prisma/adapter-pg with a pg Pool.
//
// WHY A SINGLETON: Next.js HMR re-evaluates modules on every file save.
// Without this pattern, each reload creates a NEW Pool + PrismaClient,
// exhausting PostgreSQL's connection limit instantly.
// Attaching to `globalThis` survives HMR cycles in development.

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  // Use the POOLED URL at runtime (PgBouncer, port 6543) — safe for serverless
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Vercel serverless: each function should hold at most 1 connection in the pool.
    // Without this, concurrent function instances exhaust Supabase's connection limit.
    max: 1,
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"] // Surface slow queries during dev
        : ["error"],                  // Silence verbose logs in production
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
