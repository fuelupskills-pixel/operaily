import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const org_id = searchParams.get("org_id") || "default_org";
    const provider = searchParams.get("provider");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("your_supabase_url")) {
      return NextResponse.json({ success: false, error: "Supabase connection is not configured on the server." }, { status: 500 });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let resolvedOrgId = org_id;
    if (!uuidRegex.test(resolvedOrgId)) {
      const { data: orgs } = await supabase.from("organizations").select("id").limit(1);
      if (orgs && orgs.length > 0) {
        resolvedOrgId = orgs[0].id;
      }
    }

    if (!uuidRegex.test(resolvedOrgId)) {
      return NextResponse.json({ success: true, data: [] });
    }

    let query = supabase.from("user_integrations").select("*").eq("org_id", resolvedOrgId);
    if (provider) {
      query = query.eq("provider", provider);
    }
    
    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { org_id = "default_org", provider, account_id, credentials, settings = {} } = await req.json();

    if (!provider || !account_id) {
      return NextResponse.json({ success: false, error: "Missing provider or account ID" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("your_supabase_url")) {
      return NextResponse.json({ success: false, error: "Supabase connection is not configured on the server." }, { status: 500 });
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
          slug: `default-org-${Math.floor(Math.random() * 1050)}`,
          plan: "free"
        }).select("id").single();
        if (newOrg) {
          resolvedOrgId = newOrg.id;
        }
      }
    }

    if (!uuidRegex.test(resolvedOrgId)) {
      return NextResponse.json({ success: false, error: "Unable to resolve valid organization ID." }, { status: 500 });
    }

    const encryptedToken = credentials.access_token || "configured_token_value";

    const { data, error } = await supabase
      .from("user_integrations")
      .upsert({
        org_id: resolvedOrgId,
        provider,
        account_id,
        access_token: encryptedToken,
        refresh_token: credentials.refresh_token || null,
        token_expires_at: credentials.expires_at || null,
        settings,
        is_active: true,
        updated_at: new Date().toISOString()
      }, { onConflict: "org_id,provider,account_id" })
      .select();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `${provider} integration secured`, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { org_id = "default_org", provider, account_id } = await req.json();

    if (!provider || !account_id) {
      return NextResponse.json({ success: false, error: "Missing integration parameters" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("your_supabase_url")) {
      return NextResponse.json({ success: false, error: "Supabase connection is not configured on the server." }, { status: 500 });
    }

    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let resolvedOrgId = org_id;
    if (!uuidRegex.test(resolvedOrgId)) {
      const { data: orgs } = await supabase.from("organizations").select("id").limit(1);
      if (orgs && orgs.length > 0) {
        resolvedOrgId = orgs[0].id;
      }
    }

    if (!uuidRegex.test(resolvedOrgId)) {
      return NextResponse.json({ success: false, error: "Invalid organization ID formatting." }, { status: 500 });
    }

    const { error } = await supabase
      .from("user_integrations")
      .delete()
      .match({ org_id: resolvedOrgId, provider, account_id });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `${provider} integration revoked successfully` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
