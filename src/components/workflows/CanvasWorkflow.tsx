"use client";

import React, { useState } from "react";
import {
  Target, Users, Zap, Clock, CalendarDays, CreditCard, PhoneCall, Megaphone,
  PenTool, BarChart3, Activity, Loader2, CheckCircle2, ChevronDown, Sparkles,
  Send, Mail, RefreshCw, X, ShieldAlert, FileText, Download, Play, Info,
  Settings, ChevronRight, CheckCircle, FileSpreadsheet, FileJson
} from "lucide-react";

interface AgentConfig {
  id: string;
  name: string;
  role: string;
  icon: React.ComponentType<any>;
  status: "idle" | "active" | "completed";
  color: string;
  bg: string;
  desc: string;
  channels: string[];
}

interface CampaignData {
  whatsapp: {
    introMessage: string;
    brochureUrl: string;
    catalogUrl: string;
  };
  emails: { day: number; subject: string; body: string }[];
  objections: { objection: string; reply: string }[];
  voiceCall: {
    greeting: string;
    objectionHandler: string;
    qualificationQuestion: string;
  };
  proposal: {
    title: string;
    introduction: string;
    deliverables: string[];
    investment: string;
  };
  invoice: {
    invoiceNumber: string;
    items: { description: string; amount: number }[];
    total: number;
    paymentLink: string;
  };
  retargeting: {
    awarenessAd: string;
    testimonialAd: string;
  };
}

