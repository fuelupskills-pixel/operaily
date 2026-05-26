import React, { useState } from "react";
import { Zap, Bot, Brain, Target, Workflow, ChevronRight, CheckCircle2, Shield, Zap as ZapIcon, LineChart, Globe, Mail, Phone, Calendar, Clock, Loader2, Building } from "lucide-react";

interface LandingPageProps {
  onNavigateToAuth: (mode: "login" | "signup") => void;
}

export default function LandingPage({ onNavigateToAuth }: LandingPageProps) {
  const [demoForm, setDemoForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    companyName: "",
    date: "",
    time: "10:00 AM"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const scrollToDemo = () => {
    document.getElementById("demo-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoForm.firstName || !demoForm.email || !demoForm.phone) {
      setErrorMsg("Please fill in required fields (Name, Email, Phone).");
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMsg("");

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: demoForm.firstName,
          lastName: demoForm.lastName,
          email: demoForm.email,
          phone: demoForm.phone,
          companyName: demoForm.companyName,
          status: "new",
          source: "landing_page_funnel",
          personalizedHook: `Requested Demo on ${demoForm.date} at ${demoForm.time}`,
          leadScore: 80, // High intent
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSubmitStatus("success");
      } else {
        throw new Error(data.error || "Failed to submit demo request");
      }
    } catch (err: any) {
      setSubmitStatus("error");
      setErrorMsg(err.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
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
          <button 
            onClick={scrollToDemo}
            className="px-8 py-4 rounded-full glass border border-border hover:bg-surface-hover text-white font-bold text-lg transition-all cursor-pointer"
          >
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

      {/* Ecosystem / Local Apps */}
      <section className="py-12 px-6 md:px-12 bg-background relative z-10 border-t border-border/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Development <span className="gradient-text">App Suite</span></h2>
            <p className="text-muted-foreground text-sm max-w-2xl mx-auto">Access the different modules of the OperAIly platform running locally.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer" className="glass-card p-6 border border-border/50 hover:border-primary/50 transition-all group flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Web Dashboard</h3>
              <p className="text-muted-foreground text-xs">The main command center (Port 3000)</p>
            </a>
            <a href="http://localhost:8081" target="_blank" rel="noopener noreferrer" className="glass-card p-6 border border-border/50 hover:border-accent/50 transition-all group flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">Field Agent App</h3>
              <p className="text-muted-foreground text-xs">Mobile field sales interface (Port 8081)</p>
            </a>
            <a href="http://localhost:8082" target="_blank" rel="noopener noreferrer" className="glass-card p-6 border border-border/50 hover:border-success/50 transition-all group flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-lg font-bold mb-2">Native CRM</h3>
              <p className="text-muted-foreground text-xs">Full mobile CRM experience (Port 8082)</p>
            </a>
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

      {/* Lead Capture Demo Form */}
      <section id="demo-form" className="py-24 px-6 md:px-12 bg-surface/30 relative border-t border-border/40">
        <div className="max-w-4xl mx-auto glass-card p-8 md:p-12 border border-primary/20 shadow-2xl shadow-primary/5 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-[80px] -z-10" />
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">See OperAIly in Action</h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Book a personalized 1-on-1 walkthrough. We'll show you exactly how our AI agents can automate your specific sales pipeline.
            </p>
          </div>

          {submitStatus === "success" ? (
            <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-10 h-10 text-success" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Request Received!</h3>
              <p className="text-muted-foreground text-center max-w-md">
                We've added you to our priority queue. An OperAIly specialist will reach out shortly to confirm your {demoForm.date} appointment.
              </p>
              <button 
                onClick={() => onNavigateToAuth("signup")}
                className="mt-8 px-6 py-3 rounded-xl bg-surface border border-border hover:bg-surface-hover font-semibold transition-colors cursor-pointer"
              >
                Start Free Trial Instead
              </button>
            </div>
          ) : (
            <form onSubmit={handleDemoSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">First Name</label>
                  <input 
                    type="text" 
                    required
                    value={demoForm.firstName}
                    onChange={(e) => setDemoForm({...demoForm, firstName: e.target.value})}
                    className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Last Name</label>
                  <input 
                    type="text" 
                    value={demoForm.lastName}
                    onChange={(e) => setDemoForm({...demoForm, lastName: e.target.value})}
                    className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="email" 
                      required
                      value={demoForm.email}
                      onChange={(e) => setDemoForm({...demoForm, email: e.target.value})}
                      className="w-full bg-input border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="tel" 
                      required
                      value={demoForm.phone}
                      onChange={(e) => setDemoForm({...demoForm, phone: e.target.value})}
                      className="w-full bg-input border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Company Name</label>
                <input 
                  type="text" 
                  value={demoForm.companyName}
                  onChange={(e) => setDemoForm({...demoForm, companyName: e.target.value})}
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  placeholder="Acme Corp"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Preferred Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                      type="date" 
                      required
                      value={demoForm.date}
                      onChange={(e) => setDemoForm({...demoForm, date: e.target.value})}
                      className="w-full bg-input border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Preferred Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <select
                      value={demoForm.time}
                      onChange={(e) => setDemoForm({...demoForm, time: e.target.value})}
                      className="w-full bg-input border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                    >
                      <option>09:00 AM</option>
                      <option>10:00 AM</option>
                      <option>11:00 AM</option>
                      <option>01:00 PM</option>
                      <option>02:00 PM</option>
                      <option>03:00 PM</option>
                      <option>04:00 PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {submitStatus === "error" && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-xs flex items-center gap-2">
                  <ZapIcon className="w-4 h-4 shrink-0" /> {errorMsg}
                </div>
              )}

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Request...</>
                ) : (
                  <><Calendar className="w-5 h-5" /> Schedule Demo</>
                )}
              </button>
            </form>
          )}
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
