"use client";

import React, { useState, useEffect } from "react";
import {
  X, MessageSquare, Mail, Send, Loader2, CheckCircle2,
  Copy, ExternalLink, ChevronDown, Sparkles, Calendar,
} from "lucide-react";

interface LeadInfo {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  companyName: string | null;
  country: string | null;
  city: string | null;
  designation: string | null;
  industry: string | null;
}

interface Template {
  id: string;
  name: string;
  channel: "whatsapp" | "email";
  industry: string;
  subject?: string;
  body: string;
  calendarLink: string;
}

interface SendMessageModalProps {
  lead: LeadInfo;
  isOpen: boolean;
  onClose: () => void;
  defaultChannel?: "whatsapp" | "email";
}

export default function SendMessageModal({ lead, isOpen, onClose, defaultChannel = "whatsapp" }: SendMessageModalProps) {
  const [channel, setChannel] = useState<"whatsapp" | "email">(defaultChannel);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewBody, setPreviewBody] = useState("");
  const [previewSubject, setPreviewSubject] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setSent(false);
    setCopied(false);
    fetchTemplates();
  }, [isOpen, channel, lead.industry]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`/api/templates?industry=${lead.industry || "pharmaceutical"}&channel=${channel}`);
      const data = await res.json();
      if (data.templates?.length > 0) {
        setTemplates(data.templates);
        selectTemplate(data.templates[0]);
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    }
  };

  const selectTemplate = (tmpl: Template) => {
    setSelectedTemplate(tmpl);
    let body = tmpl.body;
    let subject = tmpl.subject || "";
    const vars: Record<string, string> = {
      firstName: lead.firstName || "", lastName: lead.lastName || "",
      companyName: lead.companyName || "", country: lead.country || "",
      city: lead.city || "", designation: lead.designation || "",
      calendarLink: tmpl.calendarLink,
    };
    for (const [k, v] of Object.entries(vars)) {
      body = body.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v);
      subject = subject.replace(new RegExp(`\\{\\{${k}\\}\\}`, "g"), v);
    }
    setPreviewBody(body);
    setPreviewSubject(subject);
  };

  const handleSend = async () => {
    if (!selectedTemplate) return;
    setIsSending(true);
    try {
      await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId: selectedTemplate.id, lead, customBody: previewBody }),
      });
      setSent(true);
    } catch {
      alert("Failed to send");
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = () => {
    const text = channel === "email" ? `Subject: ${previewSubject}\n\n${previewBody.replace(/<[^>]*>/g, "")}` : previewBody;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl max-h-[85vh] glass-card overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              {channel === "whatsapp" ? <MessageSquare className="w-4 h-4 text-[#25D366]" /> : <Mail className="w-4 h-4 text-primary" />}
            </div>
            <div>
              <p className="text-sm font-semibold">Send to {lead.firstName} {lead.lastName}</p>
              <p className="text-[10px] text-muted-foreground">{lead.designation} at {lead.companyName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-surface-hover"><X className="w-4 h-4" /></button>
        </div>

        {/* Channel Tabs */}
        <div className="flex gap-1 px-5 pt-3">
          <button onClick={() => setChannel("whatsapp")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${channel === "whatsapp" ? "bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30" : "text-muted-foreground hover:text-foreground"}`}>
            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
          </button>
          <button onClick={() => setChannel("email")} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${channel === "email" ? "bg-primary/10 text-primary border border-primary/30" : "text-muted-foreground hover:text-foreground"}`}>
            <Mail className="w-3.5 h-3.5" /> Email
          </button>
        </div>

        {/* Template Selector */}
        <div className="px-5 pt-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Template</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {templates.map((t) => (
              <button key={t.id} onClick={() => selectTemplate(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${selectedTemplate?.id === t.id ? "bg-primary/10 text-primary border border-primary/30" : "bg-surface border border-border-subtle hover:border-border"}`}>
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {channel === "email" && previewSubject && (
            <div className="mb-3 p-3 bg-surface rounded-xl border border-border-subtle">
              <p className="text-[10px] text-muted-foreground uppercase mb-1">Subject</p>
              <p className="text-sm font-medium">{previewSubject}</p>
            </div>
          )}

          {channel === "whatsapp" ? (
            <div className="bg-[#0b141a] rounded-2xl p-4 border border-[#25D366]/10">
              <div className="bg-[#005c4b] rounded-xl p-3 ml-8 relative">
                <div className="absolute -right-1 top-0 w-3 h-3 bg-[#005c4b]" style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
                <pre className="text-[13px] text-white/90 whitespace-pre-wrap font-sans leading-relaxed">{previewBody}</pre>
                <p className="text-[10px] text-white/40 text-right mt-1">Just now ✓✓</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-4 border border-border-subtle">
              <div dangerouslySetInnerHTML={{ __html: previewBody }} />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border">
          <div className="flex items-center gap-2">
            <button onClick={handleCopy} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-surface border border-border-subtle hover:border-border transition-colors">
              {copied ? <CheckCircle2 className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            <a href={selectedTemplate?.calendarLink} target="_blank" className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-surface border border-border-subtle hover:border-border transition-colors">
              <Calendar className="w-3 h-3" /> Calendar Link
            </a>
          </div>
          {sent ? (
            <div className="flex items-center gap-2 text-success text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" /> Message Sent!
            </div>
          ) : (
            <button onClick={handleSend} disabled={isSending} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50">
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {isSending ? "Sending..." : `Send via ${channel === "whatsapp" ? "WhatsApp" : "Email"}`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
