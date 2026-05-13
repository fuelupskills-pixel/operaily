// OMNI-SIGMA 360 — Leads Stats API Route
// GET /api/leads/stats — Get lead counts and statistics

import { NextResponse } from "next/server";
import { getLeadService } from "@/services/leads";

export async function GET() {
  try {
    const leadService = getLeadService();
    const [statusCounts, totalCount] = await Promise.all([
      leadService.getStatusCounts(),
      leadService.getCount(),
    ]);

    return NextResponse.json({
      success: true,
      total: totalCount,
      byStatus: statusCounts,
    });
  } catch (error) {
    console.error("[API/Leads/Stats] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
