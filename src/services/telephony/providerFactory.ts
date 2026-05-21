import { TelephonyProvider } from "./types";
import { TelnyxProvider } from "./providers/telnyx";

// A mock Twilio provider for structural completeness
class TwilioProvider implements TelephonyProvider {
  name = "twilio";
  
  isConfigured(): boolean {
    return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID !== "your_twilio_sid");
  }

  async makeCall(params: any): Promise<{ success: boolean; callId?: string; error?: string }> {
    if (!this.isConfigured()) return { success: false, error: "Twilio not configured" };
    // Real implementation would use twilio SDK
    return { success: true, callId: "CA" + Date.now() };
  }
}

export class ProviderFactory {
  private static providers: Record<string, TelephonyProvider> = {
    twilio: new TwilioProvider(),
    telnyx: new TelnyxProvider(),
  };

  /**
   * Retrieves the requested provider. If the requested provider is not configured, 
   * it falls back to the other available provider if configured.
   */
  static getProvider(preferred: "twilio" | "telnyx" = "telnyx"): TelephonyProvider {
    const primary = this.providers[preferred];
    if (primary.isConfigured()) {
      return primary;
    }

    const fallback = preferred === "twilio" ? "telnyx" : "twilio";
    const secondary = this.providers[fallback];
    
    if (secondary.isConfigured()) {
      console.warn(`[Telephony] Preferred provider '${preferred}' is not configured. Falling back to '${fallback}'.`);
      return secondary;
    }

    // Return the preferred one anyway, it will just throw "not configured" when used.
    return primary;
  }
}
