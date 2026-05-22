"use client";

import React, { useState } from "react";
import { SidebarProvider, useSidebar } from "@/components/providers/SidebarProvider";
import { AuthProvider, useAuth } from "@/components/providers/AuthProvider";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import dynamic from "next/dynamic";

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center p-12 min-h-[50vh]">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      <p className="text-xs text-muted-foreground animate-pulse">Loading module...</p>
    </div>
  </div>
);

const DashboardContent = dynamic(() => import("@/components/dashboard/DashboardContent"), { loading: LoadingFallback });
const WorkforceDashboard = dynamic(() => import("@/components/dashboard/WorkforceDashboard"), { loading: LoadingFallback });
const ApprovalCenter = dynamic(() => import("@/components/dashboard/ApprovalCenter"), { loading: LoadingFallback });
const HunterContent = dynamic(() => import("@/components/hunter/HunterContent"), { loading: LoadingFallback });
const LeadsContent = dynamic(() => import("@/components/leads/LeadsContent"), { loading: LoadingFallback });
const CanvasWorkflow = dynamic(() => import("@/components/workflows/CanvasWorkflow"), { loading: LoadingFallback });
const ConversationsContent = dynamic(() => import("@/components/conversations/ConversationsContent"), { loading: LoadingFallback });
const AnalyticsContent = dynamic(() => import("@/components/analytics/AnalyticsContent"), { loading: LoadingFallback });
const CampaignsContent = dynamic(() => import("@/components/campaigns/CampaignsContent"), { loading: LoadingFallback });
const CalendarContent = dynamic(() => import("@/components/calendar/CalendarContent"), { loading: LoadingFallback });
const SettingsContent = dynamic(() => import("@/components/settings/SettingsContent"), { loading: LoadingFallback });
const BillingContent = dynamic(() => import("@/components/billing/BillingContent"), { loading: LoadingFallback });
const VideoContent = dynamic(() => import("@/components/video/VideoContent"), { loading: LoadingFallback });
const AgencyContent = dynamic(() => import("@/components/agency/AgencyContent"), { loading: LoadingFallback });
const SellerContent = dynamic(() => import("@/components/seller/SellerContent"), { loading: LoadingFallback });
import { Zap, ShieldAlert, Key, Mail, Lock, User, Building, AlertCircle, Loader2, CheckCircle2, ChevronRight } from "lucide-react";

