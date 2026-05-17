"use client";

import React, { useState } from "react";
import {
  ChevronLeft, ChevronRight, Plus, Clock, MapPin, Video, Users, Sparkles,
  RefreshCw, CheckCircle2, AlertCircle, Loader2, Link, Globe, Calendar, Check,
  Laptop, X, ArrowRight, ExternalLink
} from "lucide-react";

interface CalEvent {
  id: string;
  title: string;
  time: string;
  duration: string;
  type: "meeting" | "call" | "demo" | "internal";
  leadName: string;
  company: string;
  aiBooked: boolean;
  channel: string;
  meetingUrl?: string;
}

const eventColors: Record<string, string> = {
  meeting: "#6366f1", call: "#10b981", demo: "#f59e0b", internal: "#64748b",
};

function generateEvents(year: number, month: number): Record<number, CalEvent[]> {
  const events: Record<number, CalEvent[]> = {};
  const sampleEvents: Omit<CalEvent, "id">[] = [
    { title: "Intro Call", time: "09:00", duration: "30m", type: "call", leadName: "Hans Mueller", company: "BioPharm Import GmbH", aiBooked: true, channel: "Voice" },
    { title: "Product Demo", time: "11:00", duration: "45m", type: "demo", leadName: "Anna Weber", company: "MedImport AG", aiBooked: false, channel: "Zoom" },
    { title: "Strategy Meeting", time: "14:00", duration: "1h", type: "meeting", leadName: "Klaus Schmidt", company: "Schmidt Pharma", aiBooked: true, channel: "WhatsApp" },
    { title: "Follow-up Call", time: "10:30", duration: "20m", type: "call", leadName: "Maria Fischer", company: "EuroPharma", aiBooked: true, channel: "Voice" },
    { title: "Team Standup", time: "09:30", duration: "15m", type: "internal", leadName: "Team", company: "OperAIly", aiBooked: false, channel: "Internal" },
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(year, month, d).getDay();
    if (dow === 0 || dow === 6) continue;
    const numEvents = Math.floor(Math.random() * 2) + (d % 4 === 0 ? 1 : 0);
    if (numEvents > 0) {
      events[d] = [];
      for (let i = 0; i < numEvents; i++) {
        const sample = sampleEvents[(d + i) % sampleEvents.length];
        events[d].push({ ...sample, id: `ev_${d}_${i}` });
      }
    }
  }
  return events;
}

