import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getLeadService } from "@/services/leads";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prospectName,
      prospectEmail,
      prospectPhone,
      companyName,
      industry = "B2B Tech",
      productInterest = "OperAIly CRM Enterprise",
      geography = "North America",
      enableObjectionHandling = true,
      enableProposalGen = true,
      paymentGateway = "stripe"
    } = body;

    if (!prospectName || !prospectEmail) {
      return NextResponse.json({ success: false, error: "Missing prospect name or email" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    let aiResponse: any = null;

    if (apiKey) {
      try {
        const ai = new GoogleGenerativeAI(apiKey);
        const model = ai.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
          You are an elite AI growth agency orchestrator. Generate a complete sales growth campaign dataset for:
          - Prospect Name: ${prospectName}
          - Email: ${prospectEmail}
          - Phone: ${prospectPhone || "N/A"}
          - Company: ${companyName || "N/A"}
          - Industry: ${industry}
          - Product Interest: ${productInterest}
          - Geography: ${geography}

          Format the output strictly as a JSON object with the following fields:
          {
            "whatsapp": {
              "introMessage": "personalized welcome script using active value propositions and brochure link",
              "brochureUrl": "URL to PDF brochure",
              "catalogUrl": "URL to catalog"
            },
            "emails": [
              { "day": 1, "subject": "Subject", "body": "Body" },
              { "day": 2, "subject": "Subject", "body": "Body" },
              { "day": 4, "subject": "Subject", "body": "Body" },
              { "day": 7, "subject": "Subject", "body": "Body" }
            ],
            "objections": [
              { "objection": "Too expensive / Budget issue", "reply": "consultative response" },
              { "objection": "Need to discuss with team", "reply": "collaborative response" }
            ],
            "voiceCall": {
              "greeting": "voice opener script",
              "objectionHandler": "voice objection handle script",
              "qualificationQuestion": "key filtering question"
            },
            "proposal": {
              "title": "Custom Business Proposal",
              "introduction": "tailored pitch introducing product solutions for companyName",
              "deliverables": ["deliverable 1", "deliverable 2"],
              "investment": "$4,900 / year"
            },
            "invoice": {
              "invoiceNumber": "INV-2026-X",
              "items": [
                { "description": "license", "amount": 4900 }
              ],
              "total": 4900,
              "paymentLink": "stripe_link"
            },
            "retargeting": {
              "awarenessAd": "ad hook text",
              "testimonialAd": "social proof text"
            }
          }
          Return ONLY valid JSON, no markdown blocks.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        aiResponse = JSON.parse(jsonText);
      } catch (err) {
        console.error("Gemini failed:", err);
        return NextResponse.json({ success: false, error: "Failed to generate sales strategy with AI" }, { status: 500 });
      }
    } else {
      return NextResponse.json({ success: false, error: "GEMINI_API_KEY is not configured" }, { status: 501 });
    }

    // Sync Lead to Database in real-time
    const leadService = getLeadService();
    const names = prospectName.split(" ");
    const firstName = names[0] || "Growth";
    const lastName = names.slice(1).join(" ") || "Prospect";

    await leadService.create({
      firstName,
      lastName,
      email: prospectEmail,
      phone: prospectPhone || null,
      whatsapp: prospectPhone || null,
      designation: "Growth Partner",
      companyName: companyName || "Inbound Org",
      website: null,
      address: null,
      city: null,
      country: null,
      industry,
      linkedinUrl: null,
      twitterHandle: null,
      facebookUrl: null,
      leadScore: 95, // Fully engaged master engine lead
      status: "qualified",
      source: "Master Growth Engine Sync",
      sourceId: null,
      personalizedHook: `Prospect synthesized under product interest: ${productInterest}.`,
      aiSummary: `Master sales campaign initialized. Personalized WhatsApp, 30-day email nurture series, and custom ${paymentGateway} invoice pre-configured.`
    });

    return NextResponse.json({
      success: true,
      message: "Autonomous Sales Engine initialized and synced!",
      data: aiResponse
    });
  } catch (error: any) {
    console.error("[API/GrowthEngine] Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
