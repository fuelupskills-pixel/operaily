import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export type AIModelType = "gemini" | "claude" | "deepseek" | "memo";

export interface GenerateTextOptions {
  prompt: string;
  systemInstruction?: string;
  modelOverride?: AIModelType;
}

export class AIProvider {
  /**
   * Generates text using the configured AI model.
   * If a specific model is requested via modelOverride, it attempts to use that.
   * Otherwise, it uses the DEFAULT_AI_MODEL from environment variables, falling back to gemini.
   */
  static async generateText(options: GenerateTextOptions): Promise<string> {
    const defaultModel = (process.env.DEFAULT_AI_MODEL?.toLowerCase() || "gemini");
    const targetModel = options.modelOverride || defaultModel;

    // Route to the appropriate provider based on the target model string
    if (targetModel.includes("claude")) {
      return this.callClaude(options);
    } else if (targetModel.includes("deepseek")) {
      return this.callDeepSeek(options);
    } else if (targetModel.includes("memo")) {
      return this.callMemo(options);
    } else {
      // Default to Gemini (handles "gemini" or any specific gemini string like "gemini-flash-latest")
      return this.callGemini(options, targetModel.includes("gemini-") ? targetModel : "gemini-flash-latest");
    }
  }

  private static async callGemini(options: GenerateTextOptions, modelString: string): Promise<string> {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured.");
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: modelString });
    
    // Prefix system instruction to prompt for simple compatibility if system instruction is provided
    const fullPrompt = options.systemInstruction 
      ? `System Instruction: ${options.systemInstruction}\n\nUser Request: ${options.prompt}` 
      : options.prompt;

    const result = await model.generateContent(fullPrompt);
    return result.response.text();
  }

  private static async callClaude(options: GenerateTextOptions): Promise<string> {
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY.includes("your_")) {
        throw new Error("ANTHROPIC_API_KEY is not configured.");
    }

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", // Default fast model
      max_tokens: 1024,
      system: options.systemInstruction || "",
      messages: [{ role: "user", content: options.prompt }],
    });

    return (response.content[0] as any).text;
  }

  private static async callDeepSeek(options: GenerateTextOptions): Promise<string> {
    if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY.includes("your_")) {
        throw new Error("DEEPSEEK_API_KEY is not configured.");
    }

    const openai = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com/v1", // DeepSeek uses OpenAI compatible API
    });

    const response = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        ...(options.systemInstruction ? [{ role: "system" as const, content: options.systemInstruction }] : []),
        { role: "user", content: options.prompt }
      ],
    });

    return response.choices[0]?.message?.content || "";
  }

  private static async callMemo(options: GenerateTextOptions): Promise<string> {
    if (!process.env.MEMO_API_KEY || process.env.MEMO_API_KEY.includes("your_")) {
        throw new Error("MEMO_API_KEY is not configured.");
    }

    // Memo or custom generic OpenAI endpoint
    const openai = new OpenAI({
      apiKey: process.env.MEMO_API_KEY,
      baseURL: process.env.MEMO_BASE_URL || "https://api.memo.ai/v1", // Placeholder URL
    });

    const response = await openai.chat.completions.create({
      model: "memo-default",
      messages: [
        ...(options.systemInstruction ? [{ role: "system" as const, content: options.systemInstruction }] : []),
        { role: "user", content: options.prompt }
      ],
    });

    return response.choices[0]?.message?.content || "";
  }
}
