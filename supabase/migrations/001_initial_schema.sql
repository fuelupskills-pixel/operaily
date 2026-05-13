-- ============================================================
-- OMNI-SIGMA 360 — Initial Database Schema
-- Version: 0.1.0 | Phase 1
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- fuzzy text matching for dedup
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. ORGANIZATIONS & USERS
-- ============================================================

CREATE TABLE organizations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    slug            TEXT UNIQUE NOT NULL,
    logo_url        TEXT,
    settings        JSONB DEFAULT '{}',
    plan            TEXT DEFAULT 'free' CHECK (plan IN ('free','starter','pro','enterprise')),
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email           TEXT UNIQUE NOT NULL,
    full_name       TEXT NOT NULL,
    avatar_url      TEXT,
    role            TEXT DEFAULT 'member' CHECK (role IN ('owner','admin','member','viewer')),
    auth_uid        UUID UNIQUE,  -- links to supabase auth.users
    preferences     JSONB DEFAULT '{}',
    last_active_at  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_org ON users(org_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================
-- 2. LEADS & ENRICHMENT
-- ============================================================

CREATE TABLE leads (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    assigned_to     UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Core contact info
    first_name      TEXT,
    last_name       TEXT,
    full_name       TEXT GENERATED ALWAYS AS (COALESCE(first_name,'') || ' ' || COALESCE(last_name,'')) STORED,
    email           TEXT,
    phone           TEXT,
    whatsapp        TEXT,
    designation     TEXT,
    company_name    TEXT,
    website         TEXT,
    address         TEXT,
    city            TEXT,
    country         TEXT,
    industry        TEXT,

    -- Social handles
    linkedin_url    TEXT,
    twitter_handle  TEXT,
    facebook_url    TEXT,

    -- Scoring & status
    lead_score      INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
    status          TEXT DEFAULT 'new' CHECK (status IN ('new','contacted','engaged','qualified','meeting_set','won','lost','archived')),
    source          TEXT CHECK (source IN ('apollo','linkedin','web_scraper','manual','ads','referral','import')),
    source_id       TEXT,  -- external ID from source system

    -- AI-generated
    personalized_hook TEXT,
    ai_summary      TEXT,

    -- Timestamps
    last_contacted_at TIMESTAMPTZ,
    archived_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_leads_org ON leads(org_id);
CREATE INDEX idx_leads_status ON leads(org_id, status);
CREATE INDEX idx_leads_score ON leads(org_id, lead_score DESC);
CREATE INDEX idx_leads_industry ON leads(org_id, industry);
CREATE INDEX idx_leads_country ON leads(org_id, country);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_company_trgm ON leads USING gin(company_name gin_trgm_ops);
CREATE INDEX idx_leads_name_trgm ON leads USING gin(full_name gin_trgm_ops);

CREATE TABLE lead_enrichments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    source          TEXT NOT NULL,  -- 'apollo', 'linkedin', 'web', 'ai'
    data            JSONB NOT NULL DEFAULT '{}',
    confidence      REAL DEFAULT 0.0 CHECK (confidence >= 0 AND confidence <= 1),
    enriched_at     TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_enrichments_lead ON lead_enrichments(lead_id);

CREATE TABLE tags (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    color           TEXT DEFAULT '#6366f1',
    UNIQUE(org_id, name)
);

CREATE TABLE lead_tags (
    lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    tag_id          UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (lead_id, tag_id)
);

-- ============================================================
-- 3. PIPELINES
-- ============================================================

CREATE TABLE pipelines (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    is_default      BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE pipeline_stages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_id     UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
    lead_id         UUID REFERENCES leads(id) ON DELETE SET NULL,
    name            TEXT NOT NULL,
    position        INTEGER NOT NULL DEFAULT 0,
    deal_value      NUMERIC(12,2) DEFAULT 0,
    moved_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_stages_pipeline ON pipeline_stages(pipeline_id);

-- ============================================================
-- 4. HUNTER SEARCH ENGINE
-- ============================================================

CREATE TABLE hunter_searches (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    query_industry  TEXT NOT NULL,
    query_country   TEXT NOT NULL,
    query_params    JSONB DEFAULT '{}',
    status          TEXT DEFAULT 'pending' CHECK (status IN ('pending','searching','enriching','completed','failed')),
    total_raw       INTEGER DEFAULT 0,
    total_enriched  INTEGER DEFAULT 0,
    total_imported  INTEGER DEFAULT 0,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE hunter_results (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    search_id       UUID NOT NULL REFERENCES hunter_searches(id) ON DELETE CASCADE,
    lead_id         UUID REFERENCES leads(id) ON DELETE SET NULL,
    raw_data        JSONB NOT NULL,
    source          TEXT NOT NULL,
    is_duplicate    BOOLEAN DEFAULT false,
    imported        BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_hunter_results_search ON hunter_results(search_id);

-- ============================================================
-- 5. WORKFLOW ENGINE (n8n-style)
-- ============================================================

CREATE TABLE workflows (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    description     TEXT,
    is_active       BOOLEAN DEFAULT false,
    trigger_type    TEXT CHECK (trigger_type IN ('new_lead','lead_score','lead_status','schedule','manual','webhook')),
    trigger_config  JSONB DEFAULT '{}',
    canvas_data     JSONB DEFAULT '{}',  -- React Flow viewport/position data
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_workflows_org ON workflows(org_id);

CREATE TABLE workflow_nodes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id     UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    node_type       TEXT NOT NULL CHECK (node_type IN (
        'trigger','condition','delay','split',
        'send_whatsapp','send_email','send_sms',
        'ai_voice_call','ai_generate_video','ai_generate_image','ai_generate_text',
        'update_lead','add_tag','move_pipeline','assign_user',
        'book_meeting','webhook','code'
    )),
    label           TEXT,
    config          JSONB DEFAULT '{}',
    position_x      REAL DEFAULT 0,
    position_y      REAL DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_nodes_workflow ON workflow_nodes(workflow_id);

CREATE TABLE workflow_edges (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id     UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    source_node_id  UUID NOT NULL REFERENCES workflow_nodes(id) ON DELETE CASCADE,
    target_node_id  UUID NOT NULL REFERENCES workflow_nodes(id) ON DELETE CASCADE,
    condition_key   TEXT,       -- e.g. 'reply_received', 'no_reply', 'true', 'false'
    label           TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_edges_workflow ON workflow_edges(workflow_id);

CREATE TABLE workflow_executions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id     UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    lead_id         UUID REFERENCES leads(id) ON DELETE SET NULL,
    status          TEXT DEFAULT 'running' CHECK (status IN ('running','paused','completed','failed','cancelled')),
    current_node_id UUID REFERENCES workflow_nodes(id) ON DELETE SET NULL,
    context         JSONB DEFAULT '{}',  -- runtime variables
    started_at      TIMESTAMPTZ DEFAULT now(),
    completed_at    TIMESTAMPTZ,
    error           TEXT
);

CREATE INDEX idx_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_executions_status ON workflow_executions(status);
CREATE INDEX idx_executions_lead ON workflow_executions(lead_id);

CREATE TABLE execution_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id    UUID NOT NULL REFERENCES workflow_executions(id) ON DELETE CASCADE,
    node_id         UUID REFERENCES workflow_nodes(id) ON DELETE SET NULL,
    action          TEXT NOT NULL,
    status          TEXT DEFAULT 'success' CHECK (status IN ('success','failed','skipped','pending')),
    input_data      JSONB DEFAULT '{}',
    output_data     JSONB DEFAULT '{}',
    error           TEXT,
    duration_ms     INTEGER,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_exec_logs_execution ON execution_logs(execution_id);
CREATE INDEX idx_exec_logs_created ON execution_logs(created_at DESC);

-- ============================================================
-- 6. CONVERSATIONS & MESSAGES (Omni-Channel)
-- ============================================================

CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    channel         TEXT NOT NULL CHECK (channel IN ('whatsapp','email','sms','voice','webchat')),
    status          TEXT DEFAULT 'open' CHECK (status IN ('open','closed','archived')),
    last_message_at TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conversations_lead ON conversations(lead_id);
CREATE INDEX idx_conversations_org ON conversations(org_id);

CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    direction       TEXT NOT NULL CHECK (direction IN ('inbound','outbound')),
    sender_type     TEXT NOT NULL CHECK (sender_type IN ('lead','user','ai','system')),
    sender_id       UUID,
    content_type    TEXT DEFAULT 'text' CHECK (content_type IN ('text','image','video','audio','document','template')),
    content         TEXT,
    media_url       TEXT,
    metadata        JSONB DEFAULT '{}',
    external_id     TEXT,  -- WhatsApp message ID, email ID, etc.
    status          TEXT DEFAULT 'sent' CHECK (status IN ('queued','sent','delivered','read','failed')),
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- ============================================================
-- 7. CHANNEL CONFIGURATIONS
-- ============================================================

CREATE TABLE channel_configs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    channel         TEXT NOT NULL CHECK (channel IN ('whatsapp','email','sms','voice','meta_ads','google_ads','tiktok_ads')),
    provider        TEXT NOT NULL,
    credentials     JSONB DEFAULT '{}',  -- encrypted API keys
    settings        JSONB DEFAULT '{}',
    is_active       BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(org_id, channel, provider)
);

-- ============================================================
-- 8. ACTIVITIES & TIMELINE
-- ============================================================

CREATE TABLE activities (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    lead_id         UUID REFERENCES leads(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    type            TEXT NOT NULL CHECK (type IN (
        'note','call','email_sent','email_received',
        'whatsapp_sent','whatsapp_received','sms_sent',
        'meeting_scheduled','meeting_completed',
        'status_change','score_change','tag_added','tag_removed',
        'workflow_triggered','ai_action'
    )),
    title           TEXT,
    description     TEXT,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_activities_lead ON activities(lead_id);
CREATE INDEX idx_activities_org ON activities(org_id, created_at DESC);

-- ============================================================
-- 9. CALENDAR EVENTS
-- ============================================================

CREATE TABLE calendar_events (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lead_id         UUID REFERENCES leads(id) ON DELETE SET NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ NOT NULL,
    meeting_link    TEXT,
    external_id     TEXT,  -- Cal.com event ID
    status          TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','cancelled','no_show')),
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_calendar_user ON calendar_events(user_id, start_time);
CREATE INDEX idx_calendar_lead ON calendar_events(lead_id);

-- ============================================================
-- 10. AD CAMPAIGNS
-- ============================================================

CREATE TABLE campaigns (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    platform        TEXT NOT NULL CHECK (platform IN ('meta','google','tiktok')),
    external_id     TEXT,
    name            TEXT NOT NULL,
    status          TEXT DEFAULT 'draft' CHECK (status IN ('draft','active','paused','completed','failed')),
    budget_daily    NUMERIC(10,2),
    budget_total    NUMERIC(10,2),
    spend           NUMERIC(10,2) DEFAULT 0,
    impressions     BIGINT DEFAULT 0,
    clicks          BIGINT DEFAULT 0,
    conversions     INTEGER DEFAULT 0,
    settings        JSONB DEFAULT '{}',
    started_at      TIMESTAMPTZ,
    ended_at        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_campaigns_org ON campaigns(org_id);

CREATE TABLE ad_creatives (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    type            TEXT CHECK (type IN ('image','video','carousel','text')),
    content         JSONB DEFAULT '{}',
    media_urls      TEXT[],
    ai_generated    BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE campaign_leads (
    campaign_id     UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    lead_id         UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    attributed_at   TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (campaign_id, lead_id)
);

-- ============================================================
-- 11. UPDATED_AT TRIGGER FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_organizations_updated BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_leads_updated BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_workflows_updated BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_channel_configs_updated BEFORE UPDATE ON channel_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_campaigns_updated BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 12. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Basic RLS policy: users can only access data from their organization
CREATE POLICY org_isolation_users ON users
    USING (org_id IN (SELECT org_id FROM users WHERE auth_uid = auth.uid()));

CREATE POLICY org_isolation_leads ON leads
    USING (org_id IN (SELECT org_id FROM users WHERE auth_uid = auth.uid()));

CREATE POLICY org_isolation_workflows ON workflows
    USING (org_id IN (SELECT org_id FROM users WHERE auth_uid = auth.uid()));

CREATE POLICY org_isolation_conversations ON conversations
    USING (org_id IN (SELECT org_id FROM users WHERE auth_uid = auth.uid()));

CREATE POLICY org_isolation_activities ON activities
    USING (org_id IN (SELECT org_id FROM users WHERE auth_uid = auth.uid()));

CREATE POLICY org_isolation_campaigns ON campaigns
    USING (org_id IN (SELECT org_id FROM users WHERE auth_uid = auth.uid()));
