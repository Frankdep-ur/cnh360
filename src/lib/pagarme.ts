// Pagar.me configuration
// Chave pública da Pagar.me - centralizada para uso em todo o projeto
export const PAGARME_PUBLIC_KEY = import.meta.env.VITE_PAGARME_PUBLIC_KEY || "";

// API base URL
export const PAGARME_API_URL = "https://api.pagar.me/core/v5";

// Payment discount for PIX
export const PIX_DISCOUNT_PERCENTAGE = 5; // 5% discount for PIX payments

// Checkout configuration
export const PAGARME_CHECKOUT_CONFIG = {
  expiresIn: 3600, // 1 hour
  acceptedPaymentMethods: ["credit_card", "pix"],
  statementDescriptor: "CNH360",
};

// Card data interface
export interface CardData {
  number: string;
  holder_name: string;
  exp_month: string;
  exp_year: string;
  cvv: string;
}

// Format card number with spaces (4444 5555 6666 7777)
export function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim()
    .slice(0, 19);
}

// Detect card brand from number
export function getCardBrand(number: string): "visa" | "mastercard" | "amex" | "elo" | "hipercard" | "unknown" {
  const n = number.replace(/\s/g, "");
  if (/^4/.test(n)) return "visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "mastercard";
  if (/^3[47]/.test(n)) return "amex";
  if (/^(636368|438935|504175|451416|636297|5067|4576|4011|6504|6516|6550)/.test(n)) return "elo";
  if (/^(606282|3841)/.test(n)) return "hipercard";
  return "unknown";
}

// Validate card data
export function validateCard(cardData: CardData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validate card number (13-19 digits)
  const cleanNumber = cardData.number.replace(/\s/g, "");
  if (!cleanNumber || cleanNumber.length < 13 || cleanNumber.length > 19) {
    errors.push("Número do cartão inválido");
  } else if (!luhnCheck(cleanNumber)) {
    errors.push("Número do cartão inválido");
  }
  
  // Validate holder name (minimum 3 characters)
  if (!cardData.holder_name || cardData.holder_name.trim().length < 3) {
    errors.push("Nome do titular inválido");
  }
  
  // Validate expiration month
  const month = parseInt(cardData.exp_month);
  if (!cardData.exp_month || isNaN(month) || month < 1 || month > 12) {
    errors.push("Mês de validade inválido");
  }
  
  // Validate expiration year
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;
  const year = parseInt(cardData.exp_year);
  
  if (!cardData.exp_year || isNaN(year)) {
    errors.push("Ano de validade inválido");
  } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
    errors.push("Cartão expirado");
  }
  
  // Validate CVV (3-4 digits)
  const brand = getCardBrand(cardData.number);
  const cvvLength = brand === "amex" ? 4 : 3;
  if (!cardData.cvv || cardData.cvv.length < 3 || cardData.cvv.length > 4) {
    errors.push(`CVV deve ter ${cvvLength} dígitos`);
  }
  
  return { valid: errors.length === 0, errors };
}

// Luhn algorithm for card number validation
function luhnCheck(cardNumber: string): boolean {
  let sum = 0;
  let isEven = false;
  
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

// Format expiration input (auto-advance from month to year)
export function formatExpMonth(value: string): string {
  return value.replace(/\D/g, "").slice(0, 2);
}

export function formatExpYear(value: string): string {
  return value.replace(/\D/g, "").slice(0, 2);
}

export function formatCVV(value: string): string {
  return value.replace(/\D/g, "").slice(0, 4);
}
