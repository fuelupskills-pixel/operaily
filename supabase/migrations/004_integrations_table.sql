-- OMNI-SIGMA 360 - User Integrations Database Schema
-- Migration 004: Create user_integrations table for secure multi-channel auth persistence

CREATE TABLE IF NOT EXISTS public.user_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL, -- References the active executive organization
  provider VARCHAR(50) NOT NULL, -- 'google', 'facebook', 'instagram', 'linkedin', 'whatsapp', 'telegram', 'smtp', 'google_ads', 'meta_ads', 'tiktok_ads'
  account_id VARCHAR(255) NOT NULL, -- Platform channel or account ID
  account_name VARCHAR(255), -- Visual label e.g. "FuelUpSkills Youtube Channel"
  avatar_url TEXT,
  access_token TEXT NOT NULL, -- Encrypted credentials payload
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT '{}'::JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(org_id, provider, account_id)
);

-- Enable RLS and permissions
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow select for authenticated users" 
  ON public.user_integrations FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Allow insert/update for authenticated users" 
  ON public.user_integrations FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);