export default function CanvasWorkflow() {
  const [activeTab, setActiveTab] = useState<"specialists" | "simulator" | "analytics">("specialists");

  // Input Prospect parameters
  const [prospectName, setProspectName] = useState("");
  const [prospectEmail, setProspectEmail] = useState("");
  const [prospectPhone, setProspectPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("B2B Tech");
  const [productInterest, setProductInterest] = useState("OperAIly CRM Enterprise");
  const [geography, setGeography] = useState("North America");
  
  // Custom Flow toggles
  const [enableObjectionHandling, setEnableObjectionHandling] = useState(true);
  const [enableProposalGen, setEnableProposalGen] = useState(true);
  const [paymentGateway, setPaymentGateway] = useState("stripe");

  // Simulation execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [campaignOutput, setCampaignOutput] = useState<CampaignData | null>(null);
  const [showSimOutput, setShowSimOutput] = useState(false);
  const [simOutputTab, setSimOutputTab] = useState<"whatsapp" | "email" | "objections" | "voice" | "proposal" | "invoice">("whatsapp");

  // Simulated 14-Step Chronological Growth Workflow steps
  const simulationSteps = [
    { title: "Capture & Normalise Inbound Lead", desc: "Agent 1 ingesting from Multi-Channel sources (Facebook, Justdial, Wix)" },
    { title: "Validate & Deduplicate Records", desc: "Agent 1 verifying lead fields and removing duplicate rows" },
    { title: "Sync lead into OperAIly CRM", desc: "Agent 2 creating customer record & assigning workflow stages" },
    { title: "Calculate AI Lead Scoring", desc: "Agent 2 analyzing firmographics & mapping intent (Lead Score set to 95)" },
    { title: "Deploy Instant WhatsApp catalog outreach", desc: "Agent 3 delivering personalized welcome brochure & product details" },
    { title: "Initialize 30-Day automated Email series", desc: "Agent 4 scheduling smart sequences for Day 1, 2, 4, 7, 10, 15, 20..." },
    { title: "Activate Voice Assistant objection qualification", desc: "Agent 7 loading greeting models & cold-calling prompts" },
    { title: "Coordinate Meeting Availability checks", desc: "Agent 5 scanning Google Calendar/Teams Meet slots in real-time" },
    { title: "Book Live Virtual consultation", desc: "Agent 5 scheduling slot, generating invite, & syncing to meet URL" },
    { title: "Generate Dynamic B2B Proposal Document", desc: "Agent 9 writing custom value proposal copy matching product interest" },
    { title: "Create checkout invoice payment gates", desc: "Agent 6 provisioning custom Stripe/Razorpay link and up-sell spec" },
    { title: "Trigger Meta & Google retargeting ad pixel", desc: "Agent 8 firing dynamic awareness/testimonial carousel ads" },
    { title: "Launch live voice qual call simulation", desc: "Agent 7 triggering cold call to qualify intent and handle pushbacks" },
    { title: "Escalate Hot Qualified Deal to human sales", desc: "Agent 10 recording overall funnel analytics and firing email alert" }
  ];

  // 10 Specialized Growth Agents configuration
  const [specialists, setSpecialists] = useState<AgentConfig[]>([
    { id: "1", name: "Capture Specialist", role: "Agent 1 — Ingestion", icon: Target, status: "idle", color: "text-primary", bg: "bg-primary/10", desc: "Normalizes Justdial, IndiaMART, Wix, and Facebook lead feeds instantly.", channels: ["Facebook Ads", "Justdial", "Wix Forms", "CSV"] },
    { id: "2", name: "CRM Operator", role: "Agent 2 — Workflow Orchestrator", icon: Users, status: "idle", color: "text-accent", bg: "bg-accent/10", desc: "Syncs CRM, maps pipelines, tracks stages, and scores lead intent.", channels: ["OperAIly Leads", "Lead Ownership"] },
    { id: "3", name: "Outreach Assistant", role: "Agent 3 — Direct Nurturer", icon: Send, status: "idle", color: "text-success", bg: "bg-success/10", desc: "Triggers personalized introductory WhatsApp catalogs & corporate brochure PDFs.", channels: ["WhatsApp API", "SMS Gateway"] },
    { id: "4", name: "Nurture Sequencer", role: "Agent 4 — 30-Day Follow-up", icon: Clock, status: "idle", color: "text-warning", bg: "bg-warning/10", desc: "Deploys 30-day automated value email sequences (Day 1, 2, 4, 7, 10, 15, 20...).", channels: ["SendGrid", "Mailchimp"] },
    { id: "5", name: "Appointment Booking", role: "Agent 5 — Scheduler", icon: CalendarDays, status: "idle", color: "text-info", bg: "bg-info/10", desc: "Scans availability blocks, secures slots, and provisions Google/Teams meet links.", channels: ["Google Calendar", "Teams Meet"] },
    { id: "6", name: "Sales Closer", role: "Agent 6 — Gateway Integrator", icon: CreditCard, status: "idle", color: "text-danger", bg: "bg-danger/10", desc: "Creates checkout links, up-sells discounts, and initiates cart recovery routines.", channels: ["Stripe Gate", "Razorpay Pay"] },
    { id: "7", name: "Voice Calling Bot", role: "Agent 7 — Cold Dialer", icon: PhoneCall, status: "idle", color: "text-secondary", bg: "bg-secondary/10", desc: "Conducts automated cold calls, handles pushbacks, and routes calls to reps.", channels: ["Twilio Voice", "Speech-to-Text"] },
    { id: "8", name: "Retargeting Handler", role: "Agent 8 — Ad Automation", icon: Megaphone, status: "idle", color: "text-primary", bg: "bg-primary/10", desc: "Automatically triggers Google display, Meta, and LinkedIn remarketing carousel ads.", channels: ["Meta Pixels", "Google Ads"] },
    { id: "9", name: "Creative Copywriter", role: "Agent 9 — CTR Creator", icon: PenTool, status: "idle", color: "text-success", bg: "bg-success/10", desc: "Uses Gemini to write high-CTR headings, landing page copy, and B2B proposals.", channels: ["Gemini Engine", "PDF Generator"] },
    { id: "10", name: "funnel Analyst", role: "Agent 10 — ROI Optimizer", icon: BarChart3, status: "idle", color: "text-info", bg: "bg-info/10", desc: "Monitors costs, WhatsApp reply metrics, open rates, and runs A/B test iterations.", channels: ["Analytics Matrix"] },
  ]);

  // Launches simulated 10-Agent Multi-Step Workflow
  const handleLaunchGrowthEngine = async () => {
    if (!prospectName || !prospectEmail) return;

    setIsExecuting(true);
    setCampaignOutput(null);
    setActiveStep(0);
    setShowSimOutput(false);

    // Reset agent status animations
    setSpecialists(prev => prev.map(s => ({ ...s, status: "idle" })));

    // Begin animated execution step simulation
    const runSimulation = () => {
      let currentStep = 0;
      const interval = setInterval(() => {
        if (currentStep < 13) {
          currentStep += 1;
          setActiveStep(currentStep);

          // Animate active status of agents matching specific steps
          setSpecialists(prev => prev.map(s => {
            // Capture Agent
            if (currentStep >= 0 && currentStep <= 1 && s.id === "1") return { ...s, status: "active" };
            if (currentStep > 1 && s.id === "1") return { ...s, status: "completed" };

            // CRM Agent
            if (currentStep >= 2 && currentStep <= 3 && s.id === "2") return { ...s, status: "active" };
            if (currentStep > 3 && s.id === "2") return { ...s, status: "completed" };

            // Outreach Agent
            if (currentStep === 4 && s.id === "3") return { ...s, status: "active" };
            if (currentStep > 4 && s.id === "3") return { ...s, status: "completed" };

            // Sequencer Agent
            if (currentStep === 5 && s.id === "4") return { ...s, status: "active" };
            if (currentStep > 5 && s.id === "4") return { ...s, status: "completed" };

            // Voice Agent
            if ((currentStep === 6 || currentStep === 12) && s.id === "7") return { ...s, status: "active" };
            if (currentStep > 12 && s.id === "7") return { ...s, status: "completed" };

            // Booking Agent
            if (currentStep >= 7 && currentStep <= 8 && s.id === "5") return { ...s, status: "active" };
            if (currentStep > 8 && s.id === "5") return { ...s, status: "completed" };

            // Copywriter Agent
            if (currentStep === 9 && s.id === "9") return { ...s, status: "active" };
            if (currentStep > 9 && s.id === "9") return { ...s, status: "completed" };

            // Sales Agent
            if (currentStep === 10 && s.id === "6") return { ...s, status: "active" };
            if (currentStep > 10 && s.id === "6") return { ...s, status: "completed" };

            // Retargeting Agent
            if (currentStep === 11 && s.id === "8") return { ...s, status: "active" };
            if (currentStep > 11 && s.id === "8") return { ...s, status: "completed" };

            // Analytics Agent
            if (currentStep === 13 && s.id === "10") return { ...s, status: "active" };

            return s;
          }));
        } else {
          clearInterval(interval);
        }
      }, 900);

      return interval;
    };

    const simInterval = runSimulation();

    // Call backend endpoint to synthesize the sales campaign assets
    try {
      const response = await fetch("/api/workflows/growth-engine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospectName,
          prospectEmail,
          prospectPhone,
          companyName,
          industry,
          productInterest,
          geography,
          enableObjectionHandling,
          enableProposalGen,
          paymentGateway
        })
      });

      const resData = await response.json();
      if (resData.success) {
        setTimeout(() => {
          clearInterval(simInterval);
          setSpecialists(prev => prev.map(s => ({ ...s, status: "completed" })));
          setActiveStep(13);
          setCampaignOutput(resData.data);
          setShowSimOutput(true);
          setIsExecuting(false);
        }, 13000);
      } else {
        setIsExecuting(false);
      }
    } catch (err) {
      console.error(err);
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6 stagger-children">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Sales <span className="gradient-text">Growth Engine</span> ⚡</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Replaces legacy workflows with a 10-Agent master lead capture, nurture, booking, calling, & retargeting ecosystem.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-muted p-1 border border-border rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab("specialists")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "specialists" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Specialists Grid
          </button>
          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "simulator" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            Launch Growth Engine
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === "analytics" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            ROI Analytics (Agent 10)
          </button>
        </div>
      </div>

      {/* Tab 1: Specialists Control Grid */}
      {activeTab === "specialists" && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-start gap-3">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-foreground">10 Collaborative AI Specialists Active</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                OperAIly&apos;s Autonomous Growth Engine synchronizes multiple dedicated agents operating across distinct communication gateways (Stripe, Twilio, WhatsApp API, Meta Ads, and Outlook).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {specialists.map((agent) => {
              const AgentIcon = agent.icon;
              return (
                <div key={agent.id} className="glass-card p-5 space-y-4 hover:border-primary/25 transition-all group relative overflow-hidden flex flex-col justify-between">
                  <div className="space-y-3 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl ${agent.bg} ${agent.color} flex items-center justify-center`}>
                        <AgentIcon className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] font-mono text-muted-foreground font-bold uppercase tracking-wider">{agent.role}</span>
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold flex items-center gap-1.5">{agent.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{agent.desc}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border mt-2 relative z-10 flex flex-wrap gap-1.5">
                    {agent.channels.map((chan, idx) => (
                      <span key={idx} className="text-[9px] bg-muted border border-border px-2 py-0.5 rounded-lg text-muted-foreground font-mono font-medium">
                        {chan}
                      </span>
                    ))}
                  </div>

                  <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Live Growth Simulator Panel */}
      {activeTab === "simulator" && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start animate-fade-in">
          
          {/* Simulator Controls */}
          <div className="xl:col-span-5 space-y-6">
            <div className="glass-card p-5 space-y-4">
              <h2 className="text-sm font-semibold flex items-center gap-2 border-b border-border pb-3">
                <Target className="w-4 h-4 text-primary" /> Target Prospect Variables
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Prospect Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Thomas Miller"
                    value={prospectName}
                    onChange={(e) => setProspectName(e.target.value)}
                    disabled={isExecuting}
                    className="w-full mt-1 px-3 py-2 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground input-focus"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="thomas@miller-trade.com"
                      value={prospectEmail}
                      onChange={(e) => setProspectEmail(e.target.value)}
                      disabled={isExecuting}
                      className="w-full mt-1 px-3 py-2 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground input-focus"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 348-1293"
                      value={prospectPhone}
                      onChange={(e) => setProspectPhone(e.target.value)}
                      disabled={isExecuting}
                      className="w-full mt-1 px-3 py-2 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground input-focus"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Company Name</label>
                    <input
                      type="text"
                      placeholder="Miller Industrial"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      disabled={isExecuting}
                      className="w-full mt-1 px-3 py-2 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground input-focus"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Industry Sector</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      disabled={isExecuting}
                      className="w-full mt-1 px-2 py-2 bg-input border border-input-border rounded-xl text-xs text-foreground input-focus cursor-pointer"
                    >
                      <option value="B2B Tech">B2B Software / Tech</option>
                      <option value="Manufacturing">Heavy Manufacturing</option>
                      <option value="Real Estate">Commercial Real Estate</option>
                      <option value="Healthcare">Healthcare Services</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Product Target</label>
                    <select
                      value={productInterest}
                      onChange={(e) => setProductInterest(e.target.value)}
                      disabled={isExecuting}
                      className="w-full mt-1 px-2 py-2 bg-input border border-input-border rounded-xl text-xs text-foreground input-focus cursor-pointer"
                    >
                      <option value="OperAIly CRM Enterprise">CRM Enterprise License</option>
                      <option value="OperAIly Agency Pro">Growth Agency Bundle</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Geography</label>
                    <select
                      value={geography}
                      onChange={(e) => setGeography(e.target.value)}
                      disabled={isExecuting}
                      className="w-full mt-1 px-2 py-2 bg-input border border-input-border rounded-xl text-xs text-foreground input-focus cursor-pointer"
                    >
                      <option value="North America">North America</option>
                      <option value="Europe & UK">Europe & UK</option>
                      <option value="APAC Region">APAC Region</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 bg-surface/50 border border-border rounded-xl space-y-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-primary">Advanced AI Features</span>
                  
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>AI Objection Handling</span>
                    <input
                      type="checkbox"
                      checked={enableObjectionHandling}
                      onChange={(e) => setEnableObjectionHandling(e.target.checked)}
                      disabled={isExecuting}
                      className="rounded border-border text-primary cursor-pointer w-4 h-4"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Dynamic proposal Generation</span>
                    <input
                      type="checkbox"
                      checked={enableProposalGen}
                      onChange={(e) => setEnableProposalGen(e.target.checked)}
                      disabled={isExecuting}
                      className="rounded border-border text-primary cursor-pointer w-4 h-4"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Gateway Integration</span>
                    <select
                      value={paymentGateway}
                      onChange={(e) => setPaymentGateway(e.target.value)}
                      disabled={isExecuting}
                      className="bg-transparent border-none text-foreground font-bold font-mono text-[10px] p-0 focus:ring-0 cursor-pointer"
                    >
                      <option value="stripe">Stripe</option>
                      <option value="razorpay">Razorpay</option>
                    </select>
                  </div>
                </div>

              </div>

              <button
                onClick={handleLaunchGrowthEngine}
                disabled={isExecuting || !prospectName || !prospectEmail}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-xs hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Executing Multi-Agent Pipelines...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Launch Growth Engine Pipeline
                  </>
                )}
              </button>
            </div>

            {/* Simulated Live Lead Sync logs */}
            {isExecuting && (
              <div className="glass-card p-5 space-y-3.5 animate-fade-in">
                <h2 className="text-sm font-semibold flex items-center justify-between border-b border-border pb-3">
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" /> pipeline Tracker Log
                  </span>
                  <span className="badge bg-primary/10 text-primary text-[9px] font-mono font-bold">processing</span>
                </h2>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {simulationSteps.map((step, index) => (
                    <div key={index} className="flex gap-3 relative">
                      {index < simulationSteps.length - 1 && (
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

          </div>

          {/* Campaign Outputs Display */}
          <div className="xl:col-span-7 space-y-6">
            <div className="glass-card overflow-hidden flex flex-col min-h-[580px]">
              
              {/* Output TopBar */}
              <div className="px-5 py-3.5 border-b border-border bg-surface-hover flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-danger/50" />
                  <div className="w-3 h-3 rounded-full bg-warning/50" />
                  <div className="w-3 h-3 rounded-full bg-success/50" />
                  <span className="text-xs text-muted-foreground font-mono ml-3 truncate max-w-xs bg-muted px-2.5 py-1 rounded-lg border border-border font-medium">
                    {showSimOutput ? `Growth Engine Active — INV: ${campaignOutput?.invoice.invoiceNumber}` : "Engine Output Console"}
                  </span>
                </div>

                {showSimOutput && campaignOutput && (
                  <div className="flex flex-wrap gap-1 bg-muted p-1 rounded-xl border border-border">
                    <button
                      onClick={() => setSimOutputTab("whatsapp")}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all ${simOutputTab === "whatsapp" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      WhatsApp
                    </button>
                    <button
                      onClick={() => setSimOutputTab("email")}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all ${simOutputTab === "email" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      30d Emails
                    </button>
                    <button
                      onClick={() => setSimOutputTab("objections")}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all ${simOutputTab === "objections" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Objections
                    </button>
                    <button
                      onClick={() => setSimOutputTab("voice")}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all ${simOutputTab === "voice" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Voice Dial
                    </button>
                    <button
                      onClick={() => setSimOutputTab("proposal")}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all ${simOutputTab === "proposal" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Proposal
                    </button>
                    <button
                      onClick={() => setSimOutputTab("invoice")}
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all ${simOutputTab === "invoice" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Invoice
                    </button>
                  </div>
                )}
              </div>

              {/* Console Body */}
              <div className="flex-1 bg-surface p-6 flex flex-col justify-center overflow-y-auto">
                
                {!showSimOutput && !isExecuting && (
                  <div className="text-center max-w-sm mx-auto space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-lg animate-pulse">
                      <Zap className="w-8 h-8" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-sm">Growth Engine Simulator Ready</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Configure target prospect parameters, map advanced features, and click Launch. Watch the 10-Agent pipeline execute 14-step campaigns in real-time.
                      </p>
                    </div>
                  </div>
                )}

                {isExecuting && !showSimOutput && (
                  <div className="text-center max-w-sm mx-auto space-y-5">
                    <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-accent/20 border-t-accent animate-spin" />
                      <Sparkles className="w-6 h-6 text-accent animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-sm">Orchestrating Growth Pipelines...</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed animate-pulse">
                        Collaborating on multi-channel ingestion, normalising leads, sending WhatsApp profiles, and creating custom Stripe billing invoices...
                      </p>
                    </div>
                  </div>
                )}

                {showSimOutput && campaignOutput && (
                  <div className="w-full text-left space-y-4 animate-fade-in">
                    
                    {/* Live Lead Sync Banner */}
                    <div className="p-3 bg-success/15 border border-success/30 rounded-xl flex items-center justify-between text-xs text-success">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-bold">Lead Synced into OperAIly CRM</span>
                      </div>
                      <span className="text-[9px] bg-success/10 border border-success/20 px-2 py-0.5 rounded font-mono font-bold uppercase">HOT LEAD (SCORE: 95)</span>
                    </div>

                    {/* Tab contents */}
                    {simOutputTab === "whatsapp" && (
                      <div className="space-y-3 animate-fade-in text-xs">
                        <div>
                          <span className="text-[9px] font-bold text-success uppercase tracking-wider">Agent 3 — outreach WhatsApp Message</span>
                          <div className="p-4 bg-background border border-border rounded-xl whitespace-pre-line mt-1.5 leading-relaxed font-sans text-muted-foreground">
                            {campaignOutput.whatsapp.introMessage}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                          <div className="p-2.5 bg-surface border border-border rounded-xl text-center space-y-1">
                            <span className="text-[9px] text-muted-foreground">Corporate Brochure</span>
                            <a href={campaignOutput.whatsapp.brochureUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-primary flex items-center justify-center gap-1 hover:underline">
                              <FileText className="w-3.5 h-3.5" /> brochure.pdf <Download className="w-3 h-3" />
                            </a>
                          </div>
                          <div className="p-2.5 bg-surface border border-border rounded-xl text-center space-y-1">
                            <span className="text-[9px] text-muted-foreground">Product Catalog</span>
                            <a href={campaignOutput.whatsapp.catalogUrl} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-primary flex items-center justify-center gap-1 hover:underline">
                              <FileSpreadsheet className="w-3.5 h-3.5" /> catalog.pdf <Download className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {simOutputTab === "email" && (
                      <div className="space-y-3.5 animate-fade-in text-xs">
                        <span className="text-[9px] font-bold text-warning uppercase tracking-wider">Agent 4 — 30-Day Nurturing email Sequence</span>
                        
                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                          {campaignOutput.emails.map((email, i) => (
                            <div key={i} className="p-3.5 bg-background border border-border rounded-xl space-y-2">
                              <div className="flex justify-between items-center border-b border-border pb-2">
                                <span className="font-bold text-foreground">Day {email.day} Sequence</span>
                                <span className="text-[9px] bg-warning/10 text-warning px-2 py-0.5 rounded border border-warning/20 font-mono font-bold uppercase">Scheduled</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-muted-foreground">Subject: </span>
                                <span className="font-bold text-foreground">{email.subject}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-relaxed whitespace-pre-line border-t border-border/50 pt-2">{email.body}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {simOutputTab === "objections" && (
                      <div className="space-y-3 animate-fade-in text-xs">
                        <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider">Agent 9 — AI objection Handling Library</span>
                        
                        <div className="space-y-3.5 mt-1">
                          {campaignOutput.objections.map((obj, i) => (
                            <div key={i} className="p-3.5 bg-background border border-border rounded-xl space-y-2 text-left">
                              <h4 className="font-bold text-foreground flex items-center gap-1.5">
                                <ShieldAlert className="w-3.5 h-3.5 text-danger shrink-0" />
                                Prospect Pushback: &ldquo;{obj.objection}&rdquo;
                              </h4>
                              <p className="text-[10px] text-muted-foreground leading-relaxed pl-5 bg-surface p-2.5 rounded-xl border border-border/30">
                                {obj.reply}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {simOutputTab === "voice" && (
                      <div className="space-y-3 animate-fade-in text-xs">
                        <span className="text-[9px] font-bold text-secondary uppercase tracking-wider">Agent 7 — Live voice calling Scripts</span>
                        
                        <div className="space-y-3">
                          <div className="p-3.5 bg-background border border-border rounded-xl text-left space-y-1.5">
                            <span className="text-[9px] font-bold text-secondary">Dialer Opener greeting</span>
                            <p className="text-[10px] text-muted-foreground leading-relaxed font-mono italic">&ldquo;{campaignOutput.voiceCall.greeting}&rdquo;</p>
                          </div>
                          <div className="p-3.5 bg-background border border-border rounded-xl text-left space-y-1.5">
                            <span className="text-[9px] font-bold text-secondary">Qualification criteria hook</span>
                            <p className="text-[10px] text-muted-foreground leading-relaxed font-mono italic">&ldquo;{campaignOutput.voiceCall.qualificationQuestion}&rdquo;</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {simOutputTab === "proposal" && (
                      <div className="p-5 bg-background border border-border rounded-2xl space-y-4 animate-fade-in text-xs relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-primary/5 blur-2xl" />
                        
                        <div className="flex justify-between items-center border-b border-border pb-3">
                          <div>
                            <h3 className="font-extrabold text-sm text-foreground">{campaignOutput.proposal.title}</h3>
                            <p className="text-[9px] text-muted-foreground mt-0.5">OperAIly Dynamic Quotation Engine</p>
                          </div>
                          <span className="text-[10px] font-bold text-primary font-mono">{campaignOutput.proposal.investment}</span>
                        </div>

                        <p className="text-[11px] text-muted-foreground leading-relaxed">{campaignOutput.proposal.introduction}</p>

                        <div className="space-y-2 border-t border-border pt-4">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Deliverables Matrix:</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                            {campaignOutput.proposal.deliverables.map((del, idx) => (
                              <div key={idx} className="p-2 bg-surface/50 border border-border rounded-lg text-[10px] text-muted-foreground flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                                <span>{del}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {simOutputTab === "invoice" && (
                      <div className="p-5 bg-background border border-border rounded-2xl space-y-4 animate-fade-in text-xs">
                        <div className="flex justify-between items-center border-b border-border pb-3">
                          <div>
                            <span className="text-[9px] font-bold text-danger uppercase tracking-wider">Agent 6 — checkout billing Invoice</span>
                            <h3 className="font-black text-sm text-foreground mt-1">Invoice #{campaignOutput.invoice.invoiceNumber}</h3>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground">{new Date().toLocaleDateString()}</span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between font-bold text-muted-foreground border-b border-border/50 pb-1.5 text-[10px]">
                            <span>Description</span>
                            <span>Amount</span>
                          </div>
                          {campaignOutput.invoice.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-foreground">
                              <span>{item.description}</span>
                              <span className="font-mono">${item.amount}</span>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-border pt-3 flex justify-between items-center">
                          <span className="font-bold text-foreground">Grand Total:</span>
                          <span className="font-extrabold text-sm text-primary font-mono">${campaignOutput.invoice.total}</span>
                        </div>

                        <div className="pt-2">
                          <a
                            href={campaignOutput.invoice.paymentLink}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2.5 rounded-xl text-white font-bold text-xs transition-all hover:scale-[1.01] shadow-lg flex items-center justify-center gap-1.5 cursor-pointer bg-gradient-to-r from-primary to-accent"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Open Checkout Link ({paymentGateway === 'stripe' ? 'Stripe' : 'Razorpay'})
                          </a>
                        </div>
                      </div>
                    )}

                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 3: Campaign ROI & Performance Analytics */}
      {activeTab === "analytics" && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Key Metrics grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Cost Per Lead (CPL)</span>
              <p className="text-xl font-black font-mono text-foreground">$1.82</p>
              <span className="text-[9px] text-success font-semibold flex items-center gap-1">↓ 14% improvement week-over-week</span>
            </div>
            <div className="glass-card p-5 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Appointment Rate (%)</span>
              <p className="text-xl font-black font-mono text-foreground">22.4%</p>
              <span className="text-[9px] text-success font-semibold flex items-center gap-1">↑ 3.8% due to dynamic scheduler sync</span>
            </div>
            <div className="glass-card p-5 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Stripe/Razorpay ROI</span>
              <p className="text-xl font-black font-mono text-foreground">340%</p>
              <span className="text-[9px] text-success font-semibold flex items-center gap-1">↑ 18.5% recovery on checkout reminders</span>
            </div>
            <div className="glass-card p-5 space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Voice Call Closure</span>
              <p className="text-xl font-black font-mono text-foreground">11.8%</p>
              <span className="text-[9px] text-success font-semibold flex items-center gap-1">↑ 2.1% after objection model upgrade</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Split Testing Analytics */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 border-b border-border pb-3">
                <Activity className="w-4 h-4 text-primary" /> Active A/B Outreach Variations
              </h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-surface border border-border rounded-xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-foreground">Variant A (Consultative Tone)</span>
                    <span className="text-[10px] font-mono text-primary font-bold">54% Reply Rate</span>
                  </div>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: "54%" }} />
                  </div>
                </div>

                <div className="p-3 bg-surface border border-border rounded-xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-foreground">Variant B (Urgency / Direct Catalog Offer)</span>
                    <span className="text-[10px] font-mono text-accent font-bold">68% Reply Rate</span>
                  </div>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div className="bg-accent h-full rounded-full" style={{ width: "68%" }} />
                  </div>
                </div>

                <div className="p-3 bg-surface border border-border rounded-xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-foreground">Variant C (Video Demo Pitch)</span>
                    <span className="text-[10px] font-mono text-success font-bold">42% Reply Rate</span>
                  </div>
                  <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                    <div className="bg-success h-full rounded-full" style={{ width: "42%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign conversion funnel */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-sm font-semibold flex items-center gap-2 border-b border-border pb-3">
                <Settings className="w-4 h-4 text-accent" /> Ingestion Sync Breakdown
              </h3>
              
              <div className="space-y-3.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Meta/Facebook Lead Ads Sync</span>
                  <span className="font-bold text-foreground font-mono">482 leads</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Justdial Crawler Sync</span>
                  <span className="font-bold text-foreground font-mono">294 leads</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">IndiaMART Webhook Sync</span>
                  <span className="font-bold text-foreground font-mono">180 leads</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Wix & WordPress forms</span>
                  <span className="font-bold text-foreground font-mono">114 leads</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
