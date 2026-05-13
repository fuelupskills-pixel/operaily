"use client";

import React from "react";
import { useSidebar } from "@/components/providers/SidebarProvider";
import {
  LayoutDashboard,
  Target,
  Users,
  Workflow,
  Megaphone,
  MessageSquare,
  CalendarDays,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
  Globe,
  Bot,
  CreditCard,
} from "lucide-react";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "hunter", label: "Lead Hunter", icon: Target, badge: "AI" },
  { id: "leads", label: "Leads", icon: Users },
  { id: "workflows", label: "Automations", icon: Workflow },
  { id: "conversations", label: "Conversations", icon: MessageSquare, badge: "3" },
  { id: "campaigns", label: "Ad Campaigns", icon: Megaphone },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "billing", label: "Payments", icon: CreditCard },
];

const bottomItems = [
  { id: "settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const { isCollapsed, toggle, activeSection, setActiveSection } = useSidebar();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-sidebar border-r border-border flex flex-col z-50 sidebar-transition ${
        isCollapsed ? "w-[68px]" : "w-[260px]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!isCollapsed && (
          <div className="animate-fade-in">
            <h1 className="text-sm font-bold tracking-tight gradient-text">OMNI-SIGMA</h1>
            <p className="text-[10px] text-muted-foreground font-medium tracking-widest">360 CRM</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? "bg-primary/10 text-primary glow-primary"
                  : "text-muted-foreground hover:bg-sidebar-hover hover:text-foreground"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full" />
              )}
              <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-primary" : "group-hover:text-foreground"}`} />
              {!isCollapsed && (
                <span className="truncate animate-fade-in">{item.label}</span>
              )}
              {!isCollapsed && item.badge && (
                <span
                  className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full animate-fade-in ${
                    item.badge === "AI"
                      ? "bg-primary/15 text-primary"
                      : "bg-danger/15 text-danger"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="py-3 px-2 border-t border-border space-y-1">
        {/* AI Status */}
        <div className={`flex items-center gap-3 px-3 py-2 rounded-xl bg-success/5 border border-success/10 ${isCollapsed ? "justify-center" : ""}`}>
          <div className="relative shrink-0">
            <Bot className="w-4 h-4 text-success" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-success rounded-full animate-pulse-glow" />
          </div>
          {!isCollapsed && (
            <div className="animate-fade-in">
              <p className="text-[11px] font-medium text-success">AI Agents Online</p>
              <p className="text-[10px] text-muted-foreground">5 agents ready</p>
            </div>
          )}
        </div>

        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-sidebar-hover hover:text-foreground"
              }`}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!isCollapsed && <span className="animate-fade-in">{item.label}</span>}
            </button>
          );
        })}

        {/* Collapse toggle */}
        <button
          onClick={toggle}
          className="w-full flex items-center justify-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:bg-sidebar-hover hover:text-foreground transition-all duration-200"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!isCollapsed && <span className="text-xs animate-fade-in">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
