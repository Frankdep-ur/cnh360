import { z } from "zod";

// CPF validation with checksum
export const validateCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, "");
  
  if (numbers.length !== 11) return false;
  
  // Check for known invalid patterns
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  // Calculate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[9])) return false;
  
  // Calculate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(numbers[10])) return false;
  
  return true;
};

// CNPJ validation with checksum
export const validateCNPJ = (cnpj: string): boolean => {
  const numbers = cnpj.replace(/\D/g, "");
  
  if (numbers.length !== 14) return false;
  
  // Check for known invalid patterns
  if (/^(\d)\1+$/.test(numbers)) return false;
  
  // First digit validation
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * weights1[i];
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;
  if (digit1 !== parseInt(numbers[12])) return false;
  
  // Second digit validation
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i]) * weights2[i];
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;
  if (digit2 !== parseInt(numbers[13])) return false;
  
  return true;
};

// Zod schemas
export const cpfSchema = z.string()
  .min(14, "CPF deve ter 11 dígitos")
  .refine((val) => validateCPF(val), "CPF inválido");

export const cnpjSchema = z.string()
  .min(18, "CNPJ deve ter 14 dígitos")
  .refine((val) => validateCNPJ(val), "CNPJ inválido");

export const nameSchema = z.string()
  .min(3, "Nome deve ter pelo menos 3 caracteres")
  .max(100, "Nome muito longo")
  .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome deve conter apenas letras");

export const emailSchema = z.string()
  .email("E-mail inválido")
  .max(255, "E-mail muito longo");

export const phoneSchema = z.string()
  .min(14, "Telefone deve ter 10 ou 11 dígitos")
  .max(15, "Telefone inválido");

export const credentialSchema = z.string()
  .min(3, "Credencial muito curta")
  .max(50, "Credencial muito longa");

export const cnhSchema = z.string()
  .min(9, "CNH deve ter pelo menos 9 dígitos")
  .max(11, "CNH inválida")
  .regex(/^\d+$/, "CNH deve conter apenas números");

export const plateSchema = z.string()
  .min(7, "Placa inválida")
  .max(8, "Placa inválida")
  .regex(/^[A-Z]{3}-?\d[A-Z0-9]\d{2}$/i, "Formato de placa inválido");

export const vehicleModelSchema = z.string()
  .min(2, "Modelo muito curto")
  .max(50, "Modelo muito longo");

// Complete schemas for each onboarding form
export const autoescolaStep1Schema = z.object({
  cnpj: cnpjSchema,
  razaoSocial: z.string().min(3, "Razão social obrigatória").max(200, "Razão social muito longa"),
  nomeFantasia: z.string().max(200, "Nome fantasia muito longo").optional(),
});

export const autoescolaStep2Schema = z.object({
  credencialDetran: credentialSchema,
});

export const autoescolaStep3Schema = z.object({
  responsavel: nameSchema,
  email: emailSchema,
  whatsapp: phoneSchema,
});

export const instrutorStep1Schema = z.object({
  name: nameSchema,
  cpf: cpfSchema,
});

export const instrutorStep2Schema = z.object({
  detranCredential: credentialSchema,
  cnh: cnhSchema,
});

export const instrutorStep3Schema = z.object({
  carModel: vehicleModelSchema,
  carPlate: plateSchema,
  transmission: z.enum(["manual", "automatico"]),
});

export const alunoStep1Schema = z.object({
  name: nameSchema,
  cpf: cpfSchema,
});
