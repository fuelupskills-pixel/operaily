"use client";

import React, { useState } from "react";
import {
  Plus, Play, Pause, BarChart3, DollarSign, Eye, MousePointerClick,
  TrendingUp, Filter, ArrowUpRight, Loader2, Sparkles,
  Target, Globe, Image, Video, Type, MoreHorizontal,
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  platform: "meta" | "google" | "tiktok";
  status: "active" | "paused" | "draft" | "completed";
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
  creativeType: "image" | "video" | "carousel";
  aiGenerated: boolean;
  startDate: string;
  endDate: string;
}

const campaigns: Campaign[] = [
  { id: "1", name: "Pharma DE - Decision Makers", platform: "meta", status: "active", budget: 5000, spent: 3240, impressions: 145200, clicks: 3420, conversions: 89, ctr: 2.36, cpc: 0.95, roas: 4.2, creativeType: "video", aiGenerated: true, startDate: "2026-04-15", endDate: "2026-05-15" },
  { id: "2", name: "SaaS US - Lookalike Audience", platform: "google", status: "active", budget: 8000, spent: 5670, impressions: 234500, clicks: 5890, conversions: 134, ctr: 2.51, cpc: 0.96, roas: 3.8, creativeType: "image", aiGenerated: true, startDate: "2026-04-01", endDate: "2026-05-31" },
  { id: "3", name: "Real Estate UK - Video Ads", platform: "tiktok", status: "paused", budget: 3000, spent: 1890, impressions: 89400, clicks: 2340, conversions: 45, ctr: 2.62, cpc: 0.81, roas: 3.1, creativeType: "video", aiGenerated: true, startDate: "2026-04-10", endDate: "2026-05-10" },
  { id: "4", name: "Fintech SG - Retargeting", platform: "meta", status: "active", budget: 2500, spent: 1120, impressions: 67800, clicks: 1890, conversions: 56, ctr: 2.79, cpc: 0.59, roas: 5.1, creativeType: "carousel", aiGenerated: false, startDate: "2026-05-01", endDate: "2026-05-31" },
  { id: "5", name: "EV China - Brand Awareness", platform: "google", status: "draft", budget: 10000, spent: 0, impressions: 0, clicks: 0, conversions: 0, ctr: 0, cpc: 0, roas: 0, creativeType: "video", aiGenerated: true, startDate: "2026-05-20", endDate: "2026-06-20" },
];

const platformStyles: Record<string, { color: string; bg: string; label: string }> = {
  meta: { color: "#1877F2", bg: "bg-[#1877F2]/10 text-[#1877F2]", label: "Meta" },
  google: { color: "#34A853", bg: "bg-[#34A853]/10 text-[#34A853]", label: "Google" },
  tiktok: { color: "#FE2C55", bg: "bg-[#FE2C55]/10 text-[#FE2C55]", label: "TikTok" },
};

const statusStyles: Record<string, string> = {
  active: "bg-success/15 text-success",
  paused: "bg-warning/15 text-warning",
  draft: "bg-muted text-muted-foreground",
  completed: "bg-primary/15 text-primary",
};

