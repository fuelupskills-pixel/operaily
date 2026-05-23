"use client";

import React from "react";
import { ShieldCheck, Key, Settings, ExternalLink, Mail, CheckCircle2, Copy } from "lucide-react";

export default function AdminSetupContent() {
  const supabaseProjectId = "aodizajdxkxgqgoohfel";
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast notification here
  };

  return (
    <div className="space-y-6 relative animate-fade-in max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary" />
            Admin Setup
          </h1>
          <p className="text-muted-foreground mt-1">Configure your system's core OAuth authentication providers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Information */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 border border-primary/20 bg-primary/5">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
              <Key className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Secure Authentication</h2>
            <p className="text-sm text-muted-foreground mb-4">
              OperAIly uses Supabase for enterprise-grade security. Because of this, your OAuth credentials (Client ID and Secret) cannot be stored in the app's source code.
            </p>
            <p className="text-sm text-muted-foreground">
              You must generate these keys directly from the provider (Google, Microsoft, Meta) and paste them directly into your Supabase Dashboard.
            </p>
          </div>

          <div className="glass-card p-6 border border-border/50">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Your Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Redirect URI (Callback URL)</p>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-surface p-2 rounded flex-1 border border-border overflow-x-auto">
                    https://operaily.vercel.app/auth/callback
                  </code>
                  <button 
                    onClick={() => copyToClipboard("https://operaily.vercel.app/auth/callback")}
                    className="p-2 rounded bg-surface hover:bg-surface-hover border border-border transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">You will need to paste this into Google/Azure/Meta when generating your keys.</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-1">Supabase Project ID</p>
                <code className="text-xs bg-surface p-2 rounded block border border-border text-primary font-semibold">
                  {supabaseProjectId}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Setup Steps */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Google Setup */}
          <div className="glass-card p-6 border border-border/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#EA4335]/10 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.6 15.02 1 12 1 7.24 1 3.2 3.73 1.24 7.7l3.96 3.07C6.15 7.6 8.85 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.45 12.3c0-.82-.07-1.62-.2-2.38H12v4.51h6.43c-.28 1.46-1.1 2.69-2.34 3.52v2.93h3.78c2.22-2.04 3.58-5.04 3.58-8.58z" />
                  <path fill="#FBBC05" d="M5.2 10.77c-.24-.72-.38-1.5-.38-2.3 0-.8.14-1.58.38-2.3L1.24 3.1A11.94 11.94 0 000 8.47c0 1.95.47 3.8 1.24 5.37l3.96-3.07z" />
                  <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.78-2.93c-1.05.7-2.4 1.13-4.18 1.13-3.15 0-5.85-2.56-6.8-5.73l-3.96 3.07C3.2 20.27 7.24 23 12 23z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Google (Gmail & Calendar)</h2>
                <p className="text-sm text-muted-foreground">Enable Google Login for your users.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-muted-foreground">1</div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Generate Keys in Google Cloud</p>
                  <p className="text-xs text-muted-foreground mb-2">Create an OAuth Client ID in the Google Cloud Console. Make sure to add the Redirect URI from the left panel.</p>
                  <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4285F4] hover:underline">
                    Open Google Cloud Console <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-muted-foreground">2</div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Paste Keys into Supabase</p>
                  <p className="text-xs text-muted-foreground mb-2">Enable Google as a provider and paste your Client ID and Client Secret.</p>
                  <a href={`https://supabase.com/dashboard/project/${supabaseProjectId}/auth/providers`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#4285F4]/10 text-[#4285F4] hover:bg-[#4285F4]/20 transition-colors text-xs font-semibold">
                    <Settings className="w-3.5 h-3.5" />
                    Open Supabase Providers
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Microsoft Setup */}
          <div className="glass-card p-6 border border-border/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#0078D4]/10 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M0 0h11v11H0z" />
                  <path fill="#81bc06" d="M12 0h11v11H12z" />
                  <path fill="#05a6f0" d="M0 12h11v11H0z" />
                  <path fill="#ffba08" d="M12 12h11v11H12z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Microsoft (Outlook & Calendar)</h2>
                <p className="text-sm text-muted-foreground">Enable Outlook/Microsoft Login for your users.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-muted-foreground">1</div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Generate Keys in Azure</p>
                  <p className="text-xs text-muted-foreground mb-2">Register a new application in Microsoft Entra ID (formerly Azure AD) and create a client secret.</p>
                  <a href="https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/~/RegisteredApps" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0078D4] hover:underline">
                    Open Microsoft Azure Portal <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-muted-foreground">2</div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Paste Keys into Supabase</p>
                  <p className="text-xs text-muted-foreground mb-2">Enable Azure (Microsoft) as a provider and paste your Application (client) ID and Secret Value.</p>
                  <a href={`https://supabase.com/dashboard/project/${supabaseProjectId}/auth/providers`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0078D4]/10 text-[#0078D4] hover:bg-[#0078D4]/20 transition-colors text-xs font-semibold">
                    <Settings className="w-3.5 h-3.5" />
                    Open Supabase Providers
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Facebook Setup */}
          <div className="glass-card p-6 border border-border/50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#1877F2]/10 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Facebook (Meta)</h2>
                <p className="text-sm text-muted-foreground">Enable Facebook Login for your users.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-muted-foreground">1</div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Generate Keys in Meta Developers</p>
                  <p className="text-xs text-muted-foreground mb-2">Create a Facebook App and add the Facebook Login product. Get your App ID and App Secret.</p>
                  <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1877F2] hover:underline">
                    Open Meta Developer Dashboard <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-muted-foreground">2</div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Paste Keys into Supabase</p>
                  <p className="text-xs text-muted-foreground mb-2">Enable Facebook as a provider and paste your App ID and App Secret.</p>
                  <a href={`https://supabase.com/dashboard/project/${supabaseProjectId}/auth/providers`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 transition-colors text-xs font-semibold">
                    <Settings className="w-3.5 h-3.5" />
                    Open Supabase Providers
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
