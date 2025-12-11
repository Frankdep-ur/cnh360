/**
 * Valida CPF usando o algoritmo oficial do Brasil (mod-11)
 * @param cpf - CPF com ou sem formatação
 * @returns true se o CPF é válido
 */
export function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, "");

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) {
    return false;
  }

  // Verifica se todos os dígitos são iguais (CPFs inválidos conhecidos)
  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cleanCPF.charAt(9))) {
    return false;
  }

  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) {
    remainder = 0;
  }
  if (remainder !== parseInt(cleanCPF.charAt(10))) {
    return false;
  }

  return true;
}

/**
 * Formata CPF para o padrão brasileiro (000.000.000-00)
 * @param value - String com números
 * @returns CPF formatado
 */
export function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, "");
  return numbers
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
}

/**
 * Valida placa de veículo (formatos antigo e Mercosul)
 * @param placa - Placa do veículo
 * @returns true se a placa é válida
 */
export function validatePlaca(placa: string): boolean {
  const cleanPlaca = placa.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  
  // Formato antigo: ABC1234
  const formatoAntigo = /^[A-Z]{3}\d{4}$/;
  
  // Formato Mercosul: ABC1D23
  const formatoMercosul = /^[A-Z]{3}\d[A-Z]\d{2}$/;
  
  return formatoAntigo.test(cleanPlaca) || formatoMercosul.test(cleanPlaca);
}
