// Supabase client singleton for client-side Realtime subscriptions.
// This module initialises a single Supabase JS client using the public URL and anon key
// exposed via NEXT_PUBLIC_ environment variables. It is safe to import from "use client" components.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
