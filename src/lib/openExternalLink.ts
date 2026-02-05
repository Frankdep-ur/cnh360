/**
 * Abre links externos no navegador nativo do dispositivo (Safari, Chrome)
 * em vez de WebView. Essencial para fluxos de câmera como KYC/verificação facial.
 * 
 * Suporta: Capacitor (_system), PWA standalone, navegador normal
 */
export function openExternalLink(url: string): void {
  // Tenta usar Capacitor Browser plugin se disponível (melhor para apps nativos)
  const browserPlugin = (window as any).Capacitor?.Plugins?.Browser;
  if (browserPlugin?.open) {
    browserPlugin.open({ url, windowName: '_system' });
    return;
  }

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
    || (window.navigator as any).standalone === true;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isAndroid = userAgent.includes('android');
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isMobile = isAndroid || isIOS;
  
  // Android: Intent URL para forçar Chrome/navegador padrão
  if (isAndroid && (isStandalone || isMobile)) {
    try {
      const intentUrl = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = intentUrl;
      return;
    } catch (e) {
      console.log('Intent URL falhou, usando fallback');
    }
  }
  
  // iOS ou Standalone/Mobile: Técnica de "clean redirect"
  if (isIOS || isStandalone || isMobile) {
    const newWindow = window.open('about:blank', '_blank');
    if (newWindow) {
      newWindow.opener = null;
      newWindow.location.href = url;
      return;
    }
  }
  
  // Fallback: link com referrer policy limpo
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.referrerPolicy = 'no-referrer';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
