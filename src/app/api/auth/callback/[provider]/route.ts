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

    let tokenPayload: any = null;
    let accountId = `act_${provider}_callback`;
    let accountName = `${provider.toUpperCase()} Integration`;

    const redirectUri = `${origin}/api/auth/callback/${provider}`;

    if (provider === "google") {
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientSecret || !clientId) {
        return NextResponse.json({ success: false, error: "Google client credentials are not configured on the server." }, { status: 500 });
      }
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: "authorization_code"
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({ success: false, error: `Google OAuth token exchange failed: ${errorText}` }, { status: 400 });
      }
      tokenPayload = await response.json();
    } else if (provider === "facebook") {
      const clientSecret = process.env.META_APP_SECRET;
      const clientId = process.env.META_APP_ID;
      if (!clientSecret || !clientId) {
        return NextResponse.json({ success: false, error: "Facebook/Meta client credentials are not configured on the server." }, { status: 500 });
      }
      const response = await fetch(
        `https://graph.facebook.com/v19.0/oauth/access_token?` +
        `client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&client_secret=${clientSecret}` +
        `&code=${code}`
      );
      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({ success: false, error: `Facebook token exchange failed: ${errorText}` }, { status: 400 });
      }
      tokenPayload = await response.json();
    } else if (provider === "linkedin") {
      const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
      const clientId = process.env.LINKEDIN_CLIENT_ID;
      if (!clientSecret || !clientId) {
        return NextResponse.json({ success: false, error: "LinkedIn client credentials are not configured on the server." }, { status: 500 });
      }
      const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({ success: false, error: `LinkedIn token exchange failed: ${errorText}` }, { status: 400 });
      }
      tokenPayload = await response.json();
    } else if (provider === "outlook") {
      const clientSecret = process.env.OUTLOOK_CLIENT_SECRET || process.env.MICROSOFT_CLIENT_SECRET;
      const clientId = process.env.OUTLOOK_CLIENT_ID || process.env.MICROSOFT_CLIENT_ID;
      if (!clientSecret || !clientId) {
        return NextResponse.json({ success: false, error: "Outlook client credentials are not configured on the server." }, { status: 500 });
      }
      const response = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: redirectUri,
          grant_type: "authorization_code"
        })
      });
      if (!response.ok) {
        const errorText = await response.text();
        return NextResponse.json({ success: false, error: `Outlook token exchange failed: ${errorText}` }, { status: 400 });
      }
      tokenPayload = await response.json();
    } else if (provider === "whatsapp") {
      const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
      const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
      if (!waToken || !waPhoneId) {
        return NextResponse.json({ success: false, error: "WhatsApp credentials are not configured on the server." }, { status: 500 });
      }
      tokenPayload = {
        access_token: waToken,
        refresh_token: "permanent_token",
        expires_in: 315360000
      };
      accountId = waPhoneId;
      accountName = `WhatsApp Business API (${waPhoneId})`;
    } else if (provider === "telegram") {
      const tgToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!tgToken) {
        return NextResponse.json({ success: false, error: "Telegram Bot Token is not configured on the server." }, { status: 500 });
      }
      tokenPayload = {
        access_token: tgToken,
        refresh_token: "permanent_token",
        expires_in: 315360000
      };
      accountId = "telegram_bot";
      accountName = "Telegram Bot Integration";

      try {
        const res = await fetch(`https://api.telegram.org/bot${tgToken}/getMe`);
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.result) {
            accountId = String(data.result.id);
            accountName = `@${data.result.username} (${data.result.first_name})`;
          }
        }
      } catch (err) {
        console.warn("Failed to fetch Telegram bot info:", err);
      }
    }

    if (!tokenPayload || !tokenPayload.access_token) {
      return NextResponse.json({ success: false, error: "Failed to obtain token from provider." }, { status: 400 });
    }

    // Retrieve details for OAuth integrations
    if (tokenPayload.access_token && provider !== "whatsapp" && provider !== "telegram") {
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

    // Write credentials to Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("your_supabase_url")) {
      return NextResponse.json({ success: false, error: "Supabase connection parameters are not configured on the server." }, { status: 500 });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    if (!uuidRegex.test(resolvedOrgId)) {
      return NextResponse.json({ success: false, error: "Invalid organization ID formatting." }, { status: 500 });
    }

    const expiryTime = tokenPayload.expires_in 
      ? new Date(Date.now() + tokenPayload.expires_in * 1000).toISOString()
      : null;

    const { error: upsertError } = await supabase.from("user_integrations").upsert({
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

    if (upsertError) {
      return NextResponse.json({ success: false, error: `Failed to save integration: ${upsertError.message}` }, { status: 500 });
    }

    return NextResponse.redirect(`${origin}/?connected=${provider}&success=true`);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
