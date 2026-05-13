// OMNI-SIGMA 360 — Workflow Execution Engine
// Executes workflow nodes sequentially following edges & conditions

import type {
  WorkflowDefinition, WorkflowNodeDef, WorkflowEdgeDef,
  WorkflowExecution, ExecutionLog, ExecutionStatus,
} from "./types";
import { executeNode } from "./node-executor";

// In-memory stores
const workflows: Map<string, WorkflowDefinition> = new Map();
const executions: Map<string, WorkflowExecution> = new Map();
let wfIdCounter = 1;
let execIdCounter = 1;

// Pre-seed default workflow
function ensureDefaults() {
  if (workflows.size > 0) return;
  const defaultWf = createDefaultPharmaWorkflow();
  workflows.set(defaultWf.id, defaultWf);
}

export class WorkflowEngine {
  // ─── CRUD ──────────────────────────────────────────
  listWorkflows(): WorkflowDefinition[] {
    ensureDefaults();
    return Array.from(workflows.values());
  }

  getWorkflow(id: string): WorkflowDefinition | null {
    ensureDefaults();
    return workflows.get(id) || null;
  }

  saveWorkflow(wf: Partial<WorkflowDefinition>): WorkflowDefinition {
    const now = new Date().toISOString();
    if (wf.id && workflows.has(wf.id)) {
      const existing = workflows.get(wf.id)!;
      const updated = { ...existing, ...wf, updatedAt: now };
      workflows.set(wf.id, updated);
      return updated;
    }
    const id = `wf_${String(wfIdCounter++).padStart(4, "0")}`;
    const created: WorkflowDefinition = {
      id,
      name: wf.name || "Untitled Workflow",
      description: wf.description || "",
      isActive: wf.isActive ?? false,
      triggerType: wf.triggerType || "manual",
      triggerConfig: wf.triggerConfig || {},
      nodes: wf.nodes || [],
      edges: wf.edges || [],
      createdAt: now,
      updatedAt: now,
    };
    workflows.set(id, created);
    return created;
  }

  deleteWorkflow(id: string): boolean {
    return workflows.delete(id);
  }

  // ─── EXECUTION ─────────────────────────────────────
  async executeWorkflow(
    workflowId: string,
    leadContext?: { id: string; name: string; email?: string; phone?: string; company?: string }
  ): Promise<WorkflowExecution> {
    ensureDefaults();
    const wf = workflows.get(workflowId);
    if (!wf) throw new Error(`Workflow ${workflowId} not found`);

    const execId = `exec_${String(execIdCounter++).padStart(6, "0")}`;
    const execution: WorkflowExecution = {
      id: execId,
      workflowId: wf.id,
      workflowName: wf.name,
      leadId: leadContext?.id || null,
      leadName: leadContext?.name || null,
      status: "running",
      currentNodeId: null,
      currentNodeLabel: null,
      context: { lead: leadContext || {} },
      logs: [],
      startedAt: new Date().toISOString(),
      completedAt: null,
      error: null,
    };
    executions.set(execId, execution);

    // Find the trigger node (entry point)
    const triggerNode = wf.nodes.find((n) => n.type === "trigger");
    if (!triggerNode) {
      execution.status = "failed";
      execution.error = "No trigger node found";
      execution.completedAt = new Date().toISOString();
      return execution;
    }

    // Execute the graph starting from trigger
    try {
      await this.executeFromNode(wf, execution, triggerNode.id);
      execution.status = "completed";
    } catch (err) {
      execution.status = "failed";
      execution.error = err instanceof Error ? err.message : String(err);
    }

    execution.completedAt = new Date().toISOString();
    return execution;
  }