function AppContent() {
  const { isCollapsed, activeSection, setActiveSection } = useSidebar();
  const { isAuthenticated, isLoading, login, signUp, loginWithSocial } = useAuth();
  
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  React.useEffect(() => {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const isConfigured = rawUrl && rawUrl.startsWith("http") && rawKey && !rawKey.includes("anon_key") && rawKey !== "your_supabase_anon_key";
    setIsDemoMode(!isConfigured);
  }, []);

  React.useEffect(() => {
    if (isAuthenticated && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const connected = params.get("connected");
      if (connected) {
        setActiveSection("settings");
        // Clear parameters from search query
        const url = new URL(window.location.href);
        url.searchParams.delete("connected");
        url.searchParams.delete("success");
        window.history.replaceState({}, document.title, url.pathname + url.search);
      }
    }
  }, [isAuthenticated, setActiveSection]);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <DashboardContent />;
      case "workforce":
        return <WorkforceDashboard />;
      case "approvals":
        return <ApprovalCenter />;
      case "hunter":
        return <HunterContent />;
      case "leads":
        return <LeadsContent />;
      case "workflows":
        return <CanvasWorkflow />;
      case "conversations":
        return <ConversationsContent />;
      case "campaigns":
        return <CampaignsContent />;
      case "calendar":
        return <CalendarContent />;
      case "analytics":
        return <AnalyticsContent />;
      case "settings":
        return <SettingsContent />;
      case "billing":
        return <BillingContent />;
      case "video":
        return <VideoContent />;
      case "agency":
        return <AgencyContent />;
      case "seller":
        return <SellerContent />;
      default:
        return <DashboardContent />;
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg("Please fill in all credentials.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.error || "Authentication failed.");
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name || !email || !password || !orgName) {
      setErrorMsg("Please complete all registration fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    if (!acceptTerms) {
      setErrorMsg("You must accept the terms of service.");
      return;
    }

    setIsSubmitting(true);
    const result = await signUp(name, email, password, orgName);
    setIsSubmitting(false);

    if (result.success) {
      setSuccessMsg((result as any).message || "Account successfully registered!");
    } else {
      setErrorMsg(result.error || "Registration failed.");
    }
  };

  const handleSocialAuth = async (provider: "google" | "outlook" | "facebook") => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSocialLoading(provider);

    const result = await loginWithSocial(provider);
    setSocialLoading(null);

    if (!result.success) {
      setErrorMsg(result.error || "Social authentication failed.");
    }
  };

  // Loading Session Gate Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/10 blur-[100px]" />
        
        <div className="relative flex flex-col items-center gap-4 z-10">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Zap className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <p className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase animate-pulse">
            OperAIly Secure Gatekeeper Verifying Session...
          </p>
        </div>
      </div>
    );
  }

  // Premium Sign-In Gate Screen
  if (!isAuthenticated) {
    if (isDemoMode) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-10 left-10 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
          
          <div className="relative w-full max-w-lg glass-card p-8 space-y-6 z-10 border border-amber-500/30 shadow-2xl shadow-amber-500/5 animate-fade-in">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-primary flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20 animate-pulse">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Supabase Connection Required</h1>
                <p className="text-xs text-muted-foreground mt-1 font-medium">Environment variables are not configured. Follow these instructions to launch the platform in your real environment.</p>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-3 bg-surface/50 p-5 rounded-xl border border-border/40 text-xs">
              <h2 className="font-bold text-white mb-2 uppercase tracking-wider text-[10px]">Setup Checklist</h2>
              
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[9px] font-bold text-amber-400 shrink-0 mt-0.5">1</div>
                <div>
                  <p className="font-semibold text-white">Create a Supabase Project</p>
                  <p className="text-muted-foreground mt-0.5">Go to <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">supabase.com</a> and create a new project database.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[9px] font-bold text-amber-400 shrink-0 mt-0.5">2</div>
                <div>
                  <p className="font-semibold text-white">Retrieve API Keys</p>
                  <p className="text-muted-foreground mt-0.5">Navigate to <b>Project Settings → API</b> and find the <code>Project URL</code>, <code>anon</code> public key, and <code>service_role</code> private key.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-[9px] font-bold text-amber-400 shrink-0 mt-0.5">3</div>
                <div>
                  <p className="font-semibold text-white">Configure Environment Secrets</p>
                  <p className="text-muted-foreground mt-0.5">Create a <code>.env.local</code> file in your local workspace or configure your repository environment secrets (Vercel/GitHub):</p>
                  <pre className="bg-background border border-border p-3 rounded-lg mt-2 overflow-x-auto text-[10px] text-muted-foreground font-mono select-all">
{`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Warning details */}
            <div className="p-3.5 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger/90">
              <p className="font-semibold text-white">⚠️ Strict Security Warning</p>
              <p className="text-[11px] mt-1 text-danger/80">Never expose the <code>SUPABASE_SERVICE_ROLE_KEY</code> in public client code or push it to version control systems like GitHub. Store it exclusively in secure backend server environment variables.</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium shadow-md shadow-amber-500/10 transition-all text-center cursor-pointer"
              >
                Verify Configuration
              </button>
              <a
                href="https://supabase.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 text-xs font-semibold rounded-lg bg-surface hover:bg-surface-hover border border-border/40 text-muted-foreground hover:text-white transition-all text-center cursor-pointer"
              >
                Supabase Docs
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Sleek Gradient Ambient Backdrops */}
        <div className="absolute top-10 left-10 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
        
        <div className="relative w-full max-w-md glass-card p-8 space-y-6 z-10 border border-primary/20 hover:border-primary/30 transition-all duration-500 shadow-2xl shadow-primary/5">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Oper<span className="gradient-text">AI</span>ly</h1>
              <p className="text-[9px] text-muted-foreground font-semibold tracking-widest uppercase mt-0.5">Secure AI Operations Hub</p>
            </div>
          </div>

          {/* Form Tabs */}
          <div className="flex bg-surface/80 p-1 rounded-xl border border-border/40">
            <button
              onClick={() => {
                setAuthMode("login");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                authMode === "login" 
                  ? "bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-white shadow-sm"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setAuthMode("signup");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                authMode === "signup"
                  ? "bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 text-white shadow-sm"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Messages */}

          {errorMsg && (
            <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-xs text-danger flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-success/10 border border-success/20 rounded-xl text-xs text-success flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={authMode === "login" ? handleLoginSubmit : handleSignUpSubmit} className="space-y-4">
            {authMode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Password</label>
                {authMode === "login" && (
                  <button type="button" className="text-[10px] font-bold text-primary hover:text-primary-hover transition-colors">
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            {authMode === "signup" && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Organization Name</label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Enter organization name"
                    className="w-full pl-10 pr-4 py-2.5 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Checkbox settings */}
            {authMode === "login" ? (
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[11px] text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-input-border bg-input text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>Keep me signed in</span>
                </label>
              </div>
            ) : (
              <div className="flex items-start">
                <label className="flex items-start gap-2 cursor-pointer select-none text-[11px] text-muted-foreground leading-normal">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="w-3.5 h-3.5 mt-0.5 rounded border-input-border bg-input text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>I agree to the Terms of Service & Privacy Policy</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || socialLoading !== null}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-xs hover:shadow-lg hover:shadow-primary/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{authMode === "login" ? "Sign In" : "Register Workspace"}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative py-2 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40"></div>
            </div>
            <span className="relative px-3 bg-card text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Or continue with
            </span>
          </div>

          {/* Social login buttons */}
          <div className="grid grid-cols-3 gap-3">
            {/* Google / Gmail */}
            <button
              type="button"
              disabled={isSubmitting || socialLoading !== null}
              onClick={() => handleSocialAuth("google")}
              className="py-2.5 px-4 rounded-xl bg-surface/50 border border-input-border hover:border-primary/30 hover:bg-surface/80 flex items-center justify-center transition-all cursor-pointer group disabled:opacity-50"
            >
              {socialLoading === "google" ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : (
                <svg className="w-4 h-4 group-hover:scale-105 transition-transform" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.6 15.02 1 12 1 7.24 1 3.2 3.73 1.24 7.7l3.96 3.07C6.15 7.6 8.85 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.45 12.3c0-.82-.07-1.62-.2-2.38H12v4.51h6.43c-.28 1.46-1.1 2.69-2.34 3.52v2.93h3.78c2.22-2.04 3.58-5.04 3.58-8.58z" />
                  <path fill="#FBBC05" d="M5.2 10.77c-.24-.72-.38-1.5-.38-2.3 0-.8.14-1.58.38-2.3L1.24 3.1A11.94 11.94 0 000 8.47c0 1.95.47 3.8 1.24 5.37l3.96-3.07z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.78-2.93c-1.05.7-2.4 1.13-4.18 1.13-3.15 0-5.85-2.56-6.8-5.73l-3.96 3.07C3.2 20.27 7.24 23 12 23z" />
                </svg>
              )}
            </button>

            {/* Microsoft Outlook */}
            <button
              type="button"
              disabled={isSubmitting || socialLoading !== null}
              onClick={() => handleSocialAuth("outlook")}
              className="py-2.5 px-4 rounded-xl bg-surface/50 border border-input-border hover:border-primary/30 hover:bg-surface/80 flex items-center justify-center transition-all cursor-pointer group disabled:opacity-50"
            >
              {socialLoading === "outlook" ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : (
                <svg className="w-4 h-4 group-hover:scale-105 transition-transform" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M0 0h11v11H0z" />
                  <path fill="#81bc06" d="M12 0h11v11H12z" />
                  <path fill="#05a6f0" d="M0 12h11v11H0z" />
                  <path fill="#ffba08" d="M12 12h11v11H12z" />
                </svg>
              )}
            </button>

            {/* Facebook */}
            <button
              type="button"
              disabled={isSubmitting || socialLoading !== null}
              onClick={() => handleSocialAuth("facebook")}
              className="py-2.5 px-4 rounded-xl bg-surface/50 border border-input-border hover:border-primary/30 hover:bg-surface/80 flex items-center justify-center transition-all cursor-pointer group disabled:opacity-50"
            >
              {socialLoading === "facebook" ? (
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              ) : (
                <svg className="w-4 h-4 group-hover:scale-105 transition-transform" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              )}
            </button>
          </div>

          {/* Production App Secured */}
          <div className="border-t border-border/40 pt-4 flex flex-col items-center gap-2">
            <div className="flex items-center gap-1 text-[9px] text-muted-foreground/60 leading-none">
              <ShieldAlert className="w-3 h-3 text-primary shrink-0" />
              <span>Production access only. Connection is SSL encrypted.</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Frame (Authenticated)
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <TopBar />
      <main
        className={`pt-16 min-h-screen transition-all duration-300 ${
          isCollapsed ? "pl-[68px]" : "pl-[260px]"
        }`}
      >
        <div className="p-6">{renderContent()}</div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <AppContent />
      </SidebarProvider>
    </AuthProvider>
  );
}
