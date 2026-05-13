"use client";

import React from "react";
import { MessageSquare, Phone, Mail, Video, Search, Filter, Plus } from "lucide-react";

interface Conversation {
  id: string;
  name: string;
  company: string;
  channel: "whatsapp" | "email" | "sms" | "voice";
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  status: "online" | "offline";
}

const channelIcons = { whatsapp: MessageSquare, email: Mail, sms: Phone, voice: Video };
const channelColors = { whatsapp: "text-success", email: "text-info", sms: "text-accent", voice: "text-warning" };

const conversations: Conversation[] = [
  { id: "1", name: "Hans Mueller", company: "BioPharm Import GmbH", channel: "whatsapp", lastMessage: "Yes, I would be interested in a meeting. What times work for you?", time: "2m", unread: 2, avatar: "HM", status: "online" },
  { id: "2", name: "Dr. Anna Weber", company: "MedImport AG", channel: "email", lastMessage: "Thank you for the video. Could you send me more details about pricing?", time: "1h", unread: 1, avatar: "AW", status: "online" },
  { id: "3", name: "Klaus Schmidt", company: "Schmidt Pharma GmbH", channel: "voice", lastMessage: "AI Voice Call completed — Meeting booked for May 15", time: "3h", unread: 0, avatar: "KS", status: "offline" },
  { id: "4", name: "Sarah Johnson", company: "TechCorp Inc.", channel: "whatsapp", lastMessage: "Let me check with my team and get back to you.", time: "1d", unread: 0, avatar: "SJ", status: "offline" },
  { id: "5", name: "Maria Fischer", company: "EuroPharma Distribution", channel: "email", lastMessage: "We are currently evaluating several vendors for Q3.", time: "2d", unread: 0, avatar: "MF", status: "offline" },
];

export default function ConversationsContent() {
  const [selected, setSelected] = React.useState(conversations[0]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Conversations</h1>
        <p className="text-sm text-muted-foreground mt-1">Omni-channel inbox — WhatsApp, Email, SMS, Voice</p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-220px)]">
        {/* Conversation list */}
        <div className="w-96 shrink-0 glass-card overflow-hidden flex flex-col">
          <div className="p-3 border-b border-border-subtle">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search conversations..." className="w-full pl-10 pr-4 py-2 bg-input border border-input-border rounded-xl text-sm input-focus" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border-subtle">
            {conversations.map((conv) => {
              const Icon = channelIcons[conv.channel];
              const isSelected = selected.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv)}
                  className={`w-full text-left p-4 hover:bg-surface-hover transition-colors ${isSelected ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                >
                  <div className="flex gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{conv.avatar}</div>
                      {conv.status === "online" && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-background" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{conv.name}</span>
                        <span className="text-[10px] text-muted-foreground">{conv.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Icon className={`w-3 h-3 ${channelColors[conv.channel]}`} />
                        <span className="text-xs text-muted-foreground truncate">{conv.lastMessage}</span>
                      </div>
                    </div>
                    {conv.unread > 0 && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-1">{conv.unread}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 glass-card overflow-hidden flex flex-col">
          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{selected.avatar}</div>
              <div>
                <p className="text-sm font-semibold">{selected.name}</p>
                <p className="text-xs text-muted-foreground">{selected.company} · {selected.channel}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button className="p-2 rounded-xl hover:bg-surface-hover text-muted-foreground transition-colors"><Phone className="w-4 h-4" /></button>
              <button className="p-2 rounded-xl hover:bg-surface-hover text-muted-foreground transition-colors"><Video className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 space-y-4 overflow-y-auto">
            <div className="flex justify-end">
              <div className="max-w-[70%] bg-primary/10 rounded-2xl rounded-tr-sm px-4 py-3">
                <p className="text-sm">Hi {selected.name.split(" ")[0]}, I noticed {selected.company} has been expanding. I created a short video showing how we can help accelerate your growth. Would love to connect!</p>
                <p className="text-[10px] text-muted-foreground mt-1 text-right">Sent by AI · 10:30 AM</p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[70%] bg-surface rounded-2xl rounded-tl-sm px-4 py-3 border border-border-subtle">
                <p className="text-sm">{selected.lastMessage}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{selected.time} ago</p>
              </div>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-3">
              <input type="text" placeholder="Type a message or let AI respond..." className="flex-1 px-4 py-2.5 bg-input border border-input-border rounded-xl text-sm input-focus" />
              <button className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors">Send</button>
              <button className="px-4 py-2.5 rounded-xl bg-accent/10 text-accent text-sm font-medium hover:bg-accent/20 transition-colors">AI Reply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
