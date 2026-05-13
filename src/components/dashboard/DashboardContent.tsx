"use client";

import React from "react";
import {
  Users,
  Target,
  TrendingUp,
  CalendarCheck,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Phone,
  Mail,
  MessageSquare,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "up" | "down";
  icon: React.ElementType;
  color: string;
  glowClass: string;
}

function StatCard({ title, value, change, changeType, icon: Icon, color, glowClass }: StatCardProps) {
  return (
    <div className={`glass-card p-5 stat-card ${glowClass}`}>
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold ${
          changeType === "up" ? "text-success" : "text-danger"
        }`}>
          {changeType === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {change}
        </div>
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{title}</p>
    </div>
  );
}

const stats: StatCardProps[] = [
  {
    title: "Total Leads",
    value: "12,847",
    change: "+23.5%",
    changeType: "up",
    icon: Users,
    color: "bg-primary/15 text-primary",
    glowClass: "",
  },
  {
    title: "Hot Leads (Score ≥70)",
    value: "3,421",
    change: "+18.2%",
    changeType: "up",
    icon: Target,
    color: "bg-danger/15 text-danger",
    glowClass: "",
  },
  {
    title: "Meetings Booked",
    value: "284",
    change: "+42.1%",
    changeType: "up",
    icon: CalendarCheck,
    color: "bg-success/15 text-success",
    glowClass: "",
  },
  {
    title: "Conversion Rate",
    value: "8.7%",
    change: "+1.4%",
    changeType: "up",
    icon: TrendingUp,
    color: "bg-accent/15 text-accent",
    glowClass: "",
  },
];

interface ActivityItem {
  id: string;
  type: "whatsapp" | "email" | "call" | "automation";
  icon: React.ElementType;
  title: string;
  desc: string;
  time: string;
  color: string;
}

const recentActivity: ActivityItem[] = [
  { id: "1", type: "whatsapp", icon: MessageSquare, title: "WhatsApp sent to Hans Mueller", desc: "AI personalized video for Pharma lead", time: "2m ago", color: "text-success" },
  { id: "2", type: "call", icon: Phone, title: "AI Voice Call completed", desc: "Schmidt Pharma GmbH — Meeting booked!", time: "15m ago", color: "text-accent" },
  { id: "3", type: "email", icon: Mail, title: "Email follow-up sent", desc: "Batch of 24 pharma importers in DE", time: "1h ago", color: "text-info" },
  { id: "4", type: "automation", icon: Zap, title: "Workflow triggered", desc: '"Pharma Germany Auto-Close" — 47 leads entered', time: "2h ago", color: "text-warning" },
  { id: "5", type: "whatsapp", icon: MessageSquare, title: "Reply received", desc: "Dr. Weber from MedImport AG — Interested!", time: "3h ago", color: "text-success" },
];

interface LeadRow {
  id: string;
  name: string;
  company: string;
  designation: string;
  score: number;
  status: string;
  statusColor: string;
  channel: string;
  country: string;
}

const topLeads: LeadRow[] = [
  { id: "1", name: "Hans Mueller", company: "BioPharm Import GmbH", designation: "CEO", score: 94, status: "Meeting Set", statusColor: "bg-success/15 text-success", channel: "WhatsApp", country: "🇩🇪" },
  { id: "2", name: "Dr. Anna Weber", company: "MedImport AG", designation: "Head of Procurement", score: 88, status: "Engaged", statusColor: "bg-primary/15 text-primary", channel: "Email", country: "🇩🇪" },
  { id: "3", name: "Klaus Schmidt", company: "Schmidt Pharma GmbH", designation: "Import Director", score: 85, status: "Qualified", statusColor: "bg-accent/15 text-accent", channel: "Voice", country: "🇩🇪" },
  { id: "4", name: "Maria Fischer", company: "EuroPharma Dist.", designation: "VP Operations", score: 79, status: "Contacted", statusColor: "bg-warning/15 text-warning", channel: "WhatsApp", country: "🇩🇪" },
  { id: "5", name: "Thomas Braun", company: "HealthBridge Int.", designation: "Managing Director", score: 76, status: "New", statusColor: "bg-muted text-muted-foreground", channel: "—", country: "🇩🇪" },
];

export default function DashboardContent() {
  return (
    <div className="space-y-6 stagger-children">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Good morning, <span className="gradient-text">Operator</span> 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          5 AI agents active • 47 workflows running • 3 leads need attention
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Leads Table */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold">Top Leads</h2>
              <p className="text-xs text-muted-foreground">Highest scoring leads this week</p>
            </div>
            <button className="text-xs font-medium text-primary hover:text-primary-hover transition-colors">
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border-subtle">
                  <th className="text-left px-5 py-3 font-medium">Lead</th>
                  <th className="text-left px-3 py-3 font-medium">Score</th>
                  <th className="text-left px-3 py-3 font-medium">Status</th>
                  <th className="text-left px-3 py-3 font-medium">Channel</th>
                </tr>
              </thead>
              <tbody>
                {topLeads.map((lead) => (
                  <tr key={lead.id} className="table-row-hover border-b border-border-subtle last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {lead.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{lead.country} {lead.name}</p>
                          <p className="text-xs text-muted-foreground">{lead.designation} · {lead.company}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              lead.score >= 90 ? "bg-success" : lead.score >= 80 ? "bg-primary" : lead.score >= 70 ? "bg-accent" : "bg-warning"
                            }`}
                            style={{ width: `${lead.score}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold">{lead.score}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`badge ${lead.statusColor}`}>{lead.status}</span>
                    </td>
                    <td className="px-3 py-3 text-xs text-muted-foreground">{lead.channel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold">Live Activity</h2>
              <p className="text-xs text-muted-foreground">Real-time agent updates</p>
            </div>
            <div className="w-2 h-2 bg-success rounded-full animate-pulse-glow" />
          </div>
          <div className="divide-y divide-border-subtle">
            {recentActivity.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="px-5 py-3.5 hover:bg-surface-hover transition-colors">
                  <div className="flex gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-surface flex items-center justify-center shrink-0 ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{item.desc}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 mt-0.5">{item.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Automation Performance */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold">Active Automations</h2>
            <p className="text-xs text-muted-foreground">Running workflow performance</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: "Pharma DE Auto-Close", leads: 47, sent: 142, replies: 23, meetings: 8, status: "Running" },
            { name: "SaaS USA Outreach", leads: 89, sent: 267, replies: 41, meetings: 12, status: "Running" },
            { name: "Real Estate UK Blast", leads: 31, sent: 93, replies: 14, meetings: 5, status: "Paused" },
            { name: "Fintech SEA Hunter", leads: 56, sent: 168, replies: 28, meetings: 9, status: "Running" },
          ].map((wf, i) => (
            <div key={i} className="bg-surface rounded-xl p-4 border border-border-subtle hover:border-border transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold truncate flex-1">{wf.name}</h3>
                <span className={`badge ml-2 ${wf.status === "Running" ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                  {wf.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-lg font-bold">{wf.leads}</p>
                  <p className="text-[10px] text-muted-foreground">Leads</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-primary">{wf.sent}</p>
                  <p className="text-[10px] text-muted-foreground">Messages</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-accent">{wf.replies}</p>
                  <p className="text-[10px] text-muted-foreground">Replies</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-success">{wf.meetings}</p>
                  <p className="text-[10px] text-muted-foreground">Meetings</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
