"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Zap } from "lucide-react";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusMsg, setStatusMsg] = useState("Processing secure login session...");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        const code = searchParams.get("code");
        if (!code) {
          setErrorMsg("Authorization code not found in callback parameters.");
          return;
        }

        // 1. Exchange authorization code for active session
        const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
        
        if (sessionError) {
          setErrorMsg(sessionError.message);
          return;
        }

        const user = sessionData.user;
        if (!user || !user.email) {
          setErrorMsg("Failed to retrieve user metadata from authentication provider.");
          return;
        }

        setStatusMsg("Loading user profile details...");

        // 2. Check if user profile already exists in our database users table
        const { data: existingProfile, error: profileError } = await supabase
          .from("users")
          .select("*, organizations(*)")
          .eq("auth_uid", user.id)
          .maybeSingle();

        let profileToStore: any = {
          email: user.email,
          name: user.user_metadata?.full_name || user.email.split("@")[0],
          avatar: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email)}`,
          org: "My Workspace",
          org_id: "default_org",
          id: user.id
        };

        let resolvedOrgId = "default_org";

        if (existingProfile) {
          resolvedOrgId = existingProfile.org_id;
          profileToStore = {
            email: existingProfile.email,
            name: existingProfile.full_name,
            avatar: existingProfile.avatar_url || profileToStore.avatar,
            org: existingProfile.organizations?.name || "OperAIly HQ",
            org_id: existingProfile.org_id,
            id: existingProfile.id,
          };
        } else {
          // 3. User profile doesn't exist: provision default organization and user record
          setStatusMsg("Initializing workspace environment...");
          
          const orgName = `${profileToStore.name}'s Organization`;
          const orgSlug = `${orgName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.floor(Math.random() * 1000)}`;

          // Create Organization
          const { data: orgData, error: orgError } = await supabase
            .from("organizations")
            .insert({
              name: orgName,
              slug: orgSlug,
              plan: "free",
            })
            .select()
            .single();

          if (!orgError && orgData) {
            resolvedOrgId = orgData.id;
            // Create User Profile linked to Organization
            const { data: userData, error: userError } = await supabase
              .from("users")
              .insert({
                org_id: orgData.id,
                email: user.email,
                full_name: profileToStore.name,
                auth_uid: user.id,
                role: "owner",
                avatar_url: profileToStore.avatar,
              })
              .select()
              .single();

            if (!userError && userData) {
              profileToStore = {
                email: userData.email,
                name: userData.full_name,
                avatar: userData.avatar_url || profileToStore.avatar,
                org: orgData.name,
                org_id: userData.org_id,
                id: userData.id,
              };
            }
          }
        }

        // 3.5 Check and store provider tokens for integrations if present
        const session = sessionData.session;
        if (session?.provider_token) {
          const providerMapped = user.app_metadata.provider === "azure" ? "outlook" : user.app_metadata.provider;
          if (providerMapped) {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            if (!uuidRegex.test(resolvedOrgId)) {
              // Try to find a valid org UUID
              const { data: orgs } = await supabase.from("organizations").select("id").limit(1);
              if (orgs && orgs.length > 0) {
                resolvedOrgId = orgs[0].id;
                profileToStore.org_id = resolvedOrgId;
              }
            }

            if (uuidRegex.test(resolvedOrgId)) {
              const expiryTime = session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null;
              await supabase.from("user_integrations").upsert({
                org_id: resolvedOrgId,
                provider: providerMapped,
                account_id: `act_${providerMapped}_login`,
                account_name: `${profileToStore.name}'s Connected ${providerMapped.toUpperCase()}`,
                access_token: session.provider_token,
                refresh_token: session.provider_refresh_token || null,
                token_expires_at: expiryTime,
                is_active: true,
                updated_at: new Date().toISOString()
              }, { onConflict: "org_id,provider,account_id" });
            }
          }
        }

        // 4. Write active session locally so useAuth picks it up on redirect
        localStorage.setItem("omni_session", JSON.stringify(profileToStore));
        setStatusMsg("Redirecting to your CRM dashboard...");
        
        // Wait brief moment for smooth visual transition
        setTimeout(() => {
          router.push("/");
        }, 1000);

      } catch (err: any) {
        console.error("Auth callback error:", err);
        setErrorMsg(err.message || "An unexpected error occurred during redirect processing.");
      }
    }

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="relative flex flex-col items-center gap-6 z-10 max-w-md text-center p-6">
      {errorMsg ? (
        <>
          <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-500 text-2xl font-bold">
            !
          </div>
          <h1 className="text-xl font-bold">Authentication Redirect Failed</h1>
          <p className="text-sm text-slate-400">{errorMsg}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm transition-colors"
          >
            Return to Sign In
          </button>
        </>
      ) : (
        <>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <Zap className="w-6 h-6 text-indigo-400 animate-pulse" />
          </div>
          <h1 className="text-lg font-semibold tracking-wide text-slate-200">
            {statusMsg}
          </h1>
          <p className="text-[10px] tracking-widest text-slate-500 uppercase">
            OperAIly Secure Auth Hub
          </p>
        </>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background glow styling */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[100px]" />

      <Suspense fallback={
        <div className="relative flex flex-col items-center gap-6 z-10 max-w-md text-center p-6">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <Zap className="w-6 h-6 text-indigo-400 animate-pulse" />
          </div>
          <h1 className="text-lg font-semibold tracking-wide text-slate-200">
            Loading secure connection...
          </h1>
        </div>
      }>
        <CallbackContent />
      </Suspense>
    </div>
  );
}
