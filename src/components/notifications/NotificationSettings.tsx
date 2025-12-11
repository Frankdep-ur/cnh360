import { Bell, BellOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function NotificationSettings() {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notificações Push
          </CardTitle>
          <CardDescription>
            Seu navegador não suporta notificações push.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleToggle = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificações Push
        </CardTitle>
        <CardDescription>
          Receba lembretes de aulas e atualizações importantes.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications">Ativar notificações</Label>
            <p className="text-sm text-muted-foreground">
              {permission === 'denied' 
                ? 'Notificações bloqueadas pelo navegador'
                : 'Receba alertas sobre suas aulas'}
            </p>
          </div>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Switch
              id="push-notifications"
              checked={isSubscribed}
              onCheckedChange={handleToggle}
              disabled={permission === 'denied'}
            />
          )}
        </div>

        {permission === 'denied' && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
            As notificações foram bloqueadas. Para ativá-las, altere as permissões do navegador para este site.
          </div>
        )}

        {isSubscribed && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-sm font-medium">Você receberá notificações para:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Lembretes 1 hora antes de cada aula</li>
              <li>• Confirmação ou cancelamento de aulas</li>
              <li>• Atualizações de status das suas aulas</li>
            </ul>
          </div>
        )}

        {!isSubscribed && permission !== 'denied' && (
          <Button 
            onClick={subscribe} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Bell className="h-4 w-4 mr-2" />
            )}
            Ativar Notificações
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
