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
import LandingPage from "@/components/landing/LandingPage";
import AuthPage from "@/components/auth/AuthPage";
import { Zap, ShieldAlert, Key, Mail, Lock, User, Building, AlertCircle, Loader2, CheckCircle2, ChevronRight } from "lucide-react";

function AppContent() {
  const { isCollapsed, activeSection, setActiveSection } = useSidebar();
  const { isAuthenticated, isLoading } = useAuth();
  
  const [showAuth, setShowAuth] = useState(false);
  const [initialAuthMode, setInitialAuthMode] = useState<"login" | "signup">("login");
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

  // Unauthenticated / Landing Flow
  if (!isAuthenticated || isLoading) {
    if (showAuth) {
      return <AuthPage initialMode={initialAuthMode} onBack={() => setShowAuth(false)} isDemoMode={isDemoMode} />;
    }
    
    return (
      <LandingPage 
        onNavigateToAuth={(mode) => {
          setInitialAuthMode(mode);
          setShowAuth(true);
        }} 
      />
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
