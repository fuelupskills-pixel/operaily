"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  MessageSquare, Mail, Phone, Users, Shield, Key,
  Save, Plus, Trash2, CheckCircle2, AlertCircle, Eye, EyeOff,
  Globe, Link2, ChevronRight, Crown, UserCheck, UserMinus,
  Megaphone, Palette, User, Building2, MapPin, Camera, Edit3,
  Video, Award, Play, ShieldCheck, RefreshCw, LogOut, Send, Target,
} from "lucide-react";

/* ——— Types ——— */
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "agent" | "viewer";
  status: "active" | "invited" | "inactive";
  assignedLeads: number;
  avatar: string;
}

interface AdAccount {
  id: string;
  platform: "meta" | "google" | "tiktok";
  name: string;
  accountId: string;
  status: "connected" | "disconnected" | "expired";
}

/* ——— Mock Data ——— */
const initialTeam: TeamMember[] = [
  { id: "1", name: "Admin User", email: "admin@omnisigma.com", role: "admin", status: "active", assignedLeads: 0, avatar: "AU" },
  { id: "2", name: "Sarah Chen", email: "sarah@omnisigma.com", role: "manager", status: "active", assignedLeads: 234, avatar: "SC" },
  { id: "3", name: "Raj Patel", email: "raj@omnisigma.com", role: "agent", status: "active", assignedLeads: 178, avatar: "RP" },
  { id: "4", name: "Maria Santos", email: "maria@omnisigma.com", role: "agent", status: "invited", assignedLeads: 0, avatar: "MS" },
];

const initialAdAccounts: AdAccount[] = [
  { id: "1", platform: "meta", name: "OMNI-SIGMA Meta Ads", accountId: "act_1234567890", status: "connected" },
  { id: "2", platform: "google", name: "OMNI-SIGMA Google Ads", accountId: "123-456-7890", status: "disconnected" },
  { id: "3", platform: "tiktok", name: "", accountId: "", status: "disconnected" },
];

const roleConfig = {
  admin: { label: "Admin", color: "#ef4444", icon: Crown, perms: "Full access — manage team, settings, billing" },
  manager: { label: "Manager", color: "#f59e0b", icon: Shield, perms: "Manage leads, run workflows, view analytics" },
  agent: { label: "Agent", color: "#6366f1", icon: UserCheck, perms: "View assigned leads, send messages, book meetings" },
  viewer: { label: "Viewer", color: "#64748b", icon: Eye, perms: "View-only access to dashboard and reports" },
};

const platformStyles: Record<string, { color: string; label: string }> = {
  meta: { color: "#1877F2", label: "Meta (Facebook/Instagram)" },
  google: { color: "#34A853", label: "Google Ads" },
  tiktok: { color: "#FE2C55", label: "TikTok Ads" },
};

type SettingsTab = "profile" | "channels" | "team" | "ads" | "branding" | "integrations";

