-- 1. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL, -- References organizations(id) if you have one, else just UUID
  invoice_number TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Paid', 'Pending', 'Overdue')),
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Video Productions Table
CREATE TABLE IF NOT EXISTS public.video_productions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  topic TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  tone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  suggested_titles JSONB NOT NULL,
  suggested_tags JSONB NOT NULL,
  estimated_duration TEXT,
  thumbnail_concept TEXT,
  script JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Leads (if not already fully structured)
-- Assuming leads table already exists based on webhook, but let's ensure it has necessary fields
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0;

-- 4. User Settings
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY, -- References auth.users(id)
  full_name TEXT,
  email TEXT,
  role TEXT,
  organization_name TEXT,
  timezone TEXT DEFAULT 'UTC',
  email_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Setup Row Level Security (RLS) - Example policies
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_productions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Note: You should add proper RLS policies here to restrict access to authenticated users of the specific org.
-- Example:
-- CREATE POLICY "Users can view their org invoices" ON public.invoices FOR SELECT USING (auth.uid() IN (SELECT user_id FROM user_roles WHERE org_id = invoices.org_id));
