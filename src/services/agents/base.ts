import { AIAgent, AITask, AIArtifact, TaskStatus } from '@/types/agents';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase (assuming env vars are set)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Using service role for agent operations
const supabase = createClient(supabaseUrl, supabaseKey);

export abstract class BaseAgent {
  protected agent: AIAgent;
  protected orgId: string;

  constructor(agent: AIAgent) {
    this.agent = agent;
    this.orgId = agent.org_id;
  }

  abstract execute(task: AITask): Promise<void>;

  protected async updateTaskStatus(taskId: string, status: TaskStatus, error?: string) {
    const update: Partial<AITask> = { status, updated_at: new Date().toISOString() };
    if (status === 'running') update.started_at = new Date().toISOString();
    if (status === 'completed' || status === 'failed') update.completed_at = new Date().toISOString();
    if (error) update.error = error;

    await supabase.from('ai_tasks').update(update).eq('id', taskId);
  }

  protected async createArtifact(taskId: string, type: AIArtifact['type'], content: any, mediaUrls: string[] = []) {
    const { data, error } = await supabase.from('ai_artifacts').insert({
      task_id: taskId,
      agent_id: this.agent.id,
      type,
      content,
      media_urls: mediaUrls,
    }).select().single();

    if (error) throw error;
    return data;
  }

  protected async logActivity(leadId: string | null, title: string, description: string) {
    await supabase.from('activities').insert({
      org_id: this.orgId,
      lead_id: leadId,
      type: 'ai_action',
      title: `[${this.agent.role}] ${title}`,
      description,
      metadata: { agent_id: this.agent.id }
    });
  }
}
