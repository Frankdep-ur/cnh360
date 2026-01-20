import { useState, useEffect, useCallback } from "react";

// Pagar.me public key for merchant identification
const PAGARME_PUBLIC_KEY = import.meta.env.VITE_PAGARME_PUBLIC_KEY || "";

// Google Pay types
declare global {
  interface Window {
    google?: {
      payments: {
        api: {
          PaymentsClient: new (config: any) => GooglePayClient;
        };
      };
    };
    ApplePaySession?: {
      STATUS_SUCCESS: number;
      STATUS_FAILURE: number;
      canMakePayments: () => boolean;
      new (version: number, request: ApplePayRequest): ApplePaySessionInstance;
    };
  }
}

interface GooglePayClient {
  isReadyToPay: (request: any) => Promise<{ result: boolean }>;
  createButton: (config: any) => HTMLElement;
  loadPaymentData: (request: any) => Promise<GooglePaymentData>;
}

interface GooglePaymentData {
  paymentMethodData: {
    tokenizationData: {
      token: string;
    };
    info: {
      cardNetwork: string;
      cardDetails: string;
    };
  };
}

interface ApplePayRequest {
  countryCode: string;
  currencyCode: string;
  supportedNetworks: string[];
  merchantCapabilities: string[];
  total: {
    label: string;
    amount: string;
  };
}

interface ApplePaySessionInstance {
  begin: () => void;
  abort: () => void;
  completeMerchantValidation: (session: any) => void;
  completePayment: (status: number) => void;
  onvalidatemerchant: (event: any) => void;
  onpaymentauthorized: (event: any) => void;
  oncancel: () => void;
}

interface WalletPaymentResult {
  success: boolean;
  walletToken?: string;
  walletType?: "google_pay" | "apple_pay";
  cardNetwork?: string;
  cardLastFour?: string;
  error?: string;
}

// Load Google Pay script
let googlePayScriptLoaded = false;
let googlePayScriptPromise: Promise<void> | null = null;

