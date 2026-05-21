// OMNI-SIGMA 360 — Omni-Channel Service
// Unified interface to WhatsApp, Email, SMS, and AI Voice
// Always uses real API endpoints and returns errors if keys are missing

import type { ChannelMessage, ChannelResponse } from "../workflows/types";

// ─── WhatsApp (Meta Cloud API) ────────────────────────────────
const WA_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WA_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

async function sendWhatsApp(msg: ChannelMessage): Promise<ChannelResponse> {
  if (!WA_TOKEN || !WA_PHONE_ID || WA_TOKEN === "your_whatsapp_token") {
    return { success: false, messageId: null, provider: "meta", status: "failed", error: "WhatsApp credentials are not configured in environment variables." };
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v18.0/${WA_PHONE_ID}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${WA_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: msg.to.replace(/\D/g, ""),
        type: msg.mediaUrl ? "video" : "text",
        ...(msg.mediaUrl
          ? { video: { link: msg.mediaUrl, caption: msg.content } }
          : { text: { body: msg.content } }),
      }),
    });
    const data = await res.json();
    return {
      success: res.ok,
      messageId: data.messages?.[0]?.id || null,
      provider: "meta",
      status: res.ok ? "sent" : "failed",
      error: res.ok ? null : JSON.stringify(data.error),
    };
  } catch (err) {
    return { success: false, messageId: null, provider: "meta", status: "failed", error: String(err) };
  }
}

// ─── Email (Resend) ───────────────────────────────────────────
const RESEND_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM_ADDRESS || "noreply@omnisigma.ai";

async function sendEmail(msg: ChannelMessage): Promise<ChannelResponse> {
  if (!RESEND_KEY || RESEND_KEY === "your_resend_api_key") {
    return { success: false, messageId: null, provider: "resend", status: "failed", error: "Resend Email API Key is not configured." };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [msg.to],
        subject: (msg.metadata?.subject as string) || "Following up on our conversation",
        html: msg.content,
      }),
    });
    const data = await res.json();
    return {
      success: res.ok,
      messageId: data.id || null,
      provider: "resend",
      status: res.ok ? "sent" : "failed",
      error: res.ok ? null : JSON.stringify(data),
    };
  } catch (err) {
    return { success: false, messageId: null, provider: "resend", status: "failed", error: String(err) };
  }
}

// ─── SMS (Twilio) ─────────────────────────────────────────────
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER;

async function sendSMS(msg: ChannelMessage): Promise<ChannelResponse> {
  if (!TWILIO_SID || !TWILIO_TOKEN || TWILIO_SID === "your_twilio_sid") {
    return { success: false, messageId: null, provider: "twilio", status: "failed", error: "Twilio credentials are not configured." };
  }

  try {
    const auth = Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64");
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ To: msg.to, From: TWILIO_FROM!, Body: msg.content }),
    });
    const data = await res.json();
    return {
      success: res.ok,
      messageId: data.sid || null,
      provider: "twilio",
      status: res.ok ? "sent" : "failed",
      error: res.ok ? null : data.message,
    };
  } catch (err) {
    return { success: false, messageId: null, provider: "twilio", status: "failed", error: String(err) };
  }
}

// ─── AI Voice Call (Vapi) ─────────────────────────────────────
const VAPI_KEY = process.env.VAPI_API_KEY;

async function makeVoiceCall(msg: ChannelMessage): Promise<ChannelResponse> {
  if (!VAPI_KEY || VAPI_KEY === "your_vapi_api_key") {
    return { success: false, messageId: null, provider: "vapi", status: "failed", error: "Vapi AI calling API Key is not configured." };
  }

  try {
    const res = await fetch("https://api.vapi.ai/call/phone", {
      method: "POST",
      headers: { Authorization: `Bearer ${VAPI_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumberId: msg.metadata?.phoneNumberId,
        customer: { number: msg.to },
        assistant: {
          firstMessage: msg.content,
          model: { provider: "openai", model: "gpt-4o-mini" },
          voice: { provider: "11labs", voiceId: "21m00Tcm4TlvDq8ikWAM" },
        },
      }),
    });
    const data = await res.json();
    return {
      success: res.ok,
      messageId: data.id || null,
      provider: "vapi",
      status: res.ok ? "initiated" : "failed",
      error: res.ok ? null : JSON.stringify(data),
    };
  } catch (err) {
    return { success: false, messageId: null, provider: "vapi", status: "failed", error: String(err) };
  }
}

// ─── Unified Channel Router ──────────────────────────────────
export class ChannelService {
  async send(msg: ChannelMessage): Promise<ChannelResponse> {
    switch (msg.channel) {
      case "whatsapp": return sendWhatsApp(msg);
      case "email":    return sendEmail(msg);
      case "sms":      return sendSMS(msg);
      case "voice":    return makeVoiceCall(msg);
      default:
        return { success: false, messageId: null, provider: "unknown", status: "failed", error: `Unknown channel: ${msg.channel}` };
    }
  }
}

let channelInstance: ChannelService | null = null;
export function getChannelService(): ChannelService {
  if (!channelInstance) channelInstance = new ChannelService();
  return channelInstance;
}
