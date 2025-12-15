// List of generic/fake names that should be blocked for real accounts
const GENERIC_NAMES = [
  "teste", "test", "usuario", "user", "aluno", "instrutor", "autoescola",
  "admin", "administrador", "fake", "exemplo", "example", "demo",
  "nome", "name", "aaa", "bbb", "ccc", "xxx", "yyy", "zzz",
  "asdf", "qwert", "12345", "abcde", "conta", "account",
  "fulano", "beltrano", "ciclano", "sicrano", "joao da silva",
  "maria", "jose", "teste1", "teste2", "aluno1", "aluno2",
  "instrutor1", "instrutor2", "pessoa", "ninguem", "nobody"
];

const GENERIC_PATTERNS = [
  /^teste?\s*\d*$/i,
  /^aluno\s*\d*$/i,
  /^instrutor\s*\d*$/i,
  /^user\s*\d*$/i,
  /^admin\s*\d*$/i,
  /^demo\s*\d*$/i,
  /^fake\s*\d*$/i,
  /^conta\s*\d*$/i,
  /^autoescola\s*\d*$/i,
  /^\d+$/,
  /^[a-z]{1,3}$/i,
  /^(.)\1+$/i, // repeated characters like "aaa" or "xxx"
];

export interface NameValidationResult {
  isValid: boolean;
  isGeneric: boolean;
  message?: string;
}

/**
 * Validates if a name is a real name or a generic/test name
 */
export function validateRealName(name: string): NameValidationResult {
  const trimmedName = name.trim().toLowerCase();
  
  // Check if name is empty
  if (!trimmedName) {
    return {
      isValid: false,
      isGeneric: false,
      message: "Nome é obrigatório"
    };
  }

  // Check minimum length (at least first and last name)
  if (trimmedName.length < 5) {
    return {
      isValid: false,
      isGeneric: true,
      message: "Use seu nome completo (nome e sobrenome)"
    };
  }

  // Check if has at least two words (first and last name)
  const words = trimmedName.split(/\s+/).filter(w => w.length > 1);
  if (words.length < 2) {
    return {
      isValid: false,
      isGeneric: false,
      message: "Informe nome e sobrenome"
    };
  }

  // Check against generic names list
  if (GENERIC_NAMES.some(generic => trimmedName.includes(generic))) {
    return {
      isValid: false,
      isGeneric: true,
      message: "Use seu nome real para credenciamento válido no DETRAN. Contas com nome fake serão bloqueadas."
    };
  }

  // Check against generic patterns
  for (const pattern of GENERIC_PATTERNS) {
    if (pattern.test(trimmedName) || words.some(word => pattern.test(word))) {
      return {
        isValid: false,
        isGeneric: true,
        message: "Use seu nome real para credenciamento válido no DETRAN. Contas com nome fake serão bloqueadas."
      };
    }
  }

  return {
    isValid: true,
    isGeneric: false
  };
}

/**
 * Check if a name appears to be a test/generic account name
 */
export function isTestAccountName(name: string | null | undefined): boolean {
  if (!name) return true;
  
  const result = validateRealName(name);
  return result.isGeneric || !result.isValid;
}
