// OMNI-SIGMA 360 — Individual Lead API
// GET    /api/leads/[id] — Fetch one lead
// PATCH  /api/leads/[id] — Update a lead (status, score, notes, etc.)
// DELETE /api/leads/[id] — Archive (soft-delete) a lead

import { NextRequest, NextResponse } from "next/server";
import { getLeadService } from "@/services/leads";

// ─── GET /api/leads/[id] ─────────────────────────────────────────────────────
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leadService = getLeadService();
    const lead = await leadService.getById(params.id);

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error("[API/Leads/GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PATCH /api/leads/[id] ────────────────────────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const leadService = getLeadService();

    // Allow updating any writable fields
    const allowedFields = [
      "firstName", "lastName", "email", "phone", "whatsapp",
      "designation", "companyName", "website", "address", "city",
      "country", "industry", "linkedinUrl", "twitterHandle", "facebookUrl",
      "leadScore", "status", "source", "personalizedHook", "aiSummary",
    ];

    const updates: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updated = await leadService.update(params.id, updates as any);

    if (!updated) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead: updated });
  } catch (error) {
    console.error("[API/Leads/PATCH] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── DELETE /api/leads/[id] ───────────────────────────────────────────────────
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leadService = getLeadService();
    const success = await leadService.archive(params.id);

    if (!success) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Lead archived" });
  } catch (error) {
    console.error("[API/Leads/DELETE] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
