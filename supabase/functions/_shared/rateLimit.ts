import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

/**
 * In-memory rate limiter for Edge Functions.
 * Limits requests per userId or IP to `maxRequests` per `windowMs`.
 * Returns { allowed: boolean, remaining: number }
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 5,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1 };
  }

  entry.count++;
  const remaining = Math.max(0, maxRequests - entry.count);

  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining };
}

export function rateLimitResponse(corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify({
      error: "Muitas tentativas. Aguarde um minuto antes de tentar novamente.",
      error_code: "RATE_LIMITED",
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 429,
    }
  );
}
