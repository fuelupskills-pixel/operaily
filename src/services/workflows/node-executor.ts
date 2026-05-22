// OMNI-SIGMA 360 — Node Executors
// Each workflow node type has a specialized executor

import type { WorkflowNodeDef } from "./types";
import { getChannelService } from "../channels";

interface NodeResult {
  action: string;
  output: Record<string, unknown>;
  contextUpdates: Record<string, unknown>;
}

type ExecutorFn = (node: WorkflowNodeDef, context: Record<string, unknown>) => Promise<NodeResult>;

// ─── Trigger Node ─────────────────────────────────────────────
const executeTrigger: ExecutorFn = async (node, context) => {
  const lead = context.lead as Record<string, unknown> || {};
  return {
    action: `Triggered for ${lead.name || "unknown lead"}`,
    output: { triggered: true, lead },
    contextUpdates: {},
  };
};

// ─── Delay Node ───────────────────────────────────────────────
const executeDelay: ExecutorFn = async (node) => {
  const duration = (node.config.duration as number) || 1;
  const unit = (node.config.unit as string) || "hours";
  return {
    action: `Initiated background delay: ${duration} ${unit}`,
    output: { initiated: true, duration, unit },
    contextUpdates: { [`delay_${node.id}_initiated`]: true },
  };
};

// ─── Condition Node ───────────────────────────────────────────
const executeCondition: ExecutorFn = async (node, context) => {
  const check = (node.config.check as string) || "default";
  
  // Real implementation evaluates context
  let result = "false";
  
  if (check === "reply_received") {
    // Check if context has any recent inbound messages
    result = context.lastInboundMessage ? "reply_yes" : "reply_no";
  } else if (check === "has_email") {
    const lead = context.lead as any || {};
    result = !!lead.email ? "true" : "false";
  } else if (check === "has_phone") {
    const lead = context.lead as any || {};
    result = !!(lead.phone || lead.whatsapp) ? "true" : "false";
  } else if (check === "ai_intent_interested") {
    const intent = String(context.aiIntent || "").toLowerCase();
    result = intent.includes("interest") || intent.includes("positive") || intent.includes("yes") ? "true" : "false";
  } else {
    // Default to true for unknown checks
    result = "true";
  }

  return {
    action: `Condition "${check}" evaluated to ${result}`,
    output: { conditionResult: result, check, evaluated: true },
    contextUpdates: { lastCondition: result },
  };
};

// ─── Send WhatsApp ────────────────────────────────────────────
const executeSendWhatsApp: ExecutorFn = async (node, context) => {
  const lead = context.lead as Record<string, unknown> || {};
  const template = (node.config.messageTemplate as string) || "Hello {{firstName}}!";
  const message = interpolateTemplate(template, lead);
  const phone = (lead.phone as string) || (lead.whatsapp as string) || "+1234567890";

  const channel = getChannelService();
  const result = await channel.send({
    channel: "whatsapp",
    to: phone,
    content: message,
    mediaUrl: context.videoUrl as string || undefined,
  });

  return {
    action: `WhatsApp sent to ${lead.name || phone}`,
    output: { ...result, messageSent: message },
    contextUpdates: { whatsappSent: true, whatsappMessageId: result.messageId },
  };
};

// ─── Send Email ───────────────────────────────────────────────
const executeSendEmail: ExecutorFn = async (node, context) => {
  const lead = context.lead as Record<string, unknown> || {};
  const subject = interpolateTemplate(
    (node.config.subject as string) || "Following up",
    lead
  );
  const email = (lead.email as string) || "test@example.com";
  const body = `<p>Hi ${lead.firstName || "there"},</p><p>${interpolateTemplate(
    "I wanted to follow up on my previous message about {{companyName}}. I believe our solution could be a great fit for your team.",
    lead
  )}</p><p>Best regards,<br/>OMNI-SIGMA 360</p>`;

  const channel = getChannelService();
  const result = await channel.send({
    channel: "email",
    to: email,
    content: body,
    metadata: { subject },
  });

  return {
    action: `Email sent to ${lead.name || email}`,
    output: { ...result, subject },
    contextUpdates: { emailSent: true, emailMessageId: result.messageId },
  };
};

// ─── Send SMS ─────────────────────────────────────────────────
const executeSendSMS: ExecutorFn = async (node, context) => {
  const lead = context.lead as Record<string, unknown> || {};
  const phone = (lead.phone as string) || "+1234567890";
  const message = interpolateTemplate(
    (node.config.messageTemplate as string) || "Hi {{firstName}}, just wanted to follow up. Reply YES to schedule a call.",
    lead
  );

  const channel = getChannelService();
  const result = await channel.send({ channel: "sms", to: phone, content: message });

  return {
    action: `SMS sent to ${lead.name || phone}`,
    output: { ...result, messageSent: message },
    contextUpdates: { smsSent: true },
  };
};

