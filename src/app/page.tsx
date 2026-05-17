"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "@/components/providers/SidebarProvider";
import { AuthProvider, useAuth } from "@/components/providers/AuthProvider";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import DashboardContent from "@/components/dashboard/DashboardContent";
import WorkforceDashboard from "@/components/dashboard/WorkforceDashboard";
import ApprovalCenter from "@/components/dashboard/ApprovalCenter";
import HunterContent from "@/components/hunter/HunterContent";
import LeadsContent from "@/components/leads/LeadsContent";
import CanvasWorkflow from "@/components/workflows/CanvasWorkflow";
import ConversationsContent from "@/components/conversations/ConversationsContent";
import AnalyticsContent from "@/components/analytics/AnalyticsContent";
import CampaignsContent from "@/components/campaigns/CampaignsContent";
import CalendarContent from "@/components/calendar/CalendarContent";
import SettingsContent from "@/components/settings/SettingsContent";
import BillingContent from "@/components/billing/BillingContent";
import VideoContent from "@/components/video/VideoContent";
import { Zap, ShieldAlert, Key } from "lucide-react";

function AppContent() {
  const { isCollapsed, activeSection } = useSidebar();
  const { isAuthenticated, isLoading, loginWithOneClick } = useAuth();

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
      default:
        return <DashboardContent />;
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
            OMNI Secure Gatekeeper Verifying Session...
          </p>
        </div>
      </div>
    );
  }

  // Premium Sign-In Gate Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
        {/* Sleek Gradient Ambient Backdrops */}
        <div className="absolute top-10 left-10 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
        
        <div className="relative w-full max-w-md glass-card p-8 text-center space-y-8 z-10 border border-primary/20 hover:border-primary/30 transition-all duration-500 shadow-2xl shadow-primary/5">
          <div className="space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto shadow-lg shadow-primary/20 animate-bounce" style={{ animationDuration: '3s' }}>
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">OMNI-SIGMA <span className="gradient-text">360</span></h1>
              <p className="text-[10px] text-muted-foreground font-semibold tracking-widest uppercase mt-0.5">Secure AI Operations Hub</p>
            </div>
          </div>

          <div className="space-y-4 py-2">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Orchestrate your autonomous multi-agent workforce, publish video outlines, launch ad campaigns, and audit marketing funnels from one encrypted workspace.
            </p>
            <div className="p-3 bg-surface/50 border border-border rounded-xl text-[10px] text-muted-foreground flex items-center justify-center gap-2 leading-none">
              <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
              <span>Authorized FuelUpSkills executives only. All access is logged.</span>
            </div>
          </div>

          <button 
            onClick={loginWithOneClick}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-sm hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Key className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Secure One-Click Authorization
          </button>

          <div className="text-[9px] text-muted-foreground/60 border-t border-border pt-4 flex items-center justify-between">
            <span>Encrypted Connection (SSL)</span>
            <span>v2.4.0</span>
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
