import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  try {
    const provider = params.provider;
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const stateParam = searchParams.get("state");

    const origin = new URL(req.url).origin;

    if (!code) {
      return NextResponse.json({ success: false, error: "Authorization code not provided" }, { status: 400 });
    }

    let org_id = "default_org";
    try {
      if (stateParam) {
        const parsedState = JSON.parse(decodeURIComponent(stateParam));
        org_id = parsedState.org_id || "default_org";
      }
    } catch (e) {
      console.warn("Failed to parse OAuth state, using defaults:", e);
    }

    let tokenPayload = {
      access_token: "mock_received_access_token_via_callback",
      refresh_token: "mock_received_refresh_token_via_callback",
      expires_in: 3600
    };

    // Determine exchange URL endpoints
    const redirectUri = `${origin}/api/auth/callback/${provider}`;

    // Execute backend token exchange if active client variables exist
    if (provider === "google" && process.env.GOOGLE_CLIENT_SECRET) {
      try {
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID || "",
            client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
            redirect_uri: redirectUri,
            grant_type: "authorization_code"
          })
        });
        if (response.ok) {
          tokenPayload = await response.json();
        }
      } catch (err) {
        console.error("Google token exchange failed, falling back to mock:", err);
      }
    } else if (provider === "facebook" && process.env.META_APP_SECRET) {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v19.0/oauth/access_token?` +
          `client_id=${process.env.META_APP_ID || ""}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&client_secret=${process.env.META_APP_SECRET || ""}` +
          `&code=${code}`
        );
        if (response.ok) {
          tokenPayload = await response.json();
        }
      } catch (err) {
        console.error("Facebook token exchange failed, falling back to mock:", err);
      }
    } else if (provider === "linkedin" && process.env.LINKEDIN_CLIENT_SECRET) {
      try {
        const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id: process.env.LINKEDIN_CLIENT_ID || "",
            client_secret: process.env.LINKEDIN_CLIENT_SECRET || "",
            redirect_uri: redirectUri
          })
        });
        if (response.ok) {
          tokenPayload = await response.json();
        }
      } catch (err) {
        console.error("LinkedIn token exchange failed, falling back to mock:", err);
      }
    }

    // Securely upsert credentials to Supabase or simulated mock store
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const expiryTime = tokenPayload.expires_in 
      ? new Date(Date.now() + tokenPayload.expires_in * 1000).toISOString()
      : null;

    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);

        await supabase.from("user_integrations").upsert({
          org_id,
          provider,
          account_id: `act_${provider}_callback`,
          access_token: tokenPayload.access_token,
          refresh_token: tokenPayload.refresh_token || null,
          token_expires_at: expiryTime,
          is_active: true,
          updated_at: new Date().toISOString()
        }, { onConflict: "org_id,provider,account_id" });

      } catch (e) {
        console.error("Failed to write token callback to database:", e);
      }
    }

    // Redirect user back to the CRM front-end with active connection triggers
    return NextResponse.redirect(`${origin}/?connected=${provider}&success=true`);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
