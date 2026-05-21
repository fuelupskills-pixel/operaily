import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { provider: string } }) {
  try {
    const provider = params.provider;
    const { searchParams } = new URL(req.url);
    const org_id = searchParams.get("org_id") || "default_org";

    const state = encodeURIComponent(JSON.stringify({ org_id, provider }));
    let authUrl = "";

    const origin = new URL(req.url).origin;
    const redirectUri = `${origin}/api/auth/callback/${provider}`;

    switch (provider) {
      case "google": {
        const googleClientId = process.env.GOOGLE_CLIENT_ID;
        if (!googleClientId) {
          return NextResponse.json({ success: false, error: "Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID in your environment variables." }, { status: 400 });
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
      }

      case "facebook": {
        const metaAppId = process.env.META_APP_ID;
        if (!metaAppId) {
          return NextResponse.json({ success: false, error: "Facebook OAuth is not configured on the server. Please set META_APP_ID in your environment variables." }, { status: 400 });
        }
        authUrl = `https://www.facebook.com/v19.0/dialog/oauth?` +
          `client_id=${metaAppId}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&state=${state}` +
          `&scope=${encodeURIComponent("public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish")}`;
        break;
      }

      case "linkedin": {
        const linkedinClientId = process.env.LINKEDIN_CLIENT_ID;
        if (!linkedinClientId) {
          return NextResponse.json({ success: false, error: "LinkedIn OAuth is not configured on the server. Please set LINKEDIN_CLIENT_ID in your environment variables." }, { status: 400 });
        }
        authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
          `response_type=code` +
          `&client_id=${linkedinClientId}` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&state=${state}` +
          `&scope=${encodeURIComponent("r_liteprofile w_member_social")}`;
        break;
      }

      case "outlook": {
        const outlookClientId = process.env.OUTLOOK_CLIENT_ID || process.env.MICROSOFT_CLIENT_ID;
        if (!outlookClientId) {
          return NextResponse.json({ success: false, error: "Outlook OAuth is not configured on the server. Please set OUTLOOK_CLIENT_ID in your environment variables." }, { status: 400 });
        }
        authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
          `client_id=${outlookClientId}` +
          `&response_type=code` +
          `&redirect_uri=${encodeURIComponent(redirectUri)}` +
          `&response_mode=query` +
          `&scope=${encodeURIComponent("openid email profile offline_access https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/Calendars.ReadWrite")}` +
          `&state=${state}`;
        break;
      }

      case "whatsapp": {
        const waToken = process.env.WHATSAPP_ACCESS_TOKEN;
        const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        if (!waToken || !waPhoneId || waToken === "your_whatsapp_token") {
          return NextResponse.json({ success: false, error: "WhatsApp Cloud API credentials are not configured in environment variables (.env)." }, { status: 400 });
        }
        // Direct route to callback endpoint to establish database integration row
        return NextResponse.redirect(`${origin}/api/auth/callback/${provider}?code=real_whatsapp_connection&state=${state}`);
      }

      case "telegram": {
        const tgToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!tgToken || tgToken === "your_telegram_token") {
          return NextResponse.json({ success: false, error: "Telegram Bot Token is not configured in environment variables (TELEGRAM_BOT_TOKEN)." }, { status: 400 });
        }
        // Direct route to callback endpoint to register and query Telegram API
        return NextResponse.redirect(`${origin}/api/auth/callback/${provider}?code=real_telegram_connection&state=${state}`);
      }

      default:
        return NextResponse.json({ success: false, error: "Unsupported OAuth provider" }, { status: 400 });
    }

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
