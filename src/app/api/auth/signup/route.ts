import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, orgName } = body;

    if (!name || !email || !password || !orgName) {
      return NextResponse.json(
        { success: false, error: "Please complete all registration fields." },
        { status: 400 }
      );
    }

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: "Supabase connection is not configured." },
        { status: 500 }
      );
    }

    // ── ADMIN FLOW: service role key available — auto-confirm + create DB records ──
    if (serviceRoleKey) {
      const supabaseAdmin = createAdminClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });

      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: email.toLowerCase(),
          password,
          email_confirm: true,
          user_metadata: { full_name: name },
        });

      if (authError) {
        return NextResponse.json(
          { success: false, error: authError.message },
          { status: 400 }
        );
      }

      // Try creating org record (gracefully handle missing tables)
      let orgId: string | null = null;
      try {
        const orgSlug = `${orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.floor(Math.random() * 10000)}`;
        const { data: orgData } = await supabaseAdmin
          .from("organizations")
          .insert({ name: orgName, slug: orgSlug, plan: "free" })
          .select()
          .single();
        if (orgData) orgId = orgData.id;
      } catch (_) {}

      // Try creating user profile row
      try {
        await supabaseAdmin.from("users").insert({
          org_id: orgId,
          email: email.toLowerCase(),
          full_name: name,
          auth_uid: authData.user.id,
          role: "owner",
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        });
      } catch (_) {}

      return NextResponse.json({
        success: true,
        message: "Account created successfully!",
        user: { email: email.toLowerCase(), name, org: orgName },
      });
    }

    // ── STANDARD FLOW: no service key — this is now handled client-side in AuthProvider ──
    // This route is only called when service role key is present (admin flow).
    // Without it, signUp() happens directly in the browser via AuthProvider.
    return NextResponse.json(
      { success: false, error: "Server-side signup requires SUPABASE_SERVICE_ROLE_KEY. Please use the client-side flow." },
      { status: 501 }
    );
  } catch (err: any) {
    console.error("Signup API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "An unexpected error occurred during sign up." },
      { status: 500 }
    );
  }
}
