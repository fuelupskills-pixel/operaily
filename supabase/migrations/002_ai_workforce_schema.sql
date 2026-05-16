-- ============================================================
-- OMNI-SIGMA 360 — AI Workforce Schema
-- Version: 0.2.0 | Phase 1: Agents & Tasks
-- ============================================================

-- 1. AGENT REGISTRY
CREATE TABLE ai_agents (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    role            TEXT NOT NULL,
    department      TEXT NOT NULL CHECK (department IN ('management', 'research', 'content', 'social', 'sales', 'qc', 'analytics')),
    description     TEXT,
    system_prompt   TEXT,
    status          TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'working', 'paused', 'offline')),
    avatar_url      TEXT,
    capabilities    TEXT[], -- e.g. ['web_search', 'image_gen', 'whatsapp_send']
    settings        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_agents_org ON ai_agents(org_id);

-- 2. AI TASKS
CREATE TABLE ai_tasks (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    assigned_to     UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
    parent_task_id  UUID REFERENCES ai_tasks(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    description     TEXT,
    input_data      JSONB DEFAULT '{}',
    status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'needs_review')),
    priority        INTEGER DEFAULT 1,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    error           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_tasks_org ON ai_tasks(org_id);
CREATE INDEX idx_ai_tasks_assigned ON ai_tasks(assigned_to);

-- 3. AI ARTIFACTS (Agent Outputs)
CREATE TABLE ai_artifacts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id         UUID NOT NULL REFERENCES ai_tasks(id) ON DELETE CASCADE,
    agent_id        UUID NOT NULL REFERENCES ai_agents(id) ON DELETE CASCADE,
    type            TEXT NOT NULL CHECK (type IN ('research_report', 'copy', 'creative', 'video', 'data_analysis')),
    content         JSONB NOT NULL,
    media_urls      TEXT[],
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_artifacts_task ON ai_artifacts(task_id);

-- 4. HUMAN APPROVAL QUEUE
CREATE TABLE ai_approvals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    artifact_id     UUID NOT NULL REFERENCES ai_artifacts(id) ON DELETE CASCADE,
    status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'changes_requested')),
    reviewer_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    feedback        TEXT,
    reviewed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_approvals_org ON ai_approvals(org_id);
CREATE INDEX idx_ai_approvals_status ON ai_approvals(status);

-- 5. AI MEMORY (Context/RAG Store)
CREATE TABLE ai_memories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    agent_id        UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
    content         TEXT NOT NULL,
    embedding       VECTOR(1536), -- Requires pgvector extension if available
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ai_memories_org ON ai_memories(org_id);

-- Add updated_at trigger to ai_agents and ai_tasks
CREATE TRIGGER trg_ai_agents_updated BEFORE UPDATE ON ai_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_ai_tasks_updated BEFORE UPDATE ON ai_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS POLICIES
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_isolation_ai_agents ON ai_agents
    USING (org_id IN (SELECT org_id FROM users WHERE auth_uid = auth.uid()));

CREATE POLICY org_isolation_ai_tasks ON ai_tasks
    USING (org_id IN (SELECT org_id FROM users WHERE auth_uid = auth.uid()));

CREATE POLICY org_isolation_ai_artifacts ON ai_artifacts
    USING (EXISTS (SELECT 1 FROM ai_tasks t WHERE t.id = ai_artifacts.task_id AND t.org_id IN (SELECT org_id FROM users WHERE auth_uid = auth.uid())));

CREATE POLICY org_isolation_ai_approvals ON ai_approvals
    USING (org_id IN (SELECT org_id FROM users WHERE auth_uid = auth.uid()));

CREATE POLICY org_isolation_ai_memories ON ai_memories
    USING (org_id IN (SELECT org_id FROM users WHERE auth_uid = auth.uid()));
