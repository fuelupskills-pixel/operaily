"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSidebar } from "@/components/providers/SidebarProvider";
import {
  Search, Bell, Plus, Globe, Command,
  User, Settings, LogOut, ChevronDown, Shield, Moon,
} from "lucide-react";

export default function TopBar() {
  const { isCollapsed, setActiveSection } = useSidebar();
  const [showProfile, setShowProfile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-background/80 backdrop-blur-xl border-b border-border z-40 flex items-center justify-between px-6 transition-all duration-300 ${
        isCollapsed ? "left-[68px]" : "left-[260px]"
      }`}
    >
      {/* Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads, workflows, campaigns..."
            className="w-full pl-10 pr-16 py-2 bg-input border border-input-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground input-focus"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-muted-foreground">
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-muted rounded border border-border">
              <Command className="w-2.5 h-2.5 inline" />
            </kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-muted rounded border border-border">K</kbd>
          </div>
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Region selector */}
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-all">
          <Globe className="w-4 h-4" />
          <span className="text-xs font-medium">Global</span>
        </button>

        {/* Quick add */}
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all text-sm font-medium">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Lead</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-all">
          <Bell className="w-[18px] h-[18px]" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full animate-pulse-glow" />
        </button>

        {/* Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 ml-1 group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
              OP
            </div>
            <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${showProfile ? "rotate-180" : ""}`} />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-72 glass-card p-0 overflow-hidden shadow-2xl animate-fade-in z-50">
              {/* Profile Header */}
              <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-sm font-bold">OP</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">Operator Admin</p>
                    <p className="text-[10px] text-muted-foreground truncate">admin@operaily.com</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-success" />
                      <span className="text-[9px] text-success font-medium">Online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-1.5">
                <button
                  onClick={() => { setActiveSection("settings"); setShowProfile(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-surface-hover transition-colors"
                >
                  <User className="w-4 h-4 text-primary" /> Edit Profile
                </button>
                <button
                  onClick={() => { setActiveSection("settings"); setShowProfile(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-surface-hover transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" /> Settings
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-surface-hover transition-colors">
                  <Shield className="w-4 h-4 text-muted-foreground" /> Security
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-foreground hover:bg-surface-hover transition-colors">
                  <Moon className="w-4 h-4 text-muted-foreground" /> Dark Mode
                  <span className="ml-auto badge bg-success/15 text-success text-[9px]">ON</span>
                </button>
              </div>

              {/* Footer */}
              <div className="p-1.5 border-t border-border">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-danger hover:bg-danger/10 transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
