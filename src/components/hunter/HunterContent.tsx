"use client";

import React, { useState, useRef } from "react";
import SendMessageModal from "@/components/shared/SendMessageModal";
import {
  Search,
  Globe,
  Building2,
  Loader2,
  Users,
  MapPin,
  Download,
  Filter,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  MessageSquare,
  Link as LinkedinIcon,
  ExternalLink,
  TrendingUp,
  Target,
  Zap,
  BarChart3,
  Check,
  X,
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
}

interface SearchStats {
  totalFound: number;
  sourceBreakdown: { apollo: number; linkedin: number; web: number; deep?: number };
  averageScore: number;
  hotLeads: number;
  verifiedEmails: number;
}

const popularSearches = [
  { industry: "Pharmaceutical Importers", country: "Germany", icon: "💊" },
  { industry: "SaaS Companies", country: "United States", icon: "💻" },
  { industry: "Real Estate Developers", country: "United Kingdom", icon: "🏗️" },
  { industry: "Fintech Startups", country: "Singapore", icon: "🏦" },
  { industry: "EV Manufacturers", country: "China", icon: "⚡" },
  { industry: "Textile Exporters", country: "India", icon: "🧵" },
];

const searchPhases = [
  { message: "Querying Apollo.io API...", icon: "🔍" },
  { message: "Scanning LinkedIn Sales Navigator...", icon: "💼" },
  { message: "Crawling web directories...", icon: "🌐" },
  { message: "Deduplicating records...", icon: "🔄" },
  { message: "AI enriching & scoring leads...", icon: "🤖" },
  { message: "Finalizing results...", icon: "✨" },
];

const deepSearchPhases = [
  { message: "Querying Apollo.io API...", icon: "🔍" },
  { message: "Scanning LinkedIn Sales Navigator...", icon: "💼" },
  { message: "Crawling web directories...", icon: "🌐" },
  { message: "🌐 Deep searching internet for real companies...", icon: "🕵️" },
  { message: "Extracting contacts from search results...", icon: "📧" },
  { message: "Deduplicating records...", icon: "🔄" },
  { message: "AI enriching & scoring leads...", icon: "🤖" },
  { message: "Finalizing results...", icon: "✨" },
];

