"use client";

import React, { useState } from "react";
import { 
  CreditCard, 
  Download, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Zap, 
  Globe, 
  RefreshCw,
  FileText,
  DollarSign
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  date: string;
  dueDate: string;
}

export default function BillingContent() {
  const { user } = useAuth();
  const orgId = user?.org_id || "default_org";
  const supabase = createClient();

  const [isSyncing, setIsSyncing] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function fetchInvoices() {
      if (!orgId) return;
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setInvoices(
          data.map((d: any) => ({
            id: d.id,
            number: d.invoice_number,
            client: "Customer", // TODO: Fetch from actual client relationship
            amount: d.amount,
            status: d.status.toLowerCase(),
            date: new Date(d.date).toLocaleDateString(),
            dueDate: new Date(new Date(d.date).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // 7 days later
          }))
        );
      }
      setLoading(false);
    }
    fetchInvoices();
  }, [orgId, supabase]);

  const handleVyapaarSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments & Invoices 💳</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage international payments and sync with Vyapaar</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleVyapaarSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-surface border border-border-subtle hover:border-border transition-colors text-primary"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} /> 
            {isSyncing ? "Syncing with Vyapaar..." : "Sync Vyapaar"}
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm hover:opacity-90 transition-all">
            <Plus className="w-4 h-4" /> Create Invoice
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Total Revenue</span>
          </div>
          <p className="text-3xl font-bold">$124,500.00</p>
          <div className="flex items-center gap-1 text-xs text-success font-medium mt-2">
            <ArrowUpRight className="w-3 h-3" /> +12% from last month
          </div>
        </div>

        <div className="glass-card p-5 border-warning/20 bg-warning/5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center text-warning">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-warning uppercase tracking-wider">Pending</span>
          </div>
          <p className="text-3xl font-bold">$12,840.50</p>
          <p className="text-xs text-muted-foreground mt-2">5 invoices awaiting payment</p>
        </div>

        <div className="glass-card p-5 border-success/20 bg-success/5">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center text-success">
              <Globe className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-success uppercase tracking-wider">International</span>
          </div>
          <p className="text-3xl font-bold">14 Countries</p>
          <p className="text-xs text-muted-foreground mt-2">Stripe & PayPal connected</p>
        </div>
      </div>

      {/* Integration Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card p-6 border-info/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-info/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-info" />
            </div>
            <div>
              <h3 className="font-bold text-base">International Payment Gateway</h3>
              <p className="text-xs text-muted-foreground">Accept payments via Stripe, PayPal, and more</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                   <span className="text-[10px] font-black text-[#635BFF]">Stripe</span>
                </div>
                <span className="text-sm font-medium">Stripe Connect</span>
              </div>
              <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-1 rounded-full">ACTIVE</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-surface rounded-xl border border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                   <span className="text-[10px] font-black text-[#003087]">PayPal</span>
                </div>
                <span className="text-sm font-medium">PayPal Checkout</span>
              </div>
              <button className="text-[10px] font-bold text-primary hover:underline">Configure</button>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border-accent/20">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-base">Vyapaar API Sync</h3>
              <p className="text-xs text-muted-foreground">Automatically sync invoices with Vyapaar App</p>
            </div>
          </div>
          <div className="p-4 bg-accent/5 rounded-xl border border-accent/10 mb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-accent mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Sync Enabled
            </div>
            <p className="text-[11px] text-muted-foreground">
              Last synced: Today at 2:15 PM • 12 invoices updated
            </p>
          </div>
          <button className="w-full py-2.5 rounded-xl border border-border-subtle text-xs font-bold hover:bg-surface transition-colors">
            Configure Vyapaar API Keys
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-bold">Recent Invoices</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input placeholder="Search invoices..." className="pl-8 pr-3 py-1.5 bg-input border border-input-border rounded-lg text-xs w-48 focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <button className="p-1.5 rounded-lg border border-border-subtle hover:bg-surface"><Filter className="w-3.5 h-3.5 text-muted-foreground" /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-[11px] text-muted-foreground border-b border-border-subtle bg-muted/30">
                <th className="text-left px-5 py-3 font-semibold uppercase tracking-wider">Invoice</th>
                <th className="text-left px-3 py-3 font-semibold uppercase tracking-wider">Client</th>
                <th className="text-right px-3 py-3 font-semibold uppercase tracking-wider">Amount</th>
                <th className="text-center px-3 py-3 font-semibold uppercase tracking-wider">Status</th>
                <th className="text-left px-3 py-3 font-semibold uppercase tracking-wider">Date</th>
                <th className="text-right px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-sm text-muted-foreground">Loading invoices...</td></tr>
              ) : invoices.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-sm text-muted-foreground">No invoices found. Create your first invoice!</td></tr>
              ) : invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-surface-hover transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <span className="text-sm font-bold">{inv.number}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm font-medium">{inv.client}</td>
                  <td className="px-3 py-4 text-right text-sm font-bold">${inv.amount.toLocaleString()}</td>
                  <td className="px-3 py-4">
                    <div className="flex justify-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === "paid" ? "bg-success/15 text-success border border-success/20" :
                        inv.status === "pending" ? "bg-warning/15 text-warning border border-warning/20" :
                        "bg-danger/15 text-danger border border-danger/20"
                      }`}>
                        {inv.status.toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <p className="text-[11px] font-medium">{inv.date}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Due: {inv.dueDate}</p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="p-2 rounded-lg hover:bg-surface text-muted-foreground hover:text-primary transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
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
