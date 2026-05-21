// OMNI-SIGMA 360 — Workflow Execution Engine
// Executes workflow nodes sequentially following edges & conditions

import type {
  WorkflowDefinition, WorkflowNodeDef, WorkflowEdgeDef,
  WorkflowExecution, ExecutionLog, ExecutionStatus,
} from "./types";
import { executeNode } from "./node-executor";
import { createServerClient } from "@/lib/supabase/server";

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

// Helpers for Supabase
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return !!(
    url &&
    url.startsWith("http") &&
    key &&
    key !== "your_service_role_key" &&
    key !== "your_supabase_service_role_key"
  );
}

function stringToUuid(str: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(str)) return str;

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, "0");
  return `${hex}-1111-2222-3333-${hex.padEnd(12, "0")}`;
}

function isUuid(str: string | null | undefined): boolean {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

async function getOrResolveOrgUuid(supabase: any, orgId: string = "demo-org"): Promise<string> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(orgId)) {
    return orgId;
  }
  const { data: orgs } = await supabase.from("organizations").select("id").limit(1);
  if (orgs && orgs.length > 0) {
    return orgs[0].id;
  }
  const { data: newOrg } = await supabase
    .from("organizations")
    .insert({ name: "OperAIly Headquarters", slug: "operaily-hq" })
    .select("id")
    .single();
  if (newOrg) return newOrg.id;
  throw new Error("Could not resolve organization.");
}

async function fetchFullWorkflowFromSupabase(supabase: any, id: string): Promise<WorkflowDefinition | null> {
  const { data: wf, error: wfErr } = await supabase.from("workflows").select().eq("id", id).single();
  if (wfErr || !wf) return null;

  const { data: nodes } = await supabase.from("workflow_nodes").select().eq("workflow_id", id);
  const { data: edges } = await supabase.from("workflow_edges").select().eq("workflow_id", id);

  return {
    id: wf.id,
    name: wf.name,
    description: wf.description || "",
    isActive: wf.is_active || false,
    triggerType: wf.trigger_type || "manual",
    triggerConfig: wf.trigger_config || {},
    nodes: (nodes || []).map((n: any) => ({
      id: n.id,
      type: n.node_type,
      label: n.label || "",
      config: n.config || {},
      position: { x: n.position_x || 0, y: n.position_y || 0 },
    })),
    edges: (edges || []).map((e: any) => ({
      id: e.id,
      source: e.source_node_id,
      target: e.target_node_id,
      conditionKey: e.condition_key || undefined,
      label: e.label || undefined,
    })),
    createdAt: wf.created_at,
    updatedAt: wf.updated_at,
  };
}

export class WorkflowEngine {
  // ─── CRUD ──────────────────────────────────────────
  async listWorkflows(): Promise<WorkflowDefinition[]> {
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const uuidOrgId = await getOrResolveOrgUuid(supabase);
      const { data: wfs, error } = await supabase.from("workflows").select("id").eq("org_id", uuidOrgId);
      if (error || !wfs) return [];

      const results: WorkflowDefinition[] = [];
      for (const row of wfs) {
        const full = await fetchFullWorkflowFromSupabase(supabase, row.id);
        if (full) results.push(full);
      }
      return results;
    }

