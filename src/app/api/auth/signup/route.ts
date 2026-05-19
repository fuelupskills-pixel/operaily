import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const isSupabaseConfigured =
      supabaseUrl &&
      supabaseUrl !== "your_supabase_url" &&
      supabaseServiceKey &&
      supabaseServiceKey !== "your_service_role_key";

    if (isSupabaseConfigured) {
      // 1. Initialize Supabase Service Role client to perform admin creation
      const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      // 2. Create the Auth User instantly (auto-confirming email)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
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

      // 3. Create organization record
      const orgSlug = `${orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.floor(
        Math.random() * 10000
      )}`;
      const { data: orgData, error: orgError } = await supabaseAdmin
        .from("organizations")
        .insert({
          name: orgName,
          slug: orgSlug,
          plan: "free",
        })
        .select()
        .single();

      if (orgError) {
        // Cleanup created auth user if org creation fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json(
          { success: false, error: `Organization creation failed: ${orgError.message}` },
          { status: 400 }
        );
      }

      // 4. Create user profile linked to org and auth_uid
      const { data: userData, error: userError } = await supabaseAdmin
        .from("users")
        .insert({
          org_id: orgData.id,
          email: email.toLowerCase(),
          full_name: name,
          auth_uid: authData.user.id,
          role: "owner",
          avatar_url: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
        })
        .select()
        .single();

      if (userError) {
        // Cleanup created auth user and org if profile fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        await supabaseAdmin.from("organizations").delete().eq("id", orgData.id);
        return NextResponse.json(
          { success: false, error: `User profile linking failed: ${userError.message}` },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Account successfully registered in Supabase database!",
        user: {
          email: userData.email,
          name: userData.full_name,
          avatar: userData.avatar_url,
          org: orgData.name,
        },
      });
    } else {
      // Return a simulated successful database response if credentials are not filled yet
      const mockAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
      return NextResponse.json({
        success: true,
        simulated: true,
        message: "Account successfully registered (Simulated Database Session)!",
        user: {
          email: email.toLowerCase(),
          name,
          avatar: mockAvatar,
          org: orgName,
        },
      });
    }
  } catch (err: any) {
    console.error("Signup API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "An error occurred during sign up." },
      { status: 500 }
    );
  }
}
