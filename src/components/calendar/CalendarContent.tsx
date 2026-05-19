"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Video, Users, Sparkles } from "lucide-react";

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
    const numEvents = Math.floor(Math.random() * 3) + (d % 3 === 0 ? 1 : 0);
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

  const [events] = useState(() => generateEvents(year, month));
  const selectedEvents = selectedDay ? events[selectedDay] || [] : [];

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const totalMeetings = Object.values(events).flat().length;
  const aiBooked = Object.values(events).flat().filter((e) => e.aiBooked).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight"><span className="gradient-text">Calendar</span> 📅</h1>
          <p className="text-sm text-muted-foreground mt-1">{totalMeetings} meetings this month • {aiBooked} AI-booked</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm hover:opacity-90">
          <Plus className="w-4 h-4" /> New Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar Grid */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-surface-hover"><ChevronLeft className="w-4 h-4" /></button>
            <h3 className="text-sm font-semibold">{monthName} {year}</h3>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-surface-hover"><ChevronRight className="w-4 h-4" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
              <div key={d} className="text-center text-[10px] text-muted-foreground font-medium py-1">{d}</div>
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
                  className={`relative p-1.5 rounded-xl text-xs transition-all min-h-[52px] flex flex-col items-center ${
                    isSelected ? "bg-primary/10 border border-primary/30" : isToday ? "bg-accent/10 border border-accent/30" : "hover:bg-surface-hover border border-transparent"
                  }`}>
                  <span className={`font-medium ${isToday ? "text-accent" : isSelected ? "text-primary" : ""}`}>{day}</span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
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
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold mb-4">
            {selectedDay ? `${monthName} ${selectedDay}` : "Select a day"}
          </h3>
          {selectedEvents.length === 0 && (
            <div className="text-center py-8">
              <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-30" />
              <p className="text-xs text-muted-foreground">No meetings scheduled</p>
            </div>
          )}
          <div className="space-y-3">
            {selectedEvents.map((ev) => (
              <div key={ev.id} className="p-3 rounded-xl bg-surface border border-border-subtle hover:border-border transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ background: eventColors[ev.type] }} />
                  <span className="text-xs font-semibold">{ev.title}</span>
                  {ev.aiBooked && <Sparkles className="w-3 h-3 text-accent" />}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{ev.time} • {ev.duration}</span>
                  <span>{ev.channel}</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">{ev.leadName} — {ev.company}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
