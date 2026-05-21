export interface CallParams {
  to: string;
  from: string;
  twiml?: string; // Optional raw TwiML or equivalent instructions
  webhookUrl?: string; // Webhook for call state updates
}

export interface TelephonyProvider {
  name: string;
  isConfigured(): boolean;
  makeCall(params: CallParams): Promise<{ success: boolean; callId?: string; error?: string }>;
}
