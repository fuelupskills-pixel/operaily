// OMNI-SIGMA 360 — Hunter Service v2
// Global Lead Intelligence Agent
// Orchestrates B2B lead extraction across 7+ data sources including:
// Apollo, LinkedIn, Web Crawling, B2B Directories, Government Tenders,
// Trade Portals (Alibaba, EC21, ExportHub), Import/Export Databases, Pharma Directories

import { ApolloProvider } from "./providers/apollo";
import { LinkedInProvider } from "./providers/linkedin";
import { WebScraperProvider } from "./providers/web-scraper";
import { B2BDirectoriesProvider } from "./providers/b2b-directories";
import { DeepSearchProvider } from "./providers/deep-search";
import { GovernmentTendersProvider } from "./providers/government-tenders";
import { TradePortalsProvider } from "./providers/trade-portals";
import { ImportExportDatabaseProvider } from "./providers/import-export-db";
import { PharmaDirectoriesProvider } from "./providers/pharma-directories";
import { EnrichmentService } from "./enrichment";
import { deduplicateLeads } from "./dedup";
import type { RawLead, EnrichedLead, HunterSearchParams, HunterSearchProgress } from "./types";

export class HunterService {
  private apollo: ApolloProvider;
  private linkedin: LinkedInProvider;
  private webScraper: WebScraperProvider;
  private b2bDirectories: B2BDirectoriesProvider;
  private deepSearch: DeepSearchProvider;
  private governmentTenders: GovernmentTendersProvider;
  private tradePortals: TradePortalsProvider;
  private importExportDb: ImportExportDatabaseProvider;
  private pharmaDirectories: PharmaDirectoriesProvider;
  private enrichment: EnrichmentService;

  constructor() {
    this.apollo = new ApolloProvider();
    this.linkedin = new LinkedInProvider();
    this.webScraper = new WebScraperProvider();
    this.b2bDirectories = new B2BDirectoriesProvider();
    this.deepSearch = new DeepSearchProvider();
    this.governmentTenders = new GovernmentTendersProvider();
    this.tradePortals = new TradePortalsProvider();
    this.importExportDb = new ImportExportDatabaseProvider();
    this.pharmaDirectories = new PharmaDirectoriesProvider();
    this.enrichment = new EnrichmentService();
  }

