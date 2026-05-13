// OMNI-SIGMA 360 — Workflow Execution API
// POST /api/workflows/execute — Execute a workflow for a lead

import { NextRequest, NextResponse } from "next/server";
import { getWorkflowEngine } from "@/services/workflows/engine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowId, lead } = body;

    if (!workflowId) {
      return NextResponse.json({ error: "workflowId is required" }, { status: 400 });
    }

    const engine = getWorkflowEngine();
    const execution = await engine.executeWorkflow(workflowId, lead || {
      id: "demo_lead_001",
      name: "Hans Mueller",
      firstName: "Hans",
      lastName: "Mueller",
      email: "h.mueller@biopharmimp.de",
      phone: "+49 170 1234567",
      company: "BioPharm Import GmbH",
      companyName: "BioPharm Import GmbH",
      designation: "CEO",
    });

    return NextResponse.json({ success: true, execution });
  } catch (error) {
    console.error("[API/Workflows] Execute error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Execution failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const engine = getWorkflowEngine();
    const executions = engine.listExecutions();
    return NextResponse.json({ success: true, executions });
  } catch (error) {
    console.error("[API/Workflows] List executions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
