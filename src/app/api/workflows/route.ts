// OMNI-SIGMA 360 — Workflows API Route
// GET /api/workflows — List all workflows
// POST /api/workflows — Create/update a workflow

import { NextRequest, NextResponse } from "next/server";
import { getWorkflowEngine } from "@/services/workflows/engine";

export async function GET() {
  try {
    const engine = getWorkflowEngine();
    const workflows = engine.listWorkflows();
    return NextResponse.json({ success: true, workflows });
  } catch (error) {
    console.error("[API/Workflows] List error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const engine = getWorkflowEngine();
    const workflow = engine.saveWorkflow(body);
    return NextResponse.json({ success: true, workflow }, { status: 201 });
  } catch (error) {
    console.error("[API/Workflows] Save error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
