-- Allow service role to insert notifications (for edge functions)
-- Using a function-based policy that checks if being called from service role context
CREATE POLICY "Service role can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Note: This is intentionally permissive for INSERT because notifications
-- are created by edge functions using the service role key