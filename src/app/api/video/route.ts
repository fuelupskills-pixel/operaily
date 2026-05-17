import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
        const genAI = new GoogleGenerativeAI(geminiKey);
        // Using recommended 2.0 Flash model
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const generatedData: GeneratedScriptResponse = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ success: true, data: generatedData });
        }
      } catch (geminiError) {
        console.error("[API/Video] Gemini Generation failed, falling back:", geminiError);
      }
    }

    // High-quality fallback mock data if Gemini is unavailable or fails
    const mockData: GeneratedScriptResponse = {
      topic,
      targetAudience,
      tone,
      suggestedTitles: [
        `How to SCALE ${topic.toUpperCase()} (Step-by-Step) 🚀`,
        `The AI Secret for ${topic} That Works 24/7`,
        `Why Most People Fail at ${topic} (And How to Fix It)`
      ],
      suggestedTags: [topic.toLowerCase(), "marketing automation", "ai crm", "growth hacking", "lead generation"],
      estimatedDuration: "8-10 minutes",
      thumbnailConcept: `A sleek, premium Split-screen design. Left: A red frustrated emoji with a failing chart. Right: A golden robotic hand holding a glowing glowing graph pointing up, with big bold text: '100% AUTOMATED'`,
      script: {
        hook: "[Visual Cue: Screen recording of a CRM dashboard with leads ticking upward in real-time. Upbeat, premium tech-house music swells.] Host: Look at this chart. In the next 8 minutes, I’m going to show you how to set up an autonomous system that duplicates this growth on auto-pilot. No manual scraping. No spam folders. Just pure, targeted, AI-driven operations.",
        intro: "[Visual Cue: Cut to close-up of host smiling, sitting in a modern high-tech studio environment.] Host: Welcome back! Today we are deconstructing how to master " + topic + " for an audience of " + targetAudience + ". If you've struggled with manual workflows, this guide is your savior.",
        bodyPoints: [
          {
            title: "1. Autonomous Signal Scraping",
            content: "[Visual Cue: Sleek 3D graph showing the Trend Scout agent parsing company hiring alerts.] Host: First, we deploy scouting agents. Instead of looking for random lists, our agent monitors live business signals—like funding rounds, leadership hires, or technology additions. This gives you high-intent prospects."
          },
          {
            title: "2. The Copywriter Agent Generation",
            content: "[Visual Cue: Animated UI showing a copywriting agent generating WhatsApp and email drafts with personalized cues.] Host: Next is personalization. The agent doesn't send standard forms. It scans their recent LinkedIn publications, extracts their core values, and drafts a custom pitch that references their specific achievements."
          },
          {
            title: "3. Quality Control (Human-in-the-Loop)",
            content: "[Visual Cue: Split screen showing a mobile notification being tapped to instantly approve and send an email.] Host: Finally, we enforce the QC step. Before any message goes out, it goes to your OMNI Quality Control board. You review the draft, tap 'Approve', and let the engine execute the send. Full scale with 0% risk."
          }
        ],
        cta: "[Visual Cue: Host points down to a sleek graphic showing a Cal.com meeting booking widget.] Host: Want to clone this exact workspace? Click the first link in the description. We’ve pre-loaded it with 1,000 free AI tasks for you. Hit the subscribe button to stay updated with future AI agent workflows!",
        outro: "[Visual Cue: Music swells. Sleek dark mode logo of OMNI-SIGMA 360 appears with social icons.] Host: Build smart, work less, and let antigravity AI do the heavy lifting. I'll see you in the next breakdown. Out!"
      }
    };

    // Simulate database delay for realism
    await new Promise((r) => setTimeout(r, 1200));

    return NextResponse.json({ success: true, data: mockData });
  } catch (error) {
    console.error("[API/Video] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
