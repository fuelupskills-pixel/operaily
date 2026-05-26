// OMNI-SIGMA 360 — Individual Template API
// GET    /api/templates/[id] — Fetch one template
// PATCH  /api/templates/[id] — Update template details
// DELETE /api/templates/[id] — Delete a template

import { NextRequest, NextResponse } from "next/server";
import { getTemplateById, updateTemplate, deleteTemplate } from "@/services/templates";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = await getTemplateById(params.id);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error("[API/Templates/GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Check if the template exists first
    const template = await getTemplateById(params.id);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const updated = await updateTemplate(params.id, body);
    return NextResponse.json({ success: true, template: updated });
  } catch (error) {
    console.error("[API/Templates/PATCH] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = await getTemplateById(params.id);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const success = await deleteTemplate(params.id);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Template deleted" });
  } catch (error) {
    console.error("[API/Templates/DELETE] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
