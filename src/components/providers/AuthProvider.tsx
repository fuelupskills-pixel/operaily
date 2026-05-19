"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase } from "@/lib/supabase/client";

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
  loginWithOneClick: () => void;
  logoutAndRevoke: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  loginWithSocial: async () => ({ success: false }),
  loginWithOneClick: () => {},
  logoutAndRevoke: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = !!(
    supabaseUrl &&
    supabaseUrl !== "your_supabase_url" &&
    supabaseAnonKey &&
    supabaseAnonKey !== "your_supabase_anon_key"
  );

  // Sync session and handle auth state change listener
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Local developer sandbox mode fallback
      try {
        const storedSession = localStorage.getItem("omni_session");
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          setUser(sessionData);
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error("Failed to load auth session:", e);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    // Subscribe to auth state updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
        localStorage.removeItem("omni_session");
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isSupabaseConfigured]);

  const loginWithSocial = useCallback(async (provider: "google" | "outlook" | "facebook"): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (isSupabaseConfigured) {
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
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        return { success: true };
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || "Failed to trigger OAuth sign in." };
      }
    } else {
      // Local developer sandbox mode fallback
      await new Promise((resolve) => setTimeout(resolve, 1200));

      try {
        let mockUser: UserProfile;

        switch (provider) {
          case "google":
            mockUser = {
              email: "user.google@gmail.com",
              name: "Google Account User",
              avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=GoogleUser",
              org: "Google Workspace Hub",
              org_id: "mock-org-google",
              id: "mock-user-google"
            };
            break;
          case "outlook":
            mockUser = {
              email: "user.outlook@outlook.com",
              name: "Outlook Account User",
              avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=OutlookUser",
              org: "Microsoft Outlook Org",
              org_id: "mock-org-outlook",
              id: "mock-user-outlook"
            };
            break;
          case "facebook":
            mockUser = {
              email: "user.facebook@meta.com",
              name: "Meta Facebook User",
              avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=FacebookUser",
              org: "Meta Platform Network",
              org_id: "mock-org-facebook",
              id: "mock-user-facebook"
            };
            break;
          default:
            setIsLoading(false);
            return { success: false, error: "Unsupported social provider" };
        }

        localStorage.setItem("omni_session", JSON.stringify(mockUser));
        setUser(mockUser);
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true };
      } catch (e) {
        setIsLoading(false);
        return { success: false, error: "Failed to connect to social auth provider." };
      }
    }
  }, [isSupabaseConfigured]);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password,
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        return { success: true };
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, error: err.message || "An error occurred during sign in." };
      }
    } else {
      // Local developer sandbox mode fallback
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (result.success && result.user) {
          const profile: UserProfile = {
            email: result.user.email,
            name: result.user.name,
            avatar: result.user.avatar,
            org: result.user.org,
            org_id: "default_org",
            id: "mock-developer-user"
          };

          // Save local session state
          localStorage.setItem("omni_session", JSON.stringify(profile));
          setUser(profile);
          setIsAuthenticated(true);
          setIsLoading(false);
          return { success: true };
        } else {
          setIsLoading(false);
          return { success: false, error: result.error || "Invalid credentials." };
        }
      } catch (e) {
        console.error("Login API integration error, attempting local storage fallback:", e);
        
        // Resilient client-side fallback in case API endpoint is unreachable
        const usersRaw = localStorage.getItem("operaily_users");
        const registeredUsers = usersRaw ? JSON.parse(usersRaw) : [];
        const foundUser = registeredUsers.find(
          (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (foundUser) {
          const profile: UserProfile = {
            email: foundUser.email,
            name: foundUser.name,
            avatar: foundUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${foundUser.name}`,
            org: foundUser.org || "OperAIly Headquarters",
            org_id: "default_org",
            id: "mock-fallback-user"
          };
          localStorage.setItem("omni_session", JSON.stringify(profile));
          setUser(profile);
          setIsAuthenticated(true);
          setIsLoading(false);
          return { success: true };
        }

        if (email.toLowerCase() === "admin@operaily.com" && password === "admin123") {
          const adminProfile: UserProfile = {
            email: "admin@operaily.com",
            name: "OperAIly Admin",
            avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Admin",
            org: "OperAIly Headquarters",
            org_id: "default_org",
            id: "mock-admin-user"
          };
          localStorage.setItem("omni_session", JSON.stringify(adminProfile));
          setUser(adminProfile);
          setIsAuthenticated(true);
          setIsLoading(false);
          return { success: true };
        }

        setIsLoading(false);
        return { success: false, error: "Authentication system encountered an error connecting to server." };
      }
    }
  }, [isSupabaseConfigured]);

  const signUp = useCallback(async (name: string, email: string, password: string, orgName: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, orgName }),
      });

      const result = await response.json();

      if (result.success && result.user) {
        if (isSupabaseConfigured) {
          // Log in the user to trigger the onAuthStateChange hook and set proper sessions
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.toLowerCase(),
            password
          });
          if (signInError) {
            setIsLoading(false);
            return { success: false, error: `Account created, but sign in failed: ${signInError.message}` };
          }
          return { success: true };
        } else {
          const profile: UserProfile = {
            email: result.user.email,
            name: result.user.name,
            avatar: result.user.avatar,
            org: result.user.org,
            org_id: "default_org",
            id: "mock-registered-user"
          };

          // Also save dynamically in mock local users to support hybrid mode
          const usersRaw = localStorage.getItem("operaily_users");
          const registeredUsers = usersRaw ? JSON.parse(usersRaw) : [];
          if (!registeredUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
            registeredUsers.push({ name, email: email.toLowerCase(), password, org: orgName, avatar: result.user.avatar });
            localStorage.setItem("operaily_users", JSON.stringify(registeredUsers));
          }

          // Save session
          localStorage.setItem("omni_session", JSON.stringify(profile));
          setUser(profile);
          setIsAuthenticated(true);
          setIsLoading(false);
          return { success: true };
        }
      } else {
        setIsLoading(false);
        return { success: false, error: result.error || "Failed to create account." };
      }
    } catch (e) {
      console.error("Signup API integration error, attempting local storage fallback:", e);

      // Resilient client-side fallback in case API endpoint is unreachable
      const usersRaw = localStorage.getItem("operaily_users");
      const registeredUsers = usersRaw ? JSON.parse(usersRaw) : [];
      const exists = registeredUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      
      if (exists || email.toLowerCase() === "admin@operaily.com") {
        setIsLoading(false);
        return { success: false, error: "An account with this email address already exists." };
      }

      const mockAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
      const newUser = {
        name,
        email: email.toLowerCase(),
        password,
        org: orgName || "Default Org",
        avatar: mockAvatar
      };

      registeredUsers.push(newUser);
      localStorage.setItem("operaily_users", JSON.stringify(registeredUsers));

      const profile: UserProfile = {
        email: newUser.email,
        name: newUser.name,
        avatar: newUser.avatar,
        org: newUser.org,
        org_id: "default_org",
        id: "mock-fallback-user"
      };

      localStorage.setItem("omni_session", JSON.stringify(profile));
      setUser(profile);
      setIsAuthenticated(true);
      setIsLoading(false);
      return { success: true };
    }
  }, [isSupabaseConfigured]);

  const loginWithOneClick = useCallback(() => {
    setIsLoading(true);
    
    // Create standard secure session
    const mockUser: UserProfile = {
      email: "fuelupskills@gmail.com",
      name: "OperAIly Executive",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      org: "FuelUpSkills Headquarters",
      org_id: "default_org",
      id: "mock-oneclick-user"
    };

    localStorage.setItem("omni_session", JSON.stringify(mockUser));
    setUser(mockUser);
    setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  const logoutAndRevoke = useCallback(async () => {
    setIsLoading(true);
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Sign out failed:", err);
      }
    } else {
      localStorage.removeItem("omni_session");
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [isSupabaseConfigured]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, signUp, loginWithSocial, loginWithOneClick, logoutAndRevoke }}>
      {children}
    </AuthContext.Provider>
  );
}
