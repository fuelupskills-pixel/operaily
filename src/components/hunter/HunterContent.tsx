"use client";

import React, { useState, useRef } from "react";
import SendMessageModal from "@/components/shared/SendMessageModal";
import {
  Search, Globe, Building2, Loader2, Users, MapPin, Download,
  Filter, Sparkles, ArrowRight, CheckCircle2, AlertCircle,
  Mail, Phone, MessageSquare, Link as LinkIcon, ExternalLink,
  TrendingUp, Target, Zap, Check, X, ChevronDown, ChevronUp,
  Copy, Send,
} from "lucide-react";

// Custom inline SVG social icons because brand icons are missing in this version of lucide-react
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);


interface EnrichedLead {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  designation: string | null;
  companyName: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  industry: string | null;
  linkedinUrl: string | null;
  twitterHandle: string | null;
  facebookUrl: string | null;
  instagramHandle?: string | null;
  telegramHandle?: string | null;
  source: string;
  sourceId: string | null;
  score: number;
  personalizedHook: string | null;
  aiSummary: string | null;
  emailVerified: boolean;
  companyRevenue: string | null;
  companySize: string | null;
  enrichmentConfidence: number;
  rawData?: Record<string, unknown>;
}

interface SearchStats {
  totalFound: number;
  withEmail: number;
  withPhone: number;
  withLinkedIn: number;
  withWebsite: number;
  withWhatsApp: number;
  withSocial: number;
  hotLeads: number;
  verifiedEmails: number;
  averageScore: number;
  sourceBreakdown: Record<string, number>;
}

