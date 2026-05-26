"use client";

import React, { useState, useRef } from "react";
import SendMessageModal from "@/components/shared/SendMessageModal";
import {
  Search, Globe, Building2, Loader2, Users, MapPin, Download,
  Filter, Sparkles, ArrowRight, CheckCircle2, AlertCircle,
  Mail, Phone, MessageSquare, Link as LinkedinIcon, ExternalLink,
  TrendingUp, Target, Zap, BarChart3, Check, X, ChevronDown,
  ChevronUp, FileText, Star, Shield, Globe2, Database, Briefcase,
  Copy, RefreshCw, Send,
} from "lucide-react";

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
  hotLeads: number;
  verifiedEmails: number;
  averageScore: number;
  sourceBreakdown: {
    apollo: number;
    linkedin: number;
    web: number;
    deep?: number;
    tradePortals: number;
    governmentTenders: number;
    importExport: number;
    pharmaDirectory: number;
    b2b: number;
  };
}

// ─── Source config ────────────────────────────────────────────────────────────
const SOURCE_CONFIG = [
  { id: "apollo",        label: "Apollo.io",               icon: "🎯", group: "data",       color: "text-violet-400" },
  { id: "linkedin",      label: "LinkedIn",                icon: "💼", group: "social",     color: "text-blue-400" },
  { id: "facebook",      label: "Facebook / Instagram",    icon: "📱", group: "social",     color: "text-blue-500" },
  { id: "twitter",       label: "Twitter / X",             icon: "🐦", group: "social",     color: "text-sky-400" },
  { id: "trade_portals", label: "Trade Portals (Alibaba)", icon: "🏪", group: "trade",      color: "text-orange-400" },
  { id: "government",    label: "Government Tenders",      icon: "🏛️", group: "government", color: "text-red-400" },
  { id: "pharma_dir",    label: "Pharma/Medical Dirs",     icon: "💊", group: "industry",   color: "text-emerald-400" },
  { id: "import_export", label: "Import/Export DB",        icon: "📦", group: "trade",      color: "text-amber-400" },
  { id: "indiamart",     label: "IndiaMART / JustDial",    icon: "🇮🇳", group: "b2b",       color: "text-green-400" },
  { id: "web",           label: "Web Crawling + Yellow Pages", icon: "🌐", group: "web",   color: "text-cyan-400" },
];

// ─── Popular searches (pharma/medical focused) ────────────────────────────────
const POPULAR_SEARCHES = [
  { industry: "Pharmaceutical Importers", country: "Germany",       icon: "💊" },
  { industry: "Medical Equipment Distributors", country: "Nigeria", icon: "🏥" },
  { industry: "Lab Equipment Buyers", country: "USA",               icon: "🔬" },
  { industry: "Nutraceutical Distributors", country: "UAE",         icon: "🌿" },
  { industry: "Generic Medicine Importers", country: "Brazil",      icon: "💉" },
  { industry: "Hospital Procurement", country: "Kenya",             icon: "🏨" },
  { industry: "API Manufacturers", country: "India",                icon: "⚗️" },
  { industry: "Contract Manufacturing Pharma", country: "Vietnam",  icon: "🏭" },
  { industry: "Surgical Equipment Suppliers", country: "Saudi Arabia", icon: "🩺" },
  { industry: "Diagnostic Equipment", country: "South Africa",      icon: "🧪" },
  { industry: "SaaS Companies", country: "United States",           icon: "💻" },
  { industry: "EV Manufacturers", country: "China",                 icon: "⚡" },
];

// ─── Search phase messages ────────────────────────────────────────────────────
const SEARCH_PHASES = [
  { message: "🎯 Querying Apollo.io database...",                    icon: "🎯" },
  { message: "💼 Scanning LinkedIn & social networks...",            icon: "💼" },
  { message: "🏪 Mining trade portals (Alibaba, EC21, ExportHub)...",icon: "🏪" },
  { message: "🏛️ Searching government procurement portals...",       icon: "🏛️" },
  { message: "💊 Scanning pharma & medical directories...",          icon: "💊" },
  { message: "📦 Analyzing import/export databases...",              icon: "📦" },
  { message: "🌐 Crawling web directories & Yellow Pages...",        icon: "🌐" },
  { message: "🔄 Deduplicating all records...",                      icon: "🔄" },
  { message: "🤖 AI enriching & scoring leads...",                   icon: "🤖" },
  { message: "✨ Finalizing intelligence report...",                  icon: "✨" },
];

