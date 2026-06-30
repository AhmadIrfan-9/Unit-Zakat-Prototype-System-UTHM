// prisma.config.ts
//
// Prisma 7: Connection URLs must be defined here, not in schema.prisma.
//
// dotenv loads .env.local explicitly (Next.js uses .env.local, not .env).
// DIRECT_URL → Supabase "Session mode" direct connection (port 5432).
//              Used by the Prisma CLI (db push, migrate) because PgBouncer
//              (Transaction mode) does NOT support DDL statements.

import { config } from "dotenv";
import { resolve } from "path";
import { defineConfig } from "prisma/config";

// dotenv/config only reads `.env` by default — explicitly load `.env.local`
// which is the convention used by Next.js for local environment overrides.
config({ path: resolve(process.cwd(), ".env.local"), override: true, quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Use DIRECT_URL (non-pooled, port 5432) for CLI schema operations.
    // At runtime, src/lib/prisma.ts uses DATABASE_URL (pooled) via pg adapter.
    url: process.env.DIRECT_URL!,
  },
});
