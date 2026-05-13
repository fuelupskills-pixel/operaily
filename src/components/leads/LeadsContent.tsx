"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Loader2,
  Inbox,
} from "lucide-react";

interface LeadRecord {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  companyName: string | null;
  designation: string | null;
  country: string | null;
  city: string | null;
  leadScore: number;
  status: string;
  source: string;
  personalizedHook: string | null;
  createdAt: string;
}

const statusStyles: Record<string, string> = {
  new: "bg-muted text-muted-foreground border-border-subtle",
  contacted: "bg-warning/15 text-warning border-warning/20",
  engaged: "bg-primary/15 text-primary border-primary/20",
  qualified: "bg-accent/15 text-accent border-accent/20",
  meeting_set: "bg-success/15 text-success border-success/20",
  won: "bg-success/15 text-success border-success/20",
  lost: "bg-danger/15 text-danger border-danger/20",
  archived: "bg-muted text-muted-foreground border-border-subtle",
};

const statusLabels: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  engaged: "Engaged",
  qualified: "Qualified",
  meeting_set: "Meeting Set",
  won: "Won",
  lost: "Lost",
  archived: "Archived",
};

export default function LeadsContent() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState("leadScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
        sortBy,
        sortOrder,
      });
      if (searchQuery) params.set("search", searchQuery);

      const response = await fetch(`/api/leads?${params}`);
      const data = await response.json();

      if (data.success) {
        setLeads(data.leads || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} total leads in CRM
            {total === 0 && " — Use Lead Hunter to find and import leads"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchLeads}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-surface border border-border-subtle hover:border-border transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm hover:opacity-90 transition-all">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="glass-card p-4 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, company, email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-input border border-input-border rounded-xl text-sm input-focus"
          />
        </div>
        <button
          onClick={() => toggleSort("leadScore")}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            sortBy === "leadScore" ? "bg-primary/10 text-primary" : "bg-surface border border-border-subtle hover:border-border"
          }`}
        >
          <ArrowUpDown className="w-3 h-3" /> Score {sortBy === "leadScore" ? (sortOrder === "desc" ? "↓" : "↑") : ""}
        </button>
        <button
          onClick={() => toggleSort("createdAt")}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            sortBy === "createdAt" ? "bg-primary/10 text-primary" : "bg-surface border border-border-subtle hover:border-border"
          }`}
        >
          <ArrowUpDown className="w-3 h-3" /> Date {sortBy === "createdAt" ? (sortOrder === "desc" ? "↓" : "↑") : ""}
        </button>
      </div>

      {/* Empty State */}
      {!isLoading && leads.length === 0 && (
        <div className="glass-card p-12 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold gradient-text">No Leads Yet</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Your CRM is empty. Go to <strong>Lead Hunter</strong> to search and import your first leads,
            or add them manually.
          </p>
        </div>
      )}

      {/* Loading */}
      {isLoading && leads.length === 0 && (
        <div className="glass-card p-12 text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Loading leads...</p>
        </div>
      )}

      {/* Table */}
      {leads.length > 0 && (
        <div className="glass-card overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-muted-foreground border-b border-border">
                  <th className="text-left px-5 py-3 font-medium">Lead</th>
                  <th className="text-left px-3 py-3 font-medium">Score</th>
                  <th className="text-left px-3 py-3 font-medium">Status</th>
                  <th className="text-left px-3 py-3 font-medium">Source</th>
                  <th className="text-left px-3 py-3 font-medium">Location</th>
                  <th className="text-left px-3 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="table-row-hover border-b border-border-subtle last:border-0 group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                          {lead.firstName?.[0]}{lead.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{lead.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {lead.designation} · {lead.companyName || lead.company}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              lead.leadScore >= 90 ? "bg-success" :
                              lead.leadScore >= 80 ? "bg-primary" :
                              lead.leadScore >= 70 ? "bg-accent" : "bg-warning"
                            }`}
                            style={{ width: `${lead.leadScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold w-6">{lead.leadScore}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`badge border ${statusStyles[lead.status] || statusStyles.new}`}>
                        {statusLabels[lead.status] || lead.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`badge ${
                        lead.source === "apollo" ? "bg-primary/15 text-primary" :
                        lead.source === "linkedin" ? "bg-info/15 text-info" :
                        lead.source === "web_scraper" ? "bg-warning/15 text-warning" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {lead.source === "web_scraper" ? "Web" : lead.source}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {lead.city}, {lead.country}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 rounded-lg hover:bg-surface-hover text-muted-foreground hover:text-success transition-colors" title="WhatsApp">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-surface-hover text-muted-foreground hover:text-info transition-colors" title="Email">
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-surface-hover text-muted-foreground hover:text-accent transition-colors" title="Call">
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-surface-hover text-muted-foreground hover:text-foreground transition-colors">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Showing {leads.length} of {total} leads • Page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg hover:bg-surface-hover text-muted-foreground transition-colors disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    page === p ? "bg-primary/10 text-primary" : "hover:bg-surface-hover text-muted-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg hover:bg-surface-hover text-muted-foreground transition-colors disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
