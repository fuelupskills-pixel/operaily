// OMNI-SIGMA 360 — Hunter Import API Route
// POST /api/hunter/import — Import enriched leads into the CRM

import { NextRequest, NextResponse } from "next/server";
import { getLeadService } from "@/services/leads";
import type { LeadInput } from "@/services/leads";
import type { EnrichedLead } from "@/services/hunter/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leads, orgId } = body as { leads: EnrichedLead[]; orgId?: string };

    if (!leads || !Array.isArray(leads) || leads.length === 0) {
      return NextResponse.json(
        { error: "leads array is required and must not be empty" },
        { status: 400 }
      );
    }

    const leadService = getLeadService();

    // Convert EnrichedLead to LeadInput
    const inputs: LeadInput[] = leads.map((lead) => ({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      whatsapp: lead.whatsapp,
      designation: lead.designation,
      companyName: lead.companyName,
      website: lead.website,
      address: lead.address,
      city: lead.city,
      country: lead.country,
      industry: lead.industry,
      linkedinUrl: lead.linkedinUrl,
      twitterHandle: lead.twitterHandle,
      facebookUrl: lead.facebookUrl,
      leadScore: lead.score,
      status: "new",
      source: lead.source,
      sourceId: lead.sourceId,
      personalizedHook: lead.personalizedHook,
      aiSummary: lead.aiSummary,
    }));

    const imported = await leadService.createBatch(inputs, orgId || "demo-org");

    return NextResponse.json({
      success: true,
      imported: imported.length,
      skippedDuplicates: leads.length - imported.length,
      leads: imported,
    });
  } catch (error) {
    console.error("[API/Hunter] Import error:", error);
    return NextResponse.json(
      { error: "Internal server error during lead import" },
      { status: 500 }
    );
  }
}
