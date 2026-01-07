import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-edge-secret',
};

// Validate internal edge function secret for cron/internal calls
function validateEdgeSecret(req: Request): boolean {
  const edgeSecret = Deno.env.get("EDGE_FUNCTION_SECRET");
  if (!edgeSecret) {
    console.warn("EDGE_FUNCTION_SECRET not configured");
    return false;
  }
  
  const providedSecret = req.headers.get("x-edge-secret");
  return providedSecret === edgeSecret;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate the edge secret for internal/cron calls
  if (!validateEdgeSecret(req)) {
    console.error("Invalid or missing edge secret");
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate cutoff time (30 minutes ago)
    const cutoffTime = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    // Find and delete pending lessons without payment that are older than 30 minutes
    const { data: abandonedLessons, error: selectError } = await supabase
      .from('aulas')
      .select('id, created_at, payment_intent_id')
      .eq('status', 'pendente')
      .is('payment_intent_id', null)
      .lt('created_at', cutoffTime);

    if (selectError) {
      console.error('Error finding abandoned lessons:', selectError);
      throw selectError;
    }

    const count = abandonedLessons?.length || 0;
    console.log(`Found ${count} abandoned lessons to clean up`);

    if (count > 0) {
      const idsToDelete = abandonedLessons.map(l => l.id);
      
      const { error: deleteError } = await supabase
        .from('aulas')
        .delete()
        .in('id', idsToDelete);

      if (deleteError) {
        console.error('Error deleting abandoned lessons:', deleteError);
        throw deleteError;
      }

      console.log(`Successfully deleted ${count} abandoned lessons`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        cleaned: count,
        cutoffTime,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Cleanup error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
