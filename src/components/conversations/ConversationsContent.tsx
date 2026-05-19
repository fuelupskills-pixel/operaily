"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { MessageSquare, Phone, Mail, Video, Search, Sparkles, Send, Check } from "lucide-react";

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

interface Message {
  id: string;
  sender: "user" | "lead";
  text: string;
  time: string;
  isAi?: boolean;
}

const channelIcons = { whatsapp: MessageSquare, email: Mail, sms: Phone, voice: Video };
const channelColors = { whatsapp: "text-success", email: "text-info", sms: "text-accent", voice: "text-warning" };

const initialConversations: Conversation[] = [
  { id: "1", name: "Hans Mueller", company: "BioPharm Import GmbH", channel: "whatsapp", lastMessage: "Yes, I would be interested in a meeting. What times work for you?", time: "2m", unread: 2, avatar: "HM", status: "online" },
  { id: "2", name: "Dr. Anna Weber", company: "MedImport AG", channel: "email", lastMessage: "Thank you for the video. Could you send me more details about pricing?", time: "1h", unread: 1, avatar: "AW", status: "online" },
  { id: "3", name: "Klaus Schmidt", company: "Schmidt Pharma GmbH", channel: "voice", lastMessage: "AI Voice Call completed — Meeting booked for May 15", time: "3h", unread: 0, avatar: "KS", status: "offline" },
  { id: "4", name: "Sarah Johnson", company: "TechCorp Inc.", channel: "whatsapp", lastMessage: "Let me check with my team and get back to you.", time: "1d", unread: 0, avatar: "SJ", status: "offline" },
  { id: "5", name: "Maria Fischer", company: "EuroPharma Distribution", channel: "email", lastMessage: "We are currently evaluating several vendors for Q3.", time: "2d", unread: 0, avatar: "MF", status: "offline" },
];

const initialHistories: Record<string, Message[]> = {
  "1": [
    { id: "1", sender: "lead", text: "Hello! I saw your automated outreach campaign.", time: "10:25 AM" },
    { id: "2", sender: "user", text: "Hi Hans! Yes, we build customized AI workflows that enrich leads automatically.", time: "10:28 AM", isAi: true },
    { id: "3", sender: "lead", text: "Yes, I would be interested in a meeting. What times work for you?", time: "10:30 AM" }
  ],
  "2": [
    { id: "1", sender: "lead", text: "Hello, we need custom scrapers for European directories.", time: "9:15 AM" },
    { id: "2", sender: "user", text: "We can configure our Lead Hunter agents to parse localized databases for you.", time: "9:20 AM" },
    { id: "3", sender: "lead", text: "Thank you for the video. Could you send me more details about pricing?", time: "9:45 AM" }
  ],
  "3": [
    { id: "1", sender: "lead", text: "Hello Klaus Schmidt here. Interested in automated voice agent outreach.", time: "Yesterday" },
    { id: "2", sender: "user", text: "Hi Klaus! Our AI voice agent can call leads and book meetings directly into your calendar.", time: "Yesterday" },
    { id: "3", sender: "lead", text: "AI Voice Call completed — Meeting booked for May 15", time: "Yesterday" }
  ],
  "4": [
    { id: "1", sender: "lead", text: "Does your software integrate with HubSpot?", time: "2 days ago" },
    { id: "2", sender: "user", text: "Yes, we support native sync with Salesforce, HubSpot, and Pipedrive.", time: "2 days ago" },
    { id: "3", sender: "lead", text: "Let me check with my team and get back to you.", time: "1 day ago" }
  ],
  "5": [
    { id: "1", sender: "lead", text: "We are looking for automated ad campaign optimization for European countries.", time: "3 days ago" },
    { id: "2", sender: "user", text: "Our Ad Suite automates creative asset generation and ROAS optimization.", time: "3 days ago" },
    { id: "3", sender: "lead", text: "We are currently evaluating several vendors for Q3.", time: "2 days ago" }
  ]
};

const aiSuggestedReplies: Record<string, string> = {
  "1": "Hi Hans! Great. Here is my booking link: calendly.com/operaily. Looking forward to discussing BioPharm Import's growth!",
  "2": "Hello Dr. Anna! I've attached our pricing sheet. Packages start at $499/month for full omnichannel automation. Does next Tuesday work to discuss?",
  "3": "Hi Klaus, glad to hear the call was successful! I've sent the meeting brief to your email. Talk on May 15.",
  "4": "Thanks Sarah! I'll send over our CRM Integration Sheet so your team can review it. Let me know if you need anything else.",
  "5": "Hi Maria! Totally understand. I've sent over our case studies showing +40% higher ROAS for similar firms. Hope to stay in touch!"
};

