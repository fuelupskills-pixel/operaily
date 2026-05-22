// OMNI-SIGMA 360 — Omni-Channel Service
// Unified interface to WhatsApp, Email, SMS, and AI Voice
// Uses Zavu Unified Messaging API for production-ready communications

import type { ChannelMessage, ChannelResponse } from "../workflows/types";
import Zavudev from '@zavudev/sdk';

// Initialize Zavu Client
let zavu: Zavudev | null = null;

function getZavuClient(): Zavudev {
  if (!zavu) {
    if (!process.env.ZAVUDEV_API_KEY) {
      console.warn("ZAVUDEV_API_KEY is missing. Messaging features may fail.");
    }
    zavu = new Zavudev({ apiKey: process.env.ZAVUDEV_API_KEY || "dummy_key" });
  }
  return zavu;
}

// ─── WhatsApp ──────────────────────────────────────────────────
async function sendWhatsApp(msg: ChannelMessage): Promise<ChannelResponse> {
  if (!process.env.ZAVUDEV_API_KEY) {
    return { success: false, messageId: null, provider: "zavu", status: "failed", error: "ZAVUDEV_API_KEY not configured." };
  }

  try {
    const client = getZavuClient();
    const payload: any = {
      to: msg.to.replace(/\D/g, ""),
      channel: "whatsapp",
    };

    if (msg.mediaUrl) {
      payload.messageType = "video";
      payload.text = msg.content; // Caption
      payload.content = { mediaUrl: msg.mediaUrl };
    } else {
      payload.text = msg.content;
    }

    const result = await client.messages.send(payload);
    
    return {
      success: true,
      messageId: result.message.id,
      provider: "zavu",
      status: "sent",
      error: null,
    };
  } catch (err: any) {
    return { success: false, messageId: null, provider: "zavu", status: "failed", error: err.message || String(err) };
  }
}

// ─── Email ────────────────────────────────────────────────────
async function sendEmail(msg: ChannelMessage): Promise<ChannelResponse> {
  if (!process.env.ZAVUDEV_API_KEY) {
    return { success: false, messageId: null, provider: "zavu", status: "failed", error: "ZAVUDEV_API_KEY not configured." };
  }

  try {
    const client = getZavuClient();
    const result = await client.messages.send({
      to: msg.to,
      channel: "email",
      subject: (msg.metadata?.subject as string) || "Following up on our conversation",
      htmlBody: msg.content,
      text: msg.content.replace(/<[^>]+>/g, ''), // Strip HTML for plain text
    });

    return {
      success: true,
      messageId: result.message.id,
      provider: "zavu",
      status: "sent",
      error: null,
    };
  } catch (err: any) {
    return { success: false, messageId: null, provider: "zavu", status: "failed", error: err.message || String(err) };
  }
}

// ─── SMS ──────────────────────────────────────────────────────
async function sendSMS(msg: ChannelMessage): Promise<ChannelResponse> {
  if (!process.env.ZAVUDEV_API_KEY) {
    return { success: false, messageId: null, provider: "zavu", status: "failed", error: "ZAVUDEV_API_KEY not configured." };
  }

  try {
    const client = getZavuClient();
    const result = await client.messages.send({
      to: msg.to,
      channel: "sms",
      text: msg.content,
    });

    return {
      success: true,
      messageId: result.message.id,
      provider: "zavu",
      status: "sent",
      error: null,
    };
  } catch (err: any) {
    return { success: false, messageId: null, provider: "zavu", status: "failed", error: err.message || String(err) };
  }
}

// ─── AI Voice Call ────────────────────────────────────────────
async function makeVoiceCall(msg: ChannelMessage): Promise<ChannelResponse> {
  if (!process.env.ZAVUDEV_API_KEY) {
    return { success: false, messageId: null, provider: "zavu", status: "failed", error: "ZAVUDEV_API_KEY not configured." };
  }

  try {
    const client = getZavuClient();
    const result = await client.messages.send({
      to: msg.to,
      channel: "voice",
      text: msg.content,
    });

    return {
      success: true,
      messageId: result.message.id,
      provider: "zavu",
      status: "initiated",
      error: null,
    };
  } catch (err: any) {
    return { success: false, messageId: null, provider: "zavu", status: "failed", error: err.message || String(err) };
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
