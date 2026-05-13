"use client";

import React, { useCallback, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection,
  type Node,
  type Edge,
  Handle,
  Position,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Target,
  MessageSquare,
  Mail,
  Phone,
  Clock,
  GitBranch,
  Video,
  CalendarCheck,
  Sparkles,
  Play,
  Pause,
  Zap,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  Save,
} from "lucide-react";

/* ——— Custom Node ——— */
const nodeIcons: Record<string, React.ElementType> = {
  trigger: Target, send_whatsapp: MessageSquare, send_email: Mail,
  ai_voice_call: Phone, send_sms: Phone, delay: Clock,
  condition: GitBranch, ai_generate_video: Video, ai_generate_image: Video,
  ai_generate_text: Sparkles, book_meeting: CalendarCheck, split: GitBranch,
  update_lead: Zap, add_tag: Zap, move_pipeline: Zap, assign_user: Zap,
  webhook: Zap, code: Zap,
};

const nodeColors: Record<string, string> = {
  trigger: "#6366f1", send_whatsapp: "#25D366", send_email: "#3b82f6",
  ai_voice_call: "#06b6d4", send_sms: "#8b5cf6", delay: "#f59e0b",
  condition: "#a855f7", ai_generate_video: "#ef4444", ai_generate_image: "#f97316",
  ai_generate_text: "#f97316", book_meeting: "#10b981", split: "#a855f7",
  update_lead: "#64748b", add_tag: "#64748b", move_pipeline: "#64748b",
  assign_user: "#64748b", webhook: "#64748b", code: "#64748b",
};

