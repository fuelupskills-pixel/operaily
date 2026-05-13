"use client";

import React, { useState } from "react";
import {
  TrendingUp, Users, Target, Zap, Mail, MessageSquare, Phone,
  BarChart3, ArrowUpRight, Activity, Globe, DollarSign, Calendar,
} from "lucide-react";

const kpis = [
  { label: "Total Leads", value: "12,847", change: "+23.5%", icon: Users, color: "#6366f1" },
  { label: "Hot Leads", value: "3,421", change: "+18.2%", icon: Target, color: "#ef4444" },
  { label: "Meetings Booked", value: "284", change: "+42.1%", icon: Calendar, color: "#10b981" },
  { label: "Conversion Rate", value: "8.7%", change: "+1.4%", icon: TrendingUp, color: "#f59e0b" },
  { label: "Revenue Pipeline", value: "$2.4M", change: "+31.8%", icon: DollarSign, color: "#22d3ee" },
  { label: "AI Agent Actions", value: "47,392", change: "+56.3%", icon: Zap, color: "#a855f7" },
];

const funnelStages = [
  { stage: "Discovered", count: 12847, width: 100, color: "#6366f1" },
  { stage: "Contacted", count: 8920, width: 78, color: "#3b82f6" },
  { stage: "Engaged", count: 5234, width: 56, color: "#22d3ee" },
  { stage: "Qualified", count: 3421, width: 38, color: "#f59e0b" },
  { stage: "Meeting Set", count: 1247, width: 24, color: "#10b981" },
  { stage: "Proposal Sent", count: 689, width: 16, color: "#a855f7" },
  { stage: "Won", count: 284, width: 10, color: "#ef4444" },
];

const channelMetrics = [
  { channel: "WhatsApp", sent: 3420, replied: 1845, rate: "54.6%", icon: MessageSquare, color: "#25D366" },
  { channel: "Email", sent: 8920, replied: 2145, rate: "24.8%", icon: Mail, color: "#3b82f6" },
  { channel: "AI Voice", sent: 1247, replied: 623, rate: "52.8%", icon: Phone, color: "#06b6d4" },
  { channel: "SMS", sent: 2100, replied: 412, rate: "20.1%", icon: Phone, color: "#8b5cf6" },
];

const weeklyData = [
  { day: "Mon", leads: 142, meetings: 8 }, { day: "Tue", leads: 187, meetings: 12 },
  { day: "Wed", leads: 234, meetings: 15 }, { day: "Thu", leads: 198, meetings: 11 },
  { day: "Fri", leads: 267, meetings: 18 }, { day: "Sat", leads: 89, meetings: 4 },
  { day: "Sun", leads: 56, meetings: 2 },
];

const sourceAttribution = [
  { source: "Apollo.io", pct: 40.7, color: "#6366f1" },
  { source: "LinkedIn", pct: 29.9, color: "#3b82f6" },
  { source: "Web Scraper", pct: 16.6, color: "#f59e0b" },
  { source: "Manual", pct: 7.6, color: "#10b981" },
  { source: "Referral", pct: 5.1, color: "#a855f7" },
];

const topWorkflows = [
  { name: "Pharma DE Auto-Close", execs: 1247, success: 94.2, meetings: 142 },
  { name: "SaaS US Cold Outreach", execs: 892, success: 87.3, meetings: 89 },
  { name: "Real Estate UK Pipeline", execs: 634, success: 91.1, meetings: 67 },
  { name: "Fintech SG Nurture", execs: 423, success: 88.7, meetings: 38 },
];

const aiAgents = [
  { agent: "Auto-Closer", tasks: 12450, rate: 87.3, time: "2.1s" },
  { agent: "Lead Scorer", tasks: 34200, rate: 96.1, time: "0.8s" },
  { agent: "Content Gen", tasks: 8900, rate: 92.4, time: "4.2s" },
  { agent: "Voice Agent", tasks: 3420, rate: 78.9, time: "45s" },
  { agent: "Meeting Booker", tasks: 1890, rate: 91.2, time: "1.3s" },
];

type Period = "7d" | "30d" | "90d";

