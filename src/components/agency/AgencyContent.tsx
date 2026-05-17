"use client";

import React, { useState, useEffect } from "react";
import {
  Globe, Bot, Search, PenTool, Share2, Target, ShieldCheck, Video, Zap,
  Activity, CheckCircle2, Clock, AlertCircle, Laptop, Smartphone, Check,
  Send, Loader2, Code, FileText, ArrowRight, ShieldAlert, Sparkles, FormInput,
  GitMerge, LineChart, Plus, CheckCircle, HelpCircle, FileJson
} from "lucide-react";

// Types
interface Competitor {
  competitor: string;
  gap: string;
  strength: string;
}

interface Benefit {
  title: string;
  description: string;
}

interface Feature {
  title: string;
  description: string;
  icon: string;
}

interface Testimonial {
  name: string;
  role: string;
  quote: string;
  rating: number;
}

interface FAQ {
  question: string;
  answer: string;
}

interface GeneratedData {
  research: {
    targetAudiencePainPoints: string[];
    competitorAnalysis: Competitor[];
    seoKeywords: string[];
    offerPositioning: string;
    ctaRecommendations: { primary: string; secondary: string };
  };
  design: {
    primaryColor: string;
    secondaryColor: string;
    typography: { heading: string; body: string };
    styleDescription: string;
  };
  copy: {
    metaTitle: string;
    metaDescription: string;
    schemaJson: string;
    hero: { headline: string; subheadline: string; ctaText: string };
    benefits: Benefit[];
    features: Feature[];
    testimonials: Testimonial[];
    pricing: { tierName: string; price: string; features: string[]; description: string };
    faqs: FAQ[];
    footerText: string;
  };
  automation: {
    webhookCode: string;
    operailyFormHook: string;
  };
}

// Specialized Agency Agents status tracking
interface AgentState {
  id: string;
  name: string;
  role: string;
  icon: React.ComponentType<any>;
  status: "idle" | "working" | "completed";
  color: string;
  bg: string;
}

