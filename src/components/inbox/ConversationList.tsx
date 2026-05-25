"use client";

import { MessageSquare, PhoneCall, Mail, User } from "lucide-react";

export interface Conversation {
  id: string;
  contactId: string;
  lastMessage: string;
  channel: 'whatsapp' | 'sms' | 'email' | 'voice';
  timestamp: string;
  unread: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedContactId: string | null;
  onSelect: (contactId: string) => void;
}

export function ConversationList({ conversations, selectedContactId, onSelect }: ConversationListProps) {
  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'sms':
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case 'email':
        return <Mail className="w-4 h-4 text-purple-400" />;
      case 'voice':
        return <PhoneCall className="w-4 h-4 text-rose-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-80 h-full flex flex-col border-r border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xl font-semibold text-white tracking-tight">Inbox</h2>
        <p className="text-sm text-gray-400 mt-1">Unified Communications</p>
      </div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1 p-2">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">No recent conversations</div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.contactId)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 group
                ${selectedContactId === conv.contactId 
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
                  : 'hover:bg-white/5 border border-transparent'}
              `}
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center border border-white/10 shadow-inner">
                  <User className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-gray-900 p-1 rounded-full border border-gray-800">
                  {getChannelIcon(conv.channel)}
                </div>
              </div>

              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-medium truncate ${conv.unread ? 'text-white' : 'text-gray-300'}`}>
                    {conv.contactId}
                  </span>
                  <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                    {formatTime(conv.timestamp)}
                  </span>
                </div>
                <p className={`text-sm truncate ${conv.unread ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>
                  {conv.lastMessage}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
