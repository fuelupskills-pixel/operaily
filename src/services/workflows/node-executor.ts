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
  // In production, this would schedule a BullMQ delayed job
  // For demo, we simulate with a short delay
  const simulatedMs = Math.min(duration * 100, 2000);
  await new Promise((r) => setTimeout(r, simulatedMs));
  return {
    action: `Waited ${duration} ${unit} (simulated: ${simulatedMs}ms)`,
    output: { waited: true, duration, unit, simulatedMs },
    contextUpdates: { [`delay_${node.id}_completed`]: true },
  };
};

// ─── Condition Node ───────────────────────────────────────────
const executeCondition: ExecutorFn = async (node, context) => {
  const check = (node.config.check as string) || "default";
  // Simulate condition evaluation
  // In production, this would check real reply status from DB
  const replyReceived = Math.random() > 0.5; // 50% chance for demo
  const result = check === "reply_received"
    ? (replyReceived ? "reply_yes" : "reply_no")
    : "true";

  return {
    action: `Condition "${check}" → ${result}`,
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
  // In production, this calls HeyGen/Veo API
  await new Promise((r) => setTimeout(r, 500)); // Simulate
  const videoUrl = `https://cdn.omnisigma.ai/videos/intro_${lead.firstName || "lead"}_${Date.now()}.mp4`;

  return {
    action: `AI video generated for ${lead.name || "lead"}`,
    output: { videoUrl, provider: "heygen_mock", duration: "30s" },
    contextUpdates: { videoUrl, videoGenerated: true },
  };
};

// ─── AI Generate Text ─────────────────────────────────────────
const executeGenerateText: ExecutorFn = async (node, context) => {
  const task = (node.config.task as string) || "generate";
  const lead = context.lead as Record<string, unknown> || {};

  // Simulate AI intent classification
  await new Promise((r) => setTimeout(r, 300));
  const intents = ["interested", "objection", "not_interested"];
  const intent = intents[Math.floor(Math.random() * 2)]; // Bias toward interested

  return {
    action: `AI classified intent: ${intent}`,
    output: { conditionResult: intent, task, intent, confidence: 0.87 },
    contextUpdates: { aiIntent: intent },
  };
};

// ─── Book Meeting ─────────────────────────────────────────────
const executeBookMeeting: ExecutorFn = async (node, context) => {
  const lead = context.lead as Record<string, unknown> || {};
  const duration = (node.config.duration as number) || 30;
  // In production, this calls Cal.com API
  await new Promise((r) => setTimeout(r, 300));
  const meetingTime = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

  return {
    action: `Meeting booked with ${lead.name || "lead"} for ${new Date(meetingTime).toLocaleDateString()}`,
    output: {
      meetingBooked: true,
      meetingTime,
      duration,
      meetingLink: `https://cal.com/omnisigma/meeting-${Date.now()}`,
      provider: "calcom_mock",
    },
    contextUpdates: { meetingBooked: true, meetingTime },
  };
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
const executeWebhook: ExecutorFn = async (node) => {
  const url = (node.config.url as string) || "https://example.com/webhook";
  // In production, this sends actual HTTP request
  return {
    action: `Webhook called: ${url}`,
    output: { url, method: "POST", status: 200 },
    contextUpdates: {},
  };
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
