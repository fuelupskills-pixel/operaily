import { BaseAgent } from './base';
import { AITask } from '@/types/agents';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export class CopywritingAgent extends BaseAgent {
  async execute(task: AITask): Promise<void> {
    try {
      await this.updateTaskStatus(task.id, 'running');

      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `
        You are an Expert Copywriting Agent for OMNI-SIGMA 360.
        Your task: ${task.title}
        Input Research: ${JSON.stringify(task.input_data)}

        Generate high-converting social media posts based on the research provided.
        Provide:
        - linkedin_post (string)
        - instagram_caption (string)
        - twitter_thread (list of strings)
        - blog_intro (string)
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const copy = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw_text: text };

      await this.createArtifact(task.id, 'copy', copy);
      
      // Mark as needs_review for the Human Approval layer
      await this.updateTaskStatus(task.id, 'needs_review');
      await this.logActivity(null, 'Copy Generated', `Drafted social posts for "${task.title}". Awaiting approval.`);
    } catch (error: any) {
      console.error('Copywriter Agent Error:', error);
      await this.updateTaskStatus(task.id, 'failed', error.message);
    }
  }
}
