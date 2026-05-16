"use client";

import React, { useState } from "react";
import {
  Play, BarChart3, TrendingUp, Users, 
  Clock, Plus, ArrowUpRight, Search, Filter,
  FileText, Sparkles, Settings, Share2, MoreHorizontal,
  Video
} from "lucide-react";

const stats = [
  { label: "Total Views", value: "1.2M", change: "+12.5%", icon: Play, color: "text-red-500" },
  { label: "Watch Time (h)", value: "45.2K", change: "+8.2%", icon: Clock, color: "text-primary" },
  { label: "Subscribers", value: "82.4K", change: "+5.1%", icon: Users, color: "text-accent" },
  { label: "Avg. Retention", value: "68%", change: "+2.4%", icon: TrendingUp, color: "text-success" },
];

const videos = [
  { id: "1", title: "How to Scale your CRM with AI", views: "125K", engagement: "92%", status: "Live", thumbnail: "CRM Scale" },
  { id: "2", title: "Automating Lead Gen: A Guide", views: "82K", engagement: "88%", status: "Live", thumbnail: "Lead Gen" },
  { id: "3", title: "Next-Gen Marketing Trends 2026", views: "45K", engagement: "95%", status: "Processing", thumbnail: "2026 Trends" },
];

export default function VideoContent() {
  const [activeTab, setActiveSection] = useState<'analytics' | 'production'>('analytics');

  return (
    <div className="space-y-6 stagger-children">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Video <span className="gradient-text">Studio</span> 🎬</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your YouTube channel and AI-generated video production.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="glass-button px-4 py-2 text-xs font-semibold flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Connect Channel
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm hover:opacity-90 transition-all">
            <Plus className="w-4 h-4" /> New Production
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface/50 border border-border rounded-xl w-fit">
        <button 
          onClick={() => setActiveSection('analytics')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'analytics' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Channel Analytics
        </button>
        <button 
          onClick={() => setActiveSection('production')}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'production' ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Production Queue
        </button>
      </div>

      {activeTab === 'analytics' ? (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="glass-card p-5 group hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-surface/80 border border-border group-hover:border-primary/20`}>
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">{stat.change}</span>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Main Analytics Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-sm">Performance Overview</h3>
                <div className="flex gap-2">
                  <button className="p-1.5 rounded-lg border border-border hover:bg-surface-hover"><TrendingUp className="w-4 h-4 text-muted-foreground" /></button>
                  <button className="p-1.5 rounded-lg border border-border hover:bg-surface-hover"><BarChart3 className="w-4 h-4 text-muted-foreground" /></button>
                </div>
              </div>
              <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-xl bg-surface/30">
                <p className="text-xs text-muted-foreground italic">Interactive Chart Area: [Channel Growth vs Engagement]</p>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold text-sm mb-4">Top Performing Videos</h3>
              <div className="space-y-4">
                {videos.map((video) => (
                  <div key={video.id} className="flex items-center gap-3 group">
                    <div className="w-16 h-10 rounded-lg bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground overflow-hidden border border-border group-hover:border-primary/30 transition-all shrink-0">
                      IMG
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{video.title}</p>
                      <p className="text-[10px] text-muted-foreground">{video.views} views · {video.engagement} engagement</p>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2 text-[11px] font-semibold border border-border rounded-xl hover:bg-surface-hover transition-colors">View All Content</button>
            </div>
          </div>
        </>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between bg-surface/30">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input placeholder="Search production..." className="pl-9 pr-4 py-1.5 bg-input border border-input-border rounded-lg text-xs w-64 focus:ring-1 focus:ring-primary outline-none transition-all" />
              </div>
              <button className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                <Filter className="w-3.5 h-3.5" /> Filter
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-muted-foreground">Sorted by Newest</span>
            </div>
          </div>
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-bold">Production Pipeline Empty</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">Start a new production task to have the Video Director generate scripts and metadata.</p>
            </div>
            <button className="px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-all">Launch AI Director</button>
          </div>
        </div>
      )}
    </div>
  );
}
