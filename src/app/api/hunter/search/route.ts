// OMNI-SIGMA 360 — Global Lead Intelligence Agent API v3
// POST /api/hunter/search
// 15 Platforms: Apollo, LinkedIn, Social (IG/WA/TikTok/TG), Trade Portals,
// Gov Tenders, Pharma Dirs, Import/Export DB, IndiaMART/B2B, Yellow Pages,
// Google Maps, Industry Forums, Europages/Kompass, Chamber of Commerce, Web, Deep Search

import { NextRequest, NextResponse } from "next/server";
import { getHunterService } from "@/services/hunter";
import type { EnrichedLead } from "@/services/hunter/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { industry, country, titles, limit, deepSearch, sources, apiKeys } = body;

    if (!industry || !country) {
      return NextResponse.json(
        { error: "industry and country are required" },
        { status: 400 }
      );
    }

    const hunter = getHunterService();
    const progressLog: Array<{ phase: string; source: string; message: string; percent: number; timestamp: string }> = [];

    const results: EnrichedLead[] = await hunter.search(
      {
        industry,
        country,
        titles,
        limit: limit || 80,
        deepSearch: deepSearch || false,
        sources: sources || [
          "apollo", "linkedin", "social", "trade_portals", "government",
          "pharma_dir", "import_export", "indiamart", "yellow_pages",
          "google_maps", "forums", "europages", "chamber", "web",
        ],
        apiKeys: apiKeys || {},
      },
      (progress) => {
        progressLog.push({ ...progress, timestamp: new Date().toISOString() });
      }
    );

    // Compute stats by source
    const sg = results.reduce<Record<string, number>>((acc, r) => {
      acc[r.source] = (acc[r.source] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      totalFound: results.length,
      withEmail:    results.filter(r => r.email).length,
      withPhone:    results.filter(r => r.phone).length,
      withLinkedIn: results.filter(r => r.linkedinUrl).length,
      withWebsite:  results.filter(r => r.website).length,
      withWhatsApp: results.filter(r => r.whatsapp).length,
      withSocial:   results.filter(r => r.linkedinUrl || r.twitterHandle || r.facebookUrl || (r as any).instagramHandle).length,
      hotLeads:     results.filter(r => r.score >= 70).length,
      verifiedEmails: results.filter(r => r.emailVerified).length,
      averageScore: results.length > 0
        ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
        : 0,
      sourceBreakdown: {
        apollo:            sg["apollo"]              || 0,
        linkedin:          sg["linkedin"]            || 0,
        social:            sg["social_media"]        || 0,
        tradePortals:      sg["trade_portal"]        || 0,
        governmentTenders: sg["government_tender"]   || 0,
        importExport:      sg["import_database"]     || 0,
        pharmaDirectory:   sg["pharma_directory"]    || 0,
        b2b:               (sg["indiamart"]||0) + (sg["tradeindia"]||0) + (sg["justdial"]||0) + (sg["alibaba"]||0),
        yellowPages:       sg["yellow_pages"]        || 0,
        googleMaps:        sg["google_maps"]         || 0,
        forums:            sg["industry_forum"]      || 0,
        europages:         sg["europages_kompass"]   || 0,
        chamber:           sg["chamber_of_commerce"] || 0,
        web:               (sg["web_scraper"]||0) + (sg["deep_search"]||0),
      },
    };

    return NextResponse.json({
      success: true,
      query: { industry, country, deepSearch, sourcesUsed: Object.keys(sg) },
      stats,
      results,
      progressLog,
    });

  } catch (error) {
    console.error("[API/Hunter/Search] Error:", error);
    return NextResponse.json({ error: "Internal server error during lead hunt" }, { status: 500 });
  }
}
