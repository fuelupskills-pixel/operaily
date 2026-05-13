// OMNI-SIGMA 360 — Templates API
// GET /api/templates?industry=pharmaceutical&channel=whatsapp
// POST /api/templates/send — Send a templated message to a lead

import { NextRequest, NextResponse } from "next/server";
import { getTemplatesForIndustry, interpolateTemplate, templates } from "@/services/templates";
import { getChannelService } from "@/services/channels";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const industry = searchParams.get("industry") || "";
  const channel = searchParams.get("channel") as "whatsapp" | "email" | undefined;

  const filtered = industry
    ? getTemplatesForIndustry(industry, channel || undefined)
    : templates.filter((t) => !channel || t.channel === channel);

  return NextResponse.json({ success: true, templates: filtered });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
