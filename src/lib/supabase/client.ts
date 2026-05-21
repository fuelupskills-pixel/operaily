import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton browser client for use in Client Components
export const supabase = createBrowserClient(supabaseUrl, supabaseKey);

// Factory function (use in AuthProvider, hooks, etc.)
export const createClient = () => createBrowserClient(supabaseUrl, supabaseKey);
