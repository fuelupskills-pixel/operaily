// OMNI-SIGMA 360 — Workflow Engine Types

export type NodeType =
  | "trigger" | "condition" | "delay" | "split"
  | "send_whatsapp" | "send_email" | "send_sms"
  | "ai_voice_call" | "ai_generate_video" | "ai_generate_image" | "ai_generate_text"
  | "update_lead" | "add_tag" | "move_pipeline" | "assign_user"
  | "book_meeting" | "webhook" | "code";

export type ExecutionStatus = "pending" | "running" | "completed" | "failed" | "paused" | "waiting";

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  triggerType: string;
  triggerConfig: Record<string, unknown>;
  nodes: WorkflowNodeDef[];
  edges: WorkflowEdgeDef[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowNodeDef {
  id: string;
  type: NodeType;
  label: string;
  config: Record<string, unknown>;
  position: { x: number; y: number };
}

export interface WorkflowEdgeDef {
  id: string;
  source: string;
  target: string;
  conditionKey?: string;
  label?: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  leadId: string | null;
  leadName: string | null;
  status: ExecutionStatus;
  currentNodeId: string | null;
  currentNodeLabel: string | null;
  context: Record<string, unknown>;
  logs: ExecutionLog[];
  startedAt: string;
  completedAt: string | null;
  error: string | null;
}

export interface ExecutionLog {
  id: string;
  nodeId: string;
  nodeLabel: string;
  nodeType: NodeType;
  action: string;
  status: "success" | "failed" | "skipped" | "pending" | "running" | "waiting";
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error: string | null;
  durationMs: number;
  timestamp: string;
}

export interface ChannelMessage {
  channel: "whatsapp" | "email" | "sms" | "voice";
  to: string;
  content: string;
  mediaUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface ChannelResponse {
  success: boolean;
  messageId: string | null;
  provider: string;
  status: string;
  error: string | null;
}
