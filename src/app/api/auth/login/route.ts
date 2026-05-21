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

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("your_supabase_url")) {
      return NextResponse.json(
        { success: false, error: "Supabase connection parameters are not configured in environment variables." },
        { status: 500 }
      );
    }

    // 1. Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  } catch (err: any) {
    console.error("Login API error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "An error occurred during sign in." },
      { status: 500 }
    );
  }
}