const DEEP_PHASES = [
  ...SEARCH_PHASES.slice(0, 6),
  { message: "🕵️ Deep crawling internet for real buyers...",         icon: "🕵️" },
  { message: "📧 Extracting contacts from search results...",        icon: "📧" },
  ...SEARCH_PHASES.slice(6),
];

// ─── Source badge helper ──────────────────────────────────────────────────────
function getSourceBadge(source: string) {
  const map: Record<string, { label: string; cls: string }> = {
    apollo:           { label: "Apollo",      cls: "bg-violet-500/15 text-violet-400" },
    linkedin:         { label: "LinkedIn",    cls: "bg-blue-500/15 text-blue-400" },
    facebook:         { label: "Facebook",    cls: "bg-blue-600/15 text-blue-500" },
    twitter:          { label: "Twitter",     cls: "bg-sky-500/15 text-sky-400" },
    trade_portal:     { label: "Trade Portal",cls: "bg-orange-500/15 text-orange-400" },
    government_tender:{ label: "Gov Tender",  cls: "bg-red-500/15 text-red-400 font-bold" },
    pharma_directory: { label: "Pharma Dir",  cls: "bg-emerald-500/15 text-emerald-400" },
    import_database:  { label: "Import DB",   cls: "bg-amber-500/15 text-amber-400" },
    indiamart:        { label: "IndiaMART",   cls: "bg-green-500/15 text-green-400" },
    tradeindia:       { label: "TradeIndia",  cls: "bg-orange-600/15 text-orange-500" },
    justdial:         { label: "JustDial",    cls: "bg-blue-500/15 text-blue-500" },
    alibaba:          { label: "Alibaba",     cls: "bg-amber-600/15 text-amber-600" },
    web_scraper:      { label: "Web",         cls: "bg-cyan-500/15 text-cyan-400" },
    deep_search:      { label: "Deep Web",    cls: "bg-purple-500/15 text-purple-400" },
    yellow_pages:     { label: "Yellow Pages",cls: "bg-yellow-500/15 text-yellow-500" },
  };
  return map[source] || { label: source, cls: "bg-muted text-muted-foreground" };
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export default function HunterContent() {
  const [industry, setIndustry]               = useState("");
  const [country, setCountry]                 = useState("");
  const [isSearching, setIsSearching]         = useState(false);
  const [currentPhase, setCurrentPhase]       = useState(0);
  const [results, setResults]                 = useState<EnrichedLead[]>([]);
  const [stats, setStats]                     = useState<SearchStats | null>(null);
  const [hasSearched, setHasSearched]         = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(
    new Set(["apollo", "linkedin", "web", "trade_portals", "government", "pharma_dir", "import_export"])
  );
  const [showSourcesMenu, setShowSourcesMenu] = useState(false);
  const [selectedLeads, setSelectedLeads]     = useState<Set<number>>(new Set());
  const [isImporting, setIsImporting]         = useState(false);
  const [importResult, setImportResult]       = useState<{ imported: number; skipped: number } | null>(null);
  const [expandedLead, setExpandedLead]       = useState<number | null>(null);
  const [messageModal, setMessageModal]       = useState<{ lead: EnrichedLead; channel: "whatsapp" | "email" } | null>(null);
  const [deepSearch, setDeepSearch]           = useState(false);
  const [filterScore, setFilterScore]         = useState(0);
  const [filterHasContact, setFilterHasContact] = useState(false);
  const phaseInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const activePhases = deepSearch ? DEEP_PHASES : SEARCH_PHASES;

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!industry || !country) return;
    setIsSearching(true);
    setResults([]);
    setStats(null);
    setHasSearched(true);
    setError(null);
    setImportResult(null);
    setSelectedLeads(new Set());
    setCurrentPhase(0);

    let phase = 0;
    phaseInterval.current = setInterval(() => {
      phase = Math.min(phase + 1, activePhases.length - 1);
      setCurrentPhase(phase);
    }, deepSearch ? 1600 : 1100);

    try {
      const savedSettings = localStorage.getItem("omni_settings");
      const apiKeys = savedSettings ? JSON.parse(savedSettings).apiKeys : {};

      const response = await fetch("/api/hunter/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry,
          country,
          deepSearch,
          sources: Array.from(selectedSources),
          apiKeys,
          limit: 80,
        }),
      });

      if (!response.ok) throw new Error(`Search failed: ${response.status}`);
      const data = await response.json();

      if (phaseInterval.current) clearInterval(phaseInterval.current);
      setCurrentPhase(activePhases.length - 1);
      await new Promise(r => setTimeout(r, 400));

      setResults(data.results || []);
      setStats(data.stats || null);
    } catch (err) {
      if (phaseInterval.current) clearInterval(phaseInterval.current);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = async (leadsToImport?: EnrichedLead[]) => {
    const toImport = leadsToImport || (
      selectedLeads.size > 0 ? results.filter((_, i) => selectedLeads.has(i)) : results
    );
    if (toImport.length === 0) return;
    setIsImporting(true);
    try {
      const response = await fetch("/api/hunter/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: toImport }),
      });
      const data = await response.json();
      setImportResult({ imported: data.imported, skipped: data.skippedDuplicates });
    } catch {
      setError("Import failed");
    } finally {
      setIsImporting(false);
    }
  };

  const toggleLeadSelection = (index: number) => {
    setSelectedLeads(prev => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedLeads(selectedLeads.size === filteredResults.length
      ? new Set()
      : new Set(filteredResults.map((_, i) => i))
    );
  };

  // ─── Filtering ─────────────────────────────────────────────────────────────
  const filteredResults = results.filter(lead => {
    if (lead.score < filterScore) return false;
    if (filterHasContact && !lead.email && !lead.phone) return false;
    return true;
  });

  // ─── Score color ───────────────────────────────────────────────────────────
  function scoreColor(score: number) {
    if (score >= 90) return "text-emerald-400";
    if (score >= 80) return "text-blue-400";
    if (score >= 70) return "text-violet-400";
    if (score >= 60) return "text-amber-400";
    return "text-orange-400";
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="gradient-text">Global Lead Intelligence Agent</span> 🌍
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Discovers real buyers, RFQs, importers & tenders worldwide — Pharma · Medical · Nutraceuticals · Lab Equipment
        </p>
      </div>

      {/* ── Search Card ────────────────────────────────────────────────────── */}
      <div className="glass-card p-6 gradient-border">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Industry */}
          <div className="flex-1 relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Industry (e.g., Pharmaceutical Importers)"
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-3 bg-input border border-input-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground input-focus"
            />
          </div>
          {/* Country */}
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Country (e.g., Germany)"
              value={country}
              onChange={e => setCountry(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-3 bg-input border border-input-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground input-focus"
            />
          </div>
          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Sources dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSourcesMenu(!showSourcesMenu)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold transition-all border shrink-0 bg-surface border-border-subtle text-muted-foreground hover:text-foreground"
              >
                <Filter className="w-4 h-4" />
                {selectedSources.size} Sources
                <ChevronDown className="w-3 h-3" />
              </button>
              {showSourcesMenu && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-surface border border-border shadow-2xl rounded-xl p-2 z-50">
                  <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2 pt-1">
                    Data Sources
                  </div>
                  {SOURCE_CONFIG.map(src => (
                    <button
                      key={src.id}
                      onClick={() => {
                        const next = new Set(selectedSources);
                        next.has(src.id) ? next.delete(src.id) : next.add(src.id);
                        if (next.size > 0) setSelectedSources(next);
                      }}
                      className="flex items-center justify-between w-full p-2 hover:bg-surface-hover rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span>{src.icon}</span>
                        <span className={`text-xs ${src.color}`}>{src.label}</span>
                      </div>
                      {selectedSources.has(src.id) && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  ))}
                  <div className="mt-2 pt-2 border-t border-border px-2 pb-1 flex gap-2">
                    <button
                      onClick={() => setSelectedSources(new Set(SOURCE_CONFIG.map(s => s.id)))}
                      className="flex-1 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs hover:bg-surface-hover"
                    >
                      All
                    </button>
                    <button
                      onClick={() => setShowSourcesMenu(false)}
                      className="flex-1 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary/20"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Deep Search toggle */}
            <button
              onClick={() => setDeepSearch(!deepSearch)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold transition-all border shrink-0 ${
                deepSearch
                  ? "bg-purple-500/15 border-purple-500/30 text-purple-400"
                  : "bg-surface border-border-subtle text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="w-4 h-4" />
              {deepSearch ? "Deep ON" : "Deep"}
            </button>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              disabled={isSearching || !industry || !country || selectedSources.size === 0}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
            >
              {isSearching ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Hunting...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Hunt Leads</>
              )}
            </button>
          </div>
        </div>

        {/* Progress */}
        {isSearching && (
          <div className="mt-5 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {activePhases.map((phase, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                    i <= currentPhase ? "bg-surface border border-border-subtle" : "opacity-30"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${
                    i < currentPhase ? "bg-success/15" : i === currentPhase ? "bg-primary/15" : "bg-muted"
                  }`}>
                    {i < currentPhase
                      ? <CheckCircle2 className="w-4 h-4 text-success" />
                      : i === currentPhase
                      ? <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      : <span className="text-xs">{phase.icon}</span>
                    }
                  </div>
                  <span className={`text-xs ${i <= currentPhase ? "text-foreground" : "text-muted-foreground"}`}>
                    {phase.message}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${((currentPhase + 1) / activePhases.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-danger shrink-0" />
            <div>
              <p className="text-sm font-medium text-danger">Search Error</p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Popular Searches ───────────────────────────────────────────────── */}
      {!hasSearched && (
        <div className="animate-fade-in">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            🌍 Popular Searches
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {POPULAR_SEARCHES.map((s, i) => (
              <button
                key={i}
                onClick={() => { setIndustry(s.industry); setCountry(s.country); }}
                className="flex items-center gap-3 p-3 bg-surface rounded-xl border border-border-subtle hover:border-primary/30 hover:bg-surface-hover transition-all text-left group"
              >
                <span className="text-xl">{s.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium group-hover:text-primary transition-colors truncate">{s.industry}</p>
                  <p className="text-[10px] text-muted-foreground">{s.country}</p>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Stats Banner ──────────────────────────────────────────────────── */}
      {stats && !isSearching && (
        <div className="animate-fade-in space-y-4">
          {/* Top row: key numbers */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { label: "Total Found", value: stats.totalFound, icon: <Users className="w-4 h-4" />, color: "text-primary", bg: "bg-primary/15" },
              { label: "With Email", value: stats.withEmail, icon: <Mail className="w-4 h-4" />, color: "text-emerald-400", bg: "bg-emerald-500/15" },
              { label: "With Phone", value: stats.withPhone, icon: <Phone className="w-4 h-4" />, color: "text-blue-400", bg: "bg-blue-500/15" },
              { label: "With LinkedIn", value: stats.withLinkedIn, icon: <LinkedinIcon className="w-4 h-4" />, color: "text-sky-400", bg: "bg-sky-500/15" },
              { label: "Hot Leads", value: stats.hotLeads, icon: <Target className="w-4 h-4" />, color: "text-red-400", bg: "bg-red-500/15" },
              { label: "Avg Score", value: stats.averageScore, icon: <TrendingUp className="w-4 h-4" />, color: "text-violet-400", bg: "bg-violet-500/15" },
            ].map((stat, i) => (
              <div key={i} className="glass-card p-4 text-center">
                <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mx-auto mb-2 ${stat.color}`}>
                  {stat.icon}
                </div>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Source breakdown pills */}
          <div className="glass-card p-4">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Source Breakdown</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Apollo", count: stats.sourceBreakdown.apollo, cls: "bg-violet-500/15 text-violet-400" },
                { label: "LinkedIn", count: stats.sourceBreakdown.linkedin, cls: "bg-blue-500/15 text-blue-400" },
                { label: "Trade Portals", count: stats.sourceBreakdown.tradePortals, cls: "bg-orange-500/15 text-orange-400" },
                { label: "Gov Tenders", count: stats.sourceBreakdown.governmentTenders, cls: "bg-red-500/15 text-red-400" },
                { label: "Import DB", count: stats.sourceBreakdown.importExport, cls: "bg-amber-500/15 text-amber-400" },
                { label: "Pharma Dir", count: stats.sourceBreakdown.pharmaDirectory, cls: "bg-emerald-500/15 text-emerald-400" },
                { label: "B2B Dirs", count: stats.sourceBreakdown.b2b, cls: "bg-green-500/15 text-green-400" },
                { label: "Web", count: stats.sourceBreakdown.web, cls: "bg-cyan-500/15 text-cyan-400" },
              ]
                .filter(s => s.count > 0)
                .map((s, i) => (
                  <span key={i} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${s.cls}`}>
                    {s.label} <span className="opacity-70">({s.count})</span>
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Import Result Banner ──────────────────────────────────────────── */}
      {importResult && (
        <div className="glass-card p-4 border-success/20 flex items-center gap-3 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-success/15 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-sm font-semibold text-success">{importResult.imported} leads imported to CRM!</p>
            {importResult.skipped > 0 && (
              <p className="text-xs text-muted-foreground">{importResult.skipped} duplicates skipped</p>
            )}
          </div>
          <button onClick={() => setImportResult(null)} className="ml-auto p-1.5 rounded-lg hover:bg-surface-hover text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {filteredResults.length > 0 && !isSearching && (
        <div className="animate-fade-in space-y-4">

          {/* Results toolbar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  selectedLeads.size === filteredResults.length
                    ? "bg-primary border-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {selectedLeads.size === filteredResults.length && <Check className="w-3 h-3 text-white" />}
              </button>
              <p className="text-sm font-semibold">
                {selectedLeads.size > 0 ? `${selectedLeads.size} selected` : `${filteredResults.length} leads found`}
              </p>
              <span className="text-xs text-muted-foreground hidden md:inline">
                {industry} · {country}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Quick filters */}
              <button
                onClick={() => setFilterHasContact(!filterHasContact)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterHasContact ? "bg-primary/15 text-primary border border-primary/30" : "bg-surface text-muted-foreground border border-border"
                }`}
              >
                <Mail className="w-3 h-3" /> Has Contact
              </button>

              {/* Import */}
              <button
                onClick={() => handleImport()}
                disabled={isImporting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-all disabled:opacity-50"
              >
                {isImporting ? (
                  <><Loader2 className="w-3 h-3 animate-spin" /> Importing...</>
                ) : (
                  <><Download className="w-3 h-3" /> Import {selectedLeads.size > 0 ? `${selectedLeads.size} Selected` : "All"}</>
                )}
              </button>
            </div>
          </div>

          {/* Lead cards */}
          <div className="grid gap-3">
            {filteredResults.map((lead, index) => {
              const badge = getSourceBadge(lead.source);
              const isExpanded = expandedLead === index;
              const isSelected = selectedLeads.has(index);

              return (
                <div
                  key={index}
                  className={`glass-card p-4 transition-all ${isSelected ? "border-primary/40 bg-primary/[0.03]" : "hover:border-primary/15"}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={e => { e.stopPropagation(); toggleLeadSelection(index); }}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 shrink-0 transition-colors ${
                        isSelected ? "bg-primary border-primary" : "border-border hover:border-primary/50"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </button>

                    {/* Avatar */}
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-primary shrink-0 border border-primary/10">
                      {lead.firstName?.[0]}{lead.lastName?.[0]}
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0">
                      {/* Name + badges */}
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <h3 className="text-sm font-semibold">{lead.firstName} {lead.lastName}</h3>
                        {lead.emailVerified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        <span className={`badge ${badge.cls}`}>{badge.label}</span>
                        {lead.rawData?.type === "Government Procurement" && (
                          <span className="badge bg-red-500/20 text-red-400 font-bold">🏛️ GOV TENDER</span>
                        )}
                      </div>

                      {/* Title + Company */}
                      <p className="text-xs text-muted-foreground">
                        {lead.designation} {lead.companyName ? `@ ${lead.companyName}` : ""}
                      </p>

                      {/* Location */}
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {[lead.city, lead.country].filter(Boolean).join(", ")}
                        {lead.companySize && <span className="ml-2">· {lead.companySize} emp.</span>}
                      </p>

                      {/* ── Contact Row (PROMINENT) ──────────────────────── */}
                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {lead.email && (
                          <div className="flex items-center gap-2 group">
                            <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="text-xs text-foreground font-medium truncate">{lead.email}</span>
                            <button
                              onClick={e => { e.stopPropagation(); copyToClipboard(lead.email!); }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                            >
                              <Copy className="w-3 h-3 text-muted-foreground hover:text-primary" />
                            </button>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-2 group">
                            <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <span className="text-xs text-foreground font-medium">{lead.phone}</span>
                            <button
                              onClick={e => { e.stopPropagation(); copyToClipboard(lead.phone!); }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto"
                            >
                              <Copy className="w-3 h-3 text-muted-foreground hover:text-primary" />
                            </button>
                          </div>
                        )}
                        {lead.website && (
                          <div className="flex items-center gap-2 group">
                            <ExternalLink className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <a
                              href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-xs text-cyan-400 hover:text-cyan-300 truncate underline-offset-2 hover:underline"
                            >
                              {lead.website.replace(/^https?:\/\/(www\.)?/, "")}
                            </a>
                          </div>
                        )}
                        {lead.linkedinUrl && (
                          <div className="flex items-center gap-2">
                            <LinkedinIcon className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                            <a
                              href={lead.linkedinUrl.startsWith("http") ? lead.linkedinUrl : `https://${lead.linkedinUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-xs text-blue-400 hover:text-blue-300 underline-offset-2 hover:underline"
                            >
                              LinkedIn Profile
                            </a>
                          </div>
                        )}
                        {lead.twitterHandle && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs">🐦</span>
                            <span className="text-xs text-sky-400">{lead.twitterHandle}</span>
                          </div>
                        )}
                        {lead.whatsapp && !lead.phone && (
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-green-400 shrink-0" />
                            <span className="text-xs text-green-400">{lead.whatsapp}</span>
                          </div>
                        )}
                      </div>

                      {/* No contact notice */}
                      {!lead.email && !lead.phone && !lead.website && !lead.linkedinUrl && (
                        <p className="mt-2 text-[11px] text-muted-foreground italic">
                          Contact details not yet extracted — click to expand & view details
                        </p>
                      )}

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-border-subtle animate-fade-in space-y-3">
                          {/* Raw data details for special sources */}
                          {lead.rawData && (
                            <div className="p-3 bg-surface rounded-xl border border-border-subtle">
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                Source Intelligence
                              </p>
                              <div className="grid grid-cols-2 gap-1.5">
                                {Object.entries(lead.rawData)
                                  .filter(([k, v]) => v && !["rawData"].includes(k))
                                  .slice(0, 6)
                                  .map(([k, v]) => (
                                    <div key={k} className="text-xs">
                                      <span className="text-muted-foreground">{k.replace(/_/g, " ")}: </span>
                                      <span className="text-foreground">{String(v)}</span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* AI Hook */}
                          {lead.personalizedHook && (
                            <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                              <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">
                                <Sparkles className="w-3 h-3 inline mr-1" />AI Personalized Hook
                              </p>
                              <p className="text-xs text-foreground">{lead.personalizedHook}</p>
                            </div>
                          )}

                          {/* AI Summary */}
                          {lead.aiSummary && (
                            <p className="text-xs text-muted-foreground">
                              <strong>Summary:</strong> {lead.aiSummary}
                            </p>
                          )}

                          {/* Action buttons */}
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={e => { e.stopPropagation(); handleImport([lead]); }}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" /> Import
                            </button>
                            {(lead.whatsapp || lead.phone) && (
                              <button
                                onClick={e => { e.stopPropagation(); setMessageModal({ lead, channel: "whatsapp" }); }}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 flex items-center gap-1"
                              >
                                <MessageSquare className="w-3 h-3" /> WhatsApp
                              </button>
                            )}
                            {lead.email && (
                              <button
                                onClick={e => { e.stopPropagation(); setMessageModal({ lead, channel: "email" }); }}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 flex items-center gap-1"
                              >
                                <Send className="w-3 h-3" /> Email
                              </button>
                            )}
                            <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-400 hover:bg-violet-500/20">
                              Send to Workflow
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Expand toggle */}
                      <button
                        onClick={e => { e.stopPropagation(); setExpandedLead(isExpanded ? null : index); }}
                        className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary transition-colors"
                      >
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {isExpanded ? "Collapse" : "View Details & Actions"}
                      </button>
                    </div>

                    {/* Score */}
                    <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                      <div className={`text-2xl font-bold ${scoreColor(lead.score)}`}>
                        {lead.score}
                      </div>
                      <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            lead.score >= 90 ? "bg-emerald-400"
                            : lead.score >= 80 ? "bg-blue-400"
                            : lead.score >= 70 ? "bg-violet-400"
                            : "bg-amber-400"
                          }`}
                          style={{ width: `${lead.score}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">score</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Send Message Modal */}
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
