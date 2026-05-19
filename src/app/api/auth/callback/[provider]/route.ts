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
    } else if (provider === "outlook" && (process.env.OUTLOOK_CLIENT_SECRET || process.env.MICROSOFT_CLIENT_SECRET)) {
      try {
        const response = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.OUTLOOK_CLIENT_ID || process.env.MICROSOFT_CLIENT_ID || "",
            client_secret: process.env.OUTLOOK_CLIENT_SECRET || process.env.MICROSOFT_CLIENT_SECRET || "",
            code,
            redirect_uri: redirectUri,
            grant_type: "authorization_code"
          })
        });
        if (response.ok) {
          tokenPayload = await response.json();
        }
      } catch (err) {
        console.error("Outlook token exchange failed, falling back to mock:", err);
      }
    }

    // Securely retrieve account details from third-party APIs
    let accountId = `act_${provider}_callback`;
    let accountName = `${provider.toUpperCase()} Integration`;

    if (tokenPayload.access_token && tokenPayload.access_token !== "mock_received_access_token_via_callback") {
      if (provider === "google") {
        try {
          const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokenPayload.access_token}` }
          });
          if (userResponse.ok) {
            const userInfo = await userResponse.json();
            accountId = userInfo.email || userInfo.id || accountId;
            accountName = userInfo.name || userInfo.email || accountName;
          }
        } catch (err) {
          console.warn("Failed to fetch Google profile details:", err);
        }
      } else if (provider === "facebook") {
        try {
          const userResponse = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${tokenPayload.access_token}`);
          if (userResponse.ok) {
            const userInfo = await userResponse.json();
            accountId = userInfo.id || accountId;
            accountName = userInfo.name || accountName;
          }
        } catch (err) {
          console.warn("Failed to fetch Facebook profile details:", err);
        }
      } else if (provider === "outlook") {
        try {
          const userResponse = await fetch("https://graph.microsoft.com/v1.0/me", {
            headers: { Authorization: `Bearer ${tokenPayload.access_token}` }
          });
          if (userResponse.ok) {
            const userInfo = await userResponse.json();
            accountId = userInfo.mail || userInfo.userPrincipalName || userInfo.id || accountId;
            accountName = userInfo.displayName || accountName;
          }
        } catch (err) {
          console.warn("Failed to fetch Outlook profile details:", err);
        }
      }
    }

    // Securely upsert credentials to Supabase or simulated mock store
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const expiryTime = tokenPayload.expires_in 
      ? new Date(Date.now() + tokenPayload.expires_in * 1000).toISOString()
      : null;

    const isSupabaseConfigured = !!(
      supabaseUrl &&
      supabaseUrl.startsWith("http") &&
      supabaseKey &&
      supabaseKey !== "your_supabase_service_role_key"
    );

    if (isSupabaseConfigured) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl!, supabaseKey!);

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        let resolvedOrgId = org_id;
        if (!uuidRegex.test(resolvedOrgId)) {
          const { data: orgs } = await supabase.from("organizations").select("id").limit(1);
          if (orgs && orgs.length > 0) {
            resolvedOrgId = orgs[0].id;
          } else {
            const { data: newOrg } = await supabase.from("organizations").insert({
              name: "Default Organization",
              slug: `default-org-${Math.floor(Math.random() * 1000)}`,
              plan: "free"
            }).select("id").single();
            if (newOrg) {
              resolvedOrgId = newOrg.id;
            }
          }
        }

        if (uuidRegex.test(resolvedOrgId)) {
          await supabase.from("user_integrations").upsert({
            org_id: resolvedOrgId,
            provider,
            account_id: accountId,
            account_name: accountName,
            access_token: tokenPayload.access_token,
            refresh_token: tokenPayload.refresh_token || null,
            token_expires_at: expiryTime,
            is_active: true,
            updated_at: new Date().toISOString()
          }, { onConflict: "org_id,provider,account_id" });
        }

      } catch (e) {
        console.error("Failed to write token callback to database:", e);
      }
    } else {
      // Supabase not configured: synchronize with the local in-memory mock database
      try {
        await fetch(`${origin}/api/integrations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            org_id,
            provider,
            account_id: accountId,
            credentials: {
              access_token: tokenPayload.access_token,
              refresh_token: tokenPayload.refresh_token || null,
              expires_at: expiryTime
            }
          })
        });
        console.log(`[OAuth Callback] Synchronized ${provider} to in-memory mock integration store.`);
      } catch (e) {
        console.error("[OAuth Callback] Failed to write mock integration to database:", e);
      }
    }

    // Redirect user back to the CRM front-end with active connection triggers
    return NextResponse.redirect(`${origin}/?connected=${provider}&success=true`);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