export default function AgencyContent() {
  // Inputs
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [visualStyle, setVisualStyle] = useState("sleek_saas");
  const [publishingPlatform, setPublishingPlatform] = useState("wix");
  const [customDomain, setCustomDomain] = useState("operaily.app");

  // Flow State
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [generatedData, setGeneratedData] = useState<GeneratedData | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [activeArtifactTab, setActiveArtifactTab] = useState<"research" | "seo" | "automation" | "template">("research");

  // Live Test Form State
  const [testLeadName, setTestLeadName] = useState("");
  const [testLeadEmail, setTestLeadEmail] = useState("");
  const [testLeadPhone, setTestLeadPhone] = useState("");
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [leadSyncSuccess, setLeadSyncSuccess] = useState(false);
  const [crmLeadLog, setCrmLeadLog] = useState<{ id: string; name: string; email: string; time: string; status: string }[]>([]);

  // 12-Step Automation Timeline Steps
  const timelineSteps = [
    { title: "Initializing virtual campaign space", desc: "Setting up agency environment & variables" },
    { title: "Product & Market intelligence audit", desc: "Agent 1 parsing features & competitor strategies" },
    { title: "Target customer profiling", desc: "Agent 1 mapping key emotional pain points & desires" },
    { title: "SEO Keyword harvesting", desc: "Agent 1 compiling organic search target strings" },
    { title: "Visual design blueprint creation", desc: "Agent 2 building branding color schemes & spacing models" },
    { title: "Premium landing page layout wiring", desc: "Agent 2 organizing responsive grid architectures" },
    { title: "Persuasive sales copywriting generation", desc: "Agent 3 drafting headlines, FAQs, & pricing layers" },
    { title: "Meta SEO & rank-math metadata build", desc: "Agent 3 injecting custom RankMath structures" },
    { title: "Connecting OperAIly CRM webhook integration", desc: "Agent 4 configuring direct /api/leads webhook endpoints" },
    { title: "Platform template compilation", desc: "Agent 5/6 packaging elements for Wix/WordPress" },
    { title: "Domain configuration & SSL testing", desc: "Agent 7 verifying HTTPS routing & tracking analytics" },
    { title: "Final QA and campaign delivery", desc: "Pre-testing syncing mechanisms. Handing off workspace." }
  ];

  // 7 Virtual Specialists
  const [agents, setAgents] = useState<AgentState[]>([
    { id: "1", name: "Product Researcher", role: "Market Analysis", icon: Search, status: "idle", color: "text-accent", bg: "bg-accent/10" },
    { id: "2", name: "Design Strategist", role: "Visual Identity", icon: Sparkles, status: "idle", color: "text-primary", bg: "bg-primary/10" },
    { id: "3", name: "Conversion Copywriter", role: "Persuasive Words", icon: PenTool, status: "idle", color: "text-success", bg: "bg-success/10" },
    { id: "4", name: "Technical Integrator", role: "CRM Automations", icon: Zap, status: "idle", color: "text-info", bg: "bg-info/10" },
    { id: "5", name: "Wix Studio Builder", role: "Wix Implementation", icon: Globe, status: "idle", color: "text-warning", bg: "bg-warning/10" },
    { id: "6", name: "WordPress Architect", role: "WP Implementation", icon: Code, status: "idle", color: "text-secondary", bg: "bg-secondary/10" },
    { id: "7", name: "Deployment Specialist", role: "DNS & QA Testing", icon: ShieldCheck, status: "idle", color: "text-danger", bg: "bg-danger/10" },
  ]);

  // Handle Orchestration Trigger
  const handleOrchestrate = async () => {
    if (!productName || !productDescription || !targetAudience) return;

    setIsOrchestrating(true);
    setGeneratedData(null);
    setActiveStep(0);
    setLeadSyncSuccess(false);

    // Reset agent statuses
    setAgents(prev => prev.map(a => ({ ...a, status: "idle" })));

    // Begin animated step simulation
    const runSimulation = () => {
      let currentStep = 0;
      
      const interval = setInterval(() => {
        if (currentStep < 11) {
          currentStep += 1;
          setActiveStep(currentStep);

          // Update active agent statuses dynamically
          setAgents(prev => prev.map(agent => {
            // Researcher
            if (currentStep >= 1 && currentStep <= 3) {
              if (agent.id === "1") return { ...agent, status: "working" };
            }
            if (currentStep > 3 && agent.id === "1") return { ...agent, status: "completed" };

            // Designer
            if (currentStep >= 4 && currentStep <= 5) {
              if (agent.id === "2") return { ...agent, status: "working" };
            }
            if (currentStep > 5 && agent.id === "2") return { ...agent, status: "completed" };

            // Copywriter
            if (currentStep >= 6 && currentStep <= 7) {
              if (agent.id === "3") return { ...agent, status: "working" };
            }
            if (currentStep > 7 && agent.id === "3") return { ...agent, status: "completed" };

            // Integrator
            if (currentStep === 8) {
              if (agent.id === "4") return { ...agent, status: "working" };
            }
            if (currentStep > 8 && agent.id === "4") return { ...agent, status: "completed" };

            // Wix/WordPress implementation depending on selection
            if (currentStep === 9) {
              if (publishingPlatform === "wix" && agent.id === "5") return { ...agent, status: "working" };
              if (publishingPlatform === "wordpress" && agent.id === "6") return { ...agent, status: "working" };
            }
            if (currentStep > 9) {
              if (publishingPlatform === "wix" && agent.id === "5") return { ...agent, status: "completed" };
              if (publishingPlatform === "wordpress" && agent.id === "6") return { ...agent, status: "completed" };
            }

            // Deployment & DNS QA
            if (currentStep >= 10 && currentStep <= 11) {
              if (agent.id === "7") return { ...agent, status: "working" };
            }

            return agent;
          }));
        } else {
          clearInterval(interval);
        }
      }, 900); // Progress steps fast for engaging visual flow

      return interval;
    };

    const simInterval = runSimulation();

    // Fire actual backend API generation call in parallel
    try {
      const response = await fetch("/api/agency/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName,
          productDescription,
          targetAudience,
          visualStyle,
          publishingPlatform,
          customDomain
        })
      });

      const resData = await response.json();
      
      if (resData.success) {
        // Wait for steps simulation to finish or catch up
        setTimeout(() => {
          clearInterval(simInterval);
          setAgents(prev => prev.map(a => {
            if (a.id === "5" && publishingPlatform === "wordpress") return { ...a, status: "idle" };
            if (a.id === "6" && publishingPlatform === "wix") return { ...a, status: "idle" };
            return { ...a, status: "completed" };
          }));
          setActiveStep(11);
          setGeneratedData(resData.data);
          setIsOrchestrating(false);
        }, 11000);
      } else {
        setIsOrchestrating(false);
      }
    } catch (err) {
      console.error(err);
      setIsOrchestrating(false);
    }
  };

  // Submit test lead inside live preview
  const handleTestLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testLeadEmail || !testLeadName) return;

    setIsSubmittingLead(true);
    setLeadSyncSuccess(false);

    try {
      const names = testLeadName.split(" ");
      const firstName = names[0] || "Lead";
      const lastName = names.slice(1).join(" ") || "";

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email: testLeadEmail,
          phone: testLeadPhone || null,
          source: `${productName} Dynamic Landing Page`,
          leadScore: 88,
          status: "qualified"
        })
      });

      const resData = await response.json();
      if (response.status === 201 || response.status === 200) {
        setLeadSyncSuccess(true);
        // Reset inputs
        setTestLeadName("");
        setTestLeadEmail("");
        setTestLeadPhone("");

        // Append to local CRM simulation log
        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        setCrmLeadLog(prev => [
          {
            id: resData.lead?.id || `lead_${Math.random().toString(36).substr(2, 6)}`,
            name: `${firstName} ${lastName}`.trim(),
            email: testLeadEmail,
            time: formattedTime,
            status: "Synched to CRM"
          },
          ...prev
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // Icon Matcher helper
  const getLucideIcon = (iconName: string) => {
    const icons: Record<string, React.ComponentType<any>> = {
      FormInput, Target, GitMerge, LineChart, Sparkles, Zap, ShieldCheck
    };
    return icons[iconName] || Zap;
  };

  return (
    <div className="space-y-6 stagger-children">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Automation <span className="gradient-text">Agency</span></h1>
          <p className="text-sm text-muted-foreground mt-1">Autonomous multi-agent campaign pipeline & landing page engine.</p>
        </div>
        <div className="badge bg-primary/10 text-primary border border-primary/20 text-xs font-semibold px-3 py-1 flex items-center gap-1.5 rounded-full">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          OperAIly Agency Engine
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Side Parameters / Progress Log */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* Main Controls Card */}
          <div className="glass-card p-5 space-y-4">
            <h2 className="text-sm font-semibold flex items-center gap-2 border-b border-border pb-3">
              <Bot className="w-4 h-4 text-primary" /> Campaign Specifications
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Product/Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme SaaS Platform"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  disabled={isOrchestrating}
                  className="w-full mt-1 px-3 py-2 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground input-focus"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Product Value Proposition / Description</label>
                <textarea
                  placeholder="Explain exactly what the product does, what makes it unique, and your key features..."
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  disabled={isOrchestrating}
                  rows={3}
                  className="w-full mt-1 px-3 py-2 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground input-focus"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target Audience Profile</label>
                <input
                  type="text"
                  placeholder="e.g. Sales Directors, Real Estate Agents, Tech SaaS Founders"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  disabled={isOrchestrating}
                  className="w-full mt-1 px-3 py-2 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground input-focus"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Visual Style Theme</label>
                  <select
                    value={visualStyle}
                    onChange={(e) => setVisualStyle(e.target.value)}
                    disabled={isOrchestrating}
                    className="w-full mt-1 px-2 py-2 bg-input border border-input-border rounded-xl text-xs text-foreground input-focus cursor-pointer"
                  >
                    <option value="sleek_saas">Sleek SaaS (Indigo/Royal)</option>
                    <option value="luxury_dark">Luxury Dark (Gold/Coal)</option>
                    <option value="corporate_blue">Corporate Blue (Navy/Cyan)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Publishing Platform</label>
                  <select
                    value={publishingPlatform}
                    onChange={(e) => setPublishingPlatform(e.target.value)}
                    disabled={isOrchestrating}
                    className="w-full mt-1 px-2 py-2 bg-input border border-input-border rounded-xl text-xs text-foreground input-focus cursor-pointer"
                  >
                    <option value="wix">Wix Studio</option>
                    <option value="wordpress">WordPress Elementor</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target Custom Domain</label>
                <div className="relative mt-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">https://</div>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    disabled={isOrchestrating}
                    className="w-full pl-16 pr-3 py-2 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground input-focus font-medium"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleOrchestrate}
              disabled={isOrchestrating || !productName || !productDescription || !targetAudience}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-xs hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            >
              {isOrchestrating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Orchestrating AI Agency Team...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Initiate Multi-Agent Campaigns
                </>
              )}
            </button>
          </div>

          {/* Active Agents Workspace Card */}
          <div className="glass-card p-5">
            <h2 className="text-sm font-semibold flex items-center justify-between border-b border-border pb-3 mb-4">
              <span className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-accent" /> Virtual Specialists Guild
              </span>
              <span className="text-[9px] text-muted-foreground font-mono">7 Active Handlers</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {agents.map((agent) => {
                const AgentIcon = agent.icon;
                return (
                  <div key={agent.id} className="p-3 bg-surface border border-border rounded-xl flex items-center gap-3 transition-colors hover:border-primary/20">
                    <div className={`w-8 h-8 rounded-lg ${agent.bg} ${agent.color} flex items-center justify-center shrink-0`}>
                      <AgentIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold truncate">{agent.name}</p>
                      <p className="text-[9px] text-muted-foreground truncate">{agent.role}</p>
                    </div>
                    <div>
                      {agent.status === "working" ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                      ) : agent.status === "completed" ? (
                        <CheckCircle className="w-4 h-4 text-success shrink-0" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real-time Step Log Card */}
          {isOrchestrating && (
            <div className="glass-card p-5 space-y-4 animate-fade-in">
              <h2 className="text-sm font-semibold flex items-center gap-2 border-b border-border pb-3">
                <Clock className="w-4 h-4 text-primary" /> Orchestration Timeline
              </h2>

              <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                {timelineSteps.map((step, index) => (
                  <div key={index} className="flex gap-3 relative">
                    {index < timelineSteps.length - 1 && (
                      <div className={`absolute left-2.5 top-6 bottom-[-16px] w-[1px] ${
                        activeStep > index ? "bg-success" : "bg-border"
                      }`} />
                    )}
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold ${
                      activeStep === index ? "bg-primary/20 text-primary border border-primary animate-pulse" :
                      activeStep > index ? "bg-success/20 text-success border border-success" :
                      "bg-muted text-muted-foreground/50 border border-border"
                    }`}>
                      {activeStep > index ? "✓" : index + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`text-xs font-bold ${activeStep === index ? "text-primary" : activeStep > index ? "text-foreground" : "text-muted-foreground/50"}`}>{step.title}</p>
                      <p className="text-[10px] text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CRM Real-time Sync logs */}
          {crmLeadLog.length > 0 && (
            <div className="glass-card p-5 space-y-3 animate-fade-in">
              <h2 className="text-sm font-semibold flex items-center justify-between border-b border-border pb-3">
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-success" /> Live OperAIly CRM Lead Syncer
                </span>
                <span className="badge bg-success/10 text-success text-[9px] font-mono font-bold uppercase">Online</span>
              </h2>

              <div className="space-y-2">
                {crmLeadLog.map((log) => (
                  <div key={log.id} className="p-2.5 bg-surface/50 border border-border rounded-xl text-[10px] flex items-center justify-between animate-slide-in">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      <div>
                        <span className="font-bold text-foreground">{log.name}</span>
                        <span className="text-muted-foreground ml-1 font-mono">({log.email})</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-success bg-success/10 px-2 py-0.5 rounded border border-success/25 font-bold uppercase tracking-wider">{log.status}</span>
                      <span className="text-muted-foreground font-mono text-[9px]">{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Side Mockup Preview Canvas */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Main Visual Preview Area */}
          <div className="glass-card overflow-hidden flex flex-col min-h-[640px]">
            
            {/* Window TopBar controls */}
            <div className="px-5 py-3.5 border-b border-border bg-surface-hover flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-danger/50" />
                  <div className="w-3 h-3 rounded-full bg-warning/50" />
                  <div className="w-3 h-3 rounded-full bg-success/50" />
                </div>
                {generatedData && (
                  <span className="text-xs text-muted-foreground font-mono ml-3 truncate max-w-[200px] sm:max-w-xs bg-muted px-2.5 py-1 rounded-lg border border-border font-medium">
                    https://{customDomain}
                  </span>
                )}
              </div>

              {generatedData && (
                <div className="flex items-center gap-1.5 bg-muted p-1 rounded-xl border border-border">
                  <button
                    onClick={() => setPreviewDevice("desktop")}
                    className={`p-1.5 rounded-lg transition-all ${previewDevice === "desktop" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Laptop className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice("mobile")}
                    className={`p-1.5 rounded-lg transition-all ${previewDevice === "mobile" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Canvas Body */}
            <div className="flex-1 bg-surface-hover p-4 flex items-center justify-center overflow-y-auto">
              
              {!generatedData && !isOrchestrating && (
                <div className="text-center py-16 px-6 max-w-sm space-y-5">
                  <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/5 animate-pulse">
                    <Globe className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm">Design Strategy Canvas Ready</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Configure your product specifications, color styles, and publishing targets, then initiate the multi-agent orchestration team to generate a premium landing page.
                    </p>
                  </div>
                </div>
              )}

              {isOrchestrating && !generatedData && (
                <div className="text-center py-16 px-6 max-w-sm space-y-6">
                  <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
                    <Sparkles className="w-6 h-6 text-accent animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-sm">Structuring Visual Blueprint...</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed animate-pulse">
                      Specialists are generating design variables, laying out responsive spacing, writing meta SEO headers, and compiling custom webhook hooks code...
                    </p>
                  </div>
                </div>
              )}

              {generatedData && (
                <div className={`w-full transition-all duration-500 overflow-hidden flex justify-center`}>
                  <div
                    className={`bg-background border border-border shadow-2xl transition-all duration-500 overflow-y-auto max-h-[580px] text-foreground font-sans scrollbar-none rounded-xl relative ${
                      previewDevice === "mobile" ? "w-[340px] text-center" : "w-full"
                    }`}
                  >
                    
                    {/* Top Landing Header banner */}
                    <div className="w-full px-5 py-4 border-b border-border bg-surface/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
                      <span className="text-xs font-black tracking-tight" style={{ color: generatedData.design.primaryColor }}>
                        {productName.toUpperCase()}
                      </span>
                      <button
                        className="text-[10px] font-bold px-3 py-1.5 rounded-lg text-white transition-all shadow-md"
                        style={{ backgroundColor: generatedData.design.primaryColor }}
                      >
                        {generatedData.copy.hero.ctaText}
                      </button>
                    </div>

                    {/* HERO BLOCK */}
                    <div className="px-6 py-12 text-center space-y-5 border-b border-border bg-gradient-to-b from-surface/30 to-background">
                      <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 text-[9px] font-bold uppercase px-2.5 py-1 rounded-full">
                        <Sparkles className="w-3 h-3" /> Autonomous Launchpad
                      </div>
                      <h2 className="text-lg sm:text-xl font-extrabold tracking-tight leading-tight max-w-lg mx-auto">
                        {generatedData.copy.hero.headline}
                      </h2>
                      <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                        {generatedData.copy.hero.subheadline}
                      </p>
                      <div className={`flex justify-center gap-3 ${previewDevice === 'mobile' ? 'flex-col items-center' : ''}`}>
                        <button
                          className="px-4 py-2 text-xs font-bold text-white rounded-xl transition-all hover:scale-[1.02] shadow-lg shadow-primary/10 cursor-pointer"
                          style={{ backgroundColor: generatedData.design.primaryColor }}
                        >
                          {generatedData.copy.hero.ctaText}
                        </button>
                        <button className="px-4 py-2 text-xs font-bold bg-surface border border-border text-foreground hover:bg-surface-hover rounded-xl transition-all">
                          {generatedData.research.ctaRecommendations.secondary}
                        </button>
                      </div>
                    </div>

                    {/* BENEFITS BLOCK */}
                    <div className="px-6 py-10 space-y-6 border-b border-border">
                      <div className="text-center space-y-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Strategic Advantages</h3>
                        <p className="text-sm font-extrabold">Engineered for Massive Conversions</p>
                      </div>
                      <div className={`grid gap-4 ${previewDevice === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'}`}>
                        {generatedData.copy.benefits.map((benefit, i) => (
                          <div key={i} className="p-4 bg-surface/50 border border-border rounded-xl text-left space-y-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${generatedData.design.primaryColor}15`, color: generatedData.design.primaryColor }}>
                              <Check className="w-4 h-4" />
                            </div>
                            <h4 className="text-xs font-bold">{benefit.title}</h4>
                            <p className="text-[10px] text-muted-foreground leading-relaxed">{benefit.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* FEATURES BLOCK */}
                    <div className="px-6 py-10 space-y-6 border-b border-border bg-surface/10">
                      <div className="text-center space-y-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Technical Specifications</h3>
                        <p className="text-sm font-extrabold">Next-Gen Growth Architecture</p>
                      </div>
                      <div className={`grid gap-4 ${previewDevice === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        {generatedData.copy.features.map((feature, i) => {
                          const IconComp = getLucideIcon(feature.icon);
                          return (
                            <div key={i} className="p-4 bg-surface border border-border rounded-xl text-left flex gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${generatedData.design.primaryColor}15`, color: generatedData.design.primaryColor }}>
                                <IconComp className="w-4 h-4" />
                              </div>
                              <div className="space-y-1">
                                <h4 className="text-xs font-bold">{feature.title}</h4>
                                <p className="text-[10px] text-muted-foreground leading-relaxed">{feature.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* PRICING BLOCK */}
                    <div className="px-6 py-10 space-y-6 border-b border-border">
                      <div className="text-center space-y-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pricing Offer</h3>
                        <p className="text-sm font-extrabold">Clear, Transparent Scale Tiers</p>
                      </div>
                      <div className="max-w-sm mx-auto p-6 bg-surface border border-border rounded-2xl text-left space-y-4 relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-24 h-24 rounded-full blur-3xl opacity-20" style={{ backgroundColor: generatedData.design.primaryColor }} />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{generatedData.copy.pricing.tierName}</span>
                          <h4 className="text-2xl font-black mt-1">{generatedData.copy.pricing.price}</h4>
                          <p className="text-[10px] text-muted-foreground mt-1">{generatedData.copy.pricing.description}</p>
                        </div>
                        <div className="space-y-2 border-t border-border pt-4">
                          {generatedData.copy.pricing.features.map((f, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-[10px] text-muted-foreground">
                              <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                        <button
                          className="w-full py-2.5 rounded-xl text-white font-bold text-xs transition-all hover:scale-[1.01] shadow-lg cursor-pointer"
                          style={{ backgroundColor: generatedData.design.primaryColor }}
                        >
                          Unlock Accelerated Plan
                        </button>
                      </div>
                    </div>

                    {/* FAQS BLOCK */}
                    <div className="px-6 py-10 space-y-6 border-b border-border bg-surface/10">
                      <div className="text-center space-y-1">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Objections Solved</h3>
                        <p className="text-sm font-extrabold">Frequently Asked Questions</p>
                      </div>
                      <div className="space-y-3 max-w-md mx-auto text-left">
                        {generatedData.copy.faqs.map((faq, idx) => (
                          <div key={idx} className="p-3 bg-surface border border-border rounded-xl space-y-1.5">
                            <h4 className="text-xs font-bold flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                              {faq.question}
                            </h4>
                            <p className="text-[10px] text-muted-foreground leading-relaxed pl-5">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* LIVE CRM SYNC CAPTURE FORM BLOCK */}
                    <div className="px-6 py-10 space-y-5 bg-gradient-to-t from-primary/5 to-surface/20 border-b border-border">
                      <div className="text-center space-y-1">
                        <span className="badge bg-success/10 text-success text-[8px] font-bold uppercase tracking-widest font-mono">Live CRM Submission Gate</span>
                        <h3 className="text-sm font-extrabold mt-1">Book Your Action Demo Consultation</h3>
                        <p className="text-[10px] text-muted-foreground max-w-sm mx-auto">
                          Fill this test form out. Submissions will trigger the live **OperAIly CRM** webhook and post leads directly into your database!
                        </p>
                      </div>

                      {leadSyncSuccess ? (
                        <div className="p-4 bg-success/15 border border-success/30 rounded-xl max-w-sm mx-auto text-center space-y-2 animate-scale-in">
                          <CheckCircle2 className="w-8 h-8 text-success mx-auto" />
                          <h4 className="text-xs font-bold text-success">Lead Created in OperAIly CRM!</h4>
                          <p className="text-[9px] text-muted-foreground">
                            Go check the **Leads** CRM section. The record has been created, scored, and mapped under the source tag.
                          </p>
                          <button
                            onClick={() => setLeadSyncSuccess(false)}
                            className="text-[9px] font-bold underline text-success block mx-auto mt-2"
                          >
                            Submit Another Test Lead
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleTestLeadSubmit} className="max-w-sm mx-auto space-y-3 text-left">
                          <div>
                            <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                            <input
                              type="text"
                              required
                              placeholder="Sarah Jenkins"
                              value={testLeadName}
                              onChange={(e) => setTestLeadName(e.target.value)}
                              className="w-full mt-1 px-3 py-2 bg-input border border-input-border rounded-xl text-[10px] text-foreground placeholder:text-muted-foreground input-focus"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                            <input
                              type="email"
                              required
                              placeholder="sarah@growfast.com"
                              value={testLeadEmail}
                              onChange={(e) => setTestLeadEmail(e.target.value)}
                              className="w-full mt-1 px-3 py-2 bg-input border border-input-border rounded-xl text-[10px] text-foreground placeholder:text-muted-foreground input-focus"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                            <input
                              type="tel"
                              placeholder="+1 (555) 345-2345"
                              value={testLeadPhone}
                              onChange={(e) => setTestLeadPhone(e.target.value)}
                              className="w-full mt-1 px-3 py-2 bg-input border border-input-border rounded-xl text-[10px] text-foreground placeholder:text-muted-foreground input-focus"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={isSubmittingLead}
                            className="w-full mt-3 py-2.5 rounded-xl text-white font-bold text-xs transition-all hover:scale-[1.01] shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                            style={{ backgroundColor: generatedData.design.primaryColor }}
                          >
                            {isSubmittingLead ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Syncing Inbound webhook...
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                Submit Inbound Test Lead
                              </>
                            )}
                          </button>
                        </form>
                      )}
                    </div>

                    {/* FOOTER */}
                    <div className="px-5 py-6 text-center border-t border-border bg-surface/50">
                      <p className="text-[9px] text-muted-foreground leading-relaxed">
                        {generatedData.copy.footerText}
                      </p>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Delivery & Deployment Artifacts panel */}
          {generatedData && (
            <div className="glass-card p-5 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Elite Agency Deliverables
                </h2>
                <div className="flex gap-1.5 bg-muted p-1 border border-border rounded-xl">
                  <button
                    onClick={() => setActiveArtifactTab("research")}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${activeArtifactTab === "research" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}
                  >
                    Audits & Strategy
                  </button>
                  <button
                    onClick={() => setActiveArtifactTab("seo")}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${activeArtifactTab === "seo" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}
                  >
                    SEO & Schema
                  </button>
                  <button
                    onClick={() => setActiveArtifactTab("automation")}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${activeArtifactTab === "automation" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}
                  >
                    Automations
                  </button>
                  <button
                    onClick={() => setActiveArtifactTab("template")}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${activeArtifactTab === "template" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}
                  >
                    Platform Export
                  </button>
                </div>
              </div>

              {/* Research Strategy Tab */}
              {activeArtifactTab === "research" && (
                <div className="space-y-4 animate-fade-in text-xs">
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">Audience Positioning Strategy</h3>
                    <p className="text-muted-foreground bg-surface p-3 border border-border rounded-xl leading-relaxed">{generatedData.research.offerPositioning}</p>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-accent mb-1">Competitor Matrix Analysis</h3>
                    <div className="overflow-x-auto border border-border rounded-xl">
                      <table className="w-full text-left font-sans text-[11px]">
                        <thead className="bg-surface text-muted-foreground font-semibold">
                          <tr className="border-b border-border">
                            <th className="px-3 py-2">Competitor</th>
                            <th className="px-3 py-2">Strength</th>
                            <th className="px-3 py-2">Our Advantage</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {generatedData.research.competitorAnalysis.map((c, i) => (
                            <tr key={i} className="hover:bg-surface-hover/30">
                              <td className="px-3 py-2 font-bold">{c.competitor}</td>
                              <td className="px-3 py-2 text-muted-foreground">{c.strength}</td>
                              <td className="px-3 py-2 text-success font-medium">{c.gap}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-success mb-1">Target Customer Core Objections & Pain Points</h3>
                    <ul className="list-disc list-inside space-y-1.5 pl-2 text-muted-foreground">
                      {generatedData.research.targetAudiencePainPoints.map((pain, idx) => (
                        <li key={idx} className="leading-relaxed">{pain}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* SEO Tab */}
              {activeArtifactTab === "seo" && (
                <div className="space-y-4 animate-fade-in text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">RankMath Meta Title</h3>
                      <p className="bg-surface p-2.5 border border-border rounded-xl font-medium truncate">{generatedData.copy.metaTitle}</p>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-wider text-accent mb-1">RankMath Meta Description</h3>
                      <p className="bg-surface p-2.5 border border-border rounded-xl leading-relaxed">{generatedData.copy.metaDescription}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-success mb-1.5 flex items-center gap-1.5">
                      <FileJson className="w-3.5 h-3.5" /> Structured JSON-LD Product Schema (Google rich results)
                    </h3>
                    <pre className="bg-surface border border-border rounded-xl p-3 text-[10px] font-mono overflow-x-auto text-muted-foreground max-h-[160px] scrollbar-none leading-relaxed">
                      {generatedData.copy.schemaJson}
                    </pre>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Organic SEO Target Keywords</h3>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {generatedData.research.seoKeywords.map((kw, i) => (
                        <span key={i} className="text-[10px] bg-muted text-muted-foreground px-2.5 py-1 rounded-lg border border-border font-medium font-mono">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Automation Tab */}
              {activeArtifactTab === "automation" && (
                <div className="space-y-4 animate-fade-in text-xs">
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-foreground">Zero-Code Webhook Hookups</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                        To pipe landing page leads from your external Wix or Elementor forms into OperAIly CRM automatically, copy the pre-configured Zapier / Make.com custom Javascript trigger code below.
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-wider text-success mb-1 flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5" /> Node.js Lead Syncer code (Zapier/Make trigger)
                    </h3>
                    <pre className="bg-surface border border-border rounded-xl p-3 text-[10px] font-mono overflow-x-auto text-muted-foreground max-h-[160px] scrollbar-none leading-relaxed">
                      {generatedData.automation.webhookCode}
                    </pre>
                  </div>
                </div>
              )}

              {/* WordPress/Wix platform export Tab */}
              {activeArtifactTab === "template" && (
                <div className="space-y-4 animate-fade-in text-xs">
                  <div className="p-3 bg-success/10 border border-success/20 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-foreground">Direct Platform Provisioning</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                        We have automatically generated a ready-to-use structural platform template tailored exactly for **{publishingPlatform === "wix" ? "Wix Studio Custom Gutenberg" : "WordPress Elementor Pro"}**.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1 p-3.5 bg-surface border border-border rounded-xl space-y-1.5 text-center">
                      <h4 className="font-bold text-[11px] uppercase tracking-wider">Download Platform File</h4>
                      <p className="text-[9px] text-muted-foreground">Contains theme color variables, page elements, and SEO configurations.</p>
                      <button className="glass-button w-full mt-2 py-1.5 text-[10px] font-bold flex items-center justify-center gap-1">
                        <FileText className="w-3 h-3" /> Download operaily-template.json
                      </button>
                    </div>

                    <div className="flex-1 p-3.5 bg-surface border border-border rounded-xl space-y-1.5 text-center">
                      <h4 className="font-bold text-[11px] uppercase tracking-wider">Connect Domain</h4>
                      <p className="text-[9px] text-muted-foreground">SSL certified, Cloudflare CDN caching, and redirection metrics setup.</p>
                      <button className="glass-button w-full mt-2 py-1.5 text-[10px] font-bold flex items-center justify-center gap-1">
                        <Globe className="w-3 h-3" /> DNS Mapping Instructions
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
