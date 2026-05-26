import { NextResponse } from 'next/server';

// @ts-ignore
// const client = require('telnyx')(process.env.TELNYX_API_KEY || 'your_telnyx_api_key');

export async function POST(req: Request) {
  try {
    const event = await req.json();
    const eventType = event?.data?.event_type;
    const payload = event?.data?.payload;

    console.log(`[Webhook/Telnyx Voice] Received event: ${eventType}`);

    if (eventType === 'call.initiated') {
      const callControlId = payload.call_control_id;
      const to = payload.to;
      const from = payload.from;

      console.log(`[Webhook/Telnyx Voice] Incoming call from ${from} to ${to}`);

      // 1. Look up the assigned user or team for the `to` number in the DB
      // const assignedUser = await db.virtual_numbers.find({ number: to });

      // 2. Determine routing logic (e.g., forward to an agent's real phone or SIP URI)
      // For demonstration, we will answer the call and speak a greeting
      // const call = new (client as any).Call({ call_control_id: callControlId });
      
      // await call.answer();
      
      // We can use a short delay before speaking
      // setTimeout(async () => {
      //   try {
      //     await call.speak({
      //       payload: "Please wait while we connect you to our team.",
      //       voice: "female",
      //       language: "en-US",
      //     });
      //     
      //     // Next, we could bridge to an agent
      //     // await call.bridge({ call_control_id: 'agent_call_id' });
      //   } catch (e) {
      //     console.error("Error speaking/bridging:", e);
      //   }
      // }, 1000);

      return NextResponse.json({ success: true });
    }

    // Handle other call events (call.answered, call.hangup, etc.)
    return NextResponse.json({ success: true, message: 'Event ignored' });
  } catch (error: any) {
    console.error("[Webhook/Telnyx Voice] Error processing webhook:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
