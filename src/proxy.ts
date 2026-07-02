// src/proxy.ts
//
// Auth.js v5 exports an `auth` middleware (renamed to proxy in Next.js 16) that runs at the Vercel Edge Network
// BEFORE any RSC, Server Action, or Route Handler receives the request.
// This is Next.js's standard entrypoint for edge-level route protection.

import { auth } from "./lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const response = NextResponse.next();
  
  // Set headers to disable browser caching (back-forward cache / bfcache)
  // for all dashboard pages to prevent accessing private views via browser back button after logout.
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }
  
  return response;
});

export const config = {
  matcher: [
    // Protect everything under /dashboard and its sub-routes
    "/dashboard/:path*",
    // Protect all API routes except the Auth.js catch-all handler
    "/api/((?!auth).+)",
  ],
};