export default function ConversationsContent() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState("1");
  const [histories, setHistories] = useState<Record<string, Message[]>>(initialHistories);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo(() => {
    return conversations.find((c) => c.id === selectedId) || conversations[0];
  }, [conversations, selectedId]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.company.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  // Scroll to bottom on message updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [histories, selectedId]);

  // Clear unread badge on click
  useEffect(() => {
    setConversations(prev => 
      prev.map(c => c.id === selectedId ? { ...c, unread: 0 } : c)
    );
  }, [selectedId]);

  const handleSend = (textToSend?: string) => {
    const messageText = textToSend || inputText;
    if (!messageText.trim()) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: messageText,
      time: timestamp
    };

    // Update history
    setHistories(prev => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), newMsg]
    }));

    // Update conversation last message
    setConversations(prev =>
      prev.map(c => c.id === selectedId ? { ...c, lastMessage: messageText, time: "Just now" } : c)
    );

    if (!textToSend) {
      setInputText("");
    }

    // Simulate lead reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const leadReply: Message = {
        id: Math.random().toString(),
        sender: "lead",
        text: `Thanks for the response! That sounds very promising. What are the next steps?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setHistories(prev => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] || []), leadReply]
      }));

      setConversations(prev =>
        prev.map(c => c.id === selectedId ? { ...c, lastMessage: leadReply.text, time: "1m" } : c)
      );
    }, 1500);
  };

  const handleAiSuggest = () => {
    const suggestion = aiSuggestedReplies[selectedId] || "Hi! Thanks for reaching out. Let me check and get back to you shortly.";
    setInputText(suggestion);
  };

  const activeMessages = histories[selectedId] || [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Conversations</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Omni-channel inbox — WhatsApp, Email, SMS, Voice</p>
      </div>

      <div className="flex gap-4 h-[calc(100vh-200px)]">
        {/* Conversation list */}
        <div className="w-80 shrink-0 glass-card overflow-hidden flex flex-col border border-border/50">
          <div className="p-3 border-b border-border/40">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search inbox..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all" 
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-border/20">
            {filteredConversations.length === 0 ? (
              <p className="p-4 text-center text-xs text-muted-foreground">No conversations found</p>
            ) : (
              filteredConversations.map((conv) => {
                const Icon = channelIcons[conv.channel];
                const isSelected = selectedId === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`w-full text-left p-3.5 hover:bg-surface-hover transition-all flex gap-3 relative ${
                      isSelected ? "bg-primary/5 border-l-2 border-l-primary" : ""
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {conv.avatar}
                      </div>
                      {conv.status === "online" && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-success rounded-full border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate text-foreground">{conv.name}</span>
                        <span className="text-[10px] text-muted-foreground">{conv.time}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate font-medium">{conv.company}</p>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-muted-foreground/80">
                        <Icon className={`w-3 h-3 ${channelColors[conv.channel]}`} />
                        <span className="truncate">{conv.lastMessage}</span>
                      </div>
                    </div>
                    {conv.unread > 0 && (
                      <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-1">
                        {conv.unread}
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 glass-card overflow-hidden flex flex-col border border-border/50">
          {/* Chat header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/40">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                {selected.avatar}
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{selected.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {selected.company} • <span className="capitalize">{selected.channel} Channel</span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-muted-foreground transition-all cursor-pointer">
                <Phone className="w-3.5 h-3.5" />
              </button>
              <button className="p-2 rounded-xl bg-surface border border-border hover:bg-surface-hover text-muted-foreground transition-all cursor-pointer">
                <Video className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 space-y-4 overflow-y-auto">
            {activeMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl p-3.5 ${
                  msg.sender === "user" 
                    ? "bg-primary/15 text-foreground rounded-tr-sm" 
                    : "bg-surface rounded-tl-sm border border-border/40 text-foreground"
                }`}>
                  <p className="text-xs leading-relaxed">{msg.text}</p>
                  <p className="text-[9px] text-muted-foreground mt-1 text-right">
                    {msg.isAi ? "Sent by AI • " : ""}{msg.time}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-surface rounded-2xl rounded-tl-sm p-3 border border-border/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border/40 bg-surface/30">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2.5"
            >
              <input 
                type="text" 
                placeholder="Type a message or trigger AI draft..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 bg-input border border-input-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all" 
              />
              <button 
                type="button"
                onClick={handleAiSuggest}
                className="px-3.5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all cursor-pointer flex items-center gap-1 shrink-0"
                title="Draft response with AI Agent"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Reply</span>
              </button>
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-white text-xs font-bold hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer disabled:opacity-50 shrink-0 flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