function CustomNode({ data, selected }: NodeProps) {
  const nodeType = (data.nodeType || data.type) as string;
  const Icon = nodeIcons[nodeType] || Zap;
  const color = nodeColors[nodeType] || "#6366f1";
  const execStatus = data.execStatus as string | undefined;

  return (
    <div
      className={`px-4 py-3 rounded-xl border-2 min-w-[180px] transition-all duration-300 ${
        selected ? "shadow-lg" : ""
      } ${execStatus === "success" ? "!border-success/60" : execStatus === "running" ? "!border-warning/60" : execStatus === "failed" ? "!border-danger/60" : ""}`}
      style={{
        background: "rgba(13, 17, 23, 0.95)",
        borderColor: execStatus ? undefined : (selected ? color : `${color}33`),
        backdropFilter: "blur(12px)",
      }}
    >
      <Handle type="target" position={Position.Top} className="!w-3 !h-3 !border-2 !bg-surface" style={{ borderColor: color }} />
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 relative" style={{ background: `${color}20` }}>
          <Icon className="w-4 h-4" style={{ color }} />
          {execStatus === "success" && <CheckCircle2 className="w-3.5 h-3.5 text-success absolute -top-1 -right-1" />}
          {execStatus === "running" && <Loader2 className="w-3.5 h-3.5 text-warning absolute -top-1 -right-1 animate-spin" />}
          {execStatus === "failed" && <XCircle className="w-3.5 h-3.5 text-danger absolute -top-1 -right-1" />}
        </div>
        <div>
          <p className="text-xs font-semibold text-foreground">{data.label as string}</p>
          <p className="text-[10px] text-muted-foreground">{data.description as string}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !border-2 !bg-surface" style={{ borderColor: color }} />
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

interface ExecutionLog {
  id: string;
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  action: string;
  status: string;
  durationMs: number;
  timestamp: string;
  error: string | null;
}

interface ExecutionResult {
  id: string;
  status: string;
  workflowName: string;
  leadName: string | null;
  logs: ExecutionLog[];
  startedAt: string;
  completedAt: string | null;
}

const toolbox = [
  { type: "trigger", label: "Trigger" },
  { type: "send_whatsapp", label: "WhatsApp" },
  { type: "send_email", label: "Email" },
  { type: "send_sms", label: "SMS" },
  { type: "ai_voice_call", label: "Voice Call" },
  { type: "delay", label: "Delay" },
  { type: "condition", label: "Condition" },
  { type: "ai_generate_video", label: "AI Video" },
  { type: "ai_generate_text", label: "AI Text" },
  { type: "book_meeting", label: "Book Meeting" },
  { type: "webhook", label: "Webhook" },
];

export default function WorkflowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [execution, setExecution] = useState<ExecutionResult | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState("Pharma DE Auto-Close");
  const [isLoading, setIsLoading] = useState(true);

  // Load workflow from API
  useEffect(() => {
    async function loadWorkflow() {
      try {
        const res = await fetch("/api/workflows");
        const data = await res.json();
        if (data.workflows && data.workflows.length > 0) {
          const wf = data.workflows[0];
          setWorkflowId(wf.id);
          setWorkflowName(wf.name);

          const flowNodes: Node[] = wf.nodes.map((n: Record<string, unknown>) => ({
            id: n.id as string,
            type: "custom",
            position: n.position as { x: number; y: number },
            data: { label: n.label, description: (n.config as Record<string, unknown>)?.description || n.type, nodeType: n.type },
          }));

          const flowEdges: Edge[] = wf.edges.map((e: Record<string, unknown>) => ({
            id: e.id as string,
            source: e.source as string,
            target: e.target as string,
            label: e.label as string || undefined,
            animated: true,
            style: { stroke: "#6366f1" },
          }));

          setNodes(flowNodes as any);
          setEdges(flowEdges as any);
        }
      } catch (err) {
        console.error("Failed to load workflow:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadWorkflow();
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: "#6366f1" } }, eds)),
    [setEdges]
  );

  // Execute workflow
  const handleExecute = async () => {
    if (!workflowId || isExecuting) return;
    setIsExecuting(true);
    setExecution(null);
    setShowLogs(true);

    // Reset node statuses
    setNodes((nds: any) => nds.map((n: any) => ({ ...n, data: { ...n.data, execStatus: undefined } })));
...
        setNodes((nds: any) =>
          nds.map((n: any) => ({
            ...n,
            data: { ...n.data, execStatus: logMap.get(n.id) || undefined },
          }))
        );
      }
    } catch (err) {
      console.error("Execution failed:", err);
    } finally {
      setIsExecuting(false);
    }
  };

  const statusIcon = (status: string) => {
    if (status === "success") return <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
    if (status === "failed") return <XCircle className="w-3.5 h-3.5 text-danger" />;
    if (status === "running") return <Loader2 className="w-3.5 h-3.5 text-warning animate-spin" />;
    if (status === "waiting") return <Clock className="w-3.5 h-3.5 text-accent" />;
    return <AlertCircle className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading workflow...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="gradient-text">Automation Canvas</span> ⚡
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {workflowName} — drag-and-drop workflow builder
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExecute}
            disabled={isExecuting || !workflowId}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              isExecuting
                ? "bg-warning/10 text-warning"
                : "bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
            } disabled:opacity-50`}
          >
            {isExecuting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Executing...</>
            ) : (
              <><Play className="w-4 h-4" /> Execute Workflow</>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-4" style={{ height: "calc(100vh - 220px)" }}>
        {/* Node Toolbox */}
        <div className="w-44 shrink-0 glass-card p-3 space-y-1.5 overflow-y-auto">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">Nodes</p>
          {toolbox.map((node) => {
            const Icon = nodeIcons[node.type] || Zap;
            const color = nodeColors[node.type] || "#6366f1";
            return (
              <div
                key={node.type}
                draggable
                className="flex items-center gap-2 px-2.5 py-2 rounded-xl border border-border-subtle hover:border-border cursor-grab active:cursor-grabbing transition-all hover:bg-surface-hover"
              >
                <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: `${color}20` }}>
                  <Icon className="w-3 h-3" style={{ color }} />
                </div>
                <span className="text-[11px] font-medium">{node.label}</span>
              </div>
            );
          })}
        </div>

        {/* Canvas + Logs */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Canvas */}
          <div className={`rounded-2xl overflow-hidden border border-border bg-surface ${showLogs ? "flex-1" : "flex-1"}`} style={{ minHeight: showLogs ? "50%" : "100%" }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              fitView
              className="canvas-grid"
              defaultEdgeOptions={{ type: "smoothstep" }}
            >
              <Background color="rgba(99,102,241,0.06)" gap={20} />
              <Controls className="!bg-surface !border-border !rounded-xl !shadow-xl" />
              <MiniMap
                nodeColor={() => "#6366f1"}
                maskColor="rgba(6, 8, 13, 0.8)"
                className="!bg-surface !border-border !rounded-xl"
              />
            </ReactFlow>
          </div>

          {/* Execution Logs Panel */}
          {showLogs && (
            <div className="glass-card overflow-hidden animate-slide-in-up" style={{ maxHeight: "45%" }}>
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary" />
                  <span className="text-xs font-semibold">Execution Log</span>
                  {execution && (
                    <span className={`badge ${
                      execution.status === "completed" ? "bg-success/15 text-success" :
                      execution.status === "failed" ? "bg-danger/15 text-danger" :
                      "bg-warning/15 text-warning"
                    }`}>
                      {execution.status}
                    </span>
                  )}
                  {execution?.leadName && (
                    <span className="text-xs text-muted-foreground">• {execution.leadName}</span>
                  )}
                </div>
                <button onClick={() => setShowLogs(false)} className="p-1 rounded hover:bg-surface-hover">
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="overflow-y-auto p-2" style={{ maxHeight: "calc(100% - 44px)" }}>
                {execution?.logs.map((log, i) => (
                  <div key={log.id} className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-surface-hover transition-colors">
                    <div className="mt-0.5">{statusIcon(log.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{log.nodeLabel}</span>
                        <span className="text-[10px] text-muted-foreground">{log.nodeType}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{log.action}</p>
                      {log.error && <p className="text-[11px] text-danger mt-0.5">{log.error}</p>}
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{log.durationMs}ms</span>
                  </div>
                ))}
                {(!execution || execution.logs.length === 0) && (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    {isExecuting ? "Executing workflow..." : "Click \"Execute Workflow\" to see logs here"}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Show logs toggle */}
          {!showLogs && execution && (
            <button
              onClick={() => setShowLogs(true)}
              className="glass-card px-4 py-2 flex items-center justify-between hover:border-primary/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">Last execution: {execution.logs.length} steps</span>
                <span className={`badge ${execution.status === "completed" ? "bg-success/15 text-success" : "bg-danger/15 text-danger"}`}>
                  {execution.status}
                </span>
              </div>
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
