"use client";

import React from "react";
import { 
  Bot, 
  Search, 
  PenTool, 
  Share2, 
  Target, 
  ShieldCheck, 
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  AlertCircle,
  Video
} from "lucide-react";

const agents = [
  { id: "1", name: "Chief AI Ops", role: "Master Controller", department: "management", status: "working", icon: Bot, color: "text-primary", bg: "bg-primary/10" },
  { id: "2", name: "Trend Scout", role: "Trend Researcher", department: "research", status: "idle", icon: Search, color: "text-accent", bg: "bg-accent/10" },
  { id: "3", name: "Creative Copy", role: "Copywriting Agent", department: "content", status: "working", icon: PenTool, color: "text-success", bg: "bg-success/10" },
  { id: "4", name: "Social Pulse", role: "Publishing Agent", department: "social", status: "idle", icon: Share2, color: "text-info", bg: "bg-info/10" },
  { id: "5", name: "Lead Qual", role: "Qualification Agent", department: "sales", status: "offline", icon: Target, color: "text-warning", bg: "bg-warning/10" },
  { id: "6", name: "QC Director", role: "Quality Control", department: "qc", status: "working", icon: ShieldCheck, color: "text-danger", bg: "bg-danger/10" },
  { id: "7", name: "Video Director", role: "YouTube Strategy", department: "video", status: "idle", icon: Video, color: "text-primary", bg: "bg-primary/10" },
];

const recentTasks = [
  { id: "1", title: "Market Research: AI CRM Trends", agent: "Trend Scout", status: "completed", time: "12m ago" },
  { id: "2", title: "LinkedIn Post Generation", agent: "Creative Copy", status: "running", time: "2m ago" },
  { id: "3", title: "Lead Scoring Update", agent: "Lead Qual", status: "pending", time: "1h ago" },
  { id: "4", title: "Compliance Check: Ad Copy", agent: "QC Director", status: "failed", time: "30m ago" },
];

export default function WorkforceDashboard() {
  return (
    <div className="space-y-6 stagger-children">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Agent <span className="gradient-text">Workforce</span></h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and monitor your autonomous AI team.</p>
        </div>
        <button className="glass-button px-4 py-2 text-xs font-semibold flex items-center gap-2">
          <Activity className="w-4 h-4" />
          System Health: Optimal
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 border-l-4 border-primary">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">Active Agents</p>
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold">12 / 18</p>
          <div className="w-full h-1 bg-muted rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-primary w-[66%]" />
          </div>
        </div>
        <div className="glass-card p-5 border-l-4 border-success">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">Tasks Completed (24h)</p>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-bold">142</p>
          <p className="text-[10px] text-success mt-1 font-medium">+12% from yesterday</p>
        </div>
        <div className="glass-card p-5 border-l-4 border-accent">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground">Efficiency Gain</p>
            <TrendingUp className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-bold">84.2%</p>
          <p className="text-[10px] text-accent mt-1 font-medium">Humans saved ~120 hours</p>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const Icon = agent.icon;
          return (
            <div key={agent.id} className="glass-card p-5 group hover:border-primary/30 transition-all duration-300 relative overflow-hidden">
              <div className="flex items-start justify-between relative z-10">
                <div className={`w-12 h-12 rounded-2xl ${agent.bg} flex items-center justify-center ${agent.color} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    agent.status === 'working' ? 'bg-success/10 text-success' : 
                    agent.status === 'idle' ? 'bg-primary/10 text-primary' : 
                    'bg-muted text-muted-foreground'
                  }`}>
                    {agent.status}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1 capitalize">{agent.department}</p>
                </div>
              </div>
              <div className="mt-4 relative z-10">
                <h3 className="font-bold text-sm">{agent.name}</h3>
                <p className="text-xs text-muted-foreground">{agent.role}</p>
              </div>
              
              {/* Subtle background glow on hover */}
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${agent.bg}`} />
            </div>
          );
        })}
      </div>

      {/* Recent Activity Table */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">Recent Task Operations</h2>
          <button className="text-xs text-primary font-medium hover:underline">View Task Log</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-xs text-muted-foreground bg-surface/50">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Task</th>
                <th className="text-left px-3 py-3 font-medium">Assigned Agent</th>
                <th className="text-left px-3 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {recentTasks.map((task) => (
                <tr key={task.id} className="hover:bg-surface-hover transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium">{task.title}</p>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bot className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-xs">{task.agent}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1.5">
                      {task.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
                      {task.status === 'running' && <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />}
                      {task.status === 'pending' && <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
                      {task.status === 'failed' && <AlertCircle className="w-3.5 h-3.5 text-danger" />}
                      <span className={`text-[11px] font-medium capitalize ${
                        task.status === 'completed' ? 'text-success' : 
                        task.status === 'running' ? 'text-primary' : 
                        task.status === 'failed' ? 'text-danger' : 
                        'text-muted-foreground'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">
                    {task.time}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
