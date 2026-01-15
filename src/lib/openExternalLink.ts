/**
 * Força a abertura de links externos no navegador nativo do dispositivo
 * (Safari, Chrome, etc.) em vez de dentro de um WebView embutido.
 * 
 * Isso resolve problemas de compatibilidade com sites como DETRAN-SP
 * que bloqueiam acesso via WebView.
 */
export function openExternalLink(url: string): void {
  // Criar elemento <a> temporário
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer external';
  
  // Para iOS Safari - forçar comportamento de link externo
  link.setAttribute('data-external', 'true');
  
  // Adicionar temporariamente ao DOM, clicar e remover
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