function loadGooglePayScript(): Promise<void> {
  if (googlePayScriptLoaded && window.google?.payments) {
    return Promise.resolve();
  }

  if (googlePayScriptPromise) {
    return googlePayScriptPromise;
  }

  googlePayScriptPromise = new Promise((resolve, reject) => {
    if (window.google?.payments) {
      googlePayScriptLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://pay.google.com/gp/p/js/pay.js";
    script.async = true;
    
    script.onload = () => {
      googlePayScriptLoaded = true;
      resolve();
    };
    
    script.onerror = () => {
      googlePayScriptPromise = null;
      reject(new Error("Erro ao carregar Google Pay"));
    };

    document.head.appendChild(script);
  });

  return googlePayScriptPromise;
}

export function useWalletPayments(amount: number) {
  const [googlePayReady, setGooglePayReady] = useState(false);
  const [applePayReady, setApplePayReady] = useState(false);
  const [googlePayClient, setGooglePayClient] = useState<GooglePayClient | null>(null);
  const [loading, setLoading] = useState(false);

  // Google Pay configuration
  const baseGooglePayRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [
      {
        type: "CARD",
        parameters: {
          allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
          allowedCardNetworks: ["VISA", "MASTERCARD", "ELO"],
        },
        tokenizationSpecification: {
          type: "PAYMENT_GATEWAY",
          parameters: {
            gateway: "pagarme",
            gatewayMerchantId: PAGARME_PUBLIC_KEY,
          },
        },
      },
    ],
  };

  // Check Google Pay availability
  useEffect(() => {
    if (!PAGARME_PUBLIC_KEY) {
      console.log("[useWalletPayments] No public key configured");
      return;
    }

    loadGooglePayScript()
      .then(() => {
        if (!window.google?.payments) return;

        const client = new window.google.payments.api.PaymentsClient({
          environment: PAGARME_PUBLIC_KEY.startsWith("pk_test") ? "TEST" : "PRODUCTION",
        });

        client.isReadyToPay(baseGooglePayRequest)
          .then((response) => {
            if (response.result) {
              setGooglePayReady(true);
              setGooglePayClient(client);
              console.log("[useWalletPayments] Google Pay is ready");
            }
          })
          .catch((err) => {
            console.log("[useWalletPayments] Google Pay not available:", err);
          });
      })
      .catch((err) => {
        console.log("[useWalletPayments] Failed to load Google Pay:", err);
      });
  }, []);

  // Check Apple Pay availability
  useEffect(() => {
    if (window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
      setApplePayReady(true);
      console.log("[useWalletPayments] Apple Pay is ready");
    }
  }, []);

  // Process Google Pay payment
  const processGooglePay = useCallback(async (): Promise<WalletPaymentResult> => {
    if (!googlePayClient) {
      return { success: false, error: "Google Pay não disponível" };
    }

    setLoading(true);

    try {
      const paymentDataRequest = {
        ...baseGooglePayRequest,
        transactionInfo: {
          totalPriceStatus: "FINAL",
          totalPrice: amount.toFixed(2),
          currencyCode: "BRL",
          countryCode: "BR",
        },
        merchantInfo: {
          merchantId: PAGARME_PUBLIC_KEY,
          merchantName: "CNH360",
        },
      };

      const paymentData = await googlePayClient.loadPaymentData(paymentDataRequest);
      
      console.log("[useWalletPayments] Google Pay token received");

      return {
        success: true,
        walletToken: paymentData.paymentMethodData.tokenizationData.token,
        walletType: "google_pay",
        cardNetwork: paymentData.paymentMethodData.info.cardNetwork,
        cardLastFour: paymentData.paymentMethodData.info.cardDetails,
      };
    } catch (err: any) {
      console.error("[useWalletPayments] Google Pay error:", err);
      
      // User cancelled
      if (err.statusCode === "CANCELED") {
        return { success: false, error: "Pagamento cancelado" };
      }
      
      return { success: false, error: err.message || "Erro no Google Pay" };
    } finally {
      setLoading(false);
    }
  }, [googlePayClient, amount]);

  // Process Apple Pay payment
  const processApplePay = useCallback(async (): Promise<WalletPaymentResult> => {
    if (!window.ApplePaySession) {
      return { success: false, error: "Apple Pay não disponível" };
    }

    setLoading(true);

    return new Promise((resolve) => {
      try {
        const request: ApplePayRequest = {
          countryCode: "BR",
          currencyCode: "BRL",
          supportedNetworks: ["visa", "masterCard", "elo"],
          merchantCapabilities: ["supports3DS"],
          total: {
            label: "CNH360 - Aula de Direção",
            amount: amount.toFixed(2),
          },
        };

        const session = new window.ApplePaySession!(3, request);

        session.onvalidatemerchant = async (event: any) => {
          // In production, you'd call your server to validate with Apple
          // For now, we'll simulate validation
          console.log("[useWalletPayments] Apple Pay merchant validation:", event.validationURL);
          
          // Note: Real implementation requires server-side validation
          // session.completeMerchantValidation(merchantSession);
          session.abort();
          setLoading(false);
          resolve({ 
            success: false, 
            error: "Apple Pay requer configuração de merchant no servidor" 
          });
        };

        session.onpaymentauthorized = (event: any) => {
          console.log("[useWalletPayments] Apple Pay authorized");
          
          const token = JSON.stringify(event.payment.token.paymentData);
          
          session.completePayment(window.ApplePaySession!.STATUS_SUCCESS);
          setLoading(false);
          
          resolve({
            success: true,
            walletToken: token,
            walletType: "apple_pay",
            cardNetwork: event.payment.token.paymentMethod.network,
          });
        };

        session.oncancel = () => {
          setLoading(false);
          resolve({ success: false, error: "Pagamento cancelado" });
        };

        session.begin();
      } catch (err: any) {
        setLoading(false);
        resolve({ success: false, error: err.message || "Erro no Apple Pay" });
      }
    });
  }, [amount]);

  return {
    googlePayReady,
    applePayReady,
    processGooglePay,
    processApplePay,
    loading,
    hasWallets: googlePayReady || applePayReady,
  };
}
