// OMNI-SIGMA 360 — Hunter Service v3
// Global Lead Intelligence Agent — 15 Data Source Platforms
//
// Platforms covered:
//  1. Apollo.io           — B2B contact database
//  2. LinkedIn            — Professional network
//  3. Facebook/Instagram  — Social business profiles
//  4. Twitter/X           — Social signals
//  5. Trade Portals       — Alibaba RFQ, EC21, ExportHub, Thomasnet, Global Sources
//  6. Government Tenders  — SAM.gov, TED Europa, UNGM, GeM India, World Bank, AfDB
//  7. Pharma Directories  — Pharmacompass, CPhI, MedicalExpo, LabX, Kompass
//  8. Import/Export DB    — ImportYeti, Panjiva, Volza (by HS code)
//  9. B2B Directories     — IndiaMART, JustDial, TradeIndia, Alibaba
// 10. Web Crawling        — Yellow Pages, company websites, directories
// 11. Deep Search         — Serper-powered Google crawl for real buyers
// 12. Yellow Pages        — Country-specific YP portals worldwide
// 13. Google Maps         — Google My Business / local business listings
// 14. Industry Forums     — Reddit, pharma forums, LinkedIn groups, Quora
// 15. Europages/Kompass   — EU business directories, D&B, GlobalSpec
// 16. Social Media        — Instagram Business, WhatsApp Business, TikTok, Telegram
// 17. Chamber of Commerce — ICC, US Chamber, CII India, DIHK Germany, Arab chambers

import { ApolloProvider } from "./providers/apollo";
import { LinkedInProvider } from "./providers/linkedin";
import { WebScraperProvider } from "./providers/web-scraper";
import { B2BDirectoriesProvider } from "./providers/b2b-directories";
import { DeepSearchProvider } from "./providers/deep-search";
import { GovernmentTendersProvider } from "./providers/government-tenders";
import { TradePortalsProvider } from "./providers/trade-portals";
import { ImportExportDatabaseProvider } from "./providers/import-export-db";
import { PharmaDirectoriesProvider } from "./providers/pharma-directories";
import { YellowPagesProvider } from "./providers/yellow-pages";
import { GoogleMapsProvider } from "./providers/google-maps";
import { IndustryForumsProvider } from "./providers/industry-forums";
import { EuropagesKompassProvider } from "./providers/europages-kompass";
import { SocialMediaProvider } from "./providers/social-media";
import { ChamberOfCommerceProvider } from "./providers/chamber-of-commerce";
import { EnrichmentService } from "./enrichment";
import { deduplicateLeads } from "./dedup";
import type { RawLead, EnrichedLead, HunterSearchParams, HunterSearchProgress } from "./types";

// Source → score bonus mapping
const SOURCE_SCORE_BONUS: Record<string, number> = {
  government_tender:    40,  // Highest: real procurement budget
  import_database:      25,  // Proven buyer (already importing)
  trade_portal:         20,  // Active RFQ/inquiry
  chamber_of_commerce:  18,  // Vetted chamber member
  pharma_directory:     15,  // Verified industry listing
  europages_kompass:    12,  // EU business directory
  yellow_pages:         10,  // Local business listing
  google_maps:          10,  // Google verified business
  indiamart:            12,
  tradeindia:           12,
  industry_forum:        8,  // Community mention
  social_media:          8,  // Social presence
  apollo:                6,
  linkedin:              5,
  web_scraper:           3,
  deep_search:           4,
};

export class HunterService {
  private apollo            = new ApolloProvider();
  private linkedin          = new LinkedInProvider();
  private webScraper        = new WebScraperProvider();
  private b2bDirs           = new B2BDirectoriesProvider();
  private deepSearch        = new DeepSearchProvider();
  private govTenders        = new GovernmentTendersProvider();
  private tradePortals      = new TradePortalsProvider();
  private importExportDb    = new ImportExportDatabaseProvider();
  private pharmaDirectories = new PharmaDirectoriesProvider();
  private yellowPages       = new YellowPagesProvider();
  private googleMaps        = new GoogleMapsProvider();
  private industryForums    = new IndustryForumsProvider();
  private europagesKompass  = new EuropagesKompassProvider();
  private socialMedia       = new SocialMediaProvider();
  private chamberOfCommerce = new ChamberOfCommerceProvider();
  private enrichment        = new EnrichmentService();

