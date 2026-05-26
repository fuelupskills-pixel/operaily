// OMNI-SIGMA 360 — AI Agency Agents API
// GET  /api/agency/agents — List all configured agents
// POST /api/agency/agents — Create or update/configure an agent

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AIAgent, AgentStatus, AgentDepartment } from "@/types/agents";

// Pre-seeded mock agents matching the classes in src/services/agents/
const initialMockAgents: AIAgent[] = [
  {
    id: "agent_caio",
    org_id: "demo-org",
    name: "Caio",
    role: "Chief AI Officer",
    department: "management",
    description: "Orchestrates workflow executions, assigns tasks to sub-agents, and verifies outputs.",
    system_prompt: "You are Caio, the Chief AI Officer of OMNI-SIGMA. Your job is to lead the AI sales agency...",
    status: "idle",
    avatar_url: "/avatars/caio.png",
    capabilities: ["orchestration", "intent_classification", "quality_control"],
    settings: { temperature: 0.2 },
    created_at: new Date(Date.now() - 604800000).toISOString(),
    updated_at: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: "agent_researcher",
    org_id: "demo-org",
    name: "Scout",
    role: "Lead Researcher",
    department: "research",
    description: "Performs web scraping, LinkedIn searches, and analyzes import-export databases.",
    system_prompt: "You are Scout, the Lead Researcher. You excel at extracting company directories...",
    status: "idle",
    avatar_url: "/avatars/researcher.png",
    capabilities: ["web_scraping", "lead_enrichment", "import_export_analysis"],
    settings: { maxDepth: 2 },
    created_at: new Date(Date.now() - 604800000).toISOString(),
    updated_at: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: "agent_copywriter",
    org_id: "demo-org",
    name: "Scribe",
    role: "Senior Copywriter",
    department: "content",
    description: "Generates high-converting cold emails, SMS, and WhatsApp messages based on lead data.",
    system_prompt: "You are Scribe, the Senior Copywriter. You write short, crisp outreach copy...",
    status: "idle",
    avatar_url: "/avatars/copywriter.png",
    capabilities: ["email_drafting", "whatsapp_drafting", "personalized_hooks"],
    settings: { tone: "professional" },
    created_at: new Date(Date.now() - 604800000).toISOString(),
    updated_at: new Date(Date.now() - 604800000).toISOString(),
  },
  {
    id: "agent_youtube",
    org_id: "demo-org",
    name: "Director",
    role: "YouTube Manager",
    department: "video",
    description: "Automates video script generation, thumbnail creation, and uploads promotional videos.",
    system_prompt: "You are Director, the video outreach agent. You create video scripts...",
    status: "idle",
    avatar_url: "/avatars/video.png",
    capabilities: ["scriptwriting", "heygen_integration", "youtube_upload"],
    settings: { resolution: "1080p" },
    created_at: new Date(Date.now() - 604800000).toISOString(),
    updated_at: new Date(Date.now() - 604800000).toISOString(),
  },
];

let mockAgents = [...initialMockAgents];

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isSupabaseConfigured = () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      return !!(url && url.startsWith("http") && key && !key.startsWith("your_"));
    };

    if (isSupabaseConfigured()) {
      try {
        const { data: agents, error } = await supabase
          .from("ai_agents")
          .select()
          .order("created_at", { ascending: true });

        if (!error && agents) {
          return NextResponse.json({ success: true, agents });
        }
      } catch (dbErr) {
        console.warn("[API/Agency/Agents] Database fetch failed, using fallback:", dbErr);
      }
    }

    return NextResponse.json({ success: true, agents: mockAgents });
  } catch (error: any) {
    console.error("[API/Agency/Agents] GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      id,
      name,
      role,
      department,
      description,
      system_prompt,
      capabilities = [],
      settings = {},
    } = body;

    if (!name || !role || !department) {
      return NextResponse.json(
        { error: "Missing required fields: name, role, department" },
        { status: 400 }
      );
    }

    const isSupabaseConfigured = () => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
      return !!(url && url.startsWith("http") && key && !key.startsWith("your_"));
    };

    const agentId = id || `agent_${Date.now()}`;
    const newAgent: AIAgent = {
      id: agentId,
      org_id: "demo-org",
      name,
      role,
      department: department as AgentDepartment,
      description: description || null,
      system_prompt: system_prompt || null,
      status: "idle" as AgentStatus,
      avatar_url: body.avatar_url || null,
      capabilities,
      settings,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("ai_agents").upsert({
          id: newAgent.id,
          org_id: newAgent.org_id,
          name: newAgent.name,
          role: newAgent.role,
          department: newAgent.department,
          description: newAgent.description,
          system_prompt: newAgent.system_prompt,
          status: newAgent.status,
          avatar_url: newAgent.avatar_url,
          capabilities: newAgent.capabilities,
          settings: newAgent.settings,
        });

        if (!error) {
          return NextResponse.json({ success: true, agent: newAgent });
        } else {
          console.warn("[API/Agency/Agents] Supabase upsert failed:", error.message);
        }
      } catch (dbErr) {
        console.warn("[API/Agency/Agents] Database operation failed, using fallback:", dbErr);
      }
    }

    // In-memory fallback
    const idx = mockAgents.findIndex(a => a.id === agentId);
    if (idx !== -1) {
      mockAgents[idx] = {
        ...mockAgents[idx],
        ...newAgent,
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json({ success: true, agent: mockAgents[idx] });
    } else {
      mockAgents.push(newAgent);
      return NextResponse.json({ success: true, agent: newAgent }, { status: 201 });
    }
  } catch (error: any) {
    console.error("[API/Agency/Agents] POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
