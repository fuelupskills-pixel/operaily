import { NextResponse } from 'next/server';
import { inboxService } from '@/services/channels/inbox';

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Determine if this is a Zavu (WhatsApp) or Telnyx (SMS) webhook
    // 1. Zavu Webhook
    if (payload.event === 'message.received' && payload.channel === 'whatsapp') {
      console.log(`[Webhook/Channels] Received WhatsApp message from Zavu`);
      await inboxService.processIncomingMessage({
        channel: 'whatsapp',
        sender: payload.message.from,
        receiver: payload.message.to,
        content: payload.message.text,
      });
      return NextResponse.json({ success: true });
    }

    // 2. Telnyx Webhook (SMS)
    if (payload?.data?.event_type === 'message.received') {
      const smsData = payload.data.payload;
      console.log(`[Webhook/Channels] Received SMS from Telnyx`);
      await inboxService.processIncomingMessage({
        channel: 'sms',
        sender: smsData.from.phone_number,
        receiver: smsData.to[0].phone_number,
        content: smsData.text,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: true, message: 'Event ignored' });
  } catch (error: any) {
    console.error("[Webhook/Channels] Error processing webhook:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
