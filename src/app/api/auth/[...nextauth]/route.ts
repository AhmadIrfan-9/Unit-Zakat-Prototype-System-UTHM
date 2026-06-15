// src/app/api/auth/[...nextauth]/route.ts
//
// Auth.js v5 catch-all route handler.
// All OAuth callbacks, sign-in, sign-out, and session endpoints are handled here.
// The `handlers` object from auth.ts contains GET and POST — spread them as named exports.

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
