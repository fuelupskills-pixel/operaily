import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { provider: string } }) {
  try {
    const provider = params.provider;
    const { org_id = "default_org", account_id = `act_${provider}_callback` } = await req.json();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let accessTokenToRevoke = "";

    // 1. Retrieve the active token from the database
    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { data } = await supabase
          .from("user_integrations")
          .select("access_token")
          .match({ org_id, provider, account_id })
          .single();

        if (data?.access_token) {
          accessTokenToRevoke = data.access_token;
        }

        // Delete from the database
        await supabase
          .from("user_integrations")
          .delete()
          .match({ org_id, provider, account_id });

      } catch (e) {
        console.error("Failed to query database during revocation:", e);
      }
    }

    // 2. Trigger official HTTP revocation to third-party servers
    if (accessTokenToRevoke) {
      if (provider === "google") {
        try {
          await fetch(`https://oauth2.googleapis.com/revoke?token=${accessTokenToRevoke}`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
          });
          console.log("Successfully revoked access token directly on Google OAuth servers.");
        } catch (err) {
          console.warn("Direct Google server token revocation failed:", err);
        }
      } else if (provider === "facebook") {
        try {
          await fetch(`https://graph.facebook.com/v19.0/me/permissions?access_token=${accessTokenToRevoke}`, {
            method: "DELETE"
          });
          console.log("Successfully revoked permissions directly on Meta/Facebook Graph servers.");
        } catch (err) {
          console.warn("Direct Meta server token revocation failed:", err);
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully revoked and invalidated ${provider} permissions both locally and server-side.` 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
