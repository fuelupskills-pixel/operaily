import { NextRequest, NextResponse } from "next/server";
import { getTemplatesForIndustry, interpolateTemplate, templates, listTemplates, createTemplate } from "@/services/templates";
import { getChannelService } from "@/services/channels";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const industry = searchParams.get("industry") || "";
  const channel = searchParams.get("channel") as "whatsapp" | "email" | undefined;

  const list = await listTemplates(industry || undefined, channel || undefined);
  return NextResponse.json({ success: true, templates: list });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if it's a template creation request
    if (body.name && body.body && !body.lead) {
      const { name, channel, industry, subject, body: tplBody, variables = [], calendarLink } = body;
      if (!name || !channel || !industry || !tplBody) {
        return NextResponse.json({ error: "Missing required fields for creation: name, channel, industry, body" }, { status: 400 });
      }
      const created = await createTemplate({ name, channel, industry, subject, body: tplBody, variables, calendarLink });
      return NextResponse.json({ success: true, template: created }, { status: 201 });
    }

    // Otherwise, treat as "send templated message"
    const { templateId, lead, customBody } = body;


    const template = templates.find((t) => t.id === templateId);
    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const leadData: Record<string, string> = {
      firstName: lead.firstName || "",
      lastName: lead.lastName || "",
      companyName: lead.companyName || "",
      country: lead.country || "",
      city: lead.city || "",
      designation: lead.designation || "",
      email: lead.email || "",
      phone: lead.phone || "",
      industry: lead.industry || "",
    };

    const { subject, body: messageBody } = interpolateTemplate(template, leadData);
    const finalBody = customBody || messageBody;

    const channelService = getChannelService();
    const result = await channelService.send({
      channel: template.channel === "email" ? "email" : "whatsapp",
      to: template.channel === "email" ? (lead.email || "") : (lead.phone || lead.whatsapp || ""),
      content: finalBody,
      metadata: subject ? { subject } : undefined,
    });

    return NextResponse.json({
      success: true,
      result,
      preview: { subject, body: finalBody },
    });
  } catch (error) {
    console.error("[API/Templates] Send error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
