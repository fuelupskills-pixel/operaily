// OMNI-SIGMA 360 — Hunter Search API Route
// POST /api/hunter/search — Start a new lead hunt
// Runs the full Hunter pipeline: search → dedup → enrich → return

import { NextRequest, NextResponse } from "next/server";
import { getHunterService } from "@/services/hunter";
import type { EnrichedLead } from "@/services/hunter/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { industry, country, titles, limit, deepSearch } = body;

    if (!industry || !country) {
      return NextResponse.json(
        { error: "industry and country are required" },
        { status: 400 }
      );
    }

    const hunter = getHunterService();
    const progressLog: Array<{ phase: string; message: string; percent: number; timestamp: string }> = [];

    const results: EnrichedLead[] = await hunter.search(
      { industry, country, titles, limit: limit || 50, deepSearch: deepSearch || false },
      (progress) => {
        progressLog.push({
          phase: progress.phase,
          message: progress.message,
          percent: progress.percent,
          timestamp: new Date().toISOString(),
        });
      }
    );

    // Compute stats
    const stats = {
      totalFound: results.length,
      sourceBreakdown: {
        apollo: results.filter((r) => r.source === "apollo").length,
        linkedin: results.filter((r) => r.source === "linkedin").length,
        web: results.filter((r) => r.source === "web_scraper").length,
        deep: results.filter((r) => r.source === "deep_search").length,
      },
      averageScore: results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length)
        : 0,
      hotLeads: results.filter((r) => r.score >= 70).length,
      verifiedEmails: results.filter((r) => r.emailVerified).length,
    };

    return NextResponse.json({
      success: true,
      query: { industry, country, deepSearch },
      stats,
      results,
      progressLog,
    });
  } catch (error) {
    console.error("[API/Hunter] Search error:", error);
    return NextResponse.json(
      { error: "Internal server error during lead hunt" },
      { status: 500 }
    );
  }
}
