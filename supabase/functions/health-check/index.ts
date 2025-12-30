import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthCheckResult {
  status: 'operational' | 'degraded' | 'down';
  latency_ms: number;
  message?: string;
}

interface SystemHealth {
  overall: 'operational' | 'degraded' | 'down';
  timestamp: string;
  services: {
    database: HealthCheckResult;
    authentication: HealthCheckResult;
    storage: HealthCheckResult;
    edge_functions: HealthCheckResult;
  };
  version: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('Health check started');
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const results: SystemHealth = {
    overall: 'operational',
    timestamp: new Date().toISOString(),
    services: {
      database: { status: 'down', latency_ms: 0 },
      authentication: { status: 'down', latency_ms: 0 },
      storage: { status: 'down', latency_ms: 0 },
      edge_functions: { status: 'operational', latency_ms: 0 },
    },
    version: '1.0.0-beta',
  };

  // Check Database
  try {
    const dbStart = Date.now();
    const { error } = await supabase.from('profiles').select('id').limit(1);
    const dbLatency = Date.now() - dbStart;
    
    if (error) {
      console.error('Database check failed:', error);
      results.services.database = {
        status: 'down',
        latency_ms: dbLatency,
        message: 'Erro ao conectar ao banco de dados',
      };
    } else {
      results.services.database = {
        status: dbLatency > 1000 ? 'degraded' : 'operational',
        latency_ms: dbLatency,
      };
    }
  } catch (err) {
    console.error('Database check exception:', err);
    results.services.database = {
      status: 'down',
      latency_ms: 0,
      message: 'Exceção ao verificar banco de dados',
    };
  }

  // Check Authentication Service
  try {
    const authStart = Date.now();
    const { error } = await supabase.auth.getSession();
    const authLatency = Date.now() - authStart;
    
    // getSession returns null session for no user, but no error means auth is working
    results.services.authentication = {
      status: authLatency > 1000 ? 'degraded' : 'operational',
      latency_ms: authLatency,
    };
    
    if (error) {
      console.error('Auth check failed:', error);
      results.services.authentication = {
        status: 'degraded',
        latency_ms: authLatency,
        message: 'Serviço de autenticação com problemas',
      };
    }
  } catch (err) {
    console.error('Auth check exception:', err);
    results.services.authentication = {
      status: 'down',
      latency_ms: 0,
      message: 'Exceção ao verificar autenticação',
    };
  }

  // Check Storage
  try {
    const storageStart = Date.now();
    const { error } = await supabase.storage.listBuckets();
    const storageLatency = Date.now() - storageStart;
    
    if (error) {
      console.error('Storage check failed:', error);
      results.services.storage = {
        status: 'degraded',
        latency_ms: storageLatency,
        message: 'Serviço de armazenamento com problemas',
      };
    } else {
      results.services.storage = {
        status: storageLatency > 1000 ? 'degraded' : 'operational',
        latency_ms: storageLatency,
      };
    }
  } catch (err) {
    console.error('Storage check exception:', err);
    results.services.storage = {
      status: 'down',
      latency_ms: 0,
      message: 'Exceção ao verificar armazenamento',
    };
  }

  // Edge functions are operational if we got this far
  results.services.edge_functions = {
    status: 'operational',
    latency_ms: 0,
  };

  // Calculate overall status
  const serviceStatuses = Object.values(results.services);
  if (serviceStatuses.some((s) => s.status === 'down')) {
    results.overall = 'down';
  } else if (serviceStatuses.some((s) => s.status === 'degraded')) {
    results.overall = 'degraded';
  } else {
    results.overall = 'operational';
  }

  console.log('Health check completed:', results.overall);

  return new Response(JSON.stringify(results), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    status: 200,
  });
});
