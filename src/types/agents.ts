export type AgentDepartment = 'management' | 'research' | 'content' | 'social' | 'sales' | 'qc' | 'analytics' | 'video';

export type AgentStatus = 'idle' | 'working' | 'paused' | 'offline';

export interface AIAgent {
  id: string;
  org_id: string;
  name: string;
  role: string;
  department: AgentDepartment;
  description: string | null;
  system_prompt: string | null;
  status: AgentStatus;
  avatar_url: string | null;
  capabilities: string[];
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'pending' | 'running' | 'completed' | 'failed' | 'needs_review';

export interface AITask {
  id: string;
  org_id: string;
  assigned_to: string | null;
  parent_task_id: string | null;
  title: string;
  description: string | null;
  input_data: Record<string, any>;
  status: TaskStatus;
  priority: number;
  started_at: string | null;
  completed_at: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export type ArtifactType = 'research_report' | 'copy' | 'creative' | 'video' | 'data_analysis' | 'video_script' | 'video_analytics';

export interface AIArtifact {
  id: string;
  task_id: string;
  agent_id: string;
  type: ArtifactType;
  content: any;
  media_urls: string[];
  metadata: Record<string, any>;
  created_at: string;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

export interface AIApproval {
  id: string;
  org_id: string;
  artifact_id: string;
  status: ApprovalStatus;
  reviewer_id: string | null;
  feedback: string | null;
  reviewed_at: string | null;
  created_at: string;
}