  private async executeFromNode(
    wf: WorkflowDefinition,
    execution: WorkflowExecution,
    nodeId: string
  ): Promise<void> {
    const node = wf.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    execution.currentNodeId = node.id;
    execution.currentNodeLabel = node.label;

    const startTime = Date.now();
    const log: ExecutionLog = {
      id: `log_${Date.now()}_${node.id}`,
      nodeId: node.id,
      nodeLabel: node.label,
      nodeType: node.type,
      action: `Executing: ${node.label}`,
      status: "running",
      input: { ...node.config, lead: execution.context.lead },
      output: {},
      error: null,
      durationMs: 0,
      timestamp: new Date().toISOString(),
    };
    execution.logs.push(log);

    try {
      // Execute the node
      const result = await executeNode(node, execution.context);
      log.output = result.output;
      log.status = "success";
      log.action = result.action;
      log.durationMs = Date.now() - startTime;

      // Update context with node output
      execution.context = { ...execution.context, ...result.contextUpdates };

      // Determine next node(s) based on edges
      const outEdges = wf.edges.filter((e) => e.source === nodeId);

      if (outEdges.length === 0) return; // Terminal node

      if (node.type === "condition") {
        // For condition nodes, follow the matching edge
        const conditionResult = result.output.conditionResult as string || "true";
        const matchingEdge = outEdges.find((e) => e.conditionKey === conditionResult)
          || outEdges.find((e) => e.conditionKey === "default")
          || outEdges[0];
        if (matchingEdge) {
          await this.executeFromNode(wf, execution, matchingEdge.target);
        }
      } else {
        // For other nodes, follow all edges (typically just one)
        for (const edge of outEdges) {
          await this.executeFromNode(wf, execution, edge.target);
        }
      }
    } catch (err) {
      log.status = "failed";
      log.error = err instanceof Error ? err.message : String(err);
      log.durationMs = Date.now() - startTime;
      throw err;
    }
  }

  // ─── EXECUTION QUERIES ─────────────────────────────
  getExecution(id: string): WorkflowExecution | null {
    return executions.get(id) || null;
  }

  listExecutions(workflowId?: string): WorkflowExecution[] {
    const all = Array.from(executions.values());
    if (workflowId) return all.filter((e) => e.workflowId === workflowId);
    return all.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }
}

// ─── Default Pharma Workflow ─────────────────────────────────
function createDefaultPharmaWorkflow(): WorkflowDefinition {
  const now = new Date().toISOString();
  return {
    id: "wf_0001",
    name: "Pharma DE Auto-Close",
    description: "Automated outreach for Pharmaceutical Importers in Germany",
    isActive: true,
    triggerType: "new_lead",
    triggerConfig: { minScore: 70, industry: "Pharmaceutical" },
    nodes: [
      { id: "1", type: "trigger", label: "New Lead (Score ≥ 70)", config: { minScore: 70 }, position: { x: 300, y: 0 } },
      { id: "2", type: "ai_generate_video", label: "Generate AI Video", config: { template: "intro_30s", provider: "heygen" }, position: { x: 300, y: 120 } },
      { id: "3", type: "send_whatsapp", label: "Send WhatsApp", config: { messageTemplate: "Hi {{firstName}}, I created a short video for {{companyName}}. Check it out!" }, position: { x: 300, y: 240 } },
      { id: "4", type: "delay", label: "Wait 48 Hours", config: { duration: 48, unit: "hours" }, position: { x: 300, y: 360 } },
      { id: "5", type: "condition", label: "Reply Received?", config: { check: "reply_received" }, position: { x: 100, y: 480 } },
      { id: "6", type: "send_email", label: "Send Email Follow-up", config: { subject: "Following up — {{companyName}}", template: "follow_up_case_study" }, position: { x: 500, y: 480 } },
      { id: "7", type: "delay", label: "Wait 72 Hours", config: { duration: 72, unit: "hours" }, position: { x: 500, y: 600 } },
      { id: "8", type: "ai_voice_call", label: "AI Voice Cold Call", config: { script: "dynamic_pharma_pitch", provider: "vapi" }, position: { x: 500, y: 720 } },
      { id: "9", type: "ai_generate_text", label: "Auto-Closer AI", config: { task: "classify_intent", model: "gpt-4o-mini" }, position: { x: 100, y: 600 } },
      { id: "10", type: "book_meeting", label: "Book Meeting", config: { provider: "calcom", duration: 30 }, position: { x: 100, y: 720 } },
    ],
    edges: [
      { id: "e1-2", source: "1", target: "2" },
      { id: "e2-3", source: "2", target: "3" },
      { id: "e3-4", source: "3", target: "4" },
      { id: "e4-5", source: "4", target: "5", conditionKey: "reply_yes", label: "Reply" },
      { id: "e4-6", source: "4", target: "6", conditionKey: "reply_no", label: "No Reply" },
      { id: "e6-7", source: "6", target: "7" },
      { id: "e7-8", source: "7", target: "8", conditionKey: "reply_no", label: "No Reply" },
      { id: "e5-9", source: "5", target: "9" },
      { id: "e8-9", source: "8", target: "9", label: "Connected" },
      { id: "e9-10", source: "9", target: "10", conditionKey: "interested", label: "Interested" },
    ],
    createdAt: now,
    updatedAt: now,
  };
}

// Singleton
let engineInstance: WorkflowEngine | null = null;
export function getWorkflowEngine(): WorkflowEngine {
  if (!engineInstance) engineInstance = new WorkflowEngine();
  return engineInstance;
}
