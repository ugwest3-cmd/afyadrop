import { createClient } from "@supabase/supabase-js";

// Fall back to harmless placeholders so `createClient` doesn't throw during
// build/prerender when env vars aren't set yet (e.g. CI). Real values must be
// provided at runtime via .env.local for auth to actually work.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Single browser client for Supabase Auth (email OTP).
// Session is persisted in localStorage by default, which is what we want
// for a client-only Next.js app.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
