"use client";

import React from "react";
import { SidebarProvider, useSidebar } from "@/components/providers/SidebarProvider";
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

function AppContent() {
  const { isCollapsed, activeSection } = useSidebar();

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
    <SidebarProvider>
      <AppContent />
    </SidebarProvider>
  );
}