export default function CalendarContent() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  // State hold for calendar events
  const [events, setEvents] = useState<Record<number, CalEvent[]>>(() => generateEvents(year, month));
  
  // Real-time Integrations State
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [microsoftConnected, setMicrosoftConnected] = useState(false);
  const [microsoftEmail, setMicrosoftEmail] = useState("");
  const [isSyncing, setIsSyncing] = useState<"google" | "microsoft" | null>(null);

  // Simulated OAuth Modals
  const [showAuthModal, setShowAuthModal] = useState<"google" | "microsoft" | null>(null);

  // Public Booking drawer & scheduling simulator inputs
  const [showBookingDrawer, setShowBookingDrawer] = useState(false);
  const [bookingName, setBookingName] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingCompany, setBookingCompany] = useState("");
  const [bookingProvider, setBookingProvider] = useState<"google" | "microsoft">("google");
  const [bookingTime, setBookingTime] = useState("10:00");
  const [isConfirmingBooking, setIsConfirmingBooking] = useState(false);
  const [bookingSuccessAlert, setBookingSuccessAlert] = useState<string | null>(null);

  // Fetch lists for selected day
  const selectedEvents = selectedDay ? events[selectedDay] || [] : [];
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const totalMeetings = Object.values(events).flat().length;
  const syncMeetings = Object.values(events).flat().filter(e => e.channel.includes("Meet") || e.channel.includes("Teams")).length;

  // Handle Integrations connect trigger
  const handleConnectProvider = async (provider: "google" | "microsoft") => {
    setShowAuthModal(null);
    setIsSyncing(provider);

    try {
      const response = await fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "connect", provider })
      });

      const resData = await response.json();
      if (resData.success) {
        if (provider === "google") {
          setGoogleConnected(true);
          setGoogleEmail(resData.connectedState.email);
        } else {
          setMicrosoftConnected(true);
          setMicrosoftEmail(resData.connectedState.email);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(null);
    }
  };

  // Handle Revoking integration
  const handleRevokeProvider = (provider: "google" | "microsoft") => {
    if (provider === "google") {
      setGoogleConnected(false);
      setGoogleEmail("");
    } else {
      setMicrosoftConnected(false);
      setMicrosoftEmail("");
    }
  };

  // Confirms slot booking simulator POST transaction
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingName || !bookingEmail || !selectedDay) return;

    setIsConfirmingBooking(true);
    setBookingSuccessAlert(null);

    try {
      const response = await fetch("/api/calendar/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "book",
          provider: bookingProvider,
          leadName: bookingName,
          leadEmail: bookingEmail,
          leadCompany: bookingCompany || "Inbound Corp",
          appointmentTime: bookingTime,
          appointmentDate: selectedDay,
          meetingTitle: `${bookingCompany ? bookingCompany + " " : ""}Consultation Discovery Call`
        })
      });

      const resData = await response.json();
      if (resData.success) {
        // Dynamic push into the state calendar grid
        const newEv: CalEvent = resData.event;
        
        setEvents(prev => {
          const currentDayEvents = prev[selectedDay] || [];
          return {
            ...prev,
            [selectedDay]: [...currentDayEvents, newEv]
          };
        });

        // Trigger visual success notification
        setBookingSuccessAlert(`Demo Appt Synced! Join Link: ${newEv.meetingUrl}`);
        
        // Reset booking form inputs
        setBookingName("");
        setBookingEmail("");
        setBookingCompany("");

        // Close scheduling drawer after brief delay
        setTimeout(() => {
          setShowBookingDrawer(false);
          setBookingSuccessAlert(null);
        }, 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsConfirmingBooking(false);
    }
  };

  return (
    <div className="space-y-6 stagger-children relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar & <span className="gradient-text">Meet Sync</span> 📅</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalMeetings} active meetings • {syncMeetings} synced with Google & Microsoft real-time pipelines
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBookingDrawer(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-xs hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Book Appointment
          </button>
        </div>
      </div>

      {/* Integration Connections Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Google Meet Connection */}
        <div className="glass-card p-5 flex items-center justify-between relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#ea4335]/10 flex items-center justify-center text-[#ea4335]">
              <Video className="w-6 h-6 shrink-0" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                Google Calendar & Meet
                {googleConnected && <span className="w-2 h-2 rounded-full bg-success animate-pulse" />}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-normal">
                {googleConnected 
                  ? `Synced with ${googleEmail}` 
                  : "Sync appointments, lookup slots, & generate Google Meet links."}
              </p>
            </div>
          </div>
          <div className="relative z-10 shrink-0">
            {isSyncing === "google" ? (
              <button disabled className="glass-button px-3.5 py-2 text-xs font-semibold flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing...
              </button>
            ) : googleConnected ? (
              <button 
                onClick={() => handleRevokeProvider("google")}
                className="px-3.5 py-2 text-xs font-bold bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 rounded-xl transition-all cursor-pointer"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal("google")}
                className="glass-button px-3.5 py-2 text-xs font-bold hover:border-primary/30 transition-all cursor-pointer"
              >
                Connect Sync
              </button>
            )}
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-[#ea4335]/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Microsoft Teams Connection */}
        <div className="glass-card p-5 flex items-center justify-between relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-[#0078d4]/10 flex items-center justify-center text-[#0078d4]">
              <Users className="w-6 h-6 shrink-0" />
            </div>
            <div>
              <h3 className="text-sm font-bold flex items-center gap-1.5">
                Microsoft Teams & Calendar
                {microsoftConnected && <span className="w-2 h-2 rounded-full bg-success animate-pulse" />}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 leading-normal">
                {microsoftConnected 
                  ? `Synced with ${microsoftEmail}` 
                  : "Sync Outlook appointments & generate Teams meeting slots."}
              </p>
            </div>
          </div>
          <div className="relative z-10 shrink-0">
            {isSyncing === "microsoft" ? (
              <button disabled className="glass-button px-3.5 py-2 text-xs font-semibold flex items-center gap-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Syncing...
              </button>
            ) : microsoftConnected ? (
              <button 
                onClick={() => handleRevokeProvider("microsoft")}
                className="px-3.5 py-2 text-xs font-bold bg-danger/10 text-danger border border-danger/20 hover:bg-danger/20 rounded-xl transition-all cursor-pointer"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal("microsoft")}
                className="glass-button px-3.5 py-2 text-xs font-bold hover:border-primary/30 transition-all cursor-pointer"
              >
                Connect Sync
              </button>
            )}
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 rounded-full bg-[#0078d4]/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Calendar Grid */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5 border-b border-border pb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" /> Event Board Matrix
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <button onClick={prevMonth} className="p-1.5 bg-surface border border-border rounded-lg hover:bg-surface-hover transition-all cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
                <h3 className="text-xs font-bold font-mono">{monthName.toUpperCase()} {year}</h3>
                <button onClick={nextMonth} className="p-1.5 bg-surface border border-border rounded-lg hover:bg-surface-hover transition-all cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5 mb-1 text-center font-mono">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
              <div key={d} className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDow }, (_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayEvents = events[day] || [];
              const isToday = isCurrentMonth && day === today.getDate();
              const isSelected = day === selectedDay;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`relative p-2 rounded-xl text-xs transition-all min-h-[58px] flex flex-col items-start justify-between border cursor-pointer ${
                    isSelected ? "bg-primary/10 border-primary/40 shadow-sm" : 
                    isToday ? "bg-accent/15 border-accent/35" : 
                    "hover:bg-surface border-border-subtle"
                  }`}
                >
                  <span className={`font-bold font-mono ${isToday ? "text-accent text-[11px]" : isSelected ? "text-primary" : "text-muted-foreground"}`}>
                    {String(day).padStart(2, "0")}
                  </span>
                  
                  {dayEvents.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {dayEvents.map((ev, j) => (
                        <span
                          key={j}
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ 
                            background: ev.channel.includes("Meet") ? "#ea4335" : 
                                        ev.channel.includes("Teams") ? "#0078d4" : 
                                        eventColors[ev.type] 
                          }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Detail & Booking Sync list */}
        <div className="glass-card p-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
            <h3 className="text-sm font-semibold">
              {selectedDay ? `${monthName} ${selectedDay}` : "Select a day"}
            </h3>
            <span className="text-[10px] text-muted-foreground font-mono font-bold bg-muted px-2 py-0.5 rounded border border-border">
              {selectedEvents.length} Appts
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none">
            {selectedEvents.length === 0 ? (
              <div className="text-center py-16">
                <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-2.5 opacity-20" />
                <p className="text-xs text-muted-foreground">No bookings recorded</p>
                <button
                  onClick={() => setShowBookingDrawer(true)}
                  className="text-[10px] font-bold text-primary underline mt-1 cursor-pointer block mx-auto"
                >
                  Book a slot now
                </button>
              </div>
            ) : (
              selectedEvents.map((ev) => (
                <div key={ev.id} className="p-3 bg-surface border border-border rounded-xl space-y-2 relative overflow-hidden group hover:border-primary/30 transition-all">
                  <div className="flex items-center justify-between gap-2 relative z-10">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ 
                          background: ev.channel.includes("Meet") ? "#ea4335" : 
                                      ev.channel.includes("Teams") ? "#0078d4" : 
                                      eventColors[ev.type] 
                        }}
                      />
                      <span className="text-xs font-bold truncate text-foreground">{ev.title}</span>
                    </div>
                    {ev.aiBooked && <Sparkles className="w-3 h-3 text-accent shrink-0" />}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-[9px] text-muted-foreground relative z-10 font-mono">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-primary" />{ev.time} ({ev.duration})</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                      ev.channel.includes("Meet") ? "bg-[#ea4335]/10 text-[#ea4335] border border-[#ea4335]/25" :
                      ev.channel.includes("Teams") ? "bg-[#0078d4]/10 text-[#0078d4] border border-[#0078d4]/25" :
                      "bg-muted text-muted-foreground border border-border"
                    }`}>
                      {ev.channel}
                    </span>
                  </div>

                  <p className="text-[10px] text-muted-foreground relative z-10">
                    Lead: <span className="font-bold text-foreground">{ev.leadName}</span> — <span className="italic">{ev.company}</span>
                  </p>

                  {/* Synced external Meet join links */}
                  {ev.meetingUrl && (
                    <div className="pt-2 border-t border-border mt-2 relative z-10 flex justify-between items-center">
                      <a
                        href={ev.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[9px] font-bold text-primary flex items-center gap-1 hover:underline"
                      >
                        <Globe className="w-3 h-3" /> Sync Link: Join Meet <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Simulated OAuth Integrations Connection Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card max-w-sm w-full p-6 space-y-4 animate-scale-in text-center">
            <div className="flex justify-end">
              <button onClick={() => setShowAuthModal(null)} className="p-1 hover:bg-surface-hover rounded-lg cursor-pointer"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            
            <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center text-white ${showAuthModal === "google" ? "bg-[#ea4335]" : "bg-[#0078d4]"}`}>
              {showAuthModal === "google" ? <Video className="w-7 h-7" /> : <Users className="w-7 h-7" />}
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-sm text-foreground">
                Authorize OperAIly Sync API
              </h3>
              <p className="text-xs text-muted-foreground leading-normal">
                {showAuthModal === "google" 
                  ? "Allow OperAIly CRM to create Google Meet links, retrieve calendar availability state, and sync events." 
                  : "Allow OperAIly CRM to create Microsoft Teams sessions and update your Office 365 Outlook schedule."}
              </p>
            </div>

            <div className="p-3 bg-surface/50 border border-border rounded-xl text-left space-y-2 text-[10px] text-muted-foreground">
              <p className="font-bold text-foreground">Requested OAuth Scopes:</p>
              <div className="space-y-1 pl-1">
                <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success shrink-0" /> read/write calendar metrics</div>
                <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success shrink-0" /> organize meet video assets</div>
                <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-success shrink-0" /> webhook subscription sync</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAuthModal(null)}
                className="flex-1 py-2 rounded-xl bg-surface border border-border text-xs font-bold hover:bg-surface-hover cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConnectProvider(showAuthModal)}
                className={`flex-1 py-2 rounded-xl text-white font-bold text-xs cursor-pointer ${showAuthModal === "google" ? "bg-[#ea4335] hover:opacity-90" : "bg-[#0078d4] hover:opacity-90"}`}
              >
                Agree & Sync
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Public Appointment Booking Drawer */}
      {showBookingDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[440px] bg-background border-l border-border shadow-2xl p-6 flex flex-col justify-between animate-slide-in">
          
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-primary" /> Live Scheduler Sync Drawer
              </h3>
              <button onClick={() => setShowBookingDrawer(false)} className="p-1.5 hover:bg-surface-hover rounded-lg cursor-pointer"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>

            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl flex gap-2">
              <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <div className="text-[10px] text-muted-foreground leading-normal">
                Select a slot on the board day **{selectedDay ? `${monthName} ${selectedDay}` : "Today"}** and confirm to synchronize appointment events with external accounts!
              </div>
            </div>

            {bookingSuccessAlert ? (
              <div className="p-4 bg-success/15 border border-success/30 text-success rounded-xl text-center space-y-2 animate-scale-in">
                <CheckCircle2 className="w-8 h-8 mx-auto" />
                <p className="text-xs font-bold">Appointment Synced Successfully!</p>
                <p className="text-[9px] text-muted-foreground font-mono truncate">{bookingSuccessAlert}</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-3.5 text-xs text-left">
                
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Select Connected Synced Provider</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      type="button"
                      disabled={!googleConnected}
                      onClick={() => setBookingProvider("google")}
                      className={`py-2 px-3 border rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        !googleConnected ? "opacity-30 border-dashed border-border pointer-events-none" :
                        bookingProvider === "google" ? "bg-[#ea4335]/15 border-[#ea4335] text-foreground" : "bg-surface border-border text-muted-foreground hover:bg-surface-hover"
                      }`}
                    >
                      <Video className="w-3.5 h-3.5 text-[#ea4335]" /> Google Meet
                    </button>
                    <button
                      type="button"
                      disabled={!microsoftConnected}
                      onClick={() => setBookingProvider("microsoft")}
                      className={`py-2 px-3 border rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                        !microsoftConnected ? "opacity-30 border-dashed border-border pointer-events-none" :
                        bookingProvider === "microsoft" ? "bg-[#0078d4]/15 border-[#0078d4] text-foreground" : "bg-surface border-border text-muted-foreground hover:bg-surface-hover"
                      }`}
                    >
                      <Users className="w-3.5 h-3.5 text-[#0078d4]" /> Teams Meet
                    </button>
                  </div>
                  {!googleConnected && !microsoftConnected && (
                    <p className="text-[9px] text-danger font-medium mt-1">
                      ⚠️ Please connect at least one calendar integration from the header panel first!
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Prospect Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Klaus Schmidt"
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground input-focus"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Prospect Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. klaus@schmidt-pharma.de"
                    value={bookingEmail}
                    onChange={(e) => setBookingEmail(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground input-focus"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Prospect Company</label>
                  <input
                    type="text"
                    placeholder="e.g. Schmidt Pharma"
                    value={bookingCompany}
                    onChange={(e) => setBookingCompany(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground input-focus"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Booking Target Time Slot</label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="w-full mt-1 px-2.5 py-2 bg-input border border-input-border rounded-xl text-xs text-foreground input-focus cursor-pointer"
                    >
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:30">11:30 AM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:30">03:30 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Appt Duration</label>
                    <input
                      type="text"
                      disabled
                      value="30 minutes"
                      className="w-full mt-1 px-3 py-2 bg-input/50 border border-input-border rounded-xl text-xs text-muted-foreground font-semibold"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isConfirmingBooking || (!googleConnected && !microsoftConnected)}
                  className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-xs hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isConfirmingBooking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Provisioning synced meeting links...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Confirm & Sync Live Appointment
                    </>
                  )}
                </button>

              </form>
            )}

          </div>

          <div className="text-[9px] text-muted-foreground leading-normal border-t border-border pt-4 text-center">
            OperAIly real-time appointment booking integrations are SSL encrypted. Scans external busy blocks live.
          </div>

        </div>
      )}

    </div>
  );
}