export default function AnalyticsContent() {
  const [period, setPeriod] = useState<Period>("30d");
  const maxL = Math.max(...weeklyData.map((d) => d.leads));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight"><span className="gradient-text">Analytics</span> 📊</h1>
          <p className="text-sm text-muted-foreground mt-1">Real-time performance across all channels</p>
        </div>
        <div className="flex bg-surface rounded-xl border border-border-subtle p-0.5">
          {(["7d","30d","90d"] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${period === p ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "90 Days"}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((k, i) => { const Icon = k.icon; return (
          <div key={i} className="glass-card p-4 hover:border-primary/20 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${k.color}15` }}><Icon className="w-4 h-4" style={{ color: k.color }} /></div>
              <span className="flex items-center gap-0.5 text-xs font-medium text-success"><ArrowUpRight className="w-3 h-3" />{k.change}</span>
            </div>
            <p className="text-xl font-bold">{k.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{k.label}</p>
          </div>
        ); })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Funnel */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-5"><Activity className="w-4 h-4 text-primary" /><h3 className="text-sm font-semibold">Lead Funnel</h3></div>
          <div className="space-y-2.5">
            {funnelStages.map((s, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1"><span className="text-xs font-medium">{s.stage}</span><span className="text-xs text-muted-foreground">{s.count.toLocaleString()}</span></div>
                <div className="h-6 bg-muted rounded-lg overflow-hidden">
                  <div className="h-full rounded-lg flex items-center justify-end pr-2" style={{ width: `${s.width}%`, background: s.color }}>
                    {s.width > 15 && <span className="text-[9px] font-bold text-white/80">{i > 0 ? `${Math.round((s.count / funnelStages[0].count) * 100)}%` : ""}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Chart */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /><h3 className="text-sm font-semibold">Weekly Performance</h3></div>
            <div className="flex gap-4"><span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-primary" />Leads</span><span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-success" />Meetings</span></div>
          </div>
          <div className="flex items-end gap-2 h-48">
            {weeklyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end gap-0.5 h-40">
                  <div className="flex-1 bg-primary/80 rounded-t-md hover:bg-primary transition-all" style={{ height: `${(d.leads / maxL) * 100}%` }} title={`${d.leads} leads`} />
                  <div className="flex-1 bg-success/80 rounded-t-md hover:bg-success transition-all" style={{ height: `${(d.meetings / maxL) * 100 * 3}%` }} title={`${d.meetings} meetings`} />
                </div>
                <span className="text-[10px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Channels */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-5"><Globe className="w-4 h-4 text-primary" /><h3 className="text-sm font-semibold">Channel Performance</h3></div>
          <div className="space-y-3">
            {channelMetrics.map((c, i) => { const Icon = c.icon; return (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-surface border border-border-subtle">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${c.color}15` }}><Icon className="w-4 h-4" style={{ color: c.color }} /></div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1"><span className="text-xs font-semibold">{c.channel}</span><span className="text-xs font-bold" style={{ color: c.color }}>{c.rate}</span></div>
                  <div className="flex gap-4 text-[10px] text-muted-foreground"><span>Sent: {c.sent.toLocaleString()}</span><span className="font-medium text-foreground">Replied: {c.replied.toLocaleString()}</span></div>
                  <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: c.rate, background: c.color }} /></div>
                </div>
              </div>
            ); })}
          </div>
        </div>

        {/* Source Donut */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-5"><Target className="w-4 h-4 text-primary" /><h3 className="text-sm font-semibold">Source Attribution</h3></div>
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {(() => { let off = 0; return sourceAttribution.map((s, i) => { const d = s.pct; const o = off; off += d; return <circle key={i} r="16" cx="18" cy="18" fill="none" stroke={s.color} strokeWidth="3" strokeDasharray={`${d} ${100-d}`} strokeDashoffset={-o} />; }); })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-lg font-bold">12.8K</span><span className="text-[9px] text-muted-foreground">Total</span></div>
            </div>
            <div className="space-y-2 flex-1">
              {sourceAttribution.map((s, i) => (
                <div key={i} className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} /><span className="text-xs flex-1">{s.source}</span><span className="text-xs font-semibold">{s.pct}%</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Workflows */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4"><Zap className="w-4 h-4 text-primary" /><h3 className="text-sm font-semibold">Top Workflows</h3></div>
          <div className="space-y-2">
            {topWorkflows.map((w, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-surface border border-border-subtle">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">#{i+1}</div>
                <div className="flex-1"><p className="text-xs font-semibold">{w.name}</p><p className="text-[10px] text-muted-foreground">{w.execs} executions</p></div>
                <div className="text-right"><p className="text-xs font-bold text-success">{w.success}%</p><p className="text-[10px] text-muted-foreground">{w.meetings} meetings</p></div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Agents */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4"><Zap className="w-4 h-4 text-accent" /><h3 className="text-sm font-semibold">AI Agent Performance</h3></div>
          <table className="w-full">
            <thead><tr className="text-[10px] text-muted-foreground uppercase"><th className="text-left pb-2 font-medium">Agent</th><th className="text-right pb-2 font-medium">Tasks</th><th className="text-right pb-2 font-medium">Success</th><th className="text-right pb-2 font-medium">Avg Time</th></tr></thead>
            <tbody>
              {aiAgents.map((a, i) => (
                <tr key={i} className="border-t border-border-subtle">
                  <td className="py-2.5 text-xs font-medium">{a.agent}</td>
                  <td className="py-2.5 text-xs text-right text-muted-foreground">{a.tasks.toLocaleString()}</td>
                  <td className="py-2.5 text-xs text-right"><span className={a.rate >= 90 ? "text-success" : a.rate >= 80 ? "text-primary" : "text-warning"}>{a.rate}%</span></td>
                  <td className="py-2.5 text-xs text-right text-muted-foreground">{a.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
