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
  loginWithOneClick: () => void;
  logoutAndRevoke: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
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

  const loginWithOneClick = useCallback(() => {
    setIsLoading(true);
    
    // Create standard secure session
    const mockUser: UserProfile = {
      email: "fuelupskills@gmail.com",
      name: "OMNI Executive",
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
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, loginWithOneClick, logoutAndRevoke }}>
      {children}
    </AuthContext.Provider>
  );
}
