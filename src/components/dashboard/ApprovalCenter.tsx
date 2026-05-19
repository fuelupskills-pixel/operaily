"use client";

import React, { useState } from "react";
import { 
  CheckCircle, 
  XCircle, 
  Edit3, 
  FileText, 
  Share2, 
  Camera, 
  Globe, 
  Search,
  CheckCircle2,
  Sparkles,
  Check
} from "lucide-react";

interface ApprovalItem {
  id: string;
  type: "copy" | "research_report";
  title: string;
  agent: "Creative Copy" | "Trend Scout";
  content: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    summary?: string;
    top_topics?: string[];
  };
  created_at: string;
}

const initialApprovals: ApprovalItem[] = [
  { 
    id: "1", 
    type: "copy", 
    title: "LinkedIn Post: AI in Logistics", 
    agent: "Creative Copy",
    content: {
      linkedin: "The future of logistics is not just automated; it's intelligent. OMNI-SIGMA 360 is leading the charge... #Logistics #AI #SaaS",
      instagram: "Intelligent logistics. Period. 🚀 #AI #OMNISIGMA",
      twitter: "AI is reshaping logistics. Here's how 🧵 1/5..."
    },
    created_at: "1h ago"
  },
  { 
    id: "2", 
    type: "research_report", 
    title: "Market Trend Report: Healthcare Tech", 
    agent: "Trend Scout",
    content: {
      summary: "Healthcare tech is shifting towards patient-centric AI. Key trends include remote monitoring and predictive diagnostics.",
      top_topics: ["Remote Monitoring", "Predictive Diagnostics", "Patient Data Security"]
    },
    created_at: "2h ago"
  },
];

export default function ApprovalCenter() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(initialApprovals);
  const [selectedId, setSelectedId] = useState<string | null>("1");
  const [toastMsg, setToastMsg] = useState<{ type: "success" | "info"; text: string } | null>(null);

  const selected = approvals.find(a => a.id === selectedId);

  const handleAction = (id: string, action: "approve" | "reject") => {
    const item = approvals.find(a => a.id === id);
    if (!item) return;

    // Filter out the item
    const remaining = approvals.filter(a => a.id !== id);
    setApprovals(remaining);

    // Show toast message
    setToastMsg({
      type: action === "approve" ? "success" : "info",
      text: action === "approve" 
        ? `"${item.title}" successfully approved and published!`
        : `"${item.title}" rejected and returned to AI Agent for adjustments.`
    });

    // Automatically clear toast after 4s
    setTimeout(() => setToastMsg(null), 4000);

    // Select the next item
    if (remaining.length > 0) {
      setSelectedId(remaining[0].id);
    } else {
      setSelectedId(null);
    }
  };

  return (
    <div className="space-y-6 stagger-children">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">
          Quality Control <span className="gradient-text">& Approvals</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Review and approve AI-generated artifacts before they are published.
        </p>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in shadow-lg ${
          toastMsg.type === "success" 
            ? "bg-success/15 border-success/30 text-success" 
            : "bg-warning/15 border-warning/30 text-warning"
        }`}>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            toastMsg.type === "success" ? "bg-success/20" : "bg-warning/20"
          }`}>
            {toastMsg.type === "success" ? <Check className="w-4 h-4 text-success" /> : <XCircle className="w-4 h-4 text-warning" />}
          </div>
          <div className="flex-1 text-xs font-semibold leading-normal">
            {toastMsg.text}
          </div>
          <button 
            onClick={() => setToastMsg(null)}
            className="text-[10px] uppercase font-bold underline hover:no-underline opacity-80 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* Sidebar: Pending List */}
        <div className="glass-card flex flex-col overflow-hidden border border-border/50">
          <div className="p-4 border-b border-border/40 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Queue ({approvals.length})</h2>
            {approvals.length > 0 && (
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
              </div>
            )}
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border/20">
            {approvals.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                All reviewed! No pending items.
              </div>
            ) : (
              approvals.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full p-4 text-left hover:bg-surface-hover transition-all flex gap-3 items-start ${
                    selectedId === item.id ? "bg-primary/5 border-l-2 border-l-primary" : ""
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    item.type === "copy" ? "bg-success/10 text-success" : "bg-accent/10 text-accent"
                  }`}>
                    {item.type === "copy" ? <FileText className="w-4 h-4" /> : <Search className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate text-foreground">{item.title}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] text-muted-foreground">{item.agent}</span>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="text-[10px] text-muted-foreground">{item.created_at}</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-2 glass-card flex flex-col overflow-hidden relative border border-border/50">
          {selected ? (
            <>
              {/* Toolbar */}
              <div className="p-4 border-b border-border/40 flex items-center justify-between bg-surface/30 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">{selected.title}</h3>
                    <p className="text-[10px] text-muted-foreground">Generated by {selected.agent}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-surface-hover rounded-lg transition-all cursor-pointer" title="Edit Content">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <div className="w-px h-4 bg-border/40 mx-1" />
                  <button 
                    onClick={() => handleAction(selected.id, "reject")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-danger/10 text-danger hover:bg-danger hover:text-white border border-danger/20 text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                  <button 
                    onClick={() => handleAction(selected.id, "approve")}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 text-[10px] font-bold rounded-lg transition-all cursor-pointer shadow-md shadow-primary/15"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve & Publish
                  </button>
                </div>
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {selected.type === "copy" && (
                  <div className="grid grid-cols-1 gap-6">
                    {/* LinkedIn Preview */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-primary">
                        <Share2 className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">LinkedIn Draft</span>
                      </div>
                      <div className="p-4 bg-surface/50 border border-border/40 rounded-xl text-xs leading-relaxed whitespace-pre-wrap italic text-foreground/95">
                        &ldquo;{selected.content.linkedin}&rdquo;
                      </div>
                    </div>

                    {/* Instagram Preview */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-accent">
                        <Camera className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Instagram Caption</span>
                      </div>
                      <div className="p-4 bg-surface/50 border border-border/40 rounded-xl text-xs leading-relaxed italic text-foreground/95">
                        &ldquo;{selected.content.instagram}&rdquo;
                      </div>
                    </div>

                    {/* Twitter Preview */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-info">
                        <Globe className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Twitter Thread</span>
                      </div>
                      <div className="p-4 bg-surface/50 border border-border/40 rounded-xl text-xs leading-relaxed italic text-foreground/95">
                        &ldquo;{selected.content.twitter}&rdquo;
                      </div>
                    </div>
                  </div>
                )}

                {selected.type === "research_report" && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-accent">
                      <Search className="w-4 h-4" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Intelligence Report</span>
                    </div>
                    <div className="p-6 bg-surface/50 border border-border/40 rounded-xl space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-foreground mb-1.5">Executive Summary</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{selected.content.summary}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-foreground mb-2">Key Trends Detected</h4>
                        <div className="flex flex-wrap gap-2">
                          {selected.content.top_topics?.map((topic: string, i: number) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mb-4 text-success">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <p className="text-xs font-bold text-foreground">All Clear!</p>
              <p className="text-[11px] text-muted-foreground mt-1">No tasks currently awaiting approval.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
