"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Video, Users, Sparkles, X, Check, CalendarDays, Mail } from "lucide-react";

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
    { title: "Team Standup", time: "09:30", duration: "15m", type: "internal", leadName: "Team", company: "OMNI-SIGMA", aiBooked: false, channel: "Internal" },
    { title: "Proposal Review", time: "15:00", duration: "30m", type: "meeting", leadName: "Thomas Braun", company: "HealthBridge", aiBooked: false, channel: "Zoom" },
    { title: "Discovery Call", time: "13:00", duration: "30m", type: "call", leadName: "Eva Schneider", company: "PharmaDist", aiBooked: true, channel: "Voice" },
    { title: "Contract Discussion", time: "16:00", duration: "45m", type: "meeting", leadName: "Stefan Richter", company: "Global Health", aiBooked: false, channel: "Zoom" },
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

  const [events, setEvents] = useState<Record<number, CalEvent[]>>(() => generateEvents(year, month));
  const [isCalendarConnected, setIsCalendarConnected] = useState(false);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState<"meeting" | "call" | "demo" | "internal">("call");
  const [modalLead, setModalLead] = useState("");
  const [modalCompany, setModalCompany] = useState("");
  const [modalTime, setModalTime] = useState("10:00");
  const [modalDuration, setModalDuration] = useState("30m");
  const [modalChannel, setModalChannel] = useState("Zoom");

  const selectedEvents = selectedDay ? events[selectedDay] || [] : [];

  const prevMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
    setEvents(generateEvents(newDate.getFullYear(), newDate.getMonth()));
  };
  
  const nextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    setCurrentDate(newDate);
    setEvents(generateEvents(newDate.getFullYear(), newDate.getMonth()));
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay || !modalTitle.trim()) return;

    const newEvent: CalEvent = {
      id: Math.random().toString(),
      title: modalTitle,
      type: modalType,
      time: modalTime,
      duration: modalDuration,
      leadName: modalLead || "Self",
      company: modalCompany || "OperAIly",
      aiBooked: false,
      channel: modalChannel
    };

    setEvents(prev => {
      const dayEvents = prev[selectedDay] || [];
      return {
        ...prev,
        [selectedDay]: [...dayEvents, newEvent].sort((a, b) => a.time.localeCompare(b.time))
      };
    });

    // Reset modal
    setShowModal(false);
    setModalTitle("");
    setModalLead("");
    setModalCompany("");
  };

  const totalMeetings = Object.values(events).flat().length;
  const aiBookedCount = Object.values(events).flat().filter((e) => e.aiBooked).length;

  return (
    <div className="space-y-6 relative animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-primary" />
            Calendar
          </h1>
          <p className="text-muted-foreground mt-1">{totalMeetings} meetings this month - {aiBookedCount} AI-booked</p>
        </div>
        <div className="flex items-center gap-3">
          {isCalendarConnected && (
            <button 
              onClick={() => setIsCalendarConnected(false)}
              className="px-4 py-2.5 rounded-xl border border-danger/20 text-danger hover:bg-danger/10 transition-colors text-sm font-semibold"
            >
              Disconnect
            </button>
          )}
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-semibold text-sm cursor-pointer shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> 
            <span>New Meeting</span>
          </button>
        </div>
      </div>

      {!isCalendarConnected && (
        <div className="p-8 rounded-2xl bg-card border border-border flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
            <CalendarDays className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Connect Your Calendar</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Sync your existing events, automate scheduling with AI, and manage your meetings directly from the CRM.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
            <a 
              href="/api/auth/google"
              className="flex items-center gap-3 px-6 py-3 rounded-xl bg-[#EA4335] text-white hover:opacity-90 transition-opacity font-semibold w-full sm:w-auto justify-center"
            >
              <Mail className="w-5 h-5" />
              Sign in with Google
            </a>
            <a 
              href="/api/auth/outlook"
              className="flex items-center gap-3 px-6 py-3 rounded-xl bg-[#0078D4] text-white hover:opacity-90 transition-opacity font-semibold w-full sm:w-auto justify-center"
            >
              <Mail className="w-5 h-5" />
              Sign in with Outlook
            </a>
            <button 
              onClick={() => setIsCalendarConnected(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface border border-border text-foreground hover:bg-sidebar-hover transition-colors font-semibold w-full sm:w-auto justify-center"
            >
              Use Demo Data
            </button>
          </div>
        </div>
      )}

      {isCalendarConnected && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Calendar Grid */}
          <div className="glass-card p-5 lg:col-span-2 border border-border/50">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-surface-hover text-muted-foreground hover:text-foreground transition-all cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{monthName} {year}</h3>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-surface-hover text-muted-foreground hover:text-foreground transition-all cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
              <div key={d} className="text-center text-[10px] text-muted-foreground font-bold py-1 uppercase">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDow }, (_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayEvents = events[day] || [];
              const isToday = isCurrentMonth && day === today.getDate();
              const isSelected = day === selectedDay;
              return (
                <button key={day} onClick={() => setSelectedDay(day)}
                  className={`relative p-1.5 rounded-xl text-[11px] transition-all min-h-[52px] flex flex-col items-center justify-between border cursor-pointer ${
                    isSelected 
                      ? "bg-primary/15 border-primary text-primary font-bold shadow-md shadow-primary/5" 
                      : isToday 
                      ? "bg-accent/15 border-accent text-accent font-bold" 
                      : "bg-surface/50 border-border/30 hover:border-primary/20 text-muted-foreground hover:text-foreground"
                  }`}>
                  <span>{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1 shrink-0 pb-1">
                      {dayEvents.slice(0, 3).map((ev, j) => (
                        <span key={j} className="w-1.5 h-1.5 rounded-full" style={{ background: eventColors[ev.type] }} />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Day Detail */}
        <div className="glass-card p-5 border border-border/50 flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 border-b border-border/40 pb-2 flex items-center justify-between">
              <span>Schedule: {selectedDay ? `${monthName} ${selectedDay}` : "Select a day"}</span>
              {selectedEvents.length > 0 && (
                <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{selectedEvents.length} events</span>
              )}
            </h3>
            {selectedEvents.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-35" />
                <p className="text-xs text-muted-foreground font-semibold">No meetings scheduled</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">Select &ldquo;New Meeting&rdquo; to reserve a time slot.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {selectedEvents.map((ev) => (
                  <div key={ev.id} className="p-3.5 rounded-xl bg-surface border border-border/40 hover:border-primary/20 transition-all flex gap-3 items-start">
                    <div className="w-1.5 h-full rounded-full self-stretch shrink-0" style={{ background: eventColors[ev.type] }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-foreground">{ev.title}</span>
                        {ev.aiBooked && (
                          <div title="Booked by AI Agent">
                            <Sparkles className="w-3 h-3 text-accent fill-accent animate-pulse" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-1">
                        <span className="flex items-center gap-0.5"><Clock className="w-3 h-3 text-primary" />{ev.time} ({ev.duration})</span>
                        <span>•</span>
                        <span className="capitalize">{ev.channel}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground/90 font-medium mt-1">
                        {ev.leadName} • <span className="italic">{ev.company}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      )}

      {/* New Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md glass-card p-6 border border-primary/20 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-b border-border/40 pb-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Schedule New Event</span>
              </h3>
              <p className="text-[10px] text-muted-foreground">Add to date: {monthName} {selectedDay}, {year}</p>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Event Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Discovery Call / Technical Q&A"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Event Type</label>
                  <select
                    value={modalType}
                    onChange={(e) => setModalType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-input border border-input-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/50 transition-all"
                  >
                    <option value="call">📞 Call</option>
                    <option value="demo">💻 Demo</option>
                    <option value="meeting">🤝 Meeting</option>
                    <option value="internal">⚙️ Internal</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Channel</label>
                  <input
                    type="text"
                    placeholder="e.g. Zoom, Voice, Google Meet"
                    value={modalChannel}
                    onChange={(e) => setModalChannel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-input border border-input-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Lead Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={modalLead}
                    onChange={(e) => setModalLead(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-input border border-input-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Company</label>
                  <input
                    type="text"
                    placeholder="e.g. BioSupply GmbH"
                    value={modalCompany}
                    onChange={(e) => setModalCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-input border border-input-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Time</label>
                  <input
                    type="time"
                    value={modalTime}
                    onChange={(e) => setModalTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-input border border-input-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 30m, 45m, 1h"
                    value={modalDuration}
                    onChange={(e) => setModalDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-input border border-input-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary/50 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-surface hover:bg-surface-hover border border-border rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Confirm Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
