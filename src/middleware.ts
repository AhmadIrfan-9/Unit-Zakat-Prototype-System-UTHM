// src/middleware.ts
// IMPORTANT: This file handles auth at the edge layer before routes are processed
// For Next.js 16, this complements src/proxy.ts

import { auth } from "@/lib/auth";

export const middleware = auth;

export const config = {
  matcher: [
    // Protect dashboard routes
    "/dashboard/:path*",
    // Protect API routes (except auth)
    "/api/((?!auth).+)",
  ],
};
