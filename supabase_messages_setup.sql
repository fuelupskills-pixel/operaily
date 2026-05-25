-- 5. Communications / Inbox Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'sms', 'email', 'voice')),
  sender TEXT NOT NULL,
  receiver TEXT NOT NULL,
  content TEXT NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  team_id UUID, -- If assigned to a specific team
  user_id UUID, -- If assigned to a specific user
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
