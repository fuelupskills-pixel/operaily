"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

interface UserProfile {
  email: string;
  name: string;
  avatar: string;
  org: string;
  org_id?: string;
  id?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string, orgName: string) => Promise<{ success: boolean; error?: string }>;
  loginWithSocial: (provider: "google" | "outlook" | "facebook") => Promise<{ success: boolean; error?: string }>;
  logoutAndRevoke: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  loginWithSocial: async () => ({ success: false }),
  logoutAndRevoke: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync session and handle auth state change listener
  useEffect(() => {
    setIsLoading(true);
    
    let subscription: any = null;
    try {
      const res = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session) {
          try {
            // Fetch corresponding profile from database users table
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("*, organizations(*)")
              .eq("auth_uid", session.user.id)
              .maybeSingle();

            let profile: UserProfile;

            if (userError || !userData) {
              profile = {
                email: session.user.email || "",
                name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Database User",
                avatar: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session.user.email || "")}`,
                org: "Default Workspace",
                org_id: "default_org",
                id: session.user.id
              };
            } else {
              profile = {
                email: userData.email,
                name: userData.full_name,
                avatar: userData.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.full_name)}`,
                org: userData.organizations?.name || "OperAIly Headquarters",
                org_id: userData.org_id,
                id: userData.id
              };
            }

            // If this is an OAuth login and has provider token, capture it
            if (session.provider_token) {
              const providerMapped = session.user.app_metadata.provider === "azure" ? "outlook" : session.user.app_metadata.provider;
              if (providerMapped) {
                const expiryTime = session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null;
                
                // Validate org_id as UUID first, resolve to fallback if needed
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                let resolvedOrgId = profile.org_id || "default_org";
                if (!uuidRegex.test(resolvedOrgId)) {
                  const { data: orgs } = await supabase.from("organizations").select("id").limit(1);
                  if (orgs && orgs.length > 0) {
                    resolvedOrgId = orgs[0].id;
                    profile.org_id = resolvedOrgId;
                  }
                }

                if (uuidRegex.test(resolvedOrgId)) {
                  await supabase.from("user_integrations").upsert({
                    org_id: resolvedOrgId,
                    provider: providerMapped,
                    account_id: `act_${providerMapped}_login`,
                    account_name: `${profile.name}'s Connected ${providerMapped.toUpperCase()}`,
                    access_token: session.provider_token,
                    refresh_token: session.provider_refresh_token || null,
                    token_expires_at: expiryTime,
                    is_active: true,
                    updated_at: new Date().toISOString()
                  }, { onConflict: "org_id,provider,account_id" });
                }
              }
            }

            localStorage.setItem("omni_session", JSON.stringify(profile));
            setUser(profile);
            setIsAuthenticated(true);
          } catch (err) {
            console.error("Error syncing user profile in AuthProvider:", err);
          }
        } else {
          const mockSession = localStorage.getItem("mock_omni_session");
          if (mockSession) {
            setUser(JSON.parse(mockSession));
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem("omni_session");
            setUser(null);
            setIsAuthenticated(false);
          }
        }
        setIsLoading(false);
      });
      subscription = res.data?.subscription;
    } catch (e) {
      console.warn("Supabase auth state listener could not be initialized:", e);
      setIsLoading(false);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  const loginWithSocial = useCallback(async (provider: "google" | "outlook" | "facebook"): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback`;
      const sbProvider = provider === "outlook" ? "azure" : provider;

      let scopes = undefined;
      if (sbProvider === "google") {
        scopes = "email profile openid https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/adwords https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly";
      } else if (sbProvider === "azure") {
        scopes = "openid email profile offline_access Mail.ReadWrite Mail.Send Calendars.ReadWrite";
      } else if (sbProvider === "facebook") {
        scopes = "public_profile,email,pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish";
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: sbProvider,
        options: {
          redirectTo,
          scopes
        }
      });

      if (error) {
        // Fallback to local mock session if Supabase fails and key is invalid
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        if (!anonKey.startsWith("eyJ")) {
          // Fast simulated sign-in delay
          await new Promise(resolve => setTimeout(resolve, 400));
          
          const mockProfile = {
            email: `demo.${provider}@example.com`,
            name: `Demo ${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${provider}`,
            org: "Demo Workspace",
            org_id: "demo_org",
            id: `demo_${provider}_user`
          };
          localStorage.setItem("mock_omni_session", JSON.stringify(mockProfile));
          setUser(mockProfile);
          setIsAuthenticated(true);
          setIsLoading(false);
          return { success: true };
        }

        setIsLoading(false);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || "Failed to trigger OAuth sign in." };
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password,
      });

      if (error) {
        // Fallback to local mock session if Supabase fails and key is invalid
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        if (!anonKey.startsWith("eyJ")) {
          const mockProfile = {
            email: email.toLowerCase(),
            name: email.split("@")[0],
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
            org: "Demo Workspace",
            org_id: "demo_org",
            id: "demo_user"
          };
          localStorage.setItem("mock_omni_session", JSON.stringify(mockProfile));
          setUser(mockProfile);
          setIsAuthenticated(true);
          setIsLoading(false);
          return { success: true };
        }

        setIsLoading(false);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, error: err.message || "An error occurred during sign in." };
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string, orgName: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    setIsLoading(true);

    try {
      // Call signUp directly from the browser client — the SDK handles the
      // sb_publishable_ key format natively without raw HTTP header issues
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: { full_name: name, org_name: orgName },
        },
      });

      if (error) {
        // Fallback to local mock session if Supabase fails and key is invalid
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
        if (!anonKey.startsWith("eyJ")) {
          const mockProfile = {
            email: email.toLowerCase(),
            name: name,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
            org: orgName,
            org_id: "demo_org",
            id: "demo_user"
          };
          localStorage.setItem("mock_omni_session", JSON.stringify(mockProfile));
          setUser(mockProfile);
          setIsAuthenticated(true);
          setIsLoading(false);
          return { success: true };
        }
        setIsLoading(false);
        return { success: false, error: error.message };
      }

      // If there's already a session the account is active — sign in immediately
      if (data.session) {
        return { success: true };
      }

      // No session means email confirmation is required
      setIsLoading(false);
      return {
        success: true,
        message: "✅ Account created! Please check your email inbox and click the confirmation link, then sign in.",
      };
    } catch (e: any) {
      setIsLoading(false);
      return { success: false, error: e.message || "Signup failed. Please try again." };
    }
  }, []);

  const logoutAndRevoke = useCallback(async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem("omni_session");
      localStorage.removeItem("mock_omni_session");
      setUser(null);
      setIsAuthenticated(false);
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (err) {
      console.error("Sign out failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, signUp, loginWithSocial, logoutAndRevoke }}>
      {children}
    </AuthContext.Provider>
  );
}
