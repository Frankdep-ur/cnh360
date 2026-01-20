import { useState, useCallback, useEffect } from "react";
import type { CardData } from "@/lib/pagarme";

// Pagar.me public key from env (publishable, safe to use in frontend)
const PAGARME_PUBLIC_KEY = import.meta.env.VITE_PAGARME_PUBLIC_KEY || "";

// Pagar.me encryption library types
declare global {
  interface Window {
    pagarme: {
      client: {
        connect: (options: { encryption_key: string }) => Promise<PagarmeClient>;
      };
    };
  }
}

interface PagarmeClient {
  security: {
    encrypt: (cardData: {
      card_number: string;
      card_holder_name: string;
      card_expiration_date: string;
      card_cvv: string;
    }) => Promise<string>;
  };
}

interface TokenizeResult {
  success: boolean;
  cardHash?: string;
  error?: string;
}

// Load Pagar.me script once
let scriptLoaded = false;
let scriptPromise: Promise<void> | null = null;

function loadPagarmeScript(): Promise<void> {
  if (scriptLoaded && window.pagarme) {
    return Promise.resolve();
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.pagarme) {
      scriptLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://assets.pagar.me/pagarme-js/4.x/pagarme.min.js";
    script.async = true;
    
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Erro ao carregar SDK de pagamento"));
    };

    document.head.appendChild(script);
  });

  return scriptPromise;
}

export function usePagarmeToken() {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load SDK on mount
  useEffect(() => {
    loadPagarmeScript()
      .then(() => setIsReady(true))
      .catch((err) => {
        console.error("[usePagarmeToken] Failed to load SDK:", err);
        setError("Erro ao carregar SDK de pagamento");
      });
  }, []);

  const tokenize = useCallback(async (cardData: CardData): Promise<TokenizeResult> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate public key
      if (!PAGARME_PUBLIC_KEY) {
        throw new Error("Chave pública Pagar.me não configurada");
      }

      // Ensure SDK is loaded
      await loadPagarmeScript();

      if (!window.pagarme) {
        throw new Error("SDK Pagar.me não disponível");
      }

      // Connect to Pagar.me
      const client = await window.pagarme.client.connect({
        encryption_key: PAGARME_PUBLIC_KEY,
      });

      // Format expiration date as MMYY
      const expMonth = cardData.exp_month.padStart(2, "0");
      const expYear = cardData.exp_year.length === 4 
        ? cardData.exp_year.slice(-2) 
        : cardData.exp_year;

      // Encrypt card data to get card_hash
      const cardHash = await client.security.encrypt({
        card_number: cardData.number.replace(/\s/g, ""),
        card_holder_name: cardData.holder_name.toUpperCase(),
        card_expiration_date: `${expMonth}${expYear}`,
        card_cvv: cardData.cvv,
      });

      console.log("[usePagarmeToken] Card tokenized successfully");

      return { success: true, cardHash };
    } catch (err: any) {
      const errorMessage = err.message || "Erro ao tokenizar cartão";
      console.error("[usePagarmeToken] Tokenization error:", errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    tokenize,
    isLoading,
    isReady,
    error,
    hasPublicKey: !!PAGARME_PUBLIC_KEY,
  };
}
