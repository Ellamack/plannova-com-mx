import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Lazily builds a read-only Supabase client with the publishable (anon) key.
 * MUST be called inside a tool handler — never at module top level — so the
 * request-time env is available and the MCP entry stays import-safe.
 */
export function readOnlySupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase is not configured on the server.");
  }
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
