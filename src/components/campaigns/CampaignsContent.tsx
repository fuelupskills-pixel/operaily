"use client";

import React, { useState, useMemo } from "react";
import {
  Plus, Play, Pause, BarChart3, DollarSign, Image as ImageIcon, Video,
  TrendingUp, Target, Sparkles, Loader2, ToggleLeft, ToggleRight,
  Eye, MousePointerClick, MoreHorizontal
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

const initialCampaigns: Campaign[] = [
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
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState<"meta" | "google" | "tiktok">("meta");
  const [campaignName, setCampaignName] = useState("");
  const [campaignBudget, setCampaignBudget] = useState("");
  const [creativeType, setCreativeType] = useState<"image" | "video" | "carousel">("video");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [platformFilter, setPlatformFilter] = useState<"all" | "meta" | "google" | "tiktok">("all");

  const handleToggleStatus = (id: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus: Campaign["status"] = c.status === "active" ? "paused" : "active";
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim() || !campaignBudget) return;

    setIsGenerating(true);
    setGenerationStep("AI Agent generating copy variants...");

    setTimeout(() => {
      setGenerationStep("Creating ad creatives & layouts...");
      setTimeout(() => {
        setGenerationStep("Optimizing target bidding brackets...");
        setTimeout(() => {
          const newCampaign: Campaign = {
            id: Math.random().toString(),
            name: campaignName,
            platform: selectedPlatform,
            status: "active",
            budget: parseFloat(campaignBudget),
            spent: 0,
            impressions: 0,
            clicks: 0,
            conversions: 0,
            ctr: 0,
            cpc: 0,
            roas: 0,
            creativeType: creativeType,
            aiGenerated: true,
            startDate: new Date().toISOString().split("T")[0],
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          };

          setCampaigns(prev => [newCampaign, ...prev]);
          setIsGenerating(false);
          setShowCreate(false);
          setCampaignName("");
          setCampaignBudget("");
        }, 800);
      }, 800);
    }, 800);
  };

  // KPI calculations
  const totalBudget = useMemo(() => campaigns.reduce((s, c) => s + c.budget, 0), [campaigns]);
  const totalSpent = useMemo(() => campaigns.reduce((s, c) => s + c.spent, 0), [campaigns]);
  const totalConversions = useMemo(() => campaigns.reduce((s, c) => s + c.conversions, 0), [campaigns]);
  const avgRoas = useMemo(() => {
    const scored = campaigns.filter(c => c.roas > 0);
    return scored.length > 0 ? scored.reduce((s, c) => s + c.roas, 0) / scored.length : 0;
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    if (platformFilter === "all") return campaigns;
    return campaigns.filter(c => c.platform === platformFilter);
  }, [campaigns, platformFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight"><span className="gradient-text">AI Ad Suite</span> 📢</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Auto-generate and manage campaigns across Meta, Google & TikTok</p>
        </div>
        <button 
          onClick={() => { setShowCreate(!showCreate); setCampaignName(""); setCampaignBudget(""); }} 
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/20 text-white font-bold text-xs transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> 
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Create Campaign Panel */}
      {showCreate && (
        <form onSubmit={handleCreateCampaign} className="glass-card p-6 border border-primary/20 space-y-4 animate-fade-in">
          <div className="border-b border-border/40 pb-2 flex items-center justify-between">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Configure AI Campaign</span>
            </h3>
            <span className="text-[10px] text-muted-foreground">Setup target assets & channel sync</span>
          </div>

          {isGenerating ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-xs font-semibold text-foreground">{generationStep}</p>
              <p className="text-[10px] text-muted-foreground">Running live integrations callback...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(["meta", "google", "tiktok"] as const).map((p) => {
                  const isSelected = selectedPlatform === p;
                  return (
                    <button 
                      type="button"
                      key={p} 
                      onClick={() => setSelectedPlatform(p)} 
                      className={`p-3.5 rounded-xl border-2 transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                        isSelected 
                          ? `border-primary bg-primary/5 text-primary` 
                          : "border-border/50 hover:border-border text-muted-foreground bg-surface/50"
                      }`}
                    >
                      <span className={`badge ${platformStyles[p].bg} mb-1.5 inline-block uppercase text-[8px] font-bold tracking-wider`}>
                        {platformStyles[p].label}
                      </span>
                      <p className="text-[10px] text-muted-foreground leading-normal">
                        {p === "meta" ? "Facebook & Instagram" : p === "google" ? "Google Search & Display" : "TikTok Video Ads"}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Campaign Title</label>
                  <input 
                    required
                    placeholder="e.g. BioPharm EU Lead Accelerator" 
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-all" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Budget Limit ($)</label>
                  <input 
                    required
                    type="number" 
                    placeholder="e.g. 5000" 
                    value={campaignBudget}
                    onChange={(e) => setCampaignBudget(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block">Creative Visual Style</label>
                <div className="flex gap-2">
                  {(["image", "video", "carousel"] as const).map((type) => (
                    <button
                      type="button"
                      key={type}
                      onClick={() => setCreativeType(type)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize cursor-pointer ${
                        creativeType === type 
                          ? "bg-primary text-white border-primary" 
                          : "bg-surface border-border hover:bg-surface-hover text-muted-foreground"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                <button 
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" /> 
                  <span>Generate AI Creatives & Launch</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setShowCreate(false)} 
                  className="px-4 py-2 bg-surface border border-border rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </form>
      )}

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Budget", value: `$${totalBudget.toLocaleString()}`, icon: DollarSign, color: "#6366f1" },
          { label: "Total Spent", value: `$${totalSpent.toLocaleString()}`, icon: TrendingUp, color: "#3b82f6" },
          { label: "Conversions", value: totalConversions.toLocaleString(), icon: Target, color: "#10b981" },
          { label: "Avg ROAS", value: `${avgRoas.toFixed(1)}x`, icon: BarChart3, color: "#f59e0b" },
        ].map((k, i) => { 
          const Icon = k.icon; 
          return (
            <div key={i} className="glass-card p-4 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${k.color}15` }}>
                  <Icon className="w-4 h-4" style={{ color: k.color }} />
                </div>
              </div>
              <p className="text-lg font-bold text-foreground">{k.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-0.5">{k.label}</p>
            </div>
          ); 
        })}
      </div>

      {/* Campaigns Table Panel */}
      <div className="glass-card border border-border/50">
        <div className="p-4 border-b border-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Active Advertising Campaigns</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">Manage live ads copy and track performance statistics.</p>
          </div>

          {/* Platform filter tags */}
          <div className="flex bg-surface border border-border p-0.5 rounded-lg text-[9px] font-bold">
            {(["all", "meta", "google", "tiktok"] as const).map(p => (
              <button
                key={p}
                onClick={() => setPlatformFilter(p)}
                className={`px-2.5 py-1 rounded capitalize transition-all cursor-pointer ${
                  platformFilter === p 
                    ? "bg-primary/20 text-primary font-bold" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "all" ? "All" : p === "meta" ? "Meta" : p === "google" ? "Google" : "TikTok"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] text-muted-foreground border-b border-border/40 uppercase font-bold tracking-wider">
                <th className="px-5 py-3">Campaign</th>
                <th className="px-3 py-3">Platform</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3 text-right">Budget</th>
                <th className="px-3 py-3 text-right">Spent</th>
                <th className="px-3 py-3 text-right">Impressions</th>
                <th className="px-3 py-3 text-right">CTR</th>
                <th className="px-3 py-3 text-right">Conv.</th>
                <th className="px-3 py-3 text-right">ROAS</th>
                <th className="px-3 py-3 text-center">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-xs">
              {filteredCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-muted-foreground">
                    No active campaigns matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCampaigns.map((c) => (
                  <tr key={c.id} className="table-row-hover">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          {c.creativeType === "video" ? <Video className="w-3.5 h-3.5 text-primary" /> : <ImageIcon className="w-3.5 h-3.5 text-primary" />}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{c.name}</p>
                          {c.aiGenerated && <span className="text-[9px] text-accent flex items-center gap-0.5 mt-0.5">✨ AI Generated</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`badge ${platformStyles[c.platform].bg} text-[9px] font-bold uppercase tracking-wider`}>
                        {platformStyles[c.platform].label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`badge ${statusStyles[c.status]} text-[9px] font-bold uppercase`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-right font-medium text-foreground">${c.budget.toLocaleString()}</td>
                    <td className="px-3 py-3 text-xs text-right text-muted-foreground">
                      ${c.spent.toLocaleString()}
                      {c.budget > 0 && (
                        <div className="w-12 h-1 bg-muted rounded-full overflow-hidden mt-1 ml-auto">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(c.spent / c.budget) * 100}%` }} />
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-right text-muted-foreground">
                      {c.impressions > 0 ? `${(c.impressions / 1000).toFixed(1)}K` : "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-right">
                      {c.ctr > 0 ? <span className="text-success font-semibold">{c.ctr}%</span> : "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-right font-semibold text-foreground">
                      {c.conversions > 0 ? c.conversions.toLocaleString() : "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-right font-bold">
                      {c.roas > 0 ? (
                        <span className={c.roas >= 4 ? "text-success" : c.roas >= 3 ? "text-primary" : "text-warning"}>
                          {c.roas}x
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button 
                        onClick={() => handleToggleStatus(c.id)}
                        className="p-1 rounded hover:bg-surface-hover transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                        title={c.status === "active" ? "Pause Campaign" : "Activate Campaign"}
                      >
                        {c.status === "active" ? (
                          <ToggleRight className="w-5 h-5 text-success" />
                        ) : (
                          <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
