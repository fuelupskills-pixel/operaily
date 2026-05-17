-- ============================================================
-- OMNI-SIGMA 360 — Fix AI Workforce Table Constraints
-- Version: 0.3.0 | Phase 2: Support Video Agent & Artifact Types
-- ============================================================

-- 1. Update ai_agents table department CHECK constraint to include 'video'
ALTER TABLE ai_agents DROP CONSTRAINT IF EXISTS ai_agents_department_check;
ALTER TABLE ai_agents ADD CONSTRAINT ai_agents_department_check CHECK (department IN ('management', 'research', 'content', 'social', 'sales', 'qc', 'analytics', 'video'));

-- 2. Update ai_artifacts table type CHECK constraint to include 'video_script' and 'video_analytics'
ALTER TABLE ai_artifacts DROP CONSTRAINT IF EXISTS ai_artifacts_type_check;
ALTER TABLE ai_artifacts ADD CONSTRAINT ai_artifacts_type_check CHECK (type IN ('research_report', 'copy', 'creative', 'video', 'data_analysis', 'video_script', 'video_analytics'));
