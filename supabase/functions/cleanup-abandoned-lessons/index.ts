import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-edge-secret',
};

// Validate internal edge function secret OR service role key for cron/internal calls
function validateRequest(req: Request): boolean {
  // Check for edge secret header (internal calls)
  const edgeSecret = Deno.env.get("EDGE_FUNCTION_SECRET");
  const providedSecret = req.headers.get("x-edge-secret");
  if (edgeSecret && providedSecret === edgeSecret) {
    return true;
  }
  
  // Check for service role key in Authorization header (cron job calls)
  const authHeader = req.headers.get("Authorization");
  if (authHeader) {
    // Accept both anon key (from cron) and service role key
    // Since this is a cleanup job, we allow it to run from scheduled cron
    const token = authHeader.replace("Bearer ", "");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (token === anonKey || token === serviceKey) {
      return true;
    }
  }
  
  return false;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate the request for internal/cron calls
  if (!validateRequest(req)) {
    console.error("Invalid or missing authorization");
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
      .select('id, created_at, transaction_id')
      .eq('status', 'pendente')
      .is('transaction_id', null)
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
