CREATE TABLE public.admin_notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL,
  user_id UUID,
  nome TEXT,
  email TEXT,
  whatsapp TEXT,
  cidade TEXT,
  message_id TEXT,
  success BOOLEAN DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admin_notification_logs ENABLE ROW LEVEL SECURITY;