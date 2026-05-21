// OMNI-SIGMA 360 — LinkedIn Provider (Dynamic)

import type { RawLead, ProviderSearchParams } from "../types";

const LINKEDIN_API_KEY = process.env.LINKEDIN_API_KEY;

export class LinkedInProvider {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!LINKEDIN_API_KEY;
  }

  async search(params: ProviderSearchParams): Promise<RawLead[]> {
    if (!this.isConfigured) {
      throw new Error("[Hunter/LinkedIn] LINKEDIN_API_KEY is not configured.");
    }
    // TODO: Implement actual LinkedIn/Proxycurl API integration
    throw new Error("[Hunter/LinkedIn] Real API integration not yet implemented.");
  }
}

