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
  createConference?(name: string): Promise<{ success: boolean; conferenceId?: string; error?: string }>;
  addParticipantToConference?(conferenceId: string, callControlId: string): Promise<{ success: boolean; error?: string }>;
  bridgeCalls?(callControlId1: string, callControlId2: string): Promise<{ success: boolean; error?: string }>;
}
