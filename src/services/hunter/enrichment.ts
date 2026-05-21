// OMNI-SIGMA 360 — AI Enrichment Service
// Uses Google Gemini for lead scoring, personalization hooks, and company enrichment
// Falls back to heuristic scoring when API key not configured

import { AIProvider } from '@/services/ai/provider';
import type { RawLead, EnrichedLead } from "./types";

export class EnrichmentService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = true; // AIProvider handles key availability
  }

  async enrichBatch(
    leads: RawLead[],
    context: { industry: string; country: string }
  ): Promise<EnrichedLead[]> {
    if (this.isConfigured) {
      try {
        return await this.enrichWithAI(leads, context);
      } catch (error) {
        console.error("[Enrichment] Gemini error, falling back to heuristic:", error);
        return this.enrichHeuristic(leads, context);
      }
    }

    console.log("[Enrichment] No Gemini key, using heuristic scoring");
    return this.enrichHeuristic(leads, context);
  }

  private async enrichWithAI(
    leads: RawLead[],
    context: { industry: string; country: string }
  ): Promise<EnrichedLead[]> {
    // Process in batches of 5 to avoid token limits
    const batchSize = 5;
    const enriched: EnrichedLead[] = [];

    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize);
      const leadsContext = batch.map((l) => ({
        name: `${l.firstName} ${l.lastName}`,
        title: l.designation,
        company: l.companyName,
        city: l.city,
        hasEmail: !!l.email,
        hasPhone: !!l.phone,
        hasLinkedIn: !!l.linkedinUrl,
      }));

      const systemInstruction = `You are a B2B lead scoring AI for ${context.industry} in ${context.country}. For each lead, provide:
1. score (0-100): Based on title seniority, company relevance, data completeness
2. personalizedHook: A one-line personalized outreach hook
3. companySize: Estimated company size (Small/Medium/Large/Enterprise)
4. companyRevenue: Estimated annual revenue range
Return ONLY a valid JSON array matching input order.`;

      const prompt = JSON.stringify(leadsContext);
      
      const text = await AIProvider.generateText({ prompt, systemInstruction });
      let aiResults: Array<{
        score: number;
        personalizedHook: string;
        companySize: string;
        companyRevenue: string;
      }>;

      try {
        const parsed = JSON.parse(text);
        aiResults = parsed.leads || parsed.results || parsed;
      } catch {
        // If parsing fails, use heuristic for this batch
        const heuristic = this.enrichHeuristic(batch, context);
        enriched.push(...heuristic);
        continue;
      }

      for (let j = 0; j < batch.length; j++) {
        const lead = batch[j];
        const ai = aiResults[j] || { score: 50, personalizedHook: null, companySize: null, companyRevenue: null };

        enriched.push({
          ...lead,
          score: Math.min(100, Math.max(0, ai.score)),
          personalizedHook: ai.personalizedHook || null,
          aiSummary: `${lead.designation} at ${lead.companyName} - ${context.industry} in ${lead.city}, ${lead.country}`,
          emailVerified: !!lead.email, // Real verification would use ZeroBounce/NeverBounce
          companyRevenue: ai.companyRevenue || null,
          companySize: ai.companySize || null,
          recentNews: null,
          enrichmentConfidence: 0.85,
        });
      }
    }

    return enriched;
  }

  private enrichHeuristic(
    leads: RawLead[],
    context: { industry: string; country: string }
  ): EnrichedLead[] {
    return leads.map((lead) => {
      let score = 40; // Base score

      // Title seniority scoring
      const title = (lead.designation || "").toLowerCase();
      if (title.includes("ceo") || title.includes("founder") || title.includes("managing director")) score += 30;
      else if (title.includes("vp") || title.includes("vice president") || title.includes("director")) score += 25;
      else if (title.includes("head") || title.includes("chief")) score += 22;
      else if (title.includes("manager") || title.includes("lead")) score += 15;
      else if (title.includes("analyst") || title.includes("specialist")) score += 8;

      // Data completeness scoring
      if (lead.email) score += 8;
      if (lead.phone) score += 5;
      if (lead.whatsapp) score += 3;
      if (lead.linkedinUrl) score += 5;
      if (lead.website) score += 3;
      if (lead.companyName) score += 3;

      // Source reliability
      if (lead.source === "apollo") score += 3;
      else if (lead.source === "linkedin") score += 2;

      // Cap at 100
      score = Math.min(100, score);

      // Generate personalized hook
      const hooks = [
        `I noticed ${lead.companyName} is a key player in ${context.industry}. I'd love to explore how we can help accelerate your growth in ${context.country}.`,
        `${lead.firstName}, your work as ${lead.designation} at ${lead.companyName} caught my attention. I have insights on ${context.industry} trends that could benefit your operations.`,
        `Hi ${lead.firstName}, with ${lead.companyName}'s strong position in the ${context.country} market, I believe our solution could be a great fit for your team.`,
      ];
      const hookIndex = Math.abs(hashCode(lead.email || lead.firstName || "")) % hooks.length;

      return {
        ...lead,
        score,
        personalizedHook: hooks[hookIndex],
        aiSummary: `${lead.designation || "Professional"} at ${lead.companyName || "Unknown"} - ${context.industry} in ${lead.city || context.country}`,
        emailVerified: !!lead.email,
        companyRevenue: this.estimateRevenue(lead),
        companySize: this.estimateSize(lead),
        recentNews: null,
        enrichmentConfidence: 0.6,
      };
    });
  }

  private estimateRevenue(lead: RawLead): string {
    const title = (lead.designation || "").toLowerCase();
    if (title.includes("ceo") || title.includes("founder")) return "$10M - $50M";
    if (title.includes("vp") || title.includes("director")) return "$50M - $200M";
    return "$5M - $25M";
  }

  private estimateSize(lead: RawLead): string {
    const title = (lead.designation || "").toLowerCase();
    if (title.includes("ceo") || title.includes("founder")) return "50-200";
    if (title.includes("vp") || title.includes("director")) return "200-1000";
    return "10-100";
  }
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}
