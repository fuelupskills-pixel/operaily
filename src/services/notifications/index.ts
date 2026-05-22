// OMNI-SIGMA 360 — Notification Service
// Handles WhatsApp, Email and System notifications

import { getChannelService } from "../channels";

export type NotificationChannel = "whatsapp" | "email" | "system";

export interface NotificationPayload {
  to: string;
  subject?: string;
  message: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  /**
   * Send a WhatsApp message via unified ChannelService
   */
  async sendWhatsApp(payload: NotificationPayload): Promise<boolean> {
    const channelService = getChannelService();
    const result = await channelService.send({
      channel: "whatsapp",
      to: payload.to,
      content: payload.message,
    });
    return result.success;
  }

  /**
   * Notify Admin about new leads
   */
  async notifyAdminOnNewLead(lead: any, adminPhone: string = "+1234567890") {
    const message = `🚀 *New Lead Alert!*\n\n` +
      `Name: ${lead.fullName}\n` +
      `Company: ${lead.companyName || 'N/A'}\n` +
      `Score: ${lead.leadScore}\n` +
      `Source: ${lead.source}\n\n` +
      `View details: https://omni-sigma.io/leads/${lead.id}`;
    
    await this.sendWhatsApp({ to: adminPhone, message });
  }

  /**
   * Notify Admin on lead status change
   */
  async notifyAdminOnStatusChange(lead: any, oldStatus: string, newStatus: string, adminPhone: string = "+1234567890") {
    if (newStatus === oldStatus) return;

    const message = `📈 *Lead Status Updated*\n\n` +
      `Lead: ${lead.fullName}\n` +
      `Change: ${oldStatus.toUpperCase()} ➔ ${newStatus.toUpperCase()}\n` +
      `Company: ${lead.companyName || 'N/A'}\n\n` +
      `Time to follow up!`;

    await this.sendWhatsApp({ to: adminPhone, message });
  }
}

let notificationServiceInstance: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService();
  }
  return notificationServiceInstance;
}
