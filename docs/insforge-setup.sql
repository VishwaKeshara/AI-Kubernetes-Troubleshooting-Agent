-- InsForge setup for dashboard (already applied via MCP)
-- Re-run in InsForge SQL editor if setting up a fresh project.

CREATE TABLE IF NOT EXISTS public.investigations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  root_cause TEXT NOT NULL,
  namespace TEXT NOT NULL DEFAULT 'default',
  confidence INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own investigations"
ON public.investigations FOR SELECT
TO authenticated
USING (user_id = auth.uid()::text);

CREATE POLICY "Users can insert own investigations"
ON public.investigations FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid()::text);

INSERT INTO realtime.channels (pattern, description, enabled)
VALUES ('investigation:%', 'Per-investigation progress updates', true)
ON CONFLICT (pattern) DO UPDATE SET enabled = true;

CREATE OR REPLACE FUNCTION public.publish_investigation_progress(
  channel_name text,
  event_name text,
  payload jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, realtime
AS $$
BEGIN
  PERFORM realtime.publish(channel_name, event_name, payload);
END;
$$;

GRANT EXECUTE ON FUNCTION public.publish_investigation_progress(text, text, jsonb) TO anon, authenticated;
