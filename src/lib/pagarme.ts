// Pagar.me configuration
// Chave pública da Pagar.me - centralizada para uso em todo o projeto
export const PAGARME_PUBLIC_KEY = import.meta.env.VITE_PAGARME_PUBLIC_KEY || "";

// API base URL
export const PAGARME_API_URL = "https://api.pagar.me/core/v5";

// Checkout configuration
export const PAGARME_CHECKOUT_CONFIG = {
  expiresIn: 3600, // 1 hour
  acceptedPaymentMethods: ["credit_card", "pix"],
  statementDescriptor: "CNH360",
};