    ensureDefaults();
    return Array.from(workflows.values());
  }

  async getWorkflow(id: string): Promise<WorkflowDefinition | null> {
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      return fetchFullWorkflowFromSupabase(supabase, id);
    }

    ensureDefaults();
    return workflows.get(id) || null;
  }

  async saveWorkflow(wf: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const uuidOrgId = await getOrResolveOrgUuid(supabase);
      let wfId = wf.id;

      const dbWf = {
        name: wf.name || "Untitled Workflow",
        description: wf.description || "",
        is_active: wf.isActive ?? false,
        trigger_type: wf.triggerType || "manual",
        trigger_config: wf.triggerConfig || {},
        org_id: uuidOrgId,
      };

      if (wfId && isUuid(wfId)) {
        const { error } = await supabase.from("workflows").update(dbWf).eq("id", wfId);
        if (error) throw new Error(error.message);
      } else {
        const { data, error } = await supabase.from("workflows").insert(dbWf).select("id").single();
        if (error || !data) throw new Error(error?.message || "Failed to insert workflow");
        wfId = data.id;
      }

      // Sync nodes
      if (wf.nodes) {
        await supabase.from("workflow_nodes").delete().eq("workflow_id", wfId);
        const dbNodes = wf.nodes.map((n) => ({
          id: stringToUuid(n.id),
          workflow_id: wfId,
          node_type: n.type,
          label: n.label,
          config: n.config || {},
          position_x: n.position?.x || 0,
          position_y: n.position?.y || 0,
        }));
        await supabase.from("workflow_nodes").insert(dbNodes);
      }

      // Sync edges
      if (wf.edges) {
        await supabase.from("workflow_edges").delete().eq("workflow_id", wfId);
        const dbEdges = wf.edges.map((e) => ({
          workflow_id: wfId,
          source_node_id: stringToUuid(e.source),
          target_node_id: stringToUuid(e.target),
          condition_key: e.conditionKey || null,
          label: e.label || null,
        }));
        await supabase.from("workflow_edges").insert(dbEdges);
      }

      const saved = await fetchFullWorkflowFromSupabase(supabase, wfId!);
      if (!saved) throw new Error("Failed to retrieve saved workflow");
      return saved;
    }

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

  async deleteWorkflow(id: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const { error } = await supabase.from("workflows").delete().eq("id", id);
      return !error;
    }
    return workflows.delete(id);
  }

  // ─── EXECUTION ─────────────────────────────────────
  async executeWorkflow(
    workflowId: string,
    leadContext?: { id: string; name: string; email?: string; phone?: string; company?: string }
  ): Promise<WorkflowExecution> {
    ensureDefaults();
    
    // Check database if configured
    let wf: WorkflowDefinition | null = null;
    const supabase = isSupabaseConfigured() ? createServerClient() : null;

    if (supabase) {
      wf = await fetchFullWorkflowFromSupabase(supabase, workflowId);
    } else {
      wf = workflows.get(workflowId) || null;
    }

    if (!wf) throw new Error(`Workflow ${workflowId} not found`);

    const execId = supabase ? "" : `exec_${String(execIdCounter++).padStart(6, "0")}`;
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

    let dbExecId = "";
    if (supabase) {
      const triggerNode = wf.nodes.find((n) => n.type === "trigger");
      const { data, error } = await supabase
        .from("workflow_executions")
        .insert({
          workflow_id: wf.id,
          lead_id: isUuid(leadContext?.id) ? leadContext.id : null,
          status: "running",
          current_node_id: triggerNode ? stringToUuid(triggerNode.id) : null,
          context: { lead: leadContext || {} },
        })
        .select("id")
        .single();
      if (error || !data) throw new Error("Supabase execution insert failed: " + (error?.message || ""));
      dbExecId = data.id;
      execution.id = dbExecId;
    } else {
      executions.set(execId, execution);
    }

    // Find the trigger node (entry point)
    const triggerNode = wf.nodes.find((n) => n.type === "trigger");
    if (!triggerNode) {
      execution.status = "failed";
      execution.error = "No trigger node found";
      execution.completedAt = new Date().toISOString();
      
      if (supabase && dbExecId) {
        await supabase.from("workflow_executions").update({
          status: "failed",
          error: "No trigger node found",
          completed_at: execution.completedAt,
        }).eq("id", dbExecId);
      }
      return execution;
    }

    // Execute the graph starting from trigger
    try {
      await this.executeFromNode(wf, execution, triggerNode.id, dbExecId);
      if (execution.status !== "paused") {
        execution.status = "completed";
      }
    } catch (err) {
      execution.status = "failed";
      execution.error = err instanceof Error ? err.message : String(err);
    }

    if (execution.status !== "paused") {
      execution.completedAt = new Date().toISOString();
    }

    if (supabase && dbExecId) {
      await supabase.from("workflow_executions").update({
        status: execution.status,
        completed_at: execution.completedAt || null,
        error: execution.error,
        context: execution.context,
      }).eq("id", dbExecId);
    }

    return execution;
  }

  private async executeFromNode(
    wf: WorkflowDefinition,
    execution: WorkflowExecution,
    nodeId: string,
    dbExecId?: string
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

    const supabase = isSupabaseConfigured() ? createServerClient() : null;
    let logId = "";
    if (supabase && dbExecId) {
      await supabase.from("workflow_executions").update({
        current_node_id: stringToUuid(nodeId)
      }).eq("id", dbExecId);

      const { data } = await supabase.from("execution_logs").insert({
        execution_id: dbExecId,
        node_id: stringToUuid(nodeId),
        action: `Executing: ${node.label}`,
        status: "pending",
        input_data: { ...node.config, lead: execution.context.lead },
      }).select("id").single();
      if (data) logId = data.id;
    }

    try {
      // Execute the node
      const result = await executeNode(node, execution.context);
      log.output = result.output;
      log.status = "success";
      log.action = result.action;
      log.durationMs = Date.now() - startTime;

      if (supabase && logId) {
        await supabase.from("execution_logs").update({
          status: "success",
          action: result.action,
          output_data: result.output,
          duration_ms: log.durationMs,
        }).eq("id", logId);
      }

      // Update context with node output
      execution.context = { ...execution.context, ...result.contextUpdates };

      // Determine next node(s) based on edges
      const outEdges = wf.edges.filter((e) => e.source === nodeId);

      if (outEdges.length === 0) {
        if (execution.status !== "paused") {
          execution.status = "completed";
          execution.completedAt = new Date().toISOString();
          if (supabase && dbExecId) {
            await supabase.from("workflow_executions").update({
              status: "completed",
              completed_at: execution.completedAt,
            }).eq("id", dbExecId);
          }
        }
        return; // Terminal node
      }

      if (node.type === "delay") {
        const duration = (node.config.duration as number) || 1;
        const unit = (node.config.unit as string) || "hours";
        let delaySeconds = duration;
        if (unit === "minutes") delaySeconds = duration * 60;
        else if (unit === "hours") delaySeconds = duration * 3600;
        else if (unit === "days") delaySeconds = duration * 86400;

        const { scheduleDelay } = await import("./queue");
        for (const edge of outEdges) {
          await scheduleDelay(wf.id, execution.id, edge.target, delaySeconds, execution.context.lead, dbExecId);
        }

        execution.status = "paused";
        if (supabase && dbExecId) {
          await supabase.from("workflow_executions").update({
            status: "paused",
            context: execution.context,
          }).eq("id", dbExecId);
        } else {
          executions.set(execution.id, execution);
        }
        return; // Halt execution path and wait for delay queue
      }

      if (node.type === "condition") {
        // For condition nodes, follow the matching edge
        const conditionResult = result.output.conditionResult as string || "true";
        const matchingEdge = outEdges.find((e) => e.conditionKey === conditionResult)
          || outEdges.find((e) => e.conditionKey === "default")
          || outEdges[0];
        if (matchingEdge) {
          await this.executeFromNode(wf, execution, matchingEdge.target, dbExecId);
        }
      } else {
        // For other nodes, follow all edges (typically just one)
        for (const edge of outEdges) {
          await this.executeFromNode(wf, execution, edge.target, dbExecId);
        }
      }
    } catch (err) {
      log.status = "failed";
      log.error = err instanceof Error ? err.message : String(err);
      log.durationMs = Date.now() - startTime;

      if (supabase && logId) {
        await supabase.from("execution_logs").update({
          status: "failed",
          error: log.error,
          duration_ms: log.durationMs,
        }).eq("id", logId);
      }

      throw err;
    }
  }

  // ─── EXECUTION QUERIES ─────────────────────────────
  async getExecution(id: string): Promise<WorkflowExecution | null> {
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      const { data: exec } = await supabase.from("workflow_executions").select().eq("id", id).single();
      if (!exec) return null;
      const { data: logs } = await supabase.from("execution_logs").select().eq("execution_id", id).order("created_at", { ascending: true });
      const { data: wf } = await supabase.from("workflows").select("name").eq("id", exec.workflow_id).single();
      return {
        id: exec.id,
        workflowId: exec.workflow_id,
        workflowName: wf?.name || "Workflow",
        leadId: exec.lead_id,
        leadName: null,
        status: exec.status as ExecutionStatus,
        currentNodeId: exec.current_node_id,
        currentNodeLabel: null,
        context: exec.context,
        logs: (logs || []).map((l: any) => ({
          id: l.id,
          nodeId: l.node_id,
          nodeLabel: l.action,
          nodeType: "",
          action: l.action,
          status: l.status,
          input: l.input_data,
          output: l.output_data,
          error: l.error,
          durationMs: l.duration_ms || 0,
          timestamp: l.created_at,
        })),
        startedAt: exec.started_at,
        completedAt: exec.completed_at,
        error: exec.error,
      };
    }

    return executions.get(id) || null;
  }

  async listExecutions(workflowId?: string): Promise<WorkflowExecution[]> {
    if (isSupabaseConfigured()) {
      const supabase = createServerClient();
      let query = supabase.from("workflow_executions").select().order("started_at", { ascending: false });
      if (workflowId) {
        query = query.eq("workflow_id", workflowId);
      }
      const { data } = await query;
      const results = [];
      for (const exec of data || []) {
        const { data: wf } = await supabase.from("workflows").select("name").eq("id", exec.workflow_id).single();
        results.push({
          id: exec.id,
          workflowId: exec.workflow_id,
          workflowName: wf?.name || "Workflow",
          leadId: exec.lead_id,
          leadName: null,
          status: exec.status as ExecutionStatus,
          currentNodeId: exec.current_node_id,
          currentNodeLabel: null,
          context: exec.context,
          logs: [],
          startedAt: exec.started_at,
          completedAt: exec.completed_at,
          error: exec.error,
        });
      }
      return results;
    }

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
