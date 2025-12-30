-- Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule cleanup job to run every 10 minutes
SELECT cron.schedule(
  'cleanup-abandoned-lessons',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://kyvtlmpkjjinhjelipvr.supabase.co/functions/v1/cleanup-abandoned-lessons',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5dnRsbXBramppbmhqZWxpcHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUzNzk3MTYsImV4cCI6MjA4MDk1NTcxNn0.BW20n5vTVhKFjhaxvsPyPN1XMsTszjW5O7hI2_uHfmw"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);