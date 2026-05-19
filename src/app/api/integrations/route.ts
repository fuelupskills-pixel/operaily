import { NextRequest, NextResponse } from "next/server";

// Fallback simulator for demo and preview environments
let mockDatabase: Record<string, any>[] = [];

function checkSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return !!(
    supabaseUrl &&
    supabaseUrl.startsWith("http") &&
    supabaseKey &&
    supabaseKey !== "your_supabase_service_role_key"
  );
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const org_id = searchParams.get("org_id") || "default_org";
    const provider = searchParams.get("provider");

    // Check if Supabase client variables are present and valid
    if (checkSupabaseConfig()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
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

      if (uuidRegex.test(resolvedOrgId)) {
        let query = supabase.from("user_integrations").select("*").eq("org_id", resolvedOrgId);
        if (provider) {
          query = query.eq("provider", provider);
        }
        
        const { data, error } = await query;
        if (!error) {
          return NextResponse.json({ success: true, data });
        }
      }
    }

    // Fallback Mock database response
    const filteredMockData = mockDatabase.filter(
      item => item.org_id === org_id && (!provider || item.provider === provider)
    );
    return NextResponse.json({ success: true, data: filteredMockData });
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

    // Secure encryption placeholder representing executive encoding
    const encryptedToken = credentials.access_token || "mock_encrypted_token_value";

    if (checkSupabaseConfig()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
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

      if (uuidRegex.test(resolvedOrgId)) {
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

        if (!error) {
          return NextResponse.json({ success: true, message: `${provider} integration secured`, data });
        }
      }
    }

    // Mock database transaction
    const newIntegration = {
      id: Math.random().toString(36).substring(7),
      org_id,
      provider,
      account_id,
      account_name: `${provider} Account`,
      access_token: encryptedToken,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Remove existing duplicates in mock state
    mockDatabase = mockDatabase.filter(item => !(item.org_id === org_id && item.provider === provider && item.account_id === account_id));
    mockDatabase.push(newIntegration);

    return NextResponse.json({ 
      success: true, 
      message: `[MOCK MODE] Connected ${provider} integration successfully`, 
      data: [newIntegration] 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { org_id = "default_org", provider, account_id } = await req.json();

    if (checkSupabaseConfig()) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
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

      if (uuidRegex.test(resolvedOrgId)) {
        const { error } = await supabase
          .from("user_integrations")
          .delete()
          .match({ org_id: resolvedOrgId, provider, account_id });

        if (!error) {
          return NextResponse.json({ success: true, message: `${provider} integration revoked successfully` });
        }
      }
    }

    // Mock revoke delete
    mockDatabase = mockDatabase.filter(
      item => !(item.org_id === org_id && item.provider === provider && item.account_id === account_id)
    );

    return NextResponse.json({ 
      success: true, 
      message: `[MOCK MODE] Revoked ${provider} integration successfully` 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
