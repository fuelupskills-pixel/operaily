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

        // Fetch conversation history from Supabase if configured
        let historyText = "";
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const isSupabaseConfigured = !!(
          supabaseUrl &&
          supabaseUrl.startsWith("http") &&
          supabaseKey &&
          supabaseKey !== "your_service_role_key" &&
          supabaseKey !== "your_supabase_service_role_key"
        );

        if (isSupabaseConfigured) {
          try {
            const { createClient } = await import("@supabase/supabase-js");
            const supabase = createClient(supabaseUrl!, supabaseKey!);

            const { data: lead } = await supabase
              .from("leads")
              .select("id")
              .or(`whatsapp.eq.${leadPhoneNumber},phone.eq.${leadPhoneNumber}`)
              .limit(1)
              .maybeSingle();

            if (lead) {
              const { data: conv } = await supabase
                .from("conversations")
                .select("id")
                .eq("lead_id", lead.id)
                .eq("channel", "whatsapp")
                .limit(1)
                .maybeSingle();

              if (conv) {
                const { data: msgs } = await supabase
                  .from("messages")
                  .select("direction,content")
                  .eq("conversation_id", conv.id)
                  .order("created_at", { ascending: false })
                  .limit(5);

                if (msgs && msgs.length > 0) {
                  historyText = msgs
                    .reverse()
                    .map((m: any) => `${m.direction === "inbound" ? "Prospect" : "Agent"}: ${m.content}`)
                    .join("\n");
                }
              }
            }
          } catch (e) {
            console.error("Failed to fetch WhatsApp history:", e);
          }
        }

        // Orchestrate AI Response for Lead Qualification using Gemini
        const aiResponse = await generateLeadResponse(messageText, historyText);

        // Sync Conversation & Message records to Supabase in real-time
        if (isSupabaseConfigured) {
          try {
            const { createClient } = await import("@supabase/supabase-js");
            const supabase = createClient(supabaseUrl!, supabaseKey!);

            let leadId = "";
            const { data: existingLead } = await supabase
              .from("leads")
              .select("id")
              .or(`whatsapp.eq.${leadPhoneNumber},phone.eq.${leadPhoneNumber}`)
              .limit(1)
              .maybeSingle();

            if (existingLead) {
              leadId = existingLead.id;
            } else {
              const { data: orgs } = await supabase.from("organizations").select("id").limit(1);
              const orgId = orgs?.[0]?.id;
              if (orgId) {
                const { data: newLead } = await supabase
                  .from("leads")
                  .insert({
                    org_id: orgId,
                    first_name: "WhatsApp",
                    last_name: "Prospect",
                    whatsapp: leadPhoneNumber,
                    phone: leadPhoneNumber,
                    source: "manual",
                    status: "new",
                  })
                  .select("id")
                  .single();
                if (newLead) leadId = newLead.id;
              }
            }

            if (leadId) {
              let convId = "";
              const { data: existingConv } = await supabase
                .from("conversations")
                .select("id")
                .eq("lead_id", leadId)
                .eq("channel", "whatsapp")
                .limit(1)
                .maybeSingle();

              if (existingConv) {
                convId = existingConv.id;
              } else {
                const { data: orgs } = await supabase.from("organizations").select("id").limit(1);
                const orgId = orgs?.[0]?.id;
                if (orgId) {
                  const { data: newConv } = await supabase
                    .from("conversations")
                    .insert({
                      org_id: orgId,
                      lead_id: leadId,
                      channel: "whatsapp",
                      status: "open",
                      last_message_at: new Date().toISOString(),
                    })
                    .select("id")
                    .single();
                  if (newConv) convId = newConv.id;
                }
              }

              if (convId) {
                await supabase.from("messages").insert({
                  conversation_id: convId,
                  direction: "inbound",
                  sender_type: "lead",
                  content: messageText,
                  status: "read",
                });

                await supabase.from("messages").insert({
                  conversation_id: convId,
                  direction: "outbound",
                  sender_type: "ai",
                  content: aiResponse,
                  status: "sent",
                });

                await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", convId);
              }
            }
          } catch (e) {
            console.error("Failed to log WhatsApp conversation in database:", e);
          }
        }

        // Call Meta Graph API to send response to user
        const token = process.env.WHATSAPP_ACCESS_TOKEN;
        const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (token && phoneId && token !== "your_whatsapp_token") {
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

async function generateLeadResponse(input: string, historyContext: string = ""): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key") {
    throw new Error("GEMINI_API_KEY is missing. Cannot generate AI response.");
  }

  try {
    const { AIProvider } = await import("@/services/ai/provider");
    let aiResponse = "";
    
    const aiPrompt = `You are the OMNI Lead Qualification Agent, representing OperAIly CRM. 
Your objective is to qualify the B2B prospect and guide them to schedule a demo at: https://omni-sigma-360-83ak.vercel.app/calendar.

Guidelines:
- Keep the response brief, friendly, and conversational (max 2-3 sentences).
- Address their query directly.
- Base plans start at $49/mo.

${historyContext ? `Conversation history:\n${historyContext}\n` : ""}
Prospect message: "${input}"
Agent response:`;

    const response = await AIProvider.generateText({ prompt: aiPrompt });
    return response.trim();
  } catch (err) {
    console.error("Gemini call in WhatsApp Webhook failed:", err);
    throw new Error("Failed to generate response using Gemini AI.");
  }
}


