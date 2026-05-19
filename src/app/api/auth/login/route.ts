import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter both email and password." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const isSupabaseConfigured =
      supabaseUrl &&
      supabaseUrl !== "your_supabase_url" &&
      supabaseAnonKey &&
      supabaseAnonKey !== "your_supabase_anon_key";

    if (isSupabaseConfigured) {
      // 1. Initialize Supabase client
      const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

      // 2. Perform authenticating check
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (authError) {
        return NextResponse.json(
          { success: false, error: authError.message },
          { status: 401 }
        );
      }

      // 3. Fetch corresponding profile from database users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*, organizations(*)")
        .eq("auth_uid", authData.user.id)
        .maybeSingle();

      if (userError || !userData) {
        return NextResponse.json({
          success: true,
          message: "Authenticated successfully in Auth, but user profile does not exist yet.",
          user: {
            email: authData.user.email || email.toLowerCase(),
            name: authData.user.user_metadata?.full_name || "Database User",
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authData.user.email || "")}`,
            org: "Default Workspace",
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Authenticated successfully with Supabase Auth!",
        user: {
          email: userData.email,
          name: userData.full_name,
          avatar: userData.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.full_name)}`,
          org: userData.organizations?.name || "OperAIly Headquarters",
        },
      });
    } else {
      // Return a simulated response for the default test credentials or local development
      if (email.toLowerCase() === "admin@operaily.com" && password === "admin123") {
        return NextResponse.json({
          success: true,
          simulated: true,
          message: "Signed in successfully (Simulated Admin Session)!",
          user: {
            email: "admin@operaily.com",
            name: "OperAIly Admin",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Admin",
            org: "OperAIly Headquarters",
          },
        });
      }

      // Allow any simulated user to log in for easy developer preview
      return NextResponse.json({
        success: true,
        simulated: true,
        message: "Signed in successfully (Simulated Developer Session)!",
        user: {
          email: email.toLowerCase(),
          name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
          org: "OperAIly Team",
        },
      });
    }
  } catch (err: any) {
    console.error("Login API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "An error occurred during sign in." },
      { status: 500 }
    );
  }
}
