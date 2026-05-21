import telnyx from "telnyx";
import { TelephonyProvider, CallParams } from "../types";

export class TelnyxProvider implements TelephonyProvider {
  name = "telnyx";
  private client: any;

  constructor() {
    const apiKey = process.env.TELNYX_API_KEY;
    if (apiKey && apiKey !== "your_telnyx_api_key") {
      this.client = telnyx(apiKey);
    }
  }

  isConfigured(): boolean {
    return !!this.client;
  }

  async makeCall(params: CallParams): Promise<{ success: boolean; callId?: string; error?: string }> {
    if (!this.isConfigured()) {
      return { success: false, error: "Telnyx is not configured" };
    }

    try {
      // Create a call via Telnyx Call Control API
      const call = await this.client.calls.create({
        connection_id: process.env.TELNYX_CONNECTION_ID || "default_connection",
        to: params.to,
        from: params.from,
        // For custom routing logic or answering webhooks
        webhook_url: params.webhookUrl,
        // Telnyx does not use TwiML natively, but you can bridge it or use their Call Control commands 
        // dynamically via webhooks. Here we just initiate the call.
      });

      return { success: true, callId: call.data.call_control_id };
    } catch (error: any) {
      console.error("[Telephony/Telnyx] Error making call:", error.message || error);
      return { success: false, error: error.message || "Failed to initiate call via Telnyx" };
    }
  }
}
