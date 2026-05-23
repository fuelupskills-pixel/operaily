"use client";

import React, { useState } from "react";
import {
  Link as LinkIcon,
  CheckCircle2,
  ChevronRight,
  Key,
  Globe,
  Shield,
  Zap,
  Lock,
  Mail,
  Play,
  Briefcase,
  Plus,
  Cpu,
  Network,
  User,
  MessageSquare,
  Video,
  Eye,
  EyeOff,
  AlertCircle,
  ExternalLink
} from "lucide-react";

// Types
type IntegrationCategory = "social" | "ads" | "ai";
type AuthType = "oauth" | "apiKey";
type ConnectionStatus = "connected" | "disconnected" | "connecting";

interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  description: string;
  icon: React.ElementType;
  status: ConnectionStatus;
  authType: AuthType;
  brandColor: string;
  badge?: string;
  signupUrl?: string;
}

// Mock Data
const INITIAL_INTEGRATIONS: Integration[] = [
  // --- Social & Platforms ---
  {
    id: "linkedin",
    name: "LinkedIn",
    category: "social",
    description: "Connect for social posting and lead outreach.",
    icon: Briefcase,
    status: "disconnected",
    authType: "oauth",
    brandColor: "bg-[#0A66C2]",
    signupUrl: "https://www.linkedin.com/signup"
  },
  {
    id: "instagram",
    name: "Instagram",
    category: "social",
    description: "Manage direct messages and posts.",
    icon: Network, // Stand-in for Instagram
    status: "disconnected",
    authType: "oauth",
    brandColor: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040]",
    signupUrl: "https://www.instagram.com/accounts/emailsignup/"
  },
  {
    id: "facebook",
    name: "Facebook",
    category: "social",
    description: "Sync leads and pages.",
    icon: Globe, // Stand-in for Facebook
    status: "disconnected",
    authType: "oauth",
    brandColor: "bg-[#1877F2]",
    signupUrl: "https://www.facebook.com/r.php"
  },
  {
    id: "google",
    name: "Google Account",
    category: "social",
    description: "Sign in with Google for Calendar & Docs.",
    icon: Mail,
    status: "connected",
    authType: "oauth",
    brandColor: "bg-[#EA4335]",
    signupUrl: "https://accounts.google.com/signup"
  },
  {
    id: "outlook",
    name: "Microsoft Outlook",
    category: "social",
    description: "Connect for email automation.",
    icon: Mail,
    status: "disconnected",
    authType: "oauth",
    brandColor: "bg-[#0078D4]",
    signupUrl: "https://signup.live.com/"
  },
  {
    id: "youtube_channel",
    name: "YouTube Channel",
    category: "social",
    description: "Manage video uploads and analytics.",
    icon: Video,
    status: "disconnected",
    authType: "oauth",
    brandColor: "bg-[#FF0000]",
    signupUrl: "https://accounts.google.com/signup"
  },

  // --- Ad Networks & API Keys ---
  {
    id: "google_ads",
    name: "Google Ads API",
    category: "ads",
    description: "Manage campaigns and budgets programmatically.",
    icon: Zap,
    status: "disconnected",
    authType: "apiKey",
    brandColor: "bg-[#F4B400]",
    signupUrl: "https://ads.google.com/"
  },
  {
    id: "meta_ads",
    name: "Meta Ads",
    category: "ads",
    description: "Control Facebook and Instagram ad campaigns.",
    icon: TargetIcon, 
    status: "disconnected",
    authType: "apiKey",
    brandColor: "bg-[#0668E1]",
    signupUrl: "https://business.facebook.com/"
  },
  {
    id: "youtube_api",
    name: "YouTube API",
    category: "ads",
    description: "Advanced data analytics and programmatic access.",
    icon: Play,
    status: "disconnected",
    authType: "apiKey",
    brandColor: "bg-[#FF0000]",
    signupUrl: "https://console.cloud.google.com/"
  },
  {
    id: "linkedin_ads",
    name: "LinkedIn Ads",
    category: "ads",
    description: "B2B campaign management.",
    icon: Briefcase,
    status: "disconnected",
    authType: "apiKey",
    brandColor: "bg-[#0A66C2]",
    signupUrl: "https://business.linkedin.com/marketing-solutions/ads"
  },

  // --- AI Models ---
  {
    id: "claude",
    name: "Anthropic Claude",
    category: "ai",
    description: "Login to use your Claude API credits directly.",
    icon: Cpu,
    status: "disconnected",
    authType: "oauth",
    brandColor: "bg-[#D97757]",
    badge: "Popular",
    signupUrl: "https://console.anthropic.com/register"
  },
  {
    id: "gemini",
    name: "Google Gemini",
    category: "ai",
    description: "Connect your Google account for Gemini access.",
    icon: Zap,
    status: "disconnected",
    authType: "oauth",
    brandColor: "bg-[#1A73E8]",
    signupUrl: "https://aistudio.google.com/"
  },
  {
    id: "mistral",
    name: "Mistral / Mimo",
    category: "ai",
    description: "Affordable and fast open-source models.",
    icon: Cpu,
    status: "disconnected",
    authType: "oauth",
    brandColor: "bg-[#F36B21]",
    signupUrl: "https://console.mistral.ai/register"
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    category: "ai",
    description: "Login with DeepSeek for cost-effective reasoning.",
    icon: Cpu,
    status: "disconnected",
    authType: "oauth",
    brandColor: "bg-[#2A52BE]",
    badge: "Free Tier Available",
    signupUrl: "https://platform.deepseek.com/sign_up"
  },
];

