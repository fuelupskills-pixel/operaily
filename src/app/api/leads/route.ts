// OMNI-SIGMA 360 — Leads API Route
// GET /api/leads — List leads with filters
// POST /api/leads — Create a new lead

import { NextRequest, NextResponse } from "next/server";
import { getLeadService } from "@/services/leads";
import type { LeadInput, LeadFilters } from "@/services/leads";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadService = getLeadService();

    const filters: LeadFilters = {
      status: searchParams.get("status") || undefined,
      source: searchParams.get("source") || undefined,
      country: searchParams.get("country") || undefined,
      industry: searchParams.get("industry") || undefined,
      minScore: searchParams.get("minScore") ? Number(searchParams.get("minScore")) : undefined,
      maxScore: searchParams.get("maxScore") ? Number(searchParams.get("maxScore")) : undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 25,
      sortBy: searchParams.get("sortBy") || "leadScore",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    };

    const result = await leadService.list(filters);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("[API/Leads] List error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const leadService = getLeadService();

    const input: LeadInput = {
      firstName: body.firstName || "",
      lastName: body.lastName || "",
      email: body.email || null,
      phone: body.phone || null,
      whatsapp: body.whatsapp || null,
      designation: body.designation || null,
      companyName: body.companyName || null,
      website: body.website || null,
      address: body.address || null,
      city: body.city || null,
      country: body.country || null,
      industry: body.industry || null,
      linkedinUrl: body.linkedinUrl || null,
      twitterHandle: body.twitterHandle || null,
      facebookUrl: body.facebookUrl || null,
      leadScore: body.leadScore || 0,
      status: body.status || "new",
      source: body.source || "manual",
      sourceId: body.sourceId || null,
      personalizedHook: body.personalizedHook || null,
      aiSummary: body.aiSummary || null,
    };

    const lead = await leadService.create(input);

    return NextResponse.json({
      success: true,
      lead,
    }, { status: 201 });
  } catch (error) {
    console.error("[API/Leads] Create error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
