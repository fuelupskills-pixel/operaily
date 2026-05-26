-- Field Sales & Agent Tracking Database Schema

-- 1. Agent Locations (Live Tracking)
CREATE TABLE IF NOT EXISTS public.agent_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL, -- References the sales team member
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  battery_level DOUBLE PRECISION,
  is_mocked BOOLEAN DEFAULT false,
  recorded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries on agent's recent locations
CREATE INDEX IF NOT EXISTS idx_agent_locations_agent_time ON public.agent_locations (agent_id, recorded_at DESC);

-- 2. Appointments / Meetings
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  lead_id UUID, -- Optional, if tied to a specific CRM lead
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled')),
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  outcome_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Work Logs (Check-in / Check-out, offline activity sync)
CREATE TABLE IF NOT EXISTS public.work_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('clock_in', 'clock_out', 'break_start', 'break_end', 'visit_start', 'visit_end')),
  related_entity_id UUID, -- E.g., Appointment ID
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sync_id TEXT UNIQUE -- UUID generated on mobile to prevent duplicate syncs
);

ALTER TABLE public.agent_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_logs ENABLE ROW LEVEL SECURITY;