// ─── All 15 platform sources ──────────────────────────────────────────────────
const SOURCE_CONFIG = [
  { id: "apollo",        label: "Apollo.io",                  emoji: "🎯", group: "Data Platforms",     color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20" },
  { id: "linkedin",      label: "LinkedIn",                   emoji: "💼", group: "Social",             color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20" },
  { id: "social",        label: "Instagram / WhatsApp / TikTok / Telegram", emoji: "📱", group: "Social", color: "text-pink-400", bg: "bg-pink-500/10",  border: "border-pink-500/20" },
  { id: "trade_portals", label: "Trade Portals (Alibaba, EC21, ExportHub)", emoji: "🏪", group: "Trade", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { id: "government",    label: "Government Tenders",         emoji: "🏛️", group: "Government",        color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20" },
  { id: "pharma_dir",    label: "Pharma / Medical Directories",emoji: "💊", group: "Industry",          color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { id: "import_export", label: "Import / Export Databases",  emoji: "📦", group: "Trade",             color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
  { id: "indiamart",     label: "IndiaMART / JustDial / TradeIndia", emoji: "🇮🇳", group: "B2B",       color: "text-green-400",   bg: "bg-green-500/10",   border: "border-green-500/20" },
  { id: "yellow_pages",  label: "Yellow Pages (Worldwide)",   emoji: "📒", group: "Directories",       color: "text-yellow-400",  bg: "bg-yellow-500/10",  border: "border-yellow-500/20" },
  { id: "google_maps",   label: "Google Maps / My Business",  emoji: "📍", group: "Directories",       color: "text-green-500",   bg: "bg-green-600/10",   border: "border-green-600/20" },
  { id: "forums",        label: "Industry Forums (Reddit, Pharma Networks)", emoji: "💬", group: "Community", color: "text-slate-400", bg: "bg-slate-500/10", border: "border-slate-500/20" },
  { id: "europages",     label: "Europages / Kompass / D&B",  emoji: "🇪🇺", group: "Directories",      color: "text-indigo-400",  bg: "bg-indigo-500/10",  border: "border-indigo-500/20" },
  { id: "chamber",       label: "Chamber of Commerce",        emoji: "🏢", group: "Official",          color: "text-amber-500",   bg: "bg-amber-600/10",   border: "border-amber-600/20" },
  { id: "web",           label: "Web Crawling + Company Sites", emoji: "🌐", group: "Web",             color: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/20" },
  { id: "deep",          label: "Deep Search (Google Operators)", emoji: "🕵️", group: "Web",           color: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20" },
];

const SOURCE_GROUPS = ["Data Platforms", "Social", "Trade", "Government", "Industry", "B2B", "Directories", "Community", "Official", "Web"];

// ─── Popular pharma/medical searches ─────────────────────────────────────────
const POPULAR_SEARCHES = [
  { industry: "Pharmaceutical Importers",          country: "Germany",       emoji: "💊" },
  { industry: "Medical Equipment Distributors",    country: "Nigeria",       emoji: "🏥" },
  { industry: "Lab Equipment Buyers",              country: "USA",           emoji: "🔬" },
  { industry: "Nutraceutical Distributors",        country: "UAE",           emoji: "🌿" },
  { industry: "Hospital Procurement",              country: "Kenya",         emoji: "🏨" },
  { industry: "Generic Medicine Importers",        country: "Brazil",        emoji: "💉" },
  { industry: "API / Active Ingredients Buyers",   country: "India",         emoji: "⚗️" },
  { industry: "Contract Manufacturing Pharma",     country: "Vietnam",       emoji: "🏭" },
  { industry: "Surgical Equipment Suppliers",      country: "Saudi Arabia",  emoji: "🩺" },
  { industry: "Diagnostic Equipment Buyers",       country: "South Africa",  emoji: "🧪" },
  { industry: "Pharma Wholesalers",                country: "Ghana",         emoji: "🌍" },
  { industry: "SaaS B2B Companies",                country: "United Kingdom",emoji: "💻" },
];

// ─── Search phases (15 providers) ────────────────────────────────────────────
const SEARCH_PHASES = [
  { msg: "🎯 Querying Apollo.io database...",                       emoji: "🎯" },
  { msg: "💼 Scanning LinkedIn profiles...",                        emoji: "💼" },
  { msg: "📱 Checking Instagram / WhatsApp Business / TikTok...",  emoji: "📱" },
  { msg: "🏪 Mining trade portals (Alibaba, EC21, ExportHub)...",   emoji: "🏪" },
  { msg: "🇮🇳 Extracting IndiaMART / JustDial / TradeIndia...",      emoji: "🇮🇳" },
  { msg: "🇪🇺 Searching Europages / Kompass / D&B...",               emoji: "🇪🇺" },
  { msg: "🏛️ Searching government procurement portals...",           emoji: "🏛️" },
  { msg: "🏢 Mining Chamber of Commerce directories...",             emoji: "🏢" },
  { msg: "📦 Analyzing import/export databases (HS codes)...",      emoji: "📦" },
  { msg: "💊 Scanning pharma & medical directories...",             emoji: "💊" },
  { msg: "📒 Searching Yellow Pages worldwide...",                  emoji: "📒" },
  { msg: "📍 Extracting Google Maps / My Business listings...",     emoji: "📍" },
  { msg: "💬 Mining industry forums & communities...",              emoji: "💬" },
  { msg: "🌐 Crawling company websites & directories...",           emoji: "🌐" },
  { msg: "🔄 Deduplicating all records...",                         emoji: "🔄" },
  { msg: "🤖 AI enriching & scoring leads...",                      emoji: "🤖" },
  { msg: "✨ Finalizing intelligence report...",                     emoji: "✨" },
];

// ─── Source badge ─────────────────────────────────────────────────────────────
function getSourceBadge(source: string) {
  const map: Record<string, { label: string; cls: string }> = {
    apollo:              { label: "Apollo",        cls: "bg-violet-500/15 text-violet-400" },
    linkedin:            { label: "LinkedIn",      cls: "bg-blue-500/15 text-blue-400" },
    social_media:        { label: "Social",        cls: "bg-pink-500/15 text-pink-400" },
    trade_portal:        { label: "Trade Portal",  cls: "bg-orange-500/15 text-orange-400" },
    government_tender:   { label: "GOV TENDER",   cls: "bg-red-500/15 text-red-400 font-bold" },
    pharma_directory:    { label: "Pharma Dir",    cls: "bg-emerald-500/15 text-emerald-400" },
    import_database:     { label: "Import DB",     cls: "bg-amber-500/15 text-amber-400" },
    indiamart:           { label: "IndiaMART",     cls: "bg-green-500/15 text-green-400" },
    tradeindia:          { label: "TradeIndia",    cls: "bg-orange-600/15 text-orange-500" },
    justdial:            { label: "JustDial",      cls: "bg-blue-500/15 text-blue-500" },
    alibaba:             { label: "Alibaba",       cls: "bg-amber-600/15 text-amber-600" },
    yellow_pages:        { label: "Yellow Pages",  cls: "bg-yellow-500/15 text-yellow-500" },
    google_maps:         { label: "Google Maps",   cls: "bg-green-500/15 text-green-500" },
    industry_forum:      { label: "Forum",         cls: "bg-slate-500/15 text-slate-400" },
    europages_kompass:   { label: "Europages",     cls: "bg-indigo-500/15 text-indigo-400" },
    chamber_of_commerce: { label: "Chamber",       cls: "bg-amber-600/15 text-amber-500" },
    web_scraper:         { label: "Web",           cls: "bg-cyan-500/15 text-cyan-400" },
    deep_search:         { label: "Deep Web",      cls: "bg-purple-500/15 text-purple-400" },
  };
  return map[source] || { label: source, cls: "bg-muted text-muted-foreground" };
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function scoreColor(score: number) {
  if (score >= 90) return "text-emerald-400";
  if (score >= 80) return "text-blue-400";
  if (score >= 70) return "text-violet-400";
  if (score >= 60) return "text-amber-400";
  return "text-orange-400";
}

export default function HunterContent() {
  const [industry, setIndustry]               = useState("");
  const [country, setCountry]                 = useState("");
  const [isSearching, setIsSearching]         = useState(false);
  const [phase, setPhase]                     = useState(0);
  const [results, setResults]                 = useState<EnrichedLead[]>([]);
  const [stats, setStats]                     = useState<SearchStats | null>(null);
  const [hasSearched, setHasSearched]         = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [showSources, setShowSources]         = useState(false);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(
    new Set(SOURCE_CONFIG.filter(s => s.id !== "deep").map(s => s.id))
  );
  const [deepSearch, setDeepSearch]           = useState(false);
  const [expandedLead, setExpandedLead]       = useState<number | null>(null);
  const [selectedLeads, setSelectedLeads]     = useState<Set<number>>(new Set());
  const [isImporting, setIsImporting]         = useState(false);
  const [importResult, setImportResult]       = useState<{ imported: number; skipped: number } | null>(null);
  const [filterHasContact, setFilterHasContact] = useState(false);
  const [messageModal, setMessageModal]       = useState<{ lead: EnrichedLead; channel: "whatsapp" | "email" } | null>(null);
  const phaseTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Search ──────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!industry || !country) return;
    setIsSearching(true);
    setResults([]);
    setStats(null);
    setHasSearched(true);
    setError(null);
    setImportResult(null);
    setSelectedLeads(new Set());
    setPhase(0);

    let p = 0;
    phaseTimer.current = setInterval(() => {
      p = Math.min(p + 1, SEARCH_PHASES.length - 1);
      setPhase(p);
    }, deepSearch ? 1800 : 1200);

    try {
      const savedSettings = localStorage.getItem("omni_settings");
      const apiKeys = savedSettings ? JSON.parse(savedSettings).apiKeys : {};

      const res = await fetch("/api/hunter/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry, country, deepSearch,
          sources: Array.from(selectedSources),
          apiKeys,
          limit: 100,
        }),
      });

      if (phaseTimer.current) clearInterval(phaseTimer.current);
      setPhase(SEARCH_PHASES.length - 1);
      await new Promise(r => setTimeout(r, 400));

      if (!res.ok) throw new Error(`Search failed (${res.status})`);
      const data = await res.json();
      setResults(data.results || []);
      setStats(data.stats || null);
    } catch (err) {
      if (phaseTimer.current) clearInterval(phaseTimer.current);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSearching(false);
    }
  };

  // ─── Import ───────────────────────────────────────────────────────────────
  const handleImport = async (leadsToImport?: EnrichedLead[]) => {
    const toImport = leadsToImport || (
      selectedLeads.size > 0 ? filteredResults.filter((_, i) => selectedLeads.has(i)) : filteredResults
    );
    if (!toImport.length) return;
    setIsImporting(true);
    try {
      const res = await fetch("/api/hunter/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: toImport }),
      });
      const data = await res.json();
      setImportResult({ imported: data.imported, skipped: data.skippedDuplicates });
    } catch { setError("Import failed"); }
    finally { setIsImporting(false); }
  };

  const toggleLeadSel = (i: number) => {
    setSelectedLeads(prev => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  };

  const filteredResults = results.filter(l =>
    filterHasContact ? !!(l.email || l.phone || l.whatsapp) : true
  );

  const toggleAll = () =>
    setSelectedLeads(selectedLeads.size === filteredResults.length
      ? new Set()
      : new Set(filteredResults.map((_, i) => i))
    );

  // Group sources for display
  const sourcesByGroup = SOURCE_GROUPS.map(group => ({
    group,
    items: SOURCE_CONFIG.filter(s => s.group === group),
  })).filter(g => g.items.length > 0);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="gradient-text">Global Lead Intelligence Agent</span> 🌍
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          15 platforms · Pharma · Medical · Nutraceuticals · Lab Equipment · SaaS · Any Industry
        </p>
      </div>

      {/* ── Search Card ────────────────────────────────────────────────── */}
      <div className="glass-card p-6 gradient-border">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text" placeholder="Industry (e.g., Pharmaceutical Importers)"
              value={industry} onChange={e => setIndustry(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-3 bg-input border border-input-border rounded-xl text-sm placeholder:text-muted-foreground input-focus"
            />
          </div>
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text" placeholder="Country (e.g., Germany)"
              value={country} onChange={e => setCountry(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-3 bg-input border border-input-border rounded-xl text-sm placeholder:text-muted-foreground input-focus"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setShowSources(!showSources)}
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold border bg-surface border-border-subtle text-muted-foreground hover:text-foreground transition-all">
              <Filter className="w-4 h-4" />
              {selectedSources.size}/{SOURCE_CONFIG.length} Sources
              <ChevronDown className={`w-3 h-3 transition-transform ${showSources ? "rotate-180" : ""}`} />
            </button>
            <button onClick={() => setDeepSearch(!deepSearch)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold border transition-all ${deepSearch ? "bg-purple-500/15 border-purple-500/30 text-purple-400" : "bg-surface border-border-subtle text-muted-foreground"}`}>
              <Zap className="w-4 h-4" /> {deepSearch ? "Deep ON" : "Deep"}
            </button>
            <button onClick={handleSearch}
              disabled={isSearching || !industry || !country}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
              {isSearching ? <><Loader2 className="w-4 h-4 animate-spin" />Hunting...</> : <><Sparkles className="w-4 h-4" />Hunt Leads</>}
            </button>
          </div>
        </div>

        {/* ── Source Selector ─────────────────────────────────────────── */}
        {showSources && (
          <div className="mb-4 p-4 bg-surface rounded-xl border border-border-subtle animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Platforms</p>
              <div className="flex gap-2">
                <button onClick={() => setSelectedSources(new Set(SOURCE_CONFIG.map(s => s.id)))}
                  className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20">All</button>
                <button onClick={() => setSelectedSources(new Set(["apollo","linkedin","trade_portals","government","pharma_dir"]))}
                  className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-surface-hover">Core</button>
                <button onClick={() => setSelectedSources(new Set())}
                  className="text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-surface-hover">None</button>
              </div>
            </div>
            {sourcesByGroup.map(({ group, items }) => (
              <div key={group} className="mb-4">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">{group}</p>
                <div className="flex flex-wrap gap-2">
                  {items.map(src => {
                    const active = selectedSources.has(src.id);
                    return (
                      <button key={src.id}
                        onClick={() => {
                          const n = new Set(selectedSources);
                          active && n.size > 1 ? n.delete(src.id) : n.add(src.id);
                          setSelectedSources(n);
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${active ? `${src.bg} ${src.border} ${src.color}` : "bg-muted/50 border-border text-muted-foreground hover:border-border-subtle"}`}>
                        <span>{src.emoji}</span>{src.label}
                        {active && <Check className="w-3 h-3 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Progress */}
        {isSearching && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
              {SEARCH_PHASES.map((p, i) => (
                <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-xs ${i <= phase ? "bg-surface border border-border-subtle" : "opacity-20"}`}>
                  <span className="shrink-0">
                    {i < phase ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : i === phase ? <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" /> : <span>{p.emoji}</span>}
                  </span>
                  <span className={i <= phase ? "text-foreground" : "text-muted-foreground"}>{p.msg}</span>
                </div>
              ))}
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${((phase + 1) / SEARCH_PHASES.length) * 100}%` }} />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-danger shrink-0" />
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}
      </div>

      {/* ── Popular Searches ───────────────────────────────────────────── */}
      {!hasSearched && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">🌍 Popular Searches</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {POPULAR_SEARCHES.map((s, i) => (
              <button key={i}
                onClick={() => { setIndustry(s.industry); setCountry(s.country); }}
                className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border-subtle hover:border-primary/30 hover:bg-surface-hover transition-all text-left group">
                <span className="text-xl">{s.emoji}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium group-hover:text-primary transition-colors truncate">{s.industry}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{s.country}</p>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Stats ─────────────────────────────────────────────────────── */}
      {stats && !isSearching && (
        <div className="space-y-4 animate-fade-in">
          {/* Key metrics */}
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {[
              { label: "Found",    value: stats.totalFound,     color: "text-primary",    bg: "bg-primary/15"    },
              { label: "Email",    value: stats.withEmail,      color: "text-emerald-400",bg: "bg-emerald-500/15"},
              { label: "Phone",    value: stats.withPhone,      color: "text-blue-400",   bg: "bg-blue-500/15"   },
              { label: "LinkedIn", value: stats.withLinkedIn,   color: "text-sky-400",    bg: "bg-sky-500/15"    },
              { label: "Website",  value: stats.withWebsite,    color: "text-cyan-400",   bg: "bg-cyan-500/15"   },
              { label: "Social",   value: stats.withSocial,     color: "text-pink-400",   bg: "bg-pink-500/15"   },
              { label: "Hot 🔥",   value: stats.hotLeads,       color: "text-red-400",    bg: "bg-red-500/15"    },
              { label: "Score",    value: stats.averageScore,   color: "text-violet-400", bg: "bg-violet-500/15" },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-3 text-center">
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 uppercase">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Source breakdown */}
          <div className="glass-card p-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Source Breakdown</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Apollo",       count: stats.sourceBreakdown.apollo,            cls: "bg-violet-500/15 text-violet-400" },
                { label: "LinkedIn",     count: stats.sourceBreakdown.linkedin,           cls: "bg-blue-500/15 text-blue-400" },
                { label: "Social",       count: stats.sourceBreakdown.social,             cls: "bg-pink-500/15 text-pink-400" },
                { label: "Trade",        count: stats.sourceBreakdown.tradePortals,       cls: "bg-orange-500/15 text-orange-400" },
                { label: "Gov Tenders",  count: stats.sourceBreakdown.governmentTenders,  cls: "bg-red-500/15 text-red-400 font-bold" },
                { label: "Import DB",    count: stats.sourceBreakdown.importExport,       cls: "bg-amber-500/15 text-amber-400" },
                { label: "Pharma Dir",   count: stats.sourceBreakdown.pharmaDirectory,    cls: "bg-emerald-500/15 text-emerald-400" },
                { label: "B2B",          count: stats.sourceBreakdown.b2b,               cls: "bg-green-500/15 text-green-400" },
                { label: "Yellow Pages", count: stats.sourceBreakdown.yellowPages,        cls: "bg-yellow-500/15 text-yellow-500" },
                { label: "Google Maps",  count: stats.sourceBreakdown.googleMaps,         cls: "bg-green-600/15 text-green-500" },
                { label: "Forums",       count: stats.sourceBreakdown.forums,             cls: "bg-slate-500/15 text-slate-400" },
                { label: "Europages",    count: stats.sourceBreakdown.europages,          cls: "bg-indigo-500/15 text-indigo-400" },
                { label: "Chamber",      count: stats.sourceBreakdown.chamber,            cls: "bg-amber-600/15 text-amber-500" },
                { label: "Web",          count: stats.sourceBreakdown.web,               cls: "bg-cyan-500/15 text-cyan-400" },
              ]
                .filter(s => s.count > 0)
                .map((s, i) => (
                  <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${s.cls}`}>
                    {s.label} <span className="opacity-60">({s.count})</span>
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Import result ──────────────────────────────────────────────── */}
      {importResult && (
        <div className="glass-card p-4 border-success/20 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
          <div>
            <p className="text-sm font-semibold text-success">{importResult.imported} leads imported!</p>
            {importResult.skipped > 0 && <p className="text-xs text-muted-foreground">{importResult.skipped} duplicates skipped</p>}
          </div>
          <button onClick={() => setImportResult(null)} className="ml-auto p-1 hover:bg-surface-hover rounded-lg text-muted-foreground"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────── */}
      {filteredResults.length > 0 && !isSearching && (
        <div className="space-y-3 animate-fade-in">
          {/* Toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button onClick={toggleAll}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${selectedLeads.size === filteredResults.length ? "bg-primary border-primary" : "border-border hover:border-primary/50"}`}>
                {selectedLeads.size === filteredResults.length && <Check className="w-3 h-3 text-white" />}
              </button>
              <p className="text-sm font-semibold">
                {selectedLeads.size > 0 ? `${selectedLeads.size} selected` : `${filteredResults.length} leads found`}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setFilterHasContact(!filterHasContact)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filterHasContact ? "bg-primary/15 text-primary border-primary/30" : "bg-surface text-muted-foreground border-border"}`}>
                <Mail className="w-3 h-3" /> Has Contact
              </button>
              <button onClick={() => handleImport()} disabled={isImporting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-all disabled:opacity-50">
                {isImporting ? <><Loader2 className="w-3 h-3 animate-spin" />Importing...</> : <><Download className="w-3 h-3" />Import {selectedLeads.size > 0 ? `${selectedLeads.size}` : "All"}</>}
              </button>
            </div>
          </div>

          {/* Lead cards */}
          {filteredResults.map((lead, index) => {
            const badge = getSourceBadge(lead.source);
            const isExpanded = expandedLead === index;
            const isSelected = selectedLeads.has(index);
            const isGov = lead.source === "government_tender";

            return (
              <div key={index}
                className={`glass-card p-4 transition-all ${isSelected ? "border-primary/40" : "hover:border-primary/15"} ${isGov ? "border-red-500/20 bg-red-500/[0.02]" : ""}`}>
                <div className="flex items-start gap-4">
                  <button onClick={() => toggleLeadSel(index)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 shrink-0 ${isSelected ? "bg-primary border-primary" : "border-border"}`}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </button>

                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-primary shrink-0 border border-primary/10">
                    {lead.firstName?.[0]}{lead.lastName?.[0]}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name + badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <h3 className="text-sm font-semibold">{lead.firstName} {lead.lastName}</h3>
                      {lead.emailVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      <span className={`badge ${badge.cls}`}>{badge.label}</span>
                      {isGov && <span className="badge bg-red-500/20 text-red-400 font-bold">🏛️ GOV</span>}
                      {lead.source === "chamber_of_commerce" && <span className="badge bg-amber-600/20 text-amber-500">🏢 CHAMBER</span>}
                      {lead.source === "google_maps" && <span className="badge bg-green-500/20 text-green-500">📍 MAPS</span>}
                    </div>

                    <p className="text-xs text-muted-foreground">{lead.designation}{lead.companyName ? ` @ ${lead.companyName}` : ""}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{[lead.city, lead.country].filter(Boolean).join(", ")}
                    </p>

                    {/* ── Contact row ─────────────────────────────────────── */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {lead.email && (
                        <div className="flex items-center gap-2 group">
                          <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-xs font-medium truncate">{lead.email}</span>
                          <button onClick={e => { e.stopPropagation(); copyToClipboard(lead.email!); }}
                            className="opacity-0 group-hover:opacity-100 ml-auto">
                            <Copy className="w-3 h-3 text-muted-foreground hover:text-primary" />
                          </button>
                        </div>
                      )}
                      {lead.phone && (
                        <div className="flex items-center gap-2 group">
                          <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="text-xs font-medium">{lead.phone}</span>
                          <button onClick={e => { e.stopPropagation(); copyToClipboard(lead.phone!); }}
                            className="opacity-0 group-hover:opacity-100 ml-auto">
                            <Copy className="w-3 h-3 text-muted-foreground hover:text-primary" />
                          </button>
                        </div>
                      )}
                      {lead.website && (
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                            target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                            className="text-xs text-cyan-400 hover:underline truncate">
                            {lead.website.replace(/^https?:\/\/(www\.)?/, "")}
                          </a>
                        </div>
                      )}
                      {lead.linkedinUrl && (
                        <div className="flex items-center gap-2">
                          <LinkIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <a href={lead.linkedinUrl.startsWith("http") ? lead.linkedinUrl : `https://${lead.linkedinUrl}`}
                            target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                            className="text-xs text-blue-400 hover:underline">LinkedIn</a>
                        </div>
                      )}
                      {(lead as any).instagramHandle && (
                        <div className="flex items-center gap-2">
                          <InstagramIcon className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                          <span className="text-xs text-pink-400">{(lead as any).instagramHandle}</span>
                        </div>
                      )}
                      {lead.twitterHandle && (
                        <div className="flex items-center gap-2">
                          <TwitterIcon className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          <span className="text-xs text-sky-400">{lead.twitterHandle}</span>
                        </div>
                      )}
                      {lead.facebookUrl && (
                        <div className="flex items-center gap-2">
                          <FacebookIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <a href={lead.facebookUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-blue-500 hover:underline truncate">Facebook</a>
                        </div>
                      )}
                      {(lead as any).telegramHandle && (
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                          <span className="text-xs text-sky-500">{(lead as any).telegramHandle}</span>
                        </div>
                      )}
                    </div>

                    {!lead.email && !lead.phone && !lead.website && !lead.linkedinUrl && (
                      <p className="mt-2 text-[11px] text-muted-foreground italic">Expand for source details</p>
                    )}

                    {/* Expanded */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-border-subtle space-y-3 animate-fade-in">
                        {lead.rawData && Object.keys(lead.rawData).length > 0 && (
                          <div className="p-3 bg-surface rounded-xl border border-border-subtle">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Source Intelligence</p>
                            <div className="grid grid-cols-2 gap-1.5">
                              {Object.entries(lead.rawData).filter(([, v]) => v).slice(0, 6).map(([k, v]) => (
                                <div key={k} className="text-xs">
                                  <span className="text-muted-foreground">{k.replace(/_/g, " ")}: </span>
                                  <span>{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {lead.personalizedHook && (
                          <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">
                              <Sparkles className="w-3 h-3 inline mr-1" />AI Outreach Hook
                            </p>
                            <p className="text-xs">{lead.personalizedHook}</p>
                          </div>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          <button onClick={() => handleImport([lead])}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1">
                            <Download className="w-3 h-3" /> Import
                          </button>
                          {(lead.whatsapp || lead.phone) && (
                            <button onClick={() => setMessageModal({ lead, channel: "whatsapp" })}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 flex items-center gap-1">
                              <MessageSquare className="w-3 h-3" /> WhatsApp
                            </button>
                          )}
                          {lead.email && (
                            <button onClick={() => setMessageModal({ lead, channel: "email" })}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 flex items-center gap-1">
                              <Send className="w-3 h-3" /> Email
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <button onClick={() => setExpandedLead(isExpanded ? null : index)}
                      className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors">
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {isExpanded ? "Collapse" : "View Details & Actions"}
                    </button>
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className={`text-2xl font-bold ${scoreColor(lead.score)}`}>{lead.score}</p>
                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${lead.score >= 90 ? "bg-emerald-400" : lead.score >= 75 ? "bg-blue-400" : "bg-amber-400"}`}
                        style={{ width: `${lead.score}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">score</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Message Modal */}
      {messageModal && (
        <SendMessageModal
          lead={{
            firstName: messageModal.lead.firstName,
            lastName: messageModal.lead.lastName,
            email: messageModal.lead.email,
            phone: messageModal.lead.phone,
            whatsapp: messageModal.lead.whatsapp,
            companyName: messageModal.lead.companyName,
            country: messageModal.lead.country,
            city: messageModal.lead.city,
            designation: messageModal.lead.designation,
            industry: industry || null,
          }}
          isOpen={true}
          onClose={() => setMessageModal(null)}
          defaultChannel={messageModal.channel}
        />
      )}
    </div>
  );
}
