import { BaseAgent } from './base';
import { AITask, AIAgent } from '@/types/agents';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export class CAIOAgent extends BaseAgent {
  async execute(task: AITask): Promise<void> {
    try {
      await this.updateTaskStatus(task.id, 'running');

      // 1. Analyze the goal (logic to be enhanced with Gemini)
      console.log(`CAIO executing: ${task.title}`);

      // 2. Delegate tasks to specialized agents
      // For now, let's assume a hardcoded flow: Research -> Copywriting
      
      // Find Trend Research Agent
      const { data: researcher } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('org_id', this.orgId)
        .eq('role', 'Trend Research Agent')
        .single();

      if (researcher) {
        await this.createSubTask(task.id, researcher.id, `Research trends for: ${task.title}`, task.input_data);
      }

      await this.updateTaskStatus(task.id, 'completed');
      await this.logActivity(null, 'Goal Orchestrated', `Deconstructed "${task.title}" into sub-tasks.`);
    } catch (error: any) {
      console.error('CAIO Error:', error);
      await this.updateTaskStatus(task.id, 'failed', error.message);
    }
  }

  private async createSubTask(parentId: string, agentId: string, title: string, inputData: any) {
    const { error } = await supabase.from('ai_tasks').insert({
      org_id: this.orgId,
      parent_task_id: parentId,
      assigned_to: agentId,
      title,
      input_data: inputData,
      status: 'pending'
    });

    if (error) throw error;
  }
}
