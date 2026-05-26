// OMNI-SIGMA 360 — Global Lead Intelligence Agent API
// POST /api/hunter/search
// Full pipeline: multi-source search → dedup → AI enrich → score → return
// Sources: Apollo, LinkedIn, Trade Portals, Gov Tenders, Import/Export DB,
//          Pharma Directories, B2B Dirs, Web Crawling, Deep Search

import { NextRequest, NextResponse } from "next/server";
import { getHunterService } from "@/services/hunter";
import type { EnrichedLead } from "@/services/hunter/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      industry,
      country,
      titles,
      limit,
      deepSearch,
      sources,
      apiKeys
    } = body;

    if (!industry || !country) {
      return NextResponse.json(
        { error: "industry and country are required" },
        { status: 400 }
      );
    }

    const hunter = getHunterService();
    const progressLog: Array<{
      phase: string;
      source: string;
      message: string;
      percent: number;
      timestamp: string;
    }> = [];

    const results: EnrichedLead[] = await hunter.search(
      {
        industry,
        country,
        titles,
        limit: limit || 60,
        deepSearch: deepSearch || false,
        sources: sources || ["apollo", "linkedin", "web", "trade_portals", "government", "pharma_dir", "import_export"],
        apiKeys: apiKeys || {},
      },
      (progress) => {
        progressLog.push({
          phase: progress.phase,
          source: progress.source,
          message: progress.message,
          percent: progress.percent,
          timestamp: new Date().toISOString(),
        });
      }
    );

    // Compute comprehensive stats by source
    const sourceGroups = results.reduce<Record<string, number>>((acc, r) => {
      acc[r.source] = (acc[r.source] || 0) + 1;
      return acc;
    }, {});

    const stats = {
      totalFound: results.length,
      // Contact availability stats
      withEmail: results.filter(r => r.email).length,
      withPhone: results.filter(r => r.phone).length,
      withLinkedIn: results.filter(r => r.linkedinUrl).length,
      withWebsite: results.filter(r => r.website).length,
      withWhatsApp: results.filter(r => r.whatsapp).length,
      // Quality stats
      hotLeads: results.filter(r => r.score >= 70).length,
      verifiedEmails: results.filter(r => r.emailVerified).length,
      averageScore: results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
        : 0,
      // Source breakdown
      sourceBreakdown: {
        apollo: sourceGroups["apollo"] || 0,
        linkedin: sourceGroups["linkedin"] || 0,
        web: (sourceGroups["web_scraper"] || 0) + (sourceGroups["deep_search"] || 0),
        deep: sourceGroups["deep_search"] || 0,
        tradePortals: sourceGroups["trade_portal"] || 0,
        governmentTenders: sourceGroups["government_tender"] || 0,
        importExport: sourceGroups["import_database"] || 0,
        pharmaDirectory: sourceGroups["pharma_directory"] || 0,
        b2b: (sourceGroups["indiamart"] || 0) + (sourceGroups["tradeindia"] || 0) +
             (sourceGroups["justdial"] || 0) + (sourceGroups["alibaba"] || 0),
      },
    };

    return NextResponse.json({
      success: true,
      query: { industry, country, deepSearch, sourcesUsed: Object.keys(sourceGroups) },
      stats,
      results,
      progressLog,
    });

  } catch (error) {
    console.error("[API/Hunter/Search] Error:", error);
    return NextResponse.json(
      { error: "Internal server error during lead hunt" },
      { status: 500 }
    );
  }
}