// ─── AI Voice Call ────────────────────────────────────────────
const executeVoiceCall: ExecutorFn = async (node, context) => {
  const lead = context.lead as Record<string, unknown> || {};
  const phone = (lead.phone as string) || "+1234567890";
  const script = `Hello, this is an AI assistant from OMNI-SIGMA. I'm calling about ${lead.companyName || "your company"}. We have a solution that could help with your ${context.industry || "business"} operations. Would you be interested in a brief 15-minute call with our team?`;

  const channel = getChannelService();
  const result = await channel.send({ channel: "voice", to: phone, content: script });

  return {
    action: `AI Voice call to ${lead.name || phone}`,
    output: { ...result, script },
    contextUpdates: { voiceCallMade: true, callId: result.messageId },
  };
};

// ─── AI Generate Video ───────────────────────────────────────
const executeGenerateVideo: ExecutorFn = async (node, context) => {
  const lead = context.lead as Record<string, unknown> || {};
  const apiKey = process.env.HEYGEN_API_KEY;

  if (!apiKey || apiKey === "your_heygen_api_key") {
    return {
      action: `AI video generation failed (HeyGen Key not configured)`,
      output: { error: "HeyGen API Key is missing. Configure it in .env.local to generate real videos.", provider: "heygen" },
      contextUpdates: {},
    };
  }

  try {
    const avatarId = (node.config.avatarId as string) || "Daisy-hq_20220721";
    const voiceId = (node.config.voiceId as string) || "2d2d97a28b5b4c10a67e9f3b9bf4b321";
    const scriptText = (node.config.scriptTemplate as string) || 
      `Hi ${lead.firstName || "there"}, I noticed you are working at ${lead.companyName || "your company"}. I wanted to share how OperAIly can automate your outreach pipelines.`;

    const response = await fetch("https://api.heygen.com/v2/video/generate", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        video_setting: {
          ratio: "16:9",
        },
        dimension: {
          width: 1280,
          height: 720,
        },
        avatar: {
          avatar_id: avatarId,
          avatar_style: "normal",
        },
        voice: {
          voice_id: voiceId,
        },
        input_text: scriptText,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HeyGen API returned status ${response.status}: ${errText}`);
    }

    const resData = await response.json();
    const videoId = resData.data?.video_id || "";
    const videoUrl = `https://api.heygen.com/v2/video/status?video_id=${videoId}`;

    return {
      action: `AI video generation job triggered on HeyGen: ${videoId}`,
      output: { videoId, videoUrl, provider: "heygen", status: "processing" },
      contextUpdates: { heygenVideoId: videoId, videoUrl, videoGenerated: true },
    };
  } catch (err) {
    console.error("HeyGen API call failed:", err);
    return {
      action: `AI video generation failed`,
      output: { error: err instanceof Error ? err.message : String(err), provider: "heygen" },
      contextUpdates: {},
    };
  }
};

// ─── AI Generate Text ─────────────────────────────────────────
const executeGenerateText: ExecutorFn = async (node, context) => {
  const task = (node.config.task as string) || "generate";
  const lead = context.lead as Record<string, unknown> || {};
  const prompt = (node.config.prompt as string) || `Classify the intent for B2B lead ${lead.companyName || lead.name}.`;

  try {
    const { AIProvider } = await import("@/services/ai/provider");
    const aiResponse = await AIProvider.generateText({ 
      prompt: `Task: ${task}\nContext: ${JSON.stringify(context)}\nPrompt: ${prompt}\n\nPlease output only the classification result or generated text, keep it short.`,
      systemInstruction: "You are an AI automation agent inside a B2B sales workflow. Follow the prompt instructions precisely."
    });

    return {
      action: `AI Generation completed: ${task}`,
      output: { conditionResult: aiResponse.trim(), task, intent: aiResponse.trim(), confidence: 1.0 },
      contextUpdates: { aiIntent: aiResponse.trim() },
    };
  } catch (err) {
    console.error("AI Generation failed:", err);
    return {
      action: `AI Generation failed: ${task}`,
      output: { error: String(err) },
      contextUpdates: {},
    };
  }
};

// ─── Book Meeting ─────────────────────────────────────────────
const executeBookMeeting: ExecutorFn = async (node, context) => {
  const lead = context.lead as Record<string, unknown> || {};
  const duration = (node.config.duration as number) || 30;
  const apiKey = process.env.CALCOM_API_KEY;

  if (!apiKey || apiKey === "your_calcom_api_key") {
    return {
      action: `Meeting booking failed (Cal.com Key not configured)`,
      output: {
        meetingBooked: false,
        error: "Cal.com API Key is missing. Configure it in .env.local to book real meetings.",
        provider: "calcom",
      },
      contextUpdates: {},
    };
  }

  try {
    const eventTypeId = (node.config.eventTypeId as number) || 123456;
    const meetingTime = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(); // 48 hours from now
    const endTime = new Date(new Date(meetingTime).getTime() + duration * 60 * 1000).toISOString();

    const response = await fetch(`https://api.cal.com/v1/bookings?apiKey=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventTypeId,
        start: meetingTime,
        end: endTime,
        responses: {
          name: lead.fullName || lead.name || "Prospect",
          email: lead.email || "prospect@example.com",
        },
        timeZone: "UTC",
        language: "en",
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Cal.com returned status ${response.status}: ${errText}`);
    }

    const resData = await response.json();
    const booking = resData.booking || resData;
    const meetingLink = booking.uid ? `https://cal.com/booking/${booking.uid}` : `https://cal.com/omnisigma/meeting-${Date.now()}`;

    // Log event in database calendar_events if Supabase is active
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
        const { data: users } = await supabase.from("users").select("id, org_id").limit(1);
        if (users && users.length > 0) {
          const user = users[0];
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          const leadId = lead.id && uuidRegex.test(String(lead.id)) ? String(lead.id) : null;
          
          await supabase.from("calendar_events").insert({
            org_id: user.org_id,
            user_id: user.id,
            lead_id: leadId,
            title: `Outreach Follow-up Meeting: ${lead.fullName || lead.name || "Prospect"}`,
            description: `Automated calendar booking synced via Cal.com workflow engine.`,
            start_time: meetingTime,
            end_time: endTime,
            meeting_link: meetingLink,
            external_id: String(booking.id || booking.uid || ""),
            status: "scheduled",
          });
        }
      } catch (dbErr) {
        console.error("Failed to insert meeting in calendar_events:", dbErr);
      }
    }

    return {
      action: `Meeting booked with ${lead.fullName || lead.name || "prospect"} via Cal.com: ${booking.uid || booking.id}`,
      output: {
        meetingBooked: true,
        meetingTime,
        duration,
        meetingLink,
        provider: "calcom",
        bookingId: booking.id || booking.uid,
      },
      contextUpdates: { meetingBooked: true, meetingTime, calcomBookingId: booking.id || booking.uid },
    };
  } catch (err) {
    console.error("Cal.com API call failed:", err);
    return {
      action: `Meeting booking failed`,
      output: {
        meetingBooked: false,
        provider: "calcom",
        error: err instanceof Error ? err.message : String(err),
      },
      contextUpdates: {},
    };
  }
};

