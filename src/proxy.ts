// src/proxy.ts
//
// Next.js 16 renamed "middleware" to "proxy". This file replaces middleware.ts.
// Auth.js v5 exports an `auth` proxy factory that runs at the Vercel Edge Network
// BEFORE any RSC, Server Action, or Route Handler receives the request.
//
// IMPORTANT: This is the first layer of defense — but always re-check auth
// inside Server Actions and Route Handlers too (middleware can be misconfigured).

import { auth } from "./lib/auth";

export const proxy = auth;

export const config = {
  matcher: [
    // Protect everything under /dashboard and its sub-routes
    "/dashboard/:path*",
    // Protect all API routes except the Auth.js catch-all handler
    "/api/((?!auth).+)",
  ],
};


