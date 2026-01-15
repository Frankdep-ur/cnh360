/**
 * Força a abertura de links externos no navegador nativo do dispositivo
 * (Safari, Chrome, etc.) em vez de dentro de um WebView embutido.
 * 
 * Isso resolve problemas de compatibilidade com sites como DETRAN-SP
 * que bloqueiam acesso via WebView.
 * 
 * Técnica: "Clean Redirect" - Abre about:blank primeiro para quebrar
 * completamente a cadeia de referrer e contexto de origem PWA/WebView.
 */
export function openExternalLink(url: string): void {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
    || (window.navigator as any).standalone === true;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isAndroid = userAgent.includes('android');
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  
  // Android em standalone: Intent URL para forçar Chrome/navegador padrão
  if (isAndroid && isStandalone) {
    try {
      const intentUrl = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = intentUrl;
      return;
    } catch (e) {
      console.log('Intent URL falhou, usando fallback');
    }
  }
  
  // iOS ou Standalone: Técnica de "clean redirect"
  // Abre about:blank primeiro para quebrar completamente o referrer e contexto
  if (isIOS || isStandalone) {
    const newWindow = window.open('about:blank', '_blank');
    if (newWindow) {
      // Limpa qualquer referência ao opener (PWA)
      newWindow.opener = null;
      // Redireciona para a URL final a partir de uma página "limpa"
      newWindow.location.href = url;
      return;
    }
  }
  
  // Fallback universal: criar link com referrer policy que remove origem
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.referrerPolicy = 'no-referrer';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
