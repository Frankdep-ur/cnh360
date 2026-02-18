// Digital wallet payments (Google Pay / Apple Pay)
// Currently DISABLED - requires Pagar.me public key and Apple merchant configuration
// Keep this file for future reactivation

interface WalletPaymentResult {
  success: boolean;
  walletToken?: string;
  walletType?: "google_pay" | "apple_pay";
  cardNetwork?: string;
  cardLastFour?: string;
  error?: string;
}

export function useWalletPayments(_amount: number) {
  const noop = async (): Promise<WalletPaymentResult> => ({
    success: false,
    error: "Carteira digital não disponível",
  });

  return {
    googlePayReady: false as const,
    applePayReady: false as const,
    processGooglePay: noop,
    processApplePay: noop,
    loading: false,
    hasWallets: false as const,
  };
}
