/**
 * Força a abertura de links externos no navegador nativo do dispositivo
 * (Safari, Chrome, etc.) em vez de dentro de um WebView embutido.
 * 
 * Isso resolve problemas de compatibilidade com sites como DETRAN-SP
 * que bloqueiam acesso via WebView.
 * 
 * Estratégias por plataforma:
 * - Android WebView/PWA: Intent URL para forçar Chrome/navegador padrão
 * - iOS PWA: window.open que abre Safari
 * - Outros: Elemento <a> com target="_blank"
 */
export function openExternalLink(url: string): void {
  // Detectar se está em standalone mode (PWA instalado)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
    || (window.navigator as any).standalone === true;
  
  // Detectar plataforma via user agent
  const userAgent = navigator.userAgent.toLowerCase();
  const isAndroid = userAgent.includes('android');
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  const isWebView = userAgent.includes('wv') || userAgent.includes('webview');
  
  // Método 1: Android Intent URL (força Chrome/navegador padrão)
  // Funciona em WebViews e PWAs Android
  if (isAndroid && (isStandalone || isWebView)) {
    try {
      const intentUrl = `intent://${url.replace(/^https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      window.location.href = intentUrl;
      return;
    } catch (e) {
      // Fallback se Intent falhar
      console.log('Intent URL falhou, usando fallback');
    }
  }
  
  // Método 2: iOS em PWA - window.open geralmente abre Safari
  if (isIOS && isStandalone) {
    window.open(url, '_blank');
    return;
  }
  
  // Método 3: Fallback universal - criar elemento <a> e simular clique
  // Funciona na maioria dos navegadores desktop e mobile
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  
  // Alguns atributos extras que podem ajudar em certos navegadores
  link.setAttribute('data-external', 'true');
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
