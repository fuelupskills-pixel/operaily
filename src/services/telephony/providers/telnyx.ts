import telnyx from "telnyx";
import { TelephonyProvider, CallParams } from "../types";

export class TelnyxProvider implements TelephonyProvider {
  name = "telnyx";
  private client: any;

  constructor() {
    const apiKey = process.env.TELNYX_API_KEY;
    if (apiKey && apiKey !== "your_telnyx_api_key") {
      // @ts-ignore
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

  async createConference(name: string): Promise<{ success: boolean; conferenceId?: string; error?: string }> {
    if (!this.isConfigured()) return { success: false, error: "Telnyx is not configured" };
    try {
      const conference = await this.client.conferences.create({
        name,
        call_control_id: process.env.TELNYX_CONNECTION_ID || "default_connection",
      });
      return { success: true, conferenceId: conference.data.id };
    } catch (error: any) {
      console.error("[Telephony/Telnyx] Error creating conference:", error);
      return { success: false, error: error.message || "Failed to create conference" };
    }
  }

  async addParticipantToConference(conferenceId: string, callControlId: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) return { success: false, error: "Telnyx is not configured" };
    try {
      const conference = new this.client.Conference({ id: conferenceId });
      await conference.join({
        call_control_id: callControlId,
      });
      return { success: true };
    } catch (error: any) {
      console.error("[Telephony/Telnyx] Error joining conference:", error);
      return { success: false, error: error.message || "Failed to add participant to conference" };
    }
  }

  async bridgeCalls(callControlId1: string, callControlId2: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) return { success: false, error: "Telnyx is not configured" };
    try {
      const call = new this.client.Call({ call_control_id: callControlId1 });
      await call.bridge({ call_control_id: callControlId2 });
      return { success: true };
    } catch (error: any) {
      console.error("[Telephony/Telnyx] Error bridging calls:", error);
      return { success: false, error: error.message || "Failed to bridge calls" };
    }
  }
}