export default function HunterContent() {
  const [industry, setIndustry] = useState("");
  const [country, setCountry] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [results, setResults] = useState<EnrichedLead[]>([]);
  const [stats, setStats] = useState<SearchStats | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLeads, setSelectedLeads] = useState<Set<number>>(new Set());
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [expandedLead, setExpandedLead] = useState<number | null>(null);
  const [messageModal, setMessageModal] = useState<{ lead: EnrichedLead; channel: "whatsapp" | "email" } | null>(null);
  const [deepSearch, setDeepSearch] = useState(false);
  const phaseInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const activePhases = deepSearch ? deepSearchPhases : searchPhases;

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

    // Animate phases while API runs
    let phase = 0;
    phaseInterval.current = setInterval(() => {
      phase = Math.min(phase + 1, activePhases.length - 1);
      setCurrentPhase(phase);
    }, deepSearch ? 1800 : 1200);

    try {
      const response = await fetch("/api/hunter/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ industry, country, deepSearch }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      if (phaseInterval.current) clearInterval(phaseInterval.current);
      setCurrentPhase(activePhases.length - 1);

      // Small delay for final animation
      await new Promise((r) => setTimeout(r, 500));

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
    const toImport = leadsToImport || (selectedLeads.size > 0
      ? results.filter((_, i) => selectedLeads.has(i))
      : results);

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
    setSelectedLeads((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedLeads.size === results.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(results.map((_, i) => i)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="gradient-text">Lead Hunter</span> 🎯
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search any industry + country — powered by Apollo, LinkedIn & Web extraction
        </p>
      </div>

      {/* Search Card */}
      <div className="glass-card p-6 gradient-border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Industry (e.g., Pharmaceutical Importers)"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-3 bg-input border border-input-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground input-focus"
            />
          </div>
          <div className="flex-1 relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Country (e.g., Germany)"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full pl-10 pr-4 py-3 bg-input border border-input-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground input-focus"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDeepSearch(!deepSearch)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold transition-all border shrink-0 ${deepSearch ? "bg-accent/10 border-accent/30 text-accent" : "bg-surface border-border-subtle text-muted-foreground hover:text-foreground"}`}
            >
              <span className="text-sm">{deepSearch ? "🕵️" : "🔍"}</span>
              {deepSearch ? "Deep Search ON" : "Quick Search"}
            </button>
            <button
              onClick={handleSearch}
              disabled={isSearching || !industry || !country}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shrink-0"
            >
              {isSearching ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {deepSearch ? "Deep Hunting..." : "Hunting..."}</>
              ) : (
                <><Sparkles className="w-4 h-4" /> {deepSearch ? "Deep Hunt" : "Hunt Leads"}</>
              )}
            </button>
          </div>
        </div>

        {/* Search progress */}
        {isSearching && (
          <div className="mt-5 animate-fade-in">
            <div className="space-y-2">
              {activePhases.map((phase, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                    i <= currentPhase
                      ? "bg-surface border border-border-subtle"
                      : "opacity-30"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${
                    i < currentPhase
                      ? "bg-success/15"
                      : i === currentPhase
                      ? "bg-primary/15"
                      : "bg-muted"
                  }`}>
                    {i < currentPhase ? (
                      <CheckCircle2 className="w-4 h-4 text-success" />
                    ) : i === currentPhase ? (
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    ) : (
                      <span className="text-xs">{phase.icon}</span>
                    )}
                  </div>
                  <span className={`text-sm ${i <= currentPhase ? "text-foreground" : "text-muted-foreground"}`}>
                    {phase.message}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${((currentPhase + 1) / searchPhases.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-center gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-danger shrink-0" />
            <div>
              <p className="text-sm font-medium text-danger">Search Error</p>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick searches */}
      {!hasSearched && (
        <div className="animate-fade-in">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Popular Searches</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {popularSearches.map((s, i) => (
              <button
                key={i}
                onClick={() => { setIndustry(s.industry); setCountry(s.country); }}
                className="flex items-center gap-3 p-4 bg-surface rounded-xl border border-border-subtle hover:border-primary/30 hover:bg-surface-hover transition-all text-left group"
              >
                <span className="text-2xl">{s.icon}</span>
                <div>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">{s.industry}</p>
                  <p className="text-xs text-muted-foreground">{s.country}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stats Banner */}
      {stats && !isSearching && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="glass-card p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center mx-auto mb-2">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xl font-bold">{stats.totalFound}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Total Found</p>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-danger/15 flex items-center justify-center mx-auto mb-2">
                <Target className="w-4 h-4 text-danger" />
              </div>
              <p className="text-xl font-bold text-danger">{stats.hotLeads}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Hot (≥70)</p>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-success/15 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
              </div>
              <p className="text-xl font-bold text-success">{stats.verifiedEmails}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Verified</p>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-4 h-4 text-accent" />
              </div>
              <p className="text-xl font-bold text-accent">{stats.averageScore}</p>
              <p className="text-[10px] text-muted-foreground uppercase">Avg Score</p>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-warning/15 flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="w-4 h-4 text-warning" />
              </div>
              <p className="text-xs font-bold">
                <span className="text-primary">{stats.sourceBreakdown.apollo}</span>{"/"}
                <span className="text-info">{stats.sourceBreakdown.linkedin}</span>{"/"}
                <span className="text-warning">{stats.sourceBreakdown.web}</span>
                {(stats.sourceBreakdown.deep || 0) > 0 && <><span className="text-muted-foreground">/</span><span className="text-accent">{stats.sourceBreakdown.deep}</span></>}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase mt-1">{(stats.sourceBreakdown.deep || 0) > 0 ? "A/L/W/D" : "A/L/W"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Import Result Banner */}
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
          <button
            onClick={() => setImportResult(null)}
            className="ml-auto p-1.5 rounded-lg hover:bg-surface-hover text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && !isSearching && (
        <div className="animate-fade-in space-y-4">
          {/* Results header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  selectedLeads.size === results.length
                    ? "bg-primary border-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {selectedLeads.size === results.length && <Check className="w-3 h-3 text-white" />}
              </button>
              <p className="text-sm font-semibold">
                {selectedLeads.size > 0 ? `${selectedLeads.size} selected` : `${results.length} leads found`}
              </p>
              <span className="text-xs text-muted-foreground">
                {industry} in {country} • {stats?.sourceBreakdown.apollo || 0} Apollo + {stats?.sourceBreakdown.linkedin || 0} LinkedIn + {stats?.sourceBreakdown.web || 0} Web{(stats?.sourceBreakdown.deep || 0) > 0 ? ` + ${stats?.sourceBreakdown.deep} Deep` : ""}
              </span>
            </div>
            <div className="flex gap-2">
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

          {/* Results grid */}
          <div className="grid gap-3">
            {results.map((lead, index) => (
              <div
                key={index}
                className={`glass-card p-4 transition-all cursor-pointer ${
                  selectedLeads.has(index) ? "border-primary/30 bg-primary/[0.02]" : "hover:border-primary/15"
                }`}
                onClick={() => setExpandedLead(expandedLead === index ? null : index)}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLeadSelection(index); }}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-1 shrink-0 transition-colors ${
                      selectedLeads.has(index)
                        ? "bg-primary border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {selectedLeads.has(index) && <Check className="w-3 h-3 text-white" />}
                  </button>

                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-sm font-bold text-primary shrink-0 border border-primary/10">
                    {lead.firstName?.[0]}{lead.lastName?.[0]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-semibold">{lead.firstName} {lead.lastName}</h3>
                      {lead.emailVerified && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
                      <span className={`badge ${
                        lead.source === "apollo" ? "bg-primary/15 text-primary" :
                        lead.source === "linkedin" ? "bg-info/15 text-info" :
                        "bg-warning/15 text-warning"
                      }`}>{lead.source === "web_scraper" ? "Web" : lead.source}</span>
                      <span className="badge bg-surface text-muted-foreground">
                        {Math.round(lead.enrichmentConfidence * 100)}% conf
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{lead.designation} at {lead.companyName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {lead.city}, {lead.country}
                      {lead.companySize && <span className="ml-2">• {lead.companySize} employees</span>}
                      {lead.companyRevenue && <span className="ml-2">• {lead.companyRevenue}</span>}
                    </p>

                    {/* Contact row */}
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      {lead.email && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
                          <Mail className="w-3 h-3" /> {lead.email}
                        </span>
                      )}
                      {lead.phone && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors">
                          <Phone className="w-3 h-3" /> {lead.phone}
                        </span>
                      )}
                      {lead.linkedinUrl && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-info transition-colors">
                          <LinkedinIcon className="w-3 h-3" /> LinkedIn
                        </span>
                      )}
                      {lead.website && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <ExternalLink className="w-3 h-3" /> {lead.website}
                        </span>
                      )}
                    </div>

                    {/* Expanded details */}
                    {expandedLead === index && (
                      <div className="mt-4 pt-4 border-t border-border-subtle animate-fade-in space-y-3">
                        {lead.personalizedHook && (
                          <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                            <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">
                              <Sparkles className="w-3 h-3 inline mr-1" />AI Personalized Hook
                            </p>
                            <p className="text-sm text-foreground">{lead.personalizedHook}</p>
                          </div>
                        )}
                        {lead.aiSummary && (
                          <p className="text-xs text-muted-foreground"><strong>Summary:</strong> {lead.aiSummary}</p>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleImport([lead]); }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            Import Lead
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setMessageModal({ lead, channel: "whatsapp" }); }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" /> WhatsApp
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setMessageModal({ lead, channel: "email" }); }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-info/10 text-info hover:bg-info/20 transition-colors flex items-center gap-1"
                          >
                            <Mail className="w-3 h-3" /> Email
                          </button>
                          <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-success/10 text-success hover:bg-success/20 transition-colors">
                            Send to Workflow
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className={`text-2xl font-bold ${
                      lead.score >= 90 ? "text-success" : lead.score >= 80 ? "text-primary" : lead.score >= 70 ? "text-accent" : "text-warning"
                    }`}>
                      {lead.score}
                    </div>
                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          lead.score >= 90 ? "bg-success" : lead.score >= 80 ? "bg-primary" : lead.score >= 70 ? "bg-accent" : "bg-warning"
                        }`}
                        style={{ width: `${lead.score}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
