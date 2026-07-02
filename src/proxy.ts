// src/middleware.ts
//
// Auth.js v5 exports an `auth` middleware that runs at the Vercel Edge Network
// BEFORE any RSC, Server Action, or Route Handler receives the request.
// This is Next.js's standard entrypoint for edge-level route protection.

import { auth } from "./lib/auth";

export default auth;

export const config = {
  matcher: [
    // Protect everything under /dashboard and its sub-routes
    "/dashboard/:path*",
    // Protect all API routes except the Auth.js catch-all handler
    "/api/((?!auth).+)",
  ],
};