  async search(
    params: HunterSearchParams,
    onProgress?: (progress: HunterSearchProgress) => void
  ): Promise<EnrichedLead[]> {
    const { industry, country, titles, limit = 60 } = params;
    const isDeepSearch = params.deepSearch === true;
    const sources = params.sources || [
      "apollo", "linkedin", "web", "trade_portals", "government",
      "pharma_dir", "import_export", "yellow_pages", "google_maps",
      "forums", "europages", "social", "chamber",
    ];
    const apiKeys = params.apiKeys || {};
    const pp = { industry, country, titles, limit: Math.ceil(limit / 8), sources, apiKeys };

    const allRaw: RawLead[] = [];
    let pct = 5;

    // ── Helper to run one provider safely ──────────────────────────────────
    const run = async (
      id: string,
      label: string,
      source: HunterSearchProgress["source"],
      fn: () => Promise<RawLead[]>
    ) => {
      if (!sources.includes(id) && !isDeepSearch) return;
      try {
        onProgress?.({ phase: "searching", source, message: `🔍 ${label}...`, percent: pct });
        const results = await fn();
        allRaw.push(...results);
        pct = Math.min(pct + 5, 80);
        onProgress?.({ phase: "searching", source, message: `✅ ${label}: ${results.length} leads`, percent: pct });
      } catch (e) {
        console.warn(`[Hunter] ${id} failed:`, e);
      }
    };

    // ── Phase 1: All Providers (parallel groups for speed) ─────────────────

    // Group A — Core data platforms
    await Promise.all([
      run("apollo",        "Apollo.io database",             "apollo",       () => this.apollo.search(pp)),
      run("linkedin",      "LinkedIn & social networks",      "linkedin",     () => this.linkedin.search(pp)),
      run("social",        "Instagram / WhatsApp / TikTok / Telegram", "linkedin", () => this.socialMedia.search(pp)),
    ]);

    // Group B — Trade & commerce
    await Promise.all([
      run("trade_portals", "Trade portals (Alibaba, EC21, ExportHub)", "trade", () => this.tradePortals.search(pp)),
      run("indiamart",     "IndiaMART / JustDial / TradeIndia",        "b2b",   () => this.b2bDirs.search(pp)),
      run("europages",     "Europages / Kompass / D&B",                "trade", () => this.europagesKompass.search(pp)),
    ]);

    // Group C — Government & official
    await Promise.all([
      run("government",    "Government procurement portals",   "government",    () => this.govTenders.search(pp)),
      run("chamber",       "Chamber of Commerce directories",  "system",        () => this.chamberOfCommerce.search(pp)),
      run("import_export", "Import/Export databases (HS codes)","import_export",() => this.importExportDb.search(pp)),
    ]);

    // Group D — Industry directories
    await Promise.all([
      run("pharma_dir",    "Pharma & medical directories",  "pharma_dir",    () => this.pharmaDirectories.search(pp)),
      run("yellow_pages",  "Yellow Pages worldwide",         "system",        () => this.yellowPages.search(pp)),
      run("google_maps",   "Google Maps / My Business",      "system",        () => this.googleMaps.search(pp)),
    ]);

    // Group E — Community & web
    await Promise.all([
      run("forums",        "Industry forums & communities (Reddit, pharma networks)", "system", () => this.industryForums.search(pp)),
      run("web",           "Web crawling & directories",    "web",           () => this.webScraper.search(pp)),
    ]);

    // Deep Search — last
    if (isDeepSearch || sources.includes("deep")) {
      await run("deep", "Deep internet crawl for real buyers", "deep", () => this.deepSearch.search(pp));
    }

    // ── Phase 2: Dedup ────────────────────────────────────────────────────
    onProgress?.({ phase: "deduplicating", source: "system", message: `🔄 Deduplicating ${allRaw.length} total records...`, percent: 83 });
    const unique = deduplicateLeads(allRaw);
    onProgress?.({ phase: "deduplicating", source: "system", message: `✅ ${unique.length} unique leads after dedup`, percent: 87 });

    // ── Phase 3: AI Enrichment ────────────────────────────────────────────
    onProgress?.({ phase: "enriching", source: "ai", message: "🤖 AI scoring & enriching leads...", percent: 90 });
    const enriched = await this.enrichment.enrichBatch(unique, { industry, country });

    // Apply source bonuses
    const boosted = enriched.map(lead => {
      const bonus = SOURCE_SCORE_BONUS[lead.source as string] || 0;
      lead.score = Math.min(100, lead.score + bonus);
      return lead;
    });

    onProgress?.({ phase: "complete", source: "system", message: `🎉 ${boosted.length} leads ready!`, percent: 100 });
    return boosted.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}

// Singleton
let instance: HunterService | null = null;
export function getHunterService(): HunterService {
  if (!instance) instance = new HunterService();
  return instance;
}