  async search(
    params: HunterSearchParams,
    onProgress?: (progress: HunterSearchProgress) => void
  ): Promise<EnrichedLead[]> {
    const { industry, country, titles, limit = 50 } = params;
    const isDeepSearch = params.deepSearch === true;
    const sources = params.sources || ["apollo", "linkedin", "web"];
    const apiKeys = params.apiKeys || {};

    const providerParams = { industry, country, titles, limit, sources, apiKeys };

    // ─── Phase 1: Parallel Source Collection ────────────────────────────────────

    const allRaw: RawLead[] = [];

    // Apollo
    if (sources.includes("apollo")) {
      try {
        onProgress?.({ phase: "searching", source: "apollo", message: "🎯 Querying Apollo.io database...", percent: 8 });
        const apolloResults = await this.apollo.search(providerParams);
        allRaw.push(...apolloResults);
        onProgress?.({ phase: "searching", source: "apollo", message: `✅ Apollo: ${apolloResults.length} contacts found`, percent: 14 });
      } catch (e) { console.warn("[Hunter] Apollo provider failed:", e); }
    }

    // LinkedIn / Social
    if (sources.includes("linkedin") || sources.includes("facebook") || sources.includes("twitter")) {
      try {
        onProgress?.({ phase: "searching", source: "linkedin", message: "💼 Scanning LinkedIn & social networks...", percent: 18 });
        const linkedinResults = await this.linkedin.search(providerParams);
        allRaw.push(...linkedinResults);
        onProgress?.({ phase: "searching", source: "linkedin", message: `✅ Social: ${linkedinResults.length} profiles found`, percent: 24 });
      } catch (e) { console.warn("[Hunter] Social provider failed:", e); }
    }

    // Trade Portals (Alibaba, EC21, ExportHub, Thomasnet)
    if (sources.includes("trade_portals") || sources.includes("alibaba") || sources.includes("web")) {
      try {
        onProgress?.({ phase: "searching", source: "trade", message: "🏪 Mining trade portals: Alibaba, EC21, ExportHub...", percent: 28 });
        const tradeResults = await this.tradePortals.search(providerParams);
        allRaw.push(...tradeResults);
        onProgress?.({ phase: "searching", source: "trade", message: `✅ Trade Portals: ${tradeResults.length} RFQs/buyers found`, percent: 35 });
      } catch (e) { console.warn("[Hunter] Trade portals provider failed:", e); }
    }

    // Government Tenders
    if (sources.includes("government") || sources.includes("tenders") || isDeepSearch) {
      try {
        onProgress?.({ phase: "searching", source: "government", message: "🏛️ Searching government procurement portals...", percent: 38 });
        const tenderResults = await this.governmentTenders.search(providerParams);
        allRaw.push(...tenderResults);
        onProgress?.({ phase: "searching", source: "government", message: `✅ Gov Tenders: ${tenderResults.length} procurement leads`, percent: 44 });
      } catch (e) { console.warn("[Hunter] Gov Tenders provider failed:", e); }
    }

    // Pharma & Medical Directories
    if (sources.includes("pharma_dir") || sources.includes("directories") || isDeepSearch) {
      try {
        onProgress?.({ phase: "searching", source: "pharma_dir", message: "💊 Scanning pharma & medical directories...", percent: 48 });
        const dirResults = await this.pharmaDirectories.search(providerParams);
        allRaw.push(...dirResults);
        onProgress?.({ phase: "searching", source: "pharma_dir", message: `✅ Directories: ${dirResults.length} companies found`, percent: 53 });
      } catch (e) { console.warn("[Hunter] Pharma directories provider failed:", e); }
    }

    // Import/Export Databases
    if (sources.includes("import_export") || sources.includes("volza") || isDeepSearch) {
      try {
        onProgress?.({ phase: "searching", source: "import_export", message: "📦 Analyzing import/export databases (HS codes)...", percent: 56 });
        const importResults = await this.importExportDb.search(providerParams);
        allRaw.push(...importResults);
        onProgress?.({ phase: "searching", source: "import_export", message: `✅ Import DB: ${importResults.length} importers identified`, percent: 61 });
      } catch (e) { console.warn("[Hunter] Import/Export DB provider failed:", e); }
    }

    // B2B Directories (IndiaMART, JustDial, etc.)
    if (sources.includes("indiamart") || sources.includes("justdial")) {
      try {
        onProgress?.({ phase: "searching", source: "b2b", message: "📋 Extracting from IndiaMART, JustDial, TradeIndia...", percent: 63 });
        const b2bResults = await this.b2bDirectories.search(providerParams);
        allRaw.push(...b2bResults);
        onProgress?.({ phase: "searching", source: "b2b", message: `✅ B2B Dirs: ${b2bResults.length} listings found`, percent: 67 });
      } catch (e) { console.warn("[Hunter] B2B Directories failed:", e); }
    }

    // Web Crawling
    if (sources.includes("web")) {
      try {
        onProgress?.({ phase: "searching", source: "web", message: "🌐 Crawling web directories & Yellow Pages...", percent: 69 });
        const webResults = await this.webScraper.search(providerParams);
        allRaw.push(...webResults);
        onProgress?.({ phase: "searching", source: "web", message: `✅ Web: ${webResults.length} entries scraped`, percent: 73 });
      } catch (e) { console.warn("[Hunter] WebScraper failed:", e); }
    }

    // Deep Search (Serper-powered Google crawling)
    if (isDeepSearch || sources.includes("deep")) {
      try {
        onProgress?.({ phase: "searching", source: "deep", message: "🕵️ Deep crawling internet for real buyers...", percent: 75 });
        const deepResults = await this.deepSearch.search(providerParams);
        allRaw.push(...deepResults);
        onProgress?.({ phase: "searching", source: "deep", message: `✅ Deep search: ${deepResults.length} additional leads`, percent: 80 });
      } catch (e) { console.warn("[Hunter] Deep search failed:", e); }
    }

    // ─── Phase 2: Deduplication ──────────────────────────────────────────────────
    onProgress?.({ phase: "deduplicating", source: "system", message: `🔄 Deduplicating ${allRaw.length} total records...`, percent: 83 });
    const unique = deduplicateLeads(allRaw);
    onProgress?.({ phase: "deduplicating", source: "system", message: `✅ ${unique.length} unique leads after dedup`, percent: 87 });

    // ─── Phase 3: AI Enrichment & Scoring ───────────────────────────────────────
    onProgress?.({ phase: "enriching", source: "ai", message: "🤖 AI scoring & enriching leads...", percent: 90 });
    const enriched = await this.enrichment.enrichBatch(unique, { industry, country });

    // Apply source-based score bonuses
    const boosted = enriched.map(lead => {
      let bonus = 0;
      if ((lead as any).rawData?.type === "Government Procurement") bonus += 40;
      else if ((lead as any).source === "government_tender") bonus += 40;
      else if ((lead as any).source === "trade_portal") bonus += 20;
      else if ((lead as any).source === "import_database") bonus += 25;
      else if ((lead as any).source === "pharma_directory") bonus += 15;
      lead.score = Math.min(100, lead.score + bonus);
      return lead;
    });

    onProgress?.({ phase: "complete", source: "system", message: `🎉 ${boosted.length} leads ready!`, percent: 100 });
    return boosted.sort((a, b) => b.score - a.score);
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
