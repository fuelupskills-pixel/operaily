import { BaseAgent } from './base';
import { AITask } from '@/types/agents';
import { AIProvider } from '@/services/ai/provider';
export class TrendResearchAgent extends BaseAgent {
  async execute(task: AITask): Promise<void> {
    try {
      await this.updateTaskStatus(task.id, 'running');

      // AI Provider used directly
      const prompt = `
        You are a Trend Research Agent for OMNI-SIGMA 360.
        Your task: ${task.title}
        Context: ${task.description || ''}
        Input: ${JSON.stringify(task.input_data)}

        Research daily industry trends related to the above. 
        Provide a structured report in JSON format with:
        - trending_topics (list)
        - viral_content_ideas (list)
        - hashtags (list)
        - sentiment_analysis (string)
      `;

      const text = await AIProvider.generateText({ prompt });
      
      // Extract JSON from response (handling potential markdown)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const report = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw_text: text };

      await this.createArtifact(task.id, 'research_report', report);
      
      // Auto-trigger Copywriting Agent if applicable
      // (This would normally be handled by the CAIO or a workflow engine)

      await this.updateTaskStatus(task.id, 'completed');
      await this.logActivity(null, 'Research Completed', `Generated trend report for "${task.title}".`);
    } catch (error: any) {
      console.error('Research Agent Error:', error);
      await this.updateTaskStatus(task.id, 'failed', error.message);
    }
  }
}
