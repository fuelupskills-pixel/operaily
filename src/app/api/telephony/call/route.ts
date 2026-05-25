import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { ProviderFactory } from '@/services/telephony/providerFactory';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    
    // Auth check
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { to } = body;

    if (!to) {
      return NextResponse.json({ error: 'Missing destination number' }, { status: 400 });
    }

    const systemNumber = process.env.SYSTEM_PHONE_NUMBER || "+10000000000";

    const provider = ProviderFactory.getProvider('telnyx');
    const result = await provider.makeCall({
      to,
      from: systemNumber,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to initiate call");
    }

    // Log the outbound call in messages as a voice channel event
    const outboundMsg = {
      channel: 'voice',
      sender: systemNumber,
      receiver: to,
      content: `Outbound Call Initiated (Call ID: ${result.callId})`,
      direction: 'outbound',
      user_id: user.id
    };

    await supabase.from('messages').insert(outboundMsg);

    return NextResponse.json({ success: true, callId: result.callId });

  } catch (error: any) {
    console.error("[API/Telephony] Error initiating call:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
