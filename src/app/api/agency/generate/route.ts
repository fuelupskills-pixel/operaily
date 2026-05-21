import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface LandingPageResponse {
  research: {
    targetAudiencePainPoints: string[];
    competitorAnalysis: { competitor: string; gap: string; strength: string }[];
    seoKeywords: string[];
    offerPositioning: string;
    ctaRecommendations: { primary: string; secondary: string };
  };
  design: {
    primaryColor: string;
    secondaryColor: string;
    typography: { heading: string; body: string };
    styleDescription: string;
  };
  copy: {
    metaTitle: string;
    metaDescription: string;
    schemaJson: string;
    hero: { headline: string; subheadline: string; ctaText: string };
    benefits: { title: string; description: string }[];
    features: { title: string; description: string; icon: string }[];
    testimonials: { name: string; role: string; quote: string; rating: number }[];
    pricing: { tierName: string; price: string; features: string[]; description: string };
    faqs: { question: string; answer: string }[];
    footerText: string;
  };
  automation: {
    webhookCode: string;
    operailyFormHook: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      productName,
      productDescription,
      targetAudience,
      visualStyle = "sleek_saas",
      publishingPlatform = "wix",
      customDomain = "operaily.app"
    } = body;

    if (!productName || !productDescription || !targetAudience) {
      return NextResponse.json(
        { error: "productName, productDescription, and targetAudience are required" },
        { status: 400 }
      );
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const styleColors = {
          sleek_saas: "Primary: HSL(217.2, 91.2%, 59.8%) (Royal Blue), Secondary: HSL(262.1, 83.3%, 57.8%) (Electric Indigo)",
          luxury_dark: "Primary: HSL(47.9, 95.8%, 53.1%) (Gold/Amber), Secondary: HSL(0, 0%, 9%) (Coal/Obsidian)",
          corporate_blue: "Primary: HSL(221.2, 83.2%, 53.3%) (Navy Blue), Secondary: HSL(198.6, 93.8%, 48.2%) (Cyan)"
        }[visualStyle as "sleek_saas" | "luxury_dark" | "corporate_blue"] || "Primary: HSL(217, 91%, 60%), Secondary: HSL(262, 83%, 58%)";

        const prompt = `You are a high-end Digital Marketing Agency consisting of 7 AI Specialists. Your goal is to research, design, copywrite, and automate a landing page for:
        - Product Name: "${productName}"
        - Description: "${productDescription}"
        - Target Audience: "${targetAudience}"
        - Visual Style: "${visualStyle}" (Use color guidelines: ${styleColors})
        - Target Platform: "${publishingPlatform}"
        - Custom Domain: "${customDomain}"
        
        Generate a complete enterprise-level landing page plan and return the result strictly as a valid JSON object matching this schema:
        {
          "research": {
            "targetAudiencePainPoints": ["3 specific, emotional customer pain points"],
            "competitorAnalysis": [
              { "competitor": "Name of competitor", "gap": "Product advantage/gap", "strength": "Competitor's core strength" }
            ],
            "seoKeywords": ["5 high-converting, low-competition keywords"],
            "offerPositioning": "A highly persuasive positioning statement / primary value proposition.",
            "ctaRecommendations": { "primary": "Primary CTA text", "secondary": "Secondary CTA text" }
          },
          "design": {
            "primaryColor": "hex or hsl color string matching the choice",
            "secondaryColor": "hex or hsl accent color string",
            "typography": { "heading": "Outfit", "body": "Inter" },
            "styleDescription": "1-sentence summary of the premium layout visual concept."
          },
          "copy": {
            "metaTitle": "SEO RankMath-optimized page title",
            "metaDescription": "Highly-persuasive meta description",
            "schemaJson": "JSON string of structured schema markup (JSON-LD Product schema) with keys and descriptions",
            "hero": {
              "headline": "A bold, premium, conversion-focused main headline",
              "subheadline": "A supporting subheadline clarifying the primary value proposition",
              "ctaText": "CTA text"
            },
            "benefits": [
              { "title": "Benefit 1 Title", "description": "Short benefit description" },
              { "title": "Benefit 2 Title", "description": "Short benefit description" },
              { "title": "Benefit 3 Title", "description": "Short benefit description" }
            ],
            "features": [
              { "title": "Feature 1 Title", "description": "Detailed capability description", "icon": "Lucide icon name (e.g. Shield, Zap, Sparkles, BarChart3)" },
              { "title": "Feature 2 Title", "description": "Detailed capability description", "icon": "Lucide icon name" },
              { "title": "Feature 3 Title", "description": "Detailed capability description", "icon": "Lucide icon name" },
              { "title": "Feature 4 Title", "description": "Detailed capability description", "icon": "Lucide icon name" }
            ],
            "testimonials": [
              { "name": "Sarah Jenkins", "role": "CEO, GrowFast", "quote": "Testimonial review praising lead capture", "rating": 5 },
              { "name": "David Miller", "role": "Director of Growth, TechCorp", "quote": "Review praising seamless integration", "rating": 5 }
            ],
            "pricing": {
              "tierName": "Growth Plan",
              "price": "$49/mo",
              "features": ["Feature A included", "Feature B included", "Sync with OperAIly CRM", "Custom webhook triggers"],
              "description": "Perfect for fast-growing companies seeking to automate their outreach."
            },
            "faqs": [
              { "question": "Question 1", "answer": "Answer 1" },
              { "question": "Question 2", "answer": "Answer 2" }
            ],
            "footerText": "© 2026 ${productName}. Powered by OperAIly CRM."
          },
          "automation": {
            "webhookCode": "JavaScript webhook template for Zapier / Make.com to POST leads to https://operaily.vercel.app/api/leads",
            "operailyFormHook": "POST API trigger mapping description"
          }
        }
        
        Return ONLY valid JSON. Do not include markdown code block syntax.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const generatedData: LandingPageResponse = JSON.parse(jsonMatch[0]);
          return NextResponse.json({ success: true, data: generatedData });
        }
      } catch (geminiError) {
        console.error("[API/Agency] Gemini generation failed:", geminiError);
        return NextResponse.json(
          { error: "Failed to generate agency plan with AI" },
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
    console.error("[API/Agency] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
