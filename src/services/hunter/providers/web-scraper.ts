// OMNI-SIGMA 360 — Web Scraper Provider (Dynamic)

import type { RawLead, ProviderSearchParams } from "../types";

const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY;

export class WebScraperProvider {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!SCRAPER_API_KEY;
  }

  async search(params: ProviderSearchParams): Promise<RawLead[]> {
    if (!this.isConfigured) {
      throw new Error("[Hunter/Web] SCRAPER_API_KEY is not configured.");
    }
    // TODO: Implement actual Web Scraper API integration
    throw new Error("[Hunter/Web] Real API integration not yet implemented.");
  }
}

