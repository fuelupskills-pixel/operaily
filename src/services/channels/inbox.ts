import { createServerClient } from '@/lib/supabase/server';

export interface InboxMessage {
  id?: string;
  channel: 'whatsapp' | 'sms' | 'email' | 'voice';
  sender: string;
  receiver: string;
  content: string;
  direction: 'inbound' | 'outbound';
  timestamp?: string;
  created_at?: string;
  team_id?: string;
  user_id?: string;
}

export class InboxService {
  /**
   * Save an incoming message to the Supabase database.
   */
  async processIncomingMessage(msg: Omit<InboxMessage, 'id' | 'timestamp' | 'created_at' | 'direction'>): Promise<InboxMessage> {
    const supabase = createServerClient();
    
    const inboundMessage = {
      ...msg,
      direction: 'inbound',
    };

    console.log(`[Channels/Inbox] Saving inbound ${msg.channel} message from ${msg.sender} to Supabase`);
    
    const { data, error } = await supabase
      .from('messages')
      .insert(inboundMessage)
      .select()
      .single();

    if (error) {
      console.error("[Channels/Inbox] Database insert error:", error);
      throw new Error("Failed to save incoming message");
    }

    return data as InboxMessage;
  }

  /**
   * Fetch conversation history.
   */
  async getConversationHistory(supabaseClient: any, phoneNumber: string): Promise<InboxMessage[]> {
    const { data, error } = await supabaseClient
      .from('messages')
      .select('*')
      .or(`sender.eq.${phoneNumber},receiver.eq.${phoneNumber}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("[Channels/Inbox] Error fetching history:", error);
      throw new Error("Failed to fetch conversation history");
    }

    return data as InboxMessage[];
  }
}

export const inboxService = new InboxService();
