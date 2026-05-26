// OMNI-SIGMA 360 — Hunter Type Definitions v3
// 15 Platform Data Sources

export interface HunterSearchParams {
  industry: string;
  country: string;
  titles?: string[];
  limit?: number;
  deepSearch?: boolean;
  sources?: string[];
  apiKeys?: Record<string, string>;
}

export interface HunterSearchProgress {
  phase: "searching" | "deduplicating" | "enriching" | "complete" | "error";
  source:
    | "apollo" | "linkedin" | "web" | "deep" | "ai" | "system"
    | "trade" | "government" | "pharma_dir" | "import_export" | "b2b"
    | "yellow_pages" | "google_maps" | "forums" | "europages" | "social" | "chamber";
  message: string;
  percent: number;
}

export interface RawLead {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  designation: string | null;
  companyName: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  industry: string | null;
  linkedinUrl: string | null;
  twitterHandle: string | null;
  facebookUrl: string | null;
  instagramHandle?: string | null;
  telegramHandle?: string | null;
  source:
    | "apollo" | "linkedin" | "web_scraper" | "deep_search"
    | "indiamart" | "justdial" | "tradeindia" | "alibaba" | "yellow_pages"
    | "government_tender" | "trade_portal" | "import_database" | "pharma_directory"
    | "google_maps" | "industry_forum" | "europages_kompass" | "social_media"
    | "chamber_of_commerce";
  sourceId: string | null;
  rawData: Record<string, unknown>;
}

export interface EnrichedLead extends RawLead {
  score: number; // 0-100
  personalizedHook: string | null;
  aiSummary: string | null;
  emailVerified: boolean;
  companyRevenue: string | null;
  companySize: string | null;
  recentNews: string | null;
  enrichmentConfidence: number; // 0-1
}

export interface ProviderSearchParams {
  industry: string;
  country: string;
  titles?: string[];
  limit?: number;
  sources?: string[];
  apiKeys?: Record<string, string>;
}

// ─── Source metadata for UI rendering ────────────────────────────────────────
export const SOURCE_META: Record<string, { label: string; emoji: string; group: string; color: string }> = {
  apollo:              { label: "Apollo.io",              emoji: "🎯", group: "data",       color: "#a78bfa" },
  linkedin:            { label: "LinkedIn",               emoji: "💼", group: "social",     color: "#60a5fa" },
  social_media:        { label: "Instagram/WhatsApp/TikTok", emoji: "📱", group: "social",  color: "#f472b6" },
  trade_portal:        { label: "Trade Portals",          emoji: "🏪", group: "trade",      color: "#fb923c" },
  government_tender:   { label: "Government Tenders",     emoji: "🏛️", group: "government", color: "#f87171" },
  pharma_directory:    { label: "Pharma/Medical Dirs",    emoji: "💊", group: "industry",   color: "#34d399" },
  import_database:     { label: "Import/Export DB",       emoji: "📦", group: "trade",      color: "#fbbf24" },
  indiamart:           { label: "IndiaMART / JustDial",   emoji: "🇮🇳", group: "b2b",       color: "#4ade80" },
  yellow_pages:        { label: "Yellow Pages",           emoji: "📒", group: "directory",  color: "#facc15" },
  google_maps:         { label: "Google Maps/Business",   emoji: "📍", group: "directory",  color: "#4ade80" },
  industry_forum:      { label: "Industry Forums",        emoji: "💬", group: "community",  color: "#94a3b8" },
  europages_kompass:   { label: "Europages / Kompass",    emoji: "🇪🇺", group: "directory",  color: "#818cf8" },
  chamber_of_commerce: { label: "Chamber of Commerce",   emoji: "🏢", group: "official",   color: "#e2a459" },
  web_scraper:         { label: "Web Crawling",           emoji: "🌐", group: "web",        color: "#22d3ee" },
  deep_search:         { label: "Deep Search",            emoji: "🕵️", group: "web",        color: "#c084fc" },
};
