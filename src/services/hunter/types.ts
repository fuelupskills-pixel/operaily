// OMNI-SIGMA 360 — Hunter Type Definitions

export interface HunterSearchParams {
  industry: string;
  country: string;
  titles?: string[];
  limit?: number;
  deepSearch?: boolean;
}

export interface HunterSearchProgress {
  phase: "searching" | "deduplicating" | "enriching" | "complete" | "error";
  source: "apollo" | "linkedin" | "web" | "deep" | "ai" | "system";
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
  source: "apollo" | "linkedin" | "web_scraper" | "deep_search";
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
}
