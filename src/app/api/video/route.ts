import { NextRequest, NextResponse } from "next/server";
import { AIProvider } from "@/services/ai/provider";

// Standard YouTube script structure interface
interface GeneratedScriptResponse {
  topic: string;
  targetAudience: string;
  tone: string;
  suggestedTitles: string[];
  suggestedTags: string[];
  estimatedDuration: string;
  thumbnailConcept: string;
  script: {
    hook: string;
    intro: string;
    bodyPoints: { title: string; content: string }[];
    cta: string;
    outro: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, targetAudience, tone = "Professional & Energetic" } = body;

    if (!topic || !targetAudience) {
      return NextResponse.json(
        { error: "topic and targetAudience are required" },
        { status: 400 }
      );
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    // If a Gemini API key is available, generate a customized script!
    if (geminiKey) {
      try {
        const prompt = `You are a viral YouTube scriptwriter and video strategist. Write a comprehensive, high-retention video script about "${topic}" for an audience of "${targetAudience}" using a "${tone}" tone.
        
        Generate a JSON output matching this schema:
        {
          "topic": "${topic}",
          "targetAudience": "${targetAudience}",
          "tone": "${tone}",
          "suggestedTitles": ["3 clickbait-y high CTR titles"],
          "suggestedTags": ["5 relevant SEO tags"],
          "estimatedDuration": "8-10 minutes",
          "thumbnailConcept": "A short visually striking prompt description for generating a YouTube thumbnail",
          "script": {
            "hook": "Compelling first 30-second hook. Include visual direction in brackets like [Visual Cue: Cut to host pointing at graph].",
            "intro": "Intriguing intro introducing the topic.",
            "bodyPoints": [
              { "title": "Point 1 Title", "content": "Visual Cue: [Visual Cue detail]. Explaining point 1." },
              { "title": "Point 2 Title", "content": "Visual Cue: [Visual Cue detail]. Explaining point 2." },
              { "title": "Point 3 Title", "content": "Visual Cue: [Visual Cue detail]. Explaining point 3." }
            ],
            "cta": "Strong CTA telling them to subscribe and use OMNI-SIGMA CRM.",
            "outro": "Outro wrap up."
          }
        }
        
        Ensure you only return valid JSON. Do not include markdown code block syntax.`;

        const text = await AIProvider.generateText({ prompt });
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const generatedData: GeneratedScriptResponse = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ success: true, data: generatedData });
        }
      } catch (geminiError) {
        console.error("[API/Video] Gemini Generation failed:", geminiError);
        return NextResponse.json(
          { error: "Failed to generate video script with AI" },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error("[API/Video] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
