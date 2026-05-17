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
        // YouTube, Analytics, and Google Ads scopes
        const googleClientId = process.env.GOOGLE_CLIENT_ID || "mock_google_client_id";
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${googleClientId}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&response_type=code` +
          `&scope=${encodeURIComponent("https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/adwords")}` +
          `&access_type=offline` +
          `&prompt=consent` +
          `&state=${state}`;
        break;

      case "facebook":
        // Facebook Pages, Instagram, and Meta Ads scopes
        const metaAppId = process.env.META_APP_ID || "mock_meta_app_id";
        authUrl = `https://www.facebook.com/v19.0/dialog/oauth?` +
          `client_id=${metaAppId}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&state=${state}` +
          `&scope=${encodeURIComponent("pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish")}`;
        break;

      case "linkedin":
        // LinkedIn member share and profiling scopes
        const linkedinClientId = process.env.LINKEDIN_CLIENT_ID || "mock_linkedin_client_id";
        authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
          `response_type=code` +
          `&client_id=${linkedinClientId}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&state=${state}` +
          `&scope=${encodeURIComponent("r_liteprofile w_member_social")}`;
        break;

      case "whatsapp":
        // Sandbox instant qualification routing trigger
        return NextResponse.redirect(`${origin}/?connected=whatsapp`);

      case "telegram":
        // Sandbox instant telegram bot activation trigger
        return NextResponse.redirect(`${origin}/?connected=telegram`);

      default:
        return NextResponse.json({ success: false, error: "Unsupported OAuth provider" }, { status: 400 });
    }

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
