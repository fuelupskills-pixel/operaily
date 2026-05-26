// OMNI-SIGMA 360 — Individual Workflow API
// GET    /api/workflows/[id] — Fetch one workflow config
// PATCH  /api/workflows/[id] — Update workflow details (name, nodes, edges, etc.)
// DELETE /api/workflows/[id] — Delete a workflow

import { NextRequest, NextResponse } from "next/server";
import { getWorkflowEngine } from "@/services/workflows/engine";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const engine = getWorkflowEngine();
    const workflow = await engine.getWorkflow(params.id);

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, workflow });
  } catch (error) {
    console.error("[API/Workflows/GET] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const engine = getWorkflowEngine();

    // Check if the workflow exists first
    const existing = await engine.getWorkflow(params.id);
    if (!existing) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    // Merge parameters with existing ID
    const updated = await engine.saveWorkflow({
      ...body,
      id: params.id,
    });

    return NextResponse.json({ success: true, workflow: updated });
  } catch (error) {
    console.error("[API/Workflows/PATCH] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const engine = getWorkflowEngine();
    const existing = await engine.getWorkflow(params.id);
    if (!existing) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const success = await engine.deleteWorkflow(params.id);
    if (!success) {
      return NextResponse.json({ error: "Failed to delete workflow" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Workflow deleted" });
  } catch (error) {
    console.error("[API/Workflows/DELETE] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