export default function CampaignsContent() {
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const totalBudget = campaigns.reduce((s, c) => s + c.budget, 0);
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
  const avgRoas = campaigns.filter(c => c.roas > 0).reduce((s, c) => s + c.roas, 0) / campaigns.filter(c => c.roas > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight"><span className="gradient-text">AI Ad Suite</span> 📢</h1>
          <p className="text-sm text-muted-foreground mt-1">Auto-generate and manage campaigns across Meta, Google & TikTok</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm hover:opacity-90 transition-all">
          <Plus className="w-4 h-4" /> Create Campaign
        </button>
      </div>

      {/* Create Campaign Panel */}
      {showCreate && (
        <div className="glass-card p-6 gradient-border animate-fade-in">
          <h3 className="text-sm font-semibold mb-4">New AI Campaign</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {(["meta", "google", "tiktok"] as const).map((p) => (
              <button key={p} onClick={() => setSelectedPlatform(p)} className={`p-4 rounded-xl border-2 transition-all text-center ${selectedPlatform === p ? `border-[${platformStyles[p].color}]` : "border-border-subtle hover:border-border"}`}>
                <span className={`badge ${platformStyles[p].bg} mb-2 inline-block`}>{platformStyles[p].label}</span>
                <p className="text-xs text-muted-foreground">{p === "meta" ? "Facebook & Instagram" : p === "google" ? "Search & Display" : "Short-Form Video"}</p>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input placeholder="Campaign Name" className="w-full px-4 py-3 bg-input border border-input-border rounded-xl text-sm input-focus" />
            <input type="number" placeholder="Budget ($)" className="w-full px-4 py-3 bg-input border border-input-border rounded-xl text-sm input-focus" />
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold hover:opacity-90"><Sparkles className="w-4 h-4" /> Generate AI Creatives</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Budget", value: `$${(totalBudget / 1000).toFixed(1)}K`, icon: DollarSign, color: "#6366f1" },
          { label: "Total Spent", value: `$${(totalSpent / 1000).toFixed(1)}K`, icon: TrendingUp, color: "#3b82f6" },
          { label: "Conversions", value: totalConversions.toString(), icon: Target, color: "#10b981" },
          { label: "Avg ROAS", value: `${avgRoas.toFixed(1)}x`, icon: BarChart3, color: "#f59e0b" },
        ].map((k, i) => { const Icon = k.icon; return (
          <div key={i} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${k.color}15` }}><Icon className="w-4 h-4" style={{ color: k.color }} /></div>
            </div>
            <p className="text-xl font-bold">{k.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase">{k.label}</p>
          </div>
        ); })}
      </div>

      {/* Campaigns Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="text-xs text-muted-foreground border-b border-border">
              <th className="text-left px-5 py-3 font-medium">Campaign</th>
              <th className="text-left px-3 py-3 font-medium">Platform</th>
              <th className="text-left px-3 py-3 font-medium">Status</th>
              <th className="text-right px-3 py-3 font-medium">Budget</th>
              <th className="text-right px-3 py-3 font-medium">Spent</th>
              <th className="text-right px-3 py-3 font-medium">Impressions</th>
              <th className="text-right px-3 py-3 font-medium">CTR</th>
              <th className="text-right px-3 py-3 font-medium">Conv.</th>
              <th className="text-right px-3 py-3 font-medium">ROAS</th>
              <th className="px-3 py-3"></th>
            </tr></thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="table-row-hover border-b border-border-subtle last:border-0 group">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        {c.creativeType === "video" ? <Video className="w-3.5 h-3.5 text-primary" /> : c.creativeType === "carousel" ? <Image className="w-3.5 h-3.5 text-primary" /> : <Image className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <div>
                        <p className="text-xs font-semibold">{c.name}</p>
                        {c.aiGenerated && <span className="text-[9px] text-accent">✨ AI Generated</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3"><span className={`badge ${platformStyles[c.platform].bg}`}>{platformStyles[c.platform].label}</span></td>
                  <td className="px-3 py-3"><span className={`badge ${statusStyles[c.status]}`}>{c.status}</span></td>
                  <td className="px-3 py-3 text-xs text-right font-medium">${c.budget.toLocaleString()}</td>
                  <td className="px-3 py-3 text-xs text-right text-muted-foreground">
                    ${c.spent.toLocaleString()}
                    {c.budget > 0 && <div className="w-12 h-1 bg-muted rounded-full overflow-hidden mt-1 ml-auto"><div className="h-full bg-primary rounded-full" style={{ width: `${(c.spent / c.budget) * 100}%` }} /></div>}
                  </td>
                  <td className="px-3 py-3 text-xs text-right text-muted-foreground">{c.impressions > 0 ? `${(c.impressions / 1000).toFixed(1)}K` : "—"}</td>
                  <td className="px-3 py-3 text-xs text-right">{c.ctr > 0 ? <span className="text-success">{c.ctr}%</span> : "—"}</td>
                  <td className="px-3 py-3 text-xs text-right font-semibold">{c.conversions || "—"}</td>
                  <td className="px-3 py-3 text-xs text-right font-bold">{c.roas > 0 ? <span className={c.roas >= 4 ? "text-success" : c.roas >= 3 ? "text-primary" : "text-warning"}>{c.roas}x</span> : "—"}</td>
                  <td className="px-3 py-3"><button className="p-1.5 rounded-lg hover:bg-surface-hover opacity-0 group-hover:opacity-100 transition-all"><MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