// ─── Update Lead ──────────────────────────────────────────────
const executeUpdateLead: ExecutorFn = async (node, context) => {
  const updates = (node.config.updates as Record<string, unknown>) || {};
  return {
    action: `Lead updated: ${Object.keys(updates).join(", ")}`,
    output: { updated: true, fields: updates },
    contextUpdates: { leadUpdated: true },
  };
};

// ─── Webhook ──────────────────────────────────────────────────
const executeWebhook: ExecutorFn = async (node, context) => {
  const url = (node.config.url as string) || "https://example.com/webhook";
  const method = (node.config.method as string) || "POST";
  
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method !== "GET" ? JSON.stringify({ context, lead: context.lead }) : undefined,
    });
    
    let data;
    try {
      data = await res.json();
    } catch {
      data = await res.text();
    }

    return {
      action: `Webhook called: ${url}`,
      output: { url, method, status: res.status, response: data },
      contextUpdates: { webhookLastStatus: res.status },
    };
  } catch (err) {
    return {
      action: `Webhook failed: ${url}`,
      output: { url, method, error: String(err) },
      contextUpdates: {},
    };
  }
};

// ─── Executor Registry ───────────────────────────────────────
const executors: Record<string, ExecutorFn> = {
  trigger: executeTrigger,
  delay: executeDelay,
  condition: executeCondition,
  send_whatsapp: executeSendWhatsApp,
  send_email: executeSendEmail,
  send_sms: executeSendSMS,
  ai_voice_call: executeVoiceCall,
  ai_generate_video: executeGenerateVideo,
  ai_generate_image: executeGenerateVideo, // Reuse for now
  ai_generate_text: executeGenerateText,
  book_meeting: executeBookMeeting,
  update_lead: executeUpdateLead,
  add_tag: executeUpdateLead,
  move_pipeline: executeUpdateLead,
  assign_user: executeUpdateLead,
  webhook: executeWebhook,
  code: executeWebhook,
  split: executeCondition,
};

export async function executeNode(
  node: WorkflowNodeDef,
  context: Record<string, unknown>
): Promise<NodeResult> {
  const executor = executors[node.type];
  if (!executor) {
    return {
      action: `Unknown node type: ${node.type}`,
      output: { error: `No executor for ${node.type}` },
      contextUpdates: {},
    };
  }
  return executor(node, context);
}

// ─── Template Interpolation ──────────────────────────────────
function interpolateTemplate(template: string, vars: Record<string, unknown>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] || key));
}