function TargetIcon(props: any) {
  return <Zap {...props} />;
}

export default function IntegrationsContent() {
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [activeTab, setActiveTab] = useState<IntegrationCategory>("social");

  // Auth Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  
  // Form States
  const [apiKey, setApiKey] = useState("");
  const [connectionName, setConnectionName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleConnect = (integration: Integration) => {
    setSelectedIntegration(integration);
    setApiKey("");
    setConnectionName("");
    setEmail("");
    setPassword("");
    setShowModal(true);
  };

  const handleDisconnect = (id: string) => {
    setIntegrations(prev => prev.map(int => int.id === id ? { ...int, status: "disconnected" } : int));
  };

  const handleSimulateConnection = () => {
    if (!selectedIntegration) return;

    // Simulate connecting state
    setIntegrations(prev => prev.map(int => int.id === selectedIntegration.id ? { ...int, status: "connecting" } : int));
    setShowModal(false);

    // Simulate delay
    setTimeout(() => {
      setIntegrations(prev => prev.map(int => int.id === selectedIntegration.id ? { ...int, status: "connected" } : int));
    }, 1500);
  };

  const renderIntegrationCard = (integration: Integration) => {
    const isConnected = integration.status === "connected";
    const isConnecting = integration.status === "connecting";
    const Icon = integration.icon;

    return (
      <div 
        key={integration.id}
        className="group relative flex flex-col p-5 rounded-2xl border border-border bg-card hover:bg-sidebar-hover transition-all duration-300"
      >
        <div className="flex justify-between items-start mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg ${integration.brandColor}`}>
            <Icon className="w-6 h-6" />
          </div>
          {isConnected ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20 text-success text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Connected
            </div>
          ) : (
             integration.badge && (
               <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                {integration.badge}
              </div>
             )
          )}
        </div>

        <h3 className="text-base font-bold text-foreground mb-1">{integration.name}</h3>
        <p className="text-sm text-muted-foreground mb-6 flex-1">{integration.description}</p>

        <div className="mt-auto">
          {isConnected ? (
            <button 
              onClick={() => handleDisconnect(integration.id)}
              className="w-full py-2.5 rounded-xl border border-danger/20 text-danger hover:bg-danger/10 transition-colors text-sm font-semibold"
            >
              Disconnect
            </button>
          ) : (
            <button 
              onClick={() => handleConnect(integration)}
              disabled={isConnecting}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  {integration.authType === 'oauth' ? "Sign In to Connect" : "Add API Key"}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2 flex items-center gap-3">
          <LinkIcon className="w-8 h-8 text-primary" />
          Integrations Hub
        </h1>
        <p className="text-muted-foreground">
          Connect your social accounts, third-party services, and AI models to unlock powerful automations.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-sidebar rounded-2xl w-fit mb-8 border border-border">
        {(["social", "ads", "ai"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === tab
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            {tab === "social" && "Social & Platforms"}
            {tab === "ads" && "Ad Networks & API"}
            {tab === "ai" && "AI Models"}
          </button>
        ))}
      </div>

      {/* Free Tier Callout for AI */}
      {activeTab === "ai" && (
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/5 to-transparent border border-primary/20 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-foreground mb-1">Affordable AI Platform Access</h3>
            <p className="text-sm text-muted-foreground">
              Sign in directly with your provider account to access free credits or use your existing usage limits. Stop paying markup on AI processing!
            </p>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {integrations
          .filter((int) => int.category === activeTab)
          .map(renderIntegrationCard)}
      </div>

      {/* Connection Modal */}
      {showModal && selectedIntegration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className={`h-2 w-full shrink-0 ${selectedIntegration.brandColor}`} />
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center text-white ${selectedIntegration.brandColor}`}>
                  <selectedIntegration.icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Connect {selectedIntegration.name}</h2>
                  <p className="text-xs text-muted-foreground">Secure connection via {selectedIntegration.authType === 'oauth' ? 'OAuth' : 'API Key'}</p>
                </div>
              </div>

              {selectedIntegration.authType === 'oauth' ? (
                <div className="space-y-4">
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex gap-3 text-sm text-primary mb-4">
                    <Shield className="w-5 h-5 shrink-0" />
                    <p>You will be securely authenticated. We never store your raw passwords.</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Email Address or ID</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com" 
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Password</label>
                      <div className="relative">
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••" 
                          className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors pr-10"
                        />
                        <button 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                   <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Connection Name</label>
                      <input 
                        type="text" 
                        value={connectionName}
                        onChange={(e) => setConnectionName(e.target.value)}
                        placeholder="e.g. My Main Ad Account" 
                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">API Key</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="sk-..." 
                          className="w-full bg-background border border-border rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                        <button 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Your keys are encrypted at rest.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-border gap-4">
                {selectedIntegration.signupUrl ? (
                  <a 
                    href={selectedIntegration.signupUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-primary hover:underline flex items-center gap-1.5 transition-colors"
                  >
                    Don't have an account? Sign up
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : <div />}
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-sidebar-hover transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSimulateConnection}
                    disabled={selectedIntegration.authType === 'oauth' ? (!email || !password) : (!apiKey || !connectionName)}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Authorize
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
