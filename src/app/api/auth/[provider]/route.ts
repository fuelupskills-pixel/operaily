import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  try {
    const provider = params.provider;
    const { searchParams } = new URL(req.url);
    const org_id = searchParams.get("org_id") || "default_org";

    const state = encodeURIComponent(JSON.stringify({ org_id, provider }));
    let authUrl = "";

    // Load redirect domains dynamically to ensure seamless Vercel live support
    const origin = new URL(req.url).origin;
    const redirectUri = `${origin}/api/auth/callback/${provider}`;

    switch (provider) {
      case "google":
        // YouTube, Analytics, Google Ads, Gmail, Calendar, and Profile scopes
        const googleClientId = process.env.GOOGLE_CLIENT_ID;
        if (!googleClientId) {
          return NextResponse.redirect(`${origin}/api/auth/callback/${provider}?code=mock_google_flow_success&state=${state}`);
        }
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${googleClientId}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&response_type=code` +
          `&scope=${encodeURIComponent("email profile openid https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly")}` +
          `&access_type=offline` +
          `&prompt=consent` +
          `&state=${state}`;
        break;

      case "facebook":
        // Facebook Pages, Instagram, and Meta Ads scopes
        const metaAppId = process.env.META_APP_ID;
        if (!metaAppId) {
          return NextResponse.redirect(`${origin}/api/auth/callback/${provider}?code=mock_facebook_flow_success&state=${state}`);
        }
        authUrl = `https://www.facebook.com/v19.0/dialog/oauth?` +
          `client_id=${metaAppId}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&state=${state}` +
          `&scope=${encodeURIComponent("public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish")}`;
        break;

      case "linkedin":
        // LinkedIn member share and profiling scopes
        const linkedinClientId = process.env.LINKEDIN_CLIENT_ID;
        if (!linkedinClientId) {
          return NextResponse.redirect(`${origin}/api/auth/callback/${provider}?code=mock_linkedin_flow_success&state=${state}`);
        }
        authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
          `response_type=code` +
          `&client_id=${linkedinClientId}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&state=${state}` +
          `&scope=${encodeURIComponent("r_liteprofile w_member_social")}`;
        break;

      case "outlook":
        // Outlook Mail, Calendar, and Profile scopes
        const outlookClientId = process.env.OUTLOOK_CLIENT_ID || process.env.MICROSOFT_CLIENT_ID;
        if (!outlookClientId) {
          return NextResponse.redirect(`${origin}/api/auth/callback/${provider}?code=mock_outlook_flow_success&state=${state}`);
        }
        authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
          `client_id=${outlookClientId}` +
          `&response_type=code` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&response_mode=query` +
          `&scope=${encodeURIComponent("openid email profile offline_access https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/Calendars.ReadWrite")}` +
          `&state=${state}`;
        break;

      case "whatsapp":
        // Sandbox instant qualification routing trigger
        return NextResponse.redirect(`${origin}/api/auth/callback/${provider}?code=mock_whatsapp_flow_success&state=${state}`);

      case "telegram":
        // Sandbox instant telegram bot activation trigger
        return NextResponse.redirect(`${origin}/api/auth/callback/${provider}?code=mock_telegram_flow_success&state=${state}`);

      default:
        return NextResponse.json({ success: false, error: "Unsupported OAuth provider" }, { status: 400 });
    }

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
