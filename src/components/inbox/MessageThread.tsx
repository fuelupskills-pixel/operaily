"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Image as ImageIcon, Paperclip, PhoneCall } from "lucide-react";

export interface ThreadMessage {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  timestamp: string;
  channel: string;
}

interface MessageThreadProps {
  contactId: string;
  messages: ThreadMessage[];
  onSendMessage: (content: string, channel: string) => Promise<void>;
  onInitiateCall: () => void;
}

export function MessageThread({ contactId, messages, onSendMessage, onInitiateCall }: MessageThreadProps) {
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    setSending(true);
    try {
      // Defaulting to SMS for now in the UI if no channel picker is built yet
      await onSendMessage(inputText.trim(), "sms");
      setInputText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0A0A0B] relative overflow-hidden">
      {/* Premium Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 bg-black/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <span className="text-white font-semibold">{contactId.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h3 className="text-white font-medium">{contactId}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-gray-400">Online</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onInitiateCall}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 transition-all border border-white/5 hover:border-white/20 group"
          >
            <PhoneCall className="w-5 h-5 group-hover:text-rose-400 transition-colors" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0A0A0B] to-[#0A0A0B]"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2 border border-white/10">
              <Send className="w-6 h-6 text-gray-600" />
            </div>
            <p>No messages yet. Send one to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex flex-col ${msg.direction === 'outbound' ? 'items-end' : 'items-start'}`}
            >
              <div 
                className={`max-w-[70%] rounded-2xl px-5 py-3 shadow-sm ${
                  msg.direction === 'outbound' 
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-br-none border border-blue-500/50 shadow-[0_4px_15px_rgba(37,99,235,0.2)]' 
                    : 'bg-white/10 text-gray-100 rounded-bl-none border border-white/5 backdrop-blur-sm'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
              </div>
              <span className="text-[11px] text-gray-500 mt-1.5 px-1 uppercase tracking-wider font-medium flex items-center gap-1.5">
                {msg.channel} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/60 backdrop-blur-xl border-t border-white/10 z-10">
        <div className="flex items-end gap-3 bg-white/5 border border-white/10 p-2 rounded-2xl shadow-inner focus-within:border-blue-500/50 focus-within:bg-white/10 transition-all">
          <div className="flex gap-1 pb-1">
            <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/10">
              <Paperclip className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-xl hover:bg-white/10">
              <ImageIcon className="w-5 h-5" />
            </button>
          </div>
          
          <textarea 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-1 max-h-32 min-h-[44px] bg-transparent text-white placeholder-gray-500 resize-none outline-none py-3 px-2"
            rows={1}
          />
          
          <button 
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            className={`p-3 rounded-xl flex items-center justify-center transition-all ${
              inputText.trim() && !sending
                ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]' 
                : 'bg-white/5 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center mt-2">
          <span className="text-[10px] text-gray-600 font-medium tracking-wide">PRESS ENTER TO SEND</span>
        </div>
      </div>
    </div>
  );
}
