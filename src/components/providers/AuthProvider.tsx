"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

interface UserProfile {
  email: string;
  name: string;
  avatar: string;
  org: string;
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

  // Load session from storage on mount
  useEffect(() => {
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
  }, []);

  const loginWithSocial = useCallback(async (provider: "google" | "outlook" | "facebook"): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200)); // Dynamic OAuth loading simulation

    try {
      let mockUser: UserProfile;

      switch (provider) {
        case "google":
          mockUser = {
            email: "user.google@gmail.com",
            name: "Google Account User",
            avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=GoogleUser",
            org: "Google Workspace Hub"
          };
          break;
        case "outlook":
          mockUser = {
            email: "user.outlook@outlook.com",
            name: "Outlook Account User",
            avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=OutlookUser",
            org: "Microsoft Outlook Org"
          };
          break;
        case "facebook":
          mockUser = {
            email: "user.facebook@meta.com",
            name: "Meta Facebook User",
            avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=FacebookUser",
            org: "Meta Platform Network"
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
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800)); // Smooth loading transition

    try {
      // 1. Check dynamic users list in localStorage
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
          org: foundUser.org || "OperAIly Headquarters"
        };
        localStorage.setItem("omni_session", JSON.stringify(profile));
        setUser(profile);
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true };
      }

      // 2. Default fallback credentials for admin testing
      if (email.toLowerCase() === "admin@operaily.com" && password === "admin123") {
        const adminProfile: UserProfile = {
          email: "admin@operaily.com",
          name: "OperAIly Admin",
          avatar: "https://api.dicebear.com/7.x/initials/svg?seed=Admin",
          org: "OperAIly Headquarters"
        };
        localStorage.setItem("omni_session", JSON.stringify(adminProfile));
        setUser(adminProfile);
        setIsAuthenticated(true);
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: "Invalid email or password. Please try again." };
    } catch (e) {
      setIsLoading(false);
      return { success: false, error: "Authentication system encountered an error." };
    }
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string, orgName: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Smooth registration loading

    try {
      const usersRaw = localStorage.getItem("operaily_users");
      const registeredUsers = usersRaw ? JSON.parse(usersRaw) : [];

      const exists = registeredUsers.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      if (exists || email.toLowerCase() === "admin@operaily.com") {
        setIsLoading(false);
        return { success: false, error: "An account with this email address already exists." };
      }

      const newUser = {
        name,
        email: email.toLowerCase(),
        password,
        org: orgName || "Default Org",
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
      };

      registeredUsers.push(newUser);
      localStorage.setItem("operaily_users", JSON.stringify(registeredUsers));

      // Auto sign in user after successful sign up
      const profile: UserProfile = {
        email: newUser.email,
        name: newUser.name,
        avatar: newUser.avatar,
        org: newUser.org
      };

      localStorage.setItem("omni_session", JSON.stringify(profile));
      setUser(profile);
      setIsAuthenticated(true);
      setIsLoading(false);
      return { success: true };
    } catch (e) {
      setIsLoading(false);
      return { success: false, error: "Failed to create account. Please check inputs." };
    }
  }, []);

  const loginWithOneClick = useCallback(() => {
    setIsLoading(true);
    
    // Create standard secure session
    const mockUser: UserProfile = {
      email: "fuelupskills@gmail.com",
      name: "OperAIly Executive",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      org: "FuelUpSkills Headquarters"
    };

    localStorage.setItem("omni_session", JSON.stringify(mockUser));
    setUser(mockUser);
    setIsAuthenticated(true);
    setIsLoading(false);
  }, []);

  const logoutAndRevoke = useCallback(() => {
    setIsLoading(true);
    localStorage.removeItem("omni_session");
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, signUp, loginWithSocial, loginWithOneClick, logoutAndRevoke }}>
      {children}
    </AuthContext.Provider>
  );
}
