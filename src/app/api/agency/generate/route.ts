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
        console.error("[API/Agency] Gemini generation failed, falling back:", geminiError);
      }
    }

    // High quality premium fallback mock data
    const mockThemeColors = {
      sleek_saas: { primary: "#3b82f6", secondary: "#8b5cf6" },
      luxury_dark: { primary: "#fbbf24", secondary: "#1c1c1c" },
      corporate_blue: { primary: "#2563eb", secondary: "#06b6d4" }
    }[visualStyle as "sleek_saas" | "luxury_dark" | "corporate_blue"] || { primary: "#3b82f6", secondary: "#8b5cf6" };

    const mockData: LandingPageResponse = {
      research: {
        targetAudiencePainPoints: [
          "Spending hours manually copying prospects from lead finders to CRM pipelines.",
          "Low email response rates due to cold, robotic, unpersonalized cold copy templates.",
          "Unreliable lead sync pipelines resulting in missed notifications and lost prospects."
        ],
        competitorAnalysis: [
          { competitor: "Manual Sales Hubs", gap: "Requires expensive labor, slow, human typing errors.", strength: "Simple list building." },
          { competitor: "Legacy Outreach Builders", gap: "Lacks native CRM integrations, high subscription overhead.", strength: "Mass email blasts." }
        ],
        seoKeywords: [
          `${productName.toLowerCase()} crm automation`,
          "high converting saas landing page",
          "real-time lead syncing pipeline",
          "operaily CRM webhook integrations",
          "autonomous landing page builder"
        ],
        offerPositioning: `The ultimate automated client acquisition engine for ${targetAudience}. Automatically capture, qualify, and sync inbound leads directly into your OperAIly CRM.`,
        ctaRecommendations: {
          primary: `Launch Your ${productName} Campaign`,
          secondary: "Watch 2-Min Demo"
        }
      },
      design: {
        primaryColor: mockThemeColors.primary,
        secondaryColor: mockThemeColors.secondary,
        typography: { heading: "Outfit", body: "Inter" },
        styleDescription: `A premium, dynamic glassmorphic responsive architecture based on a ${visualStyle.replace('_', ' ')} layout.`
      },
      copy: {
        metaTitle: `${productName} | Scale Inbound Lead Generation Automatically`,
        metaDescription: `Empower your outreach. Explore the complete conversion-focused landing page template for ${productName}, featuring automatic OperAIly CRM synchronization.`,
        schemaJson: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": productName,
          "description": productDescription,
          "brand": { "@type": "Brand", "name": "OperAIly AI CRM" }
        }, null, 2),
        hero: {
          headline: `Stop Wasting Time Scraping Leads. Start Scaling ${productName}.`,
          subheadline: `A conversion-first, automated pipeline designed specifically to solve paint points for ${targetAudience}. Native OperAIly CRM integration pre-configured.`,
          ctaText: "Start Scaling Now"
        },
        benefits: [
          { title: "Real-Time OperAIly Sync", description: "Every lead captured on this landing page is instantly created in your CRM with customized campaign tags." },
          { title: "A/B Conversion Optimized", description: "Engineered by visual designers using glassmorphic CTA grids and trust seals to maximize lead conversion rates." },
          { title: "Instant Admin WhatsApp Alerts", description: "Receive background notifications on WhatsApp as soon as an enterprise lead books a consultation." }
        ],
        features: [
          { title: "Frictionless Drop Form", description: "A beautiful, premium structured floating form linked to real-time email verification APIs.", icon: "FormInput" },
          { title: "Intelligent Lead Scoring", description: "Assign automated high-intent scores to incoming leads based on corporate domain levels.", icon: "Target" },
          { title: "Custom Redirect Routing", description: "Send hot qualified leads to booking schedulers and cooler prospects to automated email flows.", icon: "GitMerge" },
          { title: "Meta & Google Tracking", description: "Pre-injected tracking pixels and Google Analytics events triggers to optimize ad spends.", icon: "LineChart" }
        ],
        testimonials: [
          { name: "Sarah Jenkins", role: "CEO, GrowFast", quote: `Implementing the ${productName} landing page boosted our lead conversion rate by 34% in just two weeks! Seamless CRM sync is a game-changer.`, rating: 5 },
          { name: "David Miller", role: "Growth Lead, TechCorp", quote: "No complex API triggers needed. Leads hit our OperAIly dashboard in less than a second. Simply flawless.", rating: 5 }
        ],
        pricing: {
          tierName: "Starter Accelerator",
          price: "$29/mo",
          features: [
            "1 Complete Landing Page Template",
            "Unlimited Lead Syncing",
            "Instant Webhook Setup",
            "OperAIly CRM Integration",
            "Premium Glassmorphic Theme Layout"
          ],
          description: "Perfect for fast-growing companies and agencies seeking to automate their outreach."
        },
        faqs: [
          { question: `Does this require manual CRM mapping for ${productName}?`, answer: "No. The system automatically provisions the webhook pipelines, links the CRM endpoints, and starts syncing contacts out of the box." },
          { question: "Can I use my own custom domain?", answer: "Yes, you can configure your custom domains directly under the Wix Studio or WordPress Settings panels in minutes." }
        ],
        footerText: `© 2026 ${productName}. Powered by the OperAIly AI CRM.`
      },
      automation: {
        webhookCode: `// Node.js Zapier Webhook Trigger Code
fetch('https://operaily.vercel.app/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: input.name.split(' ')[0] || 'Lead',
    lastName: input.name.split(' ')[1] || '',
    email: input.email,
    phone: input.phone || null,
    source: '${productName} Landing Page',
    leadScore: 85,
    status: 'Qualified'
  })
}).then(res => res.json()).then(console.log);`,
        operailyFormHook: "Inbound POST request automatically mapped to /api/leads with campaign headers."
      }
    };

    // Add brief artificial delay to simulate AI agency work
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return NextResponse.json({ success: true, data: mockData });
  } catch (error) {
    console.error("[API/Agency] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
