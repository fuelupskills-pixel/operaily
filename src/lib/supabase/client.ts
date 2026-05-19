import { createClient } from "@supabase/supabase-js";

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Use valid URL formats as fallbacks during build time to prevent compiler pre-render crashes
const supabaseUrl = rawUrl && rawUrl.startsWith("http") ? rawUrl : "https://placeholder-project.supabase.co";
const supabaseAnonKey = rawKey && !rawKey.includes("anon_key") ? rawKey : "placeholder-anon-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

