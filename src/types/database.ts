// OMNI-SIGMA 360 — TypeScript Type Definitions
// Lead & Enrichment Types

export type LeadStatus = 'new' | 'contacted' | 'engaged' | 'qualified' | 'meeting_set' | 'won' | 'lost' | 'archived';
export type LeadSource = 'apollo' | 'linkedin' | 'web_scraper' | 'manual' | 'ads' | 'referral' | 'import';
export type Channel = 'whatsapp' | 'email' | 'sms' | 'voice' | 'webchat';

export interface Lead {
  id: string;
  org_id: string;
  assigned_to: string | null;
  first_name: string | null;
  last_name: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  designation: string | null;
  company_name: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  industry: string | null;
  linkedin_url: string | null;
  twitter_handle: string | null;
  facebook_url: string | null;
  lead_score: number;
  status: LeadStatus;
  source: LeadSource | null;
  source_id: string | null;
  personalized_hook: string | null;
  ai_summary: string | null;
  last_contacted_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface LeadEnrichment {
  id: string;
  lead_id: string;
  source: string;
  data: Record<string, unknown>;
  confidence: number;
  enriched_at: string;
}

export interface HunterSearch {
  id: string;
  org_id: string;
  user_id: string;
  query_industry: string;
  query_country: string;
  query_params: Record<string, unknown>;
  status: 'pending' | 'searching' | 'enriching' | 'completed' | 'failed';
  total_raw: number;
  total_enriched: number;
  total_imported: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface HunterResult {
  id: string;
  search_id: string;
  lead_id: string | null;
  raw_data: Record<string, unknown>;
  source: string;
  is_duplicate: boolean;
  imported: boolean;
  created_at: string;
}

// Workflow Engine Types

export type WorkflowNodeType =
  | 'trigger' | 'condition' | 'delay' | 'split'
  | 'send_whatsapp' | 'send_email' | 'send_sms'
  | 'ai_voice_call' | 'ai_generate_video' | 'ai_generate_image' | 'ai_generate_text'
  | 'update_lead' | 'add_tag' | 'move_pipeline' | 'assign_user'
  | 'book_meeting' | 'webhook' | 'code';

export type WorkflowTriggerType = 'new_lead' | 'lead_score' | 'lead_status' | 'schedule' | 'manual' | 'webhook';

export interface Workflow {
  id: string;
  org_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  trigger_type: WorkflowTriggerType | null;
  trigger_config: Record<string, unknown>;
  canvas_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WorkflowNode {
  id: string;
  workflow_id: string;
  node_type: WorkflowNodeType;
  label: string | null;
  config: Record<string, unknown>;
  position_x: number;
  position_y: number;
  created_at: string;
}

export interface WorkflowEdge {
  id: string;
  workflow_id: string;
  source_node_id: string;
  target_node_id: string;
  condition_key: string | null;
  label: string | null;
  created_at: string;
}

export type ExecutionStatus = 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  lead_id: string | null;
  status: ExecutionStatus;
  current_node_id: string | null;
  context: Record<string, unknown>;
  started_at: string;
  completed_at: string | null;
  error: string | null;
}

// Conversation & Message Types

export interface Conversation {
  id: string;
  org_id: string;
  lead_id: string;
  channel: Channel;
  status: 'open' | 'closed' | 'archived';
  last_message_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  direction: 'inbound' | 'outbound';
  sender_type: 'lead' | 'user' | 'ai' | 'system';
  sender_id: string | null;
  content_type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'template';
  content: string | null;
  media_url: string | null;
  metadata: Record<string, unknown>;
  external_id: string | null;
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  created_at: string;
}

// Campaign & Ad Types

export interface Campaign {
  id: string;
  org_id: string;
  platform: 'meta' | 'google' | 'tiktok';
  external_id: string | null;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
  budget_daily: number | null;
  budget_total: number | null;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  settings: Record<string, unknown>;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

// Organization & User Types

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  settings: Record<string, unknown>;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  org_id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  auth_uid: string | null;
  preferences: Record<string, unknown>;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

// Pipeline Types

export interface Pipeline {
  id: string;
  org_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
}

export interface PipelineStage {
  id: string;
  pipeline_id: string;
  lead_id: string | null;
  name: string;
  position: number;
  deal_value: number;
  moved_at: string;
}

// Activity Types

export type ActivityType =
  | 'note' | 'call' | 'email_sent' | 'email_received'
  | 'whatsapp_sent' | 'whatsapp_received' | 'sms_sent'
  | 'meeting_scheduled' | 'meeting_completed'
  | 'status_change' | 'score_change' | 'tag_added' | 'tag_removed'
  | 'workflow_triggered' | 'ai_action';

export interface Activity {
  id: string;
  org_id: string;
  lead_id: string | null;
  user_id: string | null;
  type: ActivityType;
  title: string | null;
  description: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Calendar Types

export interface CalendarEvent {
  id: string;
  org_id: string;
  user_id: string;
  lead_id: string | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  meeting_link: string | null;
  external_id: string | null;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  created_at: string;
}
