"use client";

import { useEffect, useState } from "react";
import { ConversationList, Conversation } from "@/components/inbox/ConversationList";
import { MessageThread, ThreadMessage } from "@/components/inbox/MessageThread";
import { DialerPanel } from "@/components/inbox/DialerPanel";
import { Grid } from "lucide-react";

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [showDialer, setShowDialer] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch conversations list on load
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch thread messages when a contact is selected
  useEffect(() => {
    if (selectedContactId) {
      fetchMessages(selectedContactId);
    }
  }, [selectedContactId]);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/inbox");
      const json = await res.json();
      if (json.data) {
        const mapped: Conversation[] = json.data.map((msg: any) => ({
          id: msg.id,
          contactId: msg.direction === 'inbound' ? msg.sender : msg.receiver,
          lastMessage: msg.content,
          channel: msg.channel,
          timestamp: msg.created_at || new Date().toISOString(),
          unread: false // Determine unread logic later
        }));
        setConversations(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch conversations", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (contactId: string) => {
    try {
      const res = await fetch(`/api/inbox?phone=${encodeURIComponent(contactId)}`);
      const json = await res.json();
      if (json.data) {
        // Reverse because they come order by created_at descending (newest first), we want newest at bottom
        const mapped: ThreadMessage[] = json.data.reverse().map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          direction: msg.direction,
          timestamp: msg.created_at || new Date().toISOString(),
          channel: msg.channel,
        }));
        setMessages(mapped);
      }
    } catch (e) {
      console.error("Failed to fetch messages", e);
    }
  };

  const handleSendMessage = async (content: string, channel: string) => {
    if (!selectedContactId) return;

    try {
      const res = await fetch("/api/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedContactId,
          content,
          channel
        })
      });
      
      if (res.ok) {
        // Refresh the thread to show the new message
        fetchMessages(selectedContactId);
        fetchConversations(); // Update last message in the list
      } else {
        const error = await res.json();
        alert(`Failed to send message: ${error.error}`);
      }
    } catch (e) {
      console.error("Send error", e);
    }
  };

  const handleInitiateCall = async (phoneNumber: string) => {
    try {
      const res = await fetch("/api/telephony/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: phoneNumber })
      });
      if (res.ok) {
        alert("Call initiated successfully!");
        if (selectedContactId === phoneNumber) fetchMessages(phoneNumber);
      } else {
        const error = await res.json();
        alert(`Failed to initiate call: ${error.error}`);
      }
    } catch (e) {
      console.error("Call error", e);
    }
  };

  return (
    <div className="flex h-screen bg-black text-gray-200 overflow-hidden font-sans">
      
      {/* Sidebar Nav Stub (Optional) */}
      <div className="w-16 border-r border-white/10 flex flex-col items-center py-6 bg-black/80 z-20">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-8 cursor-pointer hover:scale-105 transition-transform">
          <Grid className="w-5 h-5 text-white" />
        </div>
        {/* Nav Icons could go here */}
      </div>

      {/* Main Inbox Interface */}
      <div className="flex-1 flex overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Conversation List Column */}
            <ConversationList 
              conversations={conversations} 
              selectedContactId={selectedContactId}
              onSelect={setSelectedContactId}
            />

            {/* Message Thread Column */}
            {selectedContactId ? (
              <MessageThread 
                contactId={selectedContactId}
                messages={messages}
                onSendMessage={handleSendMessage}
                onInitiateCall={() => setShowDialer(true)}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black">
                <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-tr from-gray-800 to-gray-900 border border-white/5 shadow-2xl flex items-center justify-center">
                  <Grid className="w-10 h-10 text-gray-600" />
                </div>
                <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">Unified Workspace</h2>
                <p className="text-gray-500 max-w-sm text-center">Select a conversation from the sidebar to start messaging or make a call.</p>
                <button 
                  onClick={() => setShowDialer(true)}
                  className="mt-8 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-sm font-medium"
                >
                  Open Dialer
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Dialer Modal Overlay */}
      {showDialer && (
        <DialerPanel 
          onClose={() => setShowDialer(false)} 
          onCall={handleInitiateCall} 
          initialNumber={selectedContactId || ""}
        />
      )}

    </div>
  );
}
