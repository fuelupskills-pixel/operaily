// OMNI-SIGMA 360 — Hunter Service
// Orchestrates B2B lead extraction across multiple data sources
// Falls back to mock data when API keys aren't configured

import { ApolloProvider } from "./providers/apollo";
import { LinkedInProvider } from "./providers/linkedin";
import { WebScraperProvider } from "./providers/web-scraper";
import { B2BDirectoriesProvider } from "./providers/b2b-directories";
import { DeepSearchProvider } from "./providers/deep-search";
import { EnrichmentService } from "./enrichment";
import { deduplicateLeads } from "./dedup";
import type { RawLead, EnrichedLead, HunterSearchParams, HunterSearchProgress } from "./types";

export class HunterService {
  private apollo: ApolloProvider;
  private linkedin: LinkedInProvider;
  private webScraper: WebScraperProvider;
  private b2bDirectories: B2BDirectoriesProvider;
  private deepSearch: DeepSearchProvider;
  private enrichment: EnrichmentService;

  constructor() {
    this.apollo = new ApolloProvider();
    this.linkedin = new LinkedInProvider();
    this.webScraper = new WebScraperProvider();
    this.b2bDirectories = new B2BDirectoriesProvider();
    this.deepSearch = new DeepSearchProvider();
    this.enrichment = new EnrichmentService();
  }

  async search(
    params: HunterSearchParams,
    onProgress?: (progress: HunterSearchProgress) => void
  ): Promise<EnrichedLead[]> {
    const { industry, country, titles, limit = 50 } = params;
    const isDeepSearch = params.deepSearch === true;

    // Phase 1: Fan-out search across all providers
    let apolloResults: RawLead[] = [];
    try {
      onProgress?.({ phase: "searching", source: "apollo", message: "Querying Apollo.io API...", percent: 10 });
      apolloResults = await this.apollo.search({ industry, country, titles, limit });
    } catch (e) { console.warn("[Hunter] Apollo provider failed/skipped:", e); }

    let linkedinResults: RawLead[] = [];
    try {
      onProgress?.({ phase: "searching", source: "linkedin", message: "Scanning LinkedIn Sales Navigator...", percent: 25 });
      linkedinResults = await this.linkedin.search({ industry, country, titles, limit });
    } catch (e) { console.warn("[Hunter] LinkedIn provider failed/skipped:", e); }

    let webResults: RawLead[] = [];
    try {
      onProgress?.({ phase: "searching", source: "web", message: "Crawling web directories & Google Maps...", percent: 40 });
      webResults = await this.webScraper.search({ industry, country, limit });
    } catch (e) { console.warn("[Hunter] WebScraper provider failed/skipped:", e); }

    let b2bResults: RawLead[] = [];
    try {
      onProgress?.({ phase: "searching", source: "web", message: "Syncing catalogs from IndiaMART, Justdial, TradeIndia & Alibaba...", percent: 45 });
      b2bResults = await this.b2bDirectories.search({ industry, country, limit });
    } catch (e) { console.warn("[Hunter] B2B Directories failed/skipped:", e); }

    // Phase 1.5: Deep Search — actual internet search
    let deepResults: RawLead[] = [];
    if (isDeepSearch) {
      try {
        onProgress?.({ phase: "searching", source: "deep", message: "🌐 Deep searching internet for real companies...", percent: 50 });
        deepResults = await this.deepSearch.search({ industry, country, limit });
        onProgress?.({ phase: "searching", source: "deep", message: `Deep search found ${deepResults.length} companies from the web`, percent: 55 });
      } catch (e) { console.warn("[Hunter] DeepSearch provider failed/skipped:", e); }
    }

    // Phase 2: Merge all raw leads
    const allRaw: RawLead[] = [...apolloResults, ...linkedinResults, ...webResults, ...b2bResults, ...deepResults];
    onProgress?.({ phase: "deduplicating", source: "system", message: `Deduplicating ${allRaw.length} records...`, percent: 60 });

    // Phase 3: Deduplicate
    const unique = deduplicateLeads(allRaw);
    onProgress?.({ phase: "deduplicating", source: "system", message: `${unique.length} unique leads found`, percent: 70 });

    // Phase 4: AI Enrichment & Scoring
    onProgress?.({ phase: "enriching", source: "ai", message: "AI enriching & scoring leads...", percent: 80 });
    const enriched = await this.enrichment.enrichBatch(unique, { industry, country });

    // Phase 5: Sort by score
    onProgress?.({ phase: "complete", source: "system", message: `${enriched.length} leads ready`, percent: 100 });
    return enriched.sort((a, b) => b.score - a.score);
  }
}

// Singleton instance
let hunterInstance: HunterService | null = null;

export function getHunterService(): HunterService {
  if (!hunterInstance) {
    hunterInstance = new HunterService();
  }
  return hunterInstance;
}
