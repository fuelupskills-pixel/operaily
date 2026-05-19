import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client with service role key
// Use this for server actions, API routes, and background tasks
export function createServerClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const supabaseUrl = rawUrl && rawUrl.startsWith("http") ? rawUrl : "https://placeholder-project.supabase.co";
  const supabaseServiceKey = rawKey && !rawKey.includes("service_role_key") ? rawKey : "placeholder-service-key";

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

