import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getChannelService } from '@/services/channels';
import { inboxService } from '@/services/channels/inbox';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const phoneNumber = searchParams.get('phone');

    if (phoneNumber) {
      // Fetch specific conversation history
      const history = await inboxService.getConversationHistory(supabase, phoneNumber);
      return NextResponse.json({ data: history });
    }

    // Otherwise, fetch all distinct conversations (most recent message per contact)
    // We can do a simple order for now, or a more complex query if needed
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    // Grouping by contact to form "conversations" list
    const conversationsMap = new Map();
    for (const msg of data) {
      const contactId = msg.direction === 'inbound' ? msg.sender : msg.receiver;
      if (!conversationsMap.has(contactId)) {
        conversationsMap.set(contactId, msg);
      }
    }

    return NextResponse.json({ data: Array.from(conversationsMap.values()) });

  } catch (error: any) {
    console.error("[API/Inbox] Error fetching inbox:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { channel, to, content } = body;

    if (!channel || !to || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Send message via ChannelService
    const channelService = getChannelService();
    const result = await channelService.send({
      channel,
      to,
      content,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to send message via provider");
    }

    // 2. Save outbound message to Supabase
    // We assume our system's number is "Omni-SIGMA System" or fetched from settings
    const systemNumber = process.env.SYSTEM_PHONE_NUMBER || "System";
    
    const outboundMsg = {
      channel,
      sender: systemNumber,
      receiver: to,
      content,
      direction: 'outbound',
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('messages')
      .insert(outboundMsg)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });

  } catch (error: any) {
    console.error("[API/Inbox] Error sending message:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
