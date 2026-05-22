import React from "react";
import { Zap, Bot, Brain, Target, Workflow, ChevronRight, CheckCircle2, Shield, Zap as ZapIcon, LineChart, Globe, Mail } from "lucide-react";

interface LandingPageProps {
  onNavigateToAuth: (mode: "login" | "signup") => void;
}

export default function LandingPage({ onNavigateToAuth }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden selection:bg-primary/30">
      
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/40 py-4 px-6 md:px-12 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Oper<span className="gradient-text">AI</span>ly</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#ai-workforce" className="hover:text-white transition-colors">AI Workforce</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigateToAuth("login")}
            className="text-sm font-semibold text-muted-foreground hover:text-white transition-colors px-4 py-2 cursor-pointer"
          >
            Sign In
          </button>
          <button 
            onClick={() => onNavigateToAuth("signup")}
            className="text-sm font-bold bg-white text-black hover:bg-white/90 px-5 py-2 rounded-full transition-all cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
          >
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 md:px-12 flex flex-col items-center text-center">
        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] -z-10" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-primary/30 mb-8 animate-fade-in shadow-[0_0_15px_rgba(var(--primary),0.2)]">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary">OperAIly 2.0 is Live</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          The First SaaS CRM Built Entirely Around <span className="gradient-text">Artificial Intelligence</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Automate your lead generation, deploy autonomous AI sales agents, and scale your revenue funnel without hiring a single extra human.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <button 
            onClick={() => onNavigateToAuth("signup")}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(var(--primary),0.5)] hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
          >
            Start Your Free Trial <ChevronRight className="w-5 h-5" />
          </button>
          <button className="px-8 py-4 rounded-full glass border border-border hover:bg-surface-hover text-white font-bold text-lg transition-all cursor-pointer">
            Book a Demo
          </button>
        </div>

        {/* Dashboard Preview Image */}
        <div className="mt-20 relative w-full max-w-5xl rounded-2xl border border-border/50 glass overflow-hidden shadow-2xl shadow-primary/10 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
          <div className="h-[400px] w-full bg-surface/50 flex flex-col">
            <div className="h-10 border-b border-border/50 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-danger/80" />
              <div className="w-3 h-3 rounded-full bg-warning/80" />
              <div className="w-3 h-3 rounded-full bg-success/80" />
            </div>
            <div className="flex-1 p-6 grid grid-cols-3 gap-6 opacity-50">
              <div className="col-span-2 space-y-4">
                <div className="h-40 bg-surface rounded-xl border border-border/30" />
                <div className="h-60 bg-surface rounded-xl border border-border/30" />
              </div>
              <div className="space-y-4">
                <div className="h-24 bg-surface rounded-xl border border-border/30" />
                <div className="h-24 bg-surface rounded-xl border border-border/30" />
                <div className="h-48 bg-surface rounded-xl border border-border/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Matrix */}
      <section id="features" className="py-24 px-6 md:px-12 bg-surface/30 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Not Just a CRM. A <span className="gradient-text">Revenue Engine</span>.</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Traditional CRMs require you to do the work. OperAIly does the work for you.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card p-8 border border-border/50 hover:border-primary/50 transition-colors group">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Omnichannel Lead Hunter</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Automatically scrape and enrich leads from LinkedIn, Apollo, Google Maps, and websites. Sync them directly to your pipeline.
              </p>
            </div>
            
            <div className="glass-card p-8 border border-border/50 hover:border-accent/50 transition-colors group">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Brain className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Sales Agents</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Deploy autonomous conversational agents on WhatsApp, Email, and SMS that qualify leads and book appointments 24/7.
              </p>
            </div>

            <div className="glass-card p-8 border border-border/50 hover:border-success/50 transition-colors group">
              <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Workflow className="w-7 h-7 text-success" />
              </div>
              <h3 className="text-xl font-bold mb-3">Drag-and-Drop Automations</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Build complex multichannel sequences and internal operational workflows visually without writing a single line of code.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Subscription Section */}
      <section id="pricing" className="py-32 px-6 md:px-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background -z-10" />
        
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Transparent, Scale-Ready <span className="gradient-text">Pricing</span></h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Choose the tier that fits your growth stage. Upgrade anytime as your AI workforce scales.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-center">
            {/* Starter Tier */}
            <div className="glass-card p-8 border border-border/50 rounded-2xl relative">
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-muted-foreground text-sm mb-6">Perfect for solo founders and small teams getting started with AI.</p>
              <div className="mb-8">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-success" /> Up to 500 Leads</li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-success" /> 1 AI Conversational Agent</li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-success" /> Email Integrations</li>
                <li className="flex items-center gap-3 text-sm text-muted-foreground line-through"><Shield className="w-5 h-5" /> Advanced Workflows</li>
              </ul>
              
              <button onClick={() => onNavigateToAuth("signup")} className="w-full py-3 rounded-xl border border-border hover:bg-surface-hover font-bold transition-colors cursor-pointer">
                Get Started Free
              </button>
            </div>

            {/* Pro Tier (Highlighted) */}
            <div className="glass-card p-8 border border-primary rounded-2xl relative transform md:-translate-y-4 shadow-2xl shadow-primary/20 bg-primary/5">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Growth Hub</h3>
              <p className="text-primary-hover text-sm mb-6">For scaling agencies and B2B SaaS companies demanding high volume.</p>
              <div className="mb-8">
                <span className="text-5xl font-bold">$49</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-primary" /> Unlimited Leads CRM</li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-primary" /> 5 Custom AI Agents</li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-primary" /> WhatsApp & LinkedIn APIs</li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-primary" /> Multi-Step Visual Workflows</li>
              </ul>
              
              <button onClick={() => onNavigateToAuth("signup")} className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all cursor-pointer">
                Start 14-Day Free Trial
              </button>
            </div>

            {/* Enterprise Tier */}
            <div className="glass-card p-8 border border-border/50 rounded-2xl relative">
              <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
              <p className="text-muted-foreground text-sm mb-6">Dedicated infrastructure and custom LLM finetuning for massive scale.</p>
              <div className="mb-8">
                <span className="text-5xl font-bold">$199</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-accent" /> Dedicated IP Architecture</li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-accent" /> Unlimited AI Agents</li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-accent" /> Custom Agency Branding</li>
                <li className="flex items-center gap-3 text-sm"><CheckCircle2 className="w-5 h-5 text-accent" /> 24/7 Priority Support</li>
              </ul>
              
              <button className="w-full py-3 rounded-xl border border-border hover:bg-surface-hover font-bold transition-colors cursor-pointer">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-24 px-6 border-t border-border/40 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 -z-10" />
        <h2 className="text-4xl font-bold mb-6">Ready to Automate Your Revenue?</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">Join thousands of modern sales teams who have completely eliminated manual prospecting and pipeline management.</p>
        <button onClick={() => onNavigateToAuth("signup")} className="px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all cursor-pointer">
          Create Your Free Account
        </button>
      </section>

      {/* Standard Footer */}
      <footer className="py-8 border-t border-border/20 text-center text-sm text-muted-foreground">
        <p>© 2026 OperAIly. All rights reserved.</p>
      </footer>

    </div>
  );
}