export default function SettingsContent() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [saved, setSaved] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("connected") || params.get("tab") === "integrations") {
        setActiveTab("integrations");
      }
    }
  }, []);

  // Profile
  const [profile, setProfile] = useState({
    companyName: "OMNI-SIGMA Exports",
    tagline: "International Pharmaceutical & Nutraceutical Exporters",
    industry: "Pharmaceutical & Nutraceutical Export",
    website: "https://omnisigma.com",
    address: "123 Export Tower, Mumbai, India",
    country: "India",
    timezone: "Asia/Kolkata (IST)",
    currency: "USD",
    description: "Leading exporter of WHO-GMP certified pharmaceutical and nutraceutical products to 40+ countries worldwide. Specializing in antibiotics, cardiovascular, nutraceuticals, and specialty formulations.",
  });
  const [userProfile, setUserProfile] = useState({
    firstName: "Operator",
    lastName: "Admin",
    email: "admin@omnisigma.com",
    phone: "+91 98765 43210",
    designation: "CEO & Founder",
    bio: "Serial entrepreneur with 15+ years in pharmaceutical exports.",
  });
  const [socials, setSocials] = useState({
    linkedin: "https://linkedin.com/company/omnisigma",
    twitter: "https://x.com/omnisigma",
    facebook: "https://facebook.com/omnisigma",
    instagram: "https://instagram.com/omnisigma_exports",
    youtube: "https://youtube.com/@omnisigma",
    tiktok: "",
    whatsappChannel: "https://whatsapp.com/channel/omnisigma",
    telegram: "https://t.me/omnisigma",
  });

  // Channel config
  const [waNumber, setWaNumber] = useState("+91 98765 43210");
  const [waBusinessName, setWaBusinessName] = useState("OMNI-SIGMA Exports");
  const [emailAddress, setEmailAddress] = useState("exports@omnisigma.com");
  const [emailDisplayName, setEmailDisplayName] = useState("OMNI-SIGMA Exports");
  const [callingNumber, setCallingNumber] = useState("+91 11 4567 8900");
  const [callerIdName, setCallerIdName] = useState("OMNI-SIGMA");
  const [calendarLink, setCalendarLink] = useState("https://cal.com/omnisigma/30min");

  // API keys (masked)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [apiKeys, setApiKeys] = useState({
    whatsappToken: "EAABs...hidden...x4ZD",
    whatsappPhoneId: "1234567890",
    resendKey: "re_abc...hidden...xyz",
    twilioSid: "AC...hidden...ef",
    twilioToken: "auth...hidden...tok",
    telnyxKey: "KEY...hidden...xyz",
    vapiKey: "vapi_...hidden...key",
    geminiKey: "AIzaSy...hidden...xyz",
    anthropicKey: "sk-ant...hidden...xyz",
    deepseekKey: "sk-ds...hidden...xyz",
    memoKey: "sk-memo...hidden...xyz",
    apolloKey: "apo_...hidden...key",
    firecrawlKey: "fc-...hidden...key",
    serperKey: "serp_...hidden...key",
    proxycurlKey: "pc_...hidden...key",
  });

  // Team
  const [team, setTeam] = useState(initialTeam);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"manager" | "agent" | "viewer">("agent");

  // Ads
  const [adAccounts, setAdAccounts] = useState(initialAdAccounts);

  const handleSave = () => {
    const settingsToSave = {
      profile, userProfile, socials, waNumber, waBusinessName, emailAddress, emailDisplayName, callingNumber, callerIdName, calendarLink, apiKeys, team
    };
    localStorage.setItem("omni_settings", JSON.stringify(settingsToSave));
    
    // Dispatch a custom event so other components (like TopBar, Sidebar) can update immediately
    window.dispatchEvent(new Event("omni_settings_updated"));

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  React.useEffect(() => {
    const savedSettings = localStorage.getItem("omni_settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.userProfile) setUserProfile(parsed.userProfile);
        if (parsed.socials) setSocials(parsed.socials);
        if (parsed.waNumber) setWaNumber(parsed.waNumber);
        if (parsed.waBusinessName) setWaBusinessName(parsed.waBusinessName);
        if (parsed.emailAddress) setEmailAddress(parsed.emailAddress);
        if (parsed.emailDisplayName) setEmailDisplayName(parsed.emailDisplayName);
        if (parsed.callingNumber) setCallingNumber(parsed.callingNumber);
        if (parsed.callerIdName) setCallerIdName(parsed.callerIdName);
        if (parsed.calendarLink) setCalendarLink(parsed.calendarLink);
        if (parsed.apiKeys) setApiKeys(parsed.apiKeys);
        if (parsed.team) setTeam(parsed.team);
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, []);

  const handleInvite = () => {
    if (!inviteEmail) return;
    const newMember: TeamMember = {
      id: String(Date.now()), name: inviteEmail.split("@")[0],
      email: inviteEmail, role: inviteRole, status: "invited",
      assignedLeads: 0, avatar: inviteEmail.slice(0, 2).toUpperCase(),
    };
    setTeam([...team, newMember]);
    setInviteEmail("");
    setShowInvite(false);
  };

  const socialFields: { key: string; label: string; placeholder: string; color: string }[] = [
    { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/...", color: "#0A66C2" },
    { key: "twitter", label: "X (Twitter)", placeholder: "https://x.com/...", color: "#1DA1F2" },
    { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/...", color: "#1877F2" },
    { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/...", color: "#E4405F" },
    { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@...", color: "#FF0000" },
    { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@...", color: "#FE2C55" },
    { key: "whatsappChannel", label: "WhatsApp Channel", placeholder: "https://whatsapp.com/channel/...", color: "#25D366" },
    { key: "telegram", label: "Telegram", placeholder: "https://t.me/...", color: "#26A5E4" },
  ];

  const tabs: { key: SettingsTab; label: string; icon: React.ElementType }[] = [
    { key: "profile", label: "Profile & Social", icon: User },
    { key: "channels", label: "Channels", icon: MessageSquare },
    { key: "team", label: "Team", icon: Users },
    { key: "integrations", label: "Integrations Center", icon: Globe },
    { key: "ads", label: "Ad Accounts", icon: Megaphone },
    { key: "branding", label: "API Keys", icon: Key },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight"><span className="gradient-text">Settings</span> ⚙️</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure channels, team, and integrations</p>
        </div>
        <button onClick={handleSave} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${saved ? "bg-success/10 text-success" : "bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"}`}>
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface rounded-xl border border-border-subtle p-1">
        {tabs.map((tab) => { const Icon = tab.icon; return (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-colors flex-1 justify-center ${activeTab === tab.key ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground"}`}>
            <Icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ); })}
      </div>

      {/* ─── PROFILE TAB ─── */}
      {activeTab === "profile" && (
        <div className="space-y-4 animate-fade-in">
          {/* Company Profile Card */}
          <div className="glass-card p-6">
            <div className="flex items-start gap-5">
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  OS
                </div>
                <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-all">
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">{profile.companyName}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{profile.tagline}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-3">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Building2 className="w-3 h-3" /> {profile.industry}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" /> {profile.country}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Globe className="w-3 h-3" /> {profile.website}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="glass-card p-5 relative z-20">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> Company Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative z-30 pointer-events-auto"><label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Company Name</label>
                <input value={profile.companyName} onChange={e => setProfile({...profile, companyName: e.target.value})} className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus relative z-40 pointer-events-auto" /></div>
                <div className="relative z-30 pointer-events-auto"><label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Tagline</label>
                <input value={profile.tagline} onChange={e => setProfile({...profile, tagline: e.target.value})} className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus relative z-40 pointer-events-auto" /></div>
                <div className="relative z-30 pointer-events-auto"><label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Industry</label>
                <input value={profile.industry} onChange={e => setProfile({...profile, industry: e.target.value})} className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus relative z-40 pointer-events-auto" /></div>
                <div className="relative z-30 pointer-events-auto"><label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Website</label>
                <input value={profile.website} onChange={e => setProfile({...profile, website: e.target.value})} className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus relative z-40 pointer-events-auto" /></div>
                <div className="relative z-30 pointer-events-auto"><label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Address</label>
                <input value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus relative z-40 pointer-events-auto" /></div>
                <div className="relative z-30 pointer-events-auto"><label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Country</label>
                <input value={profile.country} onChange={e => setProfile({...profile, country: e.target.value})} className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus relative z-40 pointer-events-auto" /></div>
                <div className="relative z-30 pointer-events-auto"><label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Timezone</label>
                <input value={profile.timezone} onChange={e => setProfile({...profile, timezone: e.target.value})} className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus relative z-40 pointer-events-auto" /></div>
                <div className="relative z-30 pointer-events-auto"><label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Currency</label>
                <select value={profile.currency} onChange={e => setProfile({...profile, currency: e.target.value})} className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm relative z-40 pointer-events-auto">
                  <option value="USD">USD ($)</option><option value="EUR">EUR (€)</option><option value="GBP">GBP (£)</option><option value="INR">INR (₹)</option><option value="AED">AED (د.إ)</option>
                </select></div>
              </div>
              <div className="mt-4 relative z-30 pointer-events-auto"><label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Company Description</label>
              <textarea value={profile.description} onChange={e => setProfile({...profile, description: e.target.value})} rows={3} className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus resize-none relative z-40 pointer-events-auto" /></div>
            </div>

          {/* User Profile */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2"><User className="w-4 h-4 text-accent" /> Your Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">First Name</label>
              <input value={userProfile.firstName} onChange={e => setUserProfile({...userProfile, firstName: e.target.value})} className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus" /></div>
              <div><label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Last Name</label>
              <input value={userProfile.lastName} onChange={e => setUserProfile({...userProfile, lastName: e.target.value})} className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus" /></div>
              <div><label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Designation</label>
              <input value={userProfile.designation} onChange={e => setUserProfile({...userProfile, designation: e.target.value})} className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus" /></div>
              <div><label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Email</label>
              <input value={userProfile.email} onChange={e => setUserProfile({...userProfile, email: e.target.value})} className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus" /></div>
              <div><label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Phone</label>
              <input value={userProfile.phone} onChange={e => setUserProfile({...userProfile, phone: e.target.value})} className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus" /></div>
              <div><label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Bio</label>
              <input value={userProfile.bio} onChange={e => setUserProfile({...userProfile, bio: e.target.value})} className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus" /></div>
            </div>
          </div>

          {/* Social Media */}
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> Social Media & Presence</h3>
            <p className="text-[10px] text-muted-foreground mb-4">Links displayed on your profile and used in outreach signatures</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {socialFields.map((sf) => (
                <div key={sf.key} className="relative">
                  <label className="text-[10px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5" style={{ color: sf.color }}>
                    <span className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold text-white" style={{ background: sf.color }}>
                      {sf.label[0]}
                    </span>
                    {sf.label}
                    {socials[sf.key as keyof typeof socials] && <CheckCircle2 className="w-3 h-3 text-success" />}
                  </label>
                  <input
                    value={socials[sf.key as keyof typeof socials]}
                    onChange={e => setSocials({...socials, [sf.key]: e.target.value})}
                    placeholder={sf.placeholder}
                    className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── CHANNELS TAB ─── */}
      {activeTab === "channels" && (
        <div className="space-y-4 animate-fade-in">
          {/* WhatsApp */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center"><MessageSquare className="w-5 h-5 text-[#25D366]" /></div>
              <div><h3 className="text-sm font-semibold">WhatsApp Business</h3><p className="text-[10px] text-muted-foreground">All outreach messages will be sent from this number</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Business Phone Number</label>
                <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={waNumber} onChange={(e) => setWaNumber(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus" /></div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Business Name</label>
                <input value={waBusinessName} onChange={(e) => setWaBusinessName(e.target.value)} className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus" />
              </div>
            </div>
          </div>

          {/* Email */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Mail className="w-5 h-5 text-primary" /></div>
              <div><h3 className="text-sm font-semibold">Email Configuration</h3><p className="text-[10px] text-muted-foreground">Official email for all automated outreach</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">From Email Address</label>
                <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus" /></div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Display Name</label>
                <input value={emailDisplayName} onChange={(e) => setEmailDisplayName(e.target.value)} className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus" />
              </div>
            </div>
          </div>

          {/* Calling */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center"><Phone className="w-5 h-5 text-accent" /></div>
              <div><h3 className="text-sm font-semibold">Voice / Calling</h3><p className="text-[10px] text-muted-foreground">Caller ID for AI voice calls and manual dials</p></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Calling Number</label>
                <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={callingNumber} onChange={(e) => setCallingNumber(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus" /></div>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Caller ID Name</label>
                <input value={callerIdName} onChange={(e) => setCallerIdName(e.target.value)} className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus" />
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center"><Link2 className="w-5 h-5 text-success" /></div>
              <div><h3 className="text-sm font-semibold">Calendar Booking</h3><p className="text-[10px] text-muted-foreground">Default link used in all outreach templates</p></div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Booking URL</label>
              <div className="relative"><Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input value={calendarLink} onChange={(e) => setCalendarLink(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus" /></div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TEAM TAB ─── */}
      {activeTab === "team" && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{team.length} team members • {team.filter(m => m.status === "active").length} active</p>
            <button onClick={() => setShowInvite(!showInvite)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-xs font-semibold hover:opacity-90">
              <Plus className="w-3.5 h-3.5" /> Invite Member
            </button>
          </div>

          {/* Invite Form */}
          {showInvite && (
            <div className="glass-card p-5 gradient-border animate-fade-in">
              <h3 className="text-sm font-semibold mb-3">Invite New Team Member</h3>
              <div className="flex gap-3">
                <div className="flex-1 relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="email@company.com" className="w-full pl-10 pr-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus" /></div>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as typeof inviteRole)} className="px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm">
                  <option value="manager">Manager</option>
                  <option value="agent">Agent</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button onClick={handleInvite} className="px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:opacity-90">Send Invite</button>
              </div>
            </div>
          )}

          {/* Role Legend */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(roleConfig).map(([key, cfg]) => { const Icon = cfg.icon; return (
              <div key={key} className="glass-card p-3 text-center">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-2" style={{ background: `${cfg.color}15` }}><Icon className="w-4 h-4" style={{ color: cfg.color }} /></div>
                <p className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">{cfg.perms}</p>
              </div>
            ); })}
          </div>

          {/* Team Table */}
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead><tr className="text-[10px] text-muted-foreground uppercase border-b border-border">
                <th className="text-left px-5 py-3 font-medium">Member</th>
                <th className="text-left px-3 py-3 font-medium">Role</th>
                <th className="text-left px-3 py-3 font-medium">Status</th>
                <th className="text-right px-3 py-3 font-medium">Assigned Leads</th>
                <th className="px-3 py-3"></th>
              </tr></thead>
              <tbody>
                {team.map((m) => { const cfg = roleConfig[m.role]; const RoleIcon = cfg.icon; return (
                  <tr key={m.id} className="border-b border-border-subtle last:border-0 table-row-hover group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{m.avatar}</div>
                        <div><p className="text-sm font-medium">{m.name}</p><p className="text-[10px] text-muted-foreground">{m.email}</p></div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="badge flex items-center gap-1 w-fit" style={{ background: `${cfg.color}15`, color: cfg.color }}>
                        <RoleIcon className="w-3 h-3" /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`badge ${m.status === "active" ? "bg-success/15 text-success" : m.status === "invited" ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground"}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-right font-medium">{m.assignedLeads > 0 ? m.assignedLeads : "—"}</td>
                    <td className="px-3 py-3">
                      {m.role !== "admin" && (
                        <button onClick={() => setTeam(team.filter(t => t.id !== m.id))} className="p-1.5 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ); })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── ADS TAB ─── */}
      {activeTab === "ads" && (
        <div className="space-y-4 animate-fade-in">
          <p className="text-sm text-muted-foreground">Connect your ad platform accounts to enable AI campaign management</p>
          {adAccounts.map((acc) => {
            const ps = platformStyles[acc.platform];
            return (
              <div key={acc.id} className="glass-card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${ps.color}15` }}>
                      <Megaphone className="w-5 h-5" style={{ color: ps.color }} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{ps.label}</h3>
                      {acc.status === "connected" ? (
                        <div className="flex items-center gap-2 mt-0.5"><CheckCircle2 className="w-3 h-3 text-success" /><span className="text-[11px] text-success">{acc.name}</span><span className="text-[10px] text-muted-foreground">({acc.accountId})</span></div>
                      ) : (
                        <p className="text-[11px] text-muted-foreground mt-0.5">Not connected</p>
                      )}
                    </div>
                  </div>
                  <button className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${acc.status === "connected" ? "bg-surface border border-border-subtle hover:border-danger hover:text-danger" : "text-white hover:opacity-90"}`}
                    style={acc.status !== "connected" ? { background: ps.color } : undefined}>
                    {acc.status === "connected" ? "Disconnect" : "Connect Account"}
                  </button>
                </div>
                {acc.status !== "connected" && (
                  <div className="mt-4 pt-4 border-t border-border-subtle">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Account ID</label>
                        <input placeholder={acc.platform === "meta" ? "act_xxxxx" : acc.platform === "google" ? "xxx-xxx-xxxx" : "Advertiser ID"} className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus" />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Access Token / API Key</label>
                        <input type="password" placeholder="Paste your token here" className="w-full px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── API KEYS TAB ─── */}
      {activeTab === "branding" && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass-card p-4 border-warning/20">
            <div className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-warning" /><p className="text-xs text-warning font-medium">API keys are sensitive. Never share them publicly.</p></div>
          </div>
          {Object.entries({
            "WhatsApp (Meta)": [["whatsappToken", "Access Token"], ["whatsappPhoneId", "Phone Number ID"]],
            "Email (Resend)": [["resendKey", "API Key"]],
            "SMS & Voice (Twilio)": [["twilioSid", "Account SID"], ["twilioToken", "Auth Token"]],
            "Secondary Voice (Telnyx)": [["telnyxKey", "API Key"]],
            "AI Voice (Vapi)": [["vapiKey", "API Key"]],
            "AI / Google Gemini": [["geminiKey", "API Key"]],
            "AI / Anthropic Claude": [["anthropicKey", "API Key"]],
            "AI / DeepSeek": [["deepseekKey", "API Key"]],
            "AI / Memo": [["memoKey", "API Key"]],
            "Lead Hunter (Apollo)": [["apolloKey", "API Key"]],
            "Lead Hunter (Web Crawl / Firecrawl)": [["firecrawlKey", "API Key"]],
            "Lead Hunter (Directories / Serper)": [["serperKey", "API Key"]],
            "Lead Hunter (LinkedIn / Proxycurl)": [["proxycurlKey", "API Key"]],
          }).map(([group, keys]) => (
            <div key={group} className="glass-card p-5">
              <h3 className="text-sm font-semibold mb-4">{group}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(keys as string[][]).map(([key, label]) => (
                  <div key={key}>
                    <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">{label}</label>
                    <div className="relative">
                      <input
                        type={showKeys[key] ? "text" : "password"}
                        value={apiKeys[key as keyof typeof apiKeys]}
                        onChange={(e) => setApiKeys({ ...apiKeys, [key]: e.target.value })}
                        className="w-full px-4 pr-10 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus font-mono"
                      />
                      <button onClick={() => setShowKeys({ ...showKeys, [key]: !showKeys[key] })} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showKeys[key] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── INTEGRATIONS TAB ─── */}
      {activeTab === "integrations" && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <h3 className="text-sm font-semibold mb-1 flex items-center gap-2"><Globe className="w-4 h-4 text-primary" /> OAuth Integrations & Authorization Center</h3>
            <p className="text-[10px] text-muted-foreground mb-4">Connect and authorize third-party platforms separately. Revoke access individually at any time.</p>
          </div>

          <IntegrationsDeck />
        </div>
      )}
    </div>
  );
}

function IntegrationsDeck() {
  const { user } = useAuth();
  const [activeConnections, setActiveConnections] = useState<Record<string, boolean>>({});
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const orgId = user?.org_id || "default_org";

  React.useEffect(() => {
    fetch(`/api/integrations?org_id=${orgId}`)
      .then(res => res.json())
      .then(res => {
        if (res.success && Array.isArray(res.data)) {
          const activeMap: Record<string, boolean> = {};
          res.data.forEach((item: any) => {
            if (item.is_active) {
              activeMap[item.provider] = true;
            }
          });
          setActiveConnections(activeMap);
        }
      })
      .catch(err => console.error("Failed to load integrations:", err));
  }, [orgId]);

  const handleToggle = async (id: string, provider: string) => {
    setLoadingProvider(id);
    try {
      if (activeConnections[provider]) {
        // Dynamic Provider OAuth Revocation Route
        const response = await fetch(`/api/auth/revoke/${provider}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ org_id: orgId, account_id: `act_${provider}_callback` })
        });
        const resData = await response.json();
        if (resData.success) {
          setActiveConnections(prev => ({ ...prev, [provider]: false }));
        }
      } else {
        // Dynamic Provider OAuth Init Routes
        window.location.href = `/api/auth/${provider}?org_id=${orgId}`;
      }
    } catch (err) {
      console.error("Operation failed:", err);
    } finally {
      setLoadingProvider(null);
    }
  };

  const integrations = [
    { id: "outlook", label: "Outlook Mail & Calendar", desc: "Sync corporate mailboxes, schedules, and outreach sequences", provider: "outlook", icon: Mail, color: "text-blue-600" },
    { id: "youtube", label: "YouTube Studio", desc: "AI script generation, video upload, and channel insights", provider: "google", icon: Video, color: "text-red-500" },
    { id: "facebook", label: "Facebook Pages", desc: "Outbound campaign updates, analytics & comment moderation", provider: "facebook", icon: Globe, color: "text-blue-500" },
    { id: "instagram", label: "Instagram Business", desc: "Automated media publishing, reels schedule, and audience stats", provider: "facebook", icon: Camera, color: "text-pink-500" },
    { id: "linkedin", label: "LinkedIn Share", desc: "AI B2B article posting and professional networking reach", provider: "linkedin", icon: Users, color: "text-sky-600" },
    { id: "whatsapp", label: "WhatsApp Business API", desc: "Outbound templates, instant AI messaging & lead scoring", provider: "whatsapp", icon: MessageSquare, color: "text-emerald-500" },
    { id: "telegram", label: "Telegram Channels", desc: "Outbound operations broadcast and chatbot notifications", provider: "telegram", icon: Send, color: "text-info" },
    { id: "google_ads", label: "Google Ads", desc: "Modify ad spend budgets, demographic targets, and conversion stats", provider: "google", icon: Target, color: "text-blue-400" },
    { id: "meta_ads", label: "Meta Ads Manager", desc: "Create ad campaigns, set daily target splits, and track leads CTR", provider: "facebook", icon: Award, color: "text-indigo-400" },
    { id: "tiktok_ads", label: "TikTok Ads Manager", desc: "Query campaign performance, audience demographics, and metrics", provider: "tiktok", icon: Play, color: "text-rose-400" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {integrations.map((item) => {
        const Icon = item.icon;
        const isConnected = activeConnections[item.provider];
        const isLoading = loadingProvider === item.id;
        return (
          <div key={item.id} className={`glass-card p-5 border transition-all duration-300 relative overflow-hidden flex gap-4 ${isConnected ? 'border-primary/20 bg-primary/5 shadow-md shadow-primary/5' : 'hover:border-border-hover'}`}>
            <div className={`w-12 h-12 rounded-2xl bg-surface border border-border flex items-center justify-center ${item.color} shrink-0`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-bold text-sm text-foreground">{item.label}</h3>
                <div className="flex items-center gap-1.5">
                  {isConnected && (
                    <span className="text-[9px] font-bold bg-success/15 text-success px-2 py-0.5 rounded-full flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-success animate-pulse" /> Connected
                    </span>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
              <div className="mt-4 flex justify-end">
                <button 
                  disabled={isLoading}
                  onClick={() => handleToggle(item.id, item.provider)}
                  className={`px-4 py-2 text-[10px] font-bold rounded-lg border transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer ${isConnected ? 'border-danger/20 bg-danger/5 text-danger hover:bg-danger/10' : 'border-primary/20 bg-primary/10 text-primary hover:bg-primary-hover hover:text-white'}`}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : isConnected ? (
                    <span>Revoke Access</span>
                  ) : (
                    <span>Connect OAuth</span>
                  )}
                </button>
              </div>
            </div>
            {isConnected && <div className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full bg-primary/10 blur-xl pointer-events-none" />}
          </div>
        );
      })}
    </div>
  );
}
