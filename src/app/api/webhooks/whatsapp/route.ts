import { NextRequest, NextResponse } from "next/server";

// Verify token for Meta WhatsApp Developer portal (can be configured in .env.local)
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "omni_sigma_secure_handshake";

// GET Handler: Verification handshake with Meta servers
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    // Check matching modes and verification tokens
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WhatsApp Webhook Handshake verified successfully!");
      return new Response(challenge, { status: 200 });
    }

    return NextResponse.json({ success: false, error: "Verification token mismatch" }, { status: 403 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST Handler: Listens to incoming customer messages, parses text, and routes to AI
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify WhatsApp Cloud API messaging events schema
    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];

      if (message) {
        const leadPhoneNumber = message.from; // Sender's phone number
        const messageId = message.id;
        const messageType = message.type;
        
        let messageText = "";
        if (messageType === "text") {
          messageText = message.text?.body || "";
        } else if (messageType === "interactive") {
          messageText = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || "";
        }

        console.log(`Received WhatsApp message from [${leadPhoneNumber}]: "${messageText}" (ID: ${messageId})`);

        // Orchestrate AI Response for Lead Qualification
        const aiResponse = generateLeadResponse(messageText);

        // Call Meta Graph API to send response to user
        const token = process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (token && phoneId) {
          const response = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: leadPhoneNumber,
              type: "text",
              text: { body: aiResponse }
            })
          });
          const resData = await response.json();
          console.log("Reply sent successfully via Cloud API:", resData);
        } else {
          console.log(`[MOCK WHATSAPP SEND] Outbound to ${leadPhoneNumber}: "${aiResponse}"`);
        }

        return NextResponse.json({ 
          success: true, 
          message: "Event processed", 
          routed: {
            from: leadPhoneNumber,
            input: messageText,
            output: aiResponse
          }
        });
      }
    }

    return NextResponse.json({ success: true, message: "Non-messaging event ignored" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Simulated Lead Qualification Agent reasoning
function generateLeadResponse(input: string): string {
  const query = input.toLowerCase();
  
  if (query.includes("pricing") || query.includes("cost") || query.includes("how much")) {
    return "Thanks for asking! OMNI-SIGMA 360 plans scale directly with your active AI agent workforce requirements. Standard access starts at $49/mo. Would you like to schedule a quick visual demo?";
  }
  
  if (query.includes("demo") || query.includes("book") || query.includes("schedule") || query.includes("talk")) {
    return "Excellent! I can book you in right away. Click this link to open our interactive schedule planner: https://omni-sigma-360-83ak.vercel.app/calendar or let me know your preferred day!";
  }
  
  if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
    return "Hi there! I am the OMNI Lead Qualification Agent. I'm here to help you configure your multi-channel sales pipelines. What CRM modules can I guide you with today?";
  }

  return "Received! I have routed your query to our Chief AI Ops agent. They will audit the details and follow up with a comprehensive strategy brief in just a few minutes. Is there anything else you'd like to add?";
}
