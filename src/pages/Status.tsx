import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Database, 
  Shield, 
  HardDrive, 
  Zap,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

const StatusIcon = ({ status }: { status: 'operational' | 'degraded' | 'down' }) => {
  switch (status) {
    case 'operational':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'degraded':
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case 'down':
      return <XCircle className="h-5 w-5 text-red-500" />;
  }
};

const StatusBadge = ({ status }: { status: 'operational' | 'degraded' | 'down' }) => {
  const variants = {
    operational: 'bg-green-100 text-green-800 border-green-200',
    degraded: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    down: 'bg-red-100 text-red-800 border-red-200',
  };

  const labels = {
    operational: 'Operacional',
    degraded: 'Degradado',
    down: 'Fora do Ar',
  };

  return (
    <Badge className={`${variants[status]} border`}>
      {labels[status]}
    </Badge>
  );
};

const ServiceCard = ({ 
  name, 
  icon: Icon, 
  result 
}: { 
  name: string; 
  icon: React.ElementType; 
  result: HealthCheckResult;
}) => (
  <Card className="bg-card/50 backdrop-blur">
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">{name}</p>
            {result.latency_ms > 0 && (
              <p className="text-xs text-muted-foreground">
                Latência: {result.latency_ms}ms
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusIcon status={result.status} />
          <StatusBadge status={result.status} />
        </div>
      </div>
      {result.message && (
        <p className="text-sm text-muted-foreground mt-2 pl-12">
          {result.message}
        </p>
      )}
    </CardContent>
  </Card>
);

export default function Status() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fnError } = await supabase.functions.invoke('health-check');
      
      if (fnError) {
        throw fnError;
      }
      
      setHealth(data);
      setLastCheck(new Date());
    } catch (err) {
      console.error('Error fetching health:', err);
      setError('Não foi possível verificar o status do sistema');
      // Set a fallback health status
      setHealth({
        overall: 'down',
        timestamp: new Date().toISOString(),
        services: {
          database: { status: 'down', latency_ms: 0, message: 'Não foi possível verificar' },
          authentication: { status: 'down', latency_ms: 0, message: 'Não foi possível verificar' },
          storage: { status: 'down', latency_ms: 0, message: 'Não foi possível verificar' },
          edge_functions: { status: 'down', latency_ms: 0, message: 'Não foi possível verificar' },
        },
        version: 'unknown',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const overallStatusColors = {
    operational: 'from-green-500/20 to-green-500/5 border-green-500/30',
    degraded: 'from-yellow-500/20 to-yellow-500/5 border-yellow-500/30',
    down: 'from-red-500/20 to-red-500/5 border-red-500/30',
  };

  const overallStatusLabels = {
    operational: 'Todos os Sistemas Operacionais',
    degraded: 'Alguns Sistemas Degradados',
    down: 'Sistemas Fora do Ar',
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">360CNH Status</h1>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchHealth}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Overall Status */}
        <Card className={`mb-8 bg-gradient-to-br ${health ? overallStatusColors[health.overall] : 'from-muted to-muted/50'} border`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {health && <StatusIcon status={health.overall} />}
                {loading && !health && (
                  <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
                )}
                <div>
                  <h2 className="text-lg font-semibold">
                    {loading && !health 
                      ? 'Verificando status...' 
                      : health 
                        ? overallStatusLabels[health.overall]
                        : 'Status desconhecido'
                    }
                  </h2>
                  {lastCheck && (
                    <p className="text-sm text-muted-foreground">
                      Última verificação: {lastCheck.toLocaleTimeString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
              {health && <StatusBadge status={health.overall} />}
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/10">
            <CardContent className="p-4">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Serviços</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {health ? (
              <>
                <ServiceCard 
                  name="Banco de Dados" 
                  icon={Database} 
                  result={health.services.database} 
                />
                <ServiceCard 
                  name="Autenticação" 
                  icon={Shield} 
                  result={health.services.authentication} 
                />
                <ServiceCard 
                  name="Armazenamento" 
                  icon={HardDrive} 
                  result={health.services.storage} 
                />
                <ServiceCard 
                  name="Edge Functions" 
                  icon={Zap} 
                  result={health.services.edge_functions} 
                />
              </>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3" />
                <p>Carregando status dos serviços...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground space-y-2">
          {health && (
            <p>Versão: {health.version}</p>
          )}
          <p>
            Esta página atualiza automaticamente a cada 30 segundos.
          </p>
          <p>
            Em caso de problemas, entre em contato: 
            <a href="mailto:360cnh@gmail.com" className="text-primary hover:underline ml-1">
              360cnh@gmail.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
