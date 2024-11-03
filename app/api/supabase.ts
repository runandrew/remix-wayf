import { createClient } from "@supabase/supabase-js";

const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_URL = "https://zwlxxknypnpeildsqprf.supabase.co";

if (!SUPABASE_KEY) {
  throw new Error("Missing SUPABASE_KEY");
}

export function createSupabaseClient() {
  if (!SUPABASE_KEY) {
    throw new Error("Missing SUPABASE_KEY");
  }

  return createClient(SUPABASE_URL, SUPABASE_KEY);
}
