import { NextResponse } from "next/server";

export async function GET() {
  const integrations = [
    { id: "outlook", label: "Outlook Mail & Calendar", desc: "Sync corporate mailboxes, schedules, and outreach sequences", provider: "outlook", icon: "Mail", color: "text-blue-600" },
    { id: "youtube", label: "YouTube Studio", desc: "AI script generation, video upload, and channel insights", provider: "google", icon: "Video", color: "text-red-500" },
    { id: "facebook", label: "Facebook Pages", desc: "Outbound campaign updates, analytics & comment moderation", provider: "facebook", icon: "Globe", color: "text-blue-500" },
    { id: "instagram", label: "Instagram Business", desc: "Automated media publishing, reels schedule, and audience stats", provider: "facebook", icon: "Camera", color: "text-pink-500" },
    { id: "linkedin", label: "LinkedIn Share", desc: "AI B2B article posting and professional networking reach", provider: "linkedin", icon: "Users", color: "text-sky-600" },
    { id: "whatsapp", label: "WhatsApp Business API", desc: "Outbound templates, instant AI messaging & lead scoring", provider: "whatsapp", icon: "MessageSquare", color: "text-emerald-500" },
    { id: "telegram", label: "Telegram Channels", desc: "Outbound operations broadcast and chatbot notifications", provider: "telegram", icon: "Send", color: "text-info" },
    { id: "google_ads", label: "Google Ads", desc: "Modify ad spend budgets, demographic targets, and conversion stats", provider: "google", icon: "Target", color: "text-blue-400" },
    { id: "meta_ads", label: "Meta Ads Manager", desc: "Create ad campaigns, set daily target splits, and track leads CTR", provider: "facebook", icon: "Award", color: "text-indigo-400" },
    { id: "tiktok_ads", label: "TikTok Ads Manager", desc: "Query campaign performance, audience demographics, and metrics", provider: "tiktok", icon: "Play", color: "text-rose-400" }
  ];

  return NextResponse.json({ success: true, data: integrations });
}
