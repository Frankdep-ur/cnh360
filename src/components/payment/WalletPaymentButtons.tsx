import { useEffect, useState } from "react";
import { useStripe, PaymentRequestButtonElement } from "@stripe/react-stripe-js";
import { PaymentRequest } from "@stripe/stripe-js";

interface WalletPaymentButtonsProps {
  amount: number;
  label?: string;
  onPaymentMethod: (event: any) => void;
  onAvailabilityChange?: (available: boolean, type: 'applePay' | 'googlePay' | null) => void;
  clientSecret?: string | null;
}

export function WalletPaymentButtons({ 
  amount, 
  label = "Aula de Direção",
  onPaymentMethod,
  onAvailabilityChange,
  clientSecret
}: WalletPaymentButtonsProps) {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const [walletType, setWalletType] = useState<'applePay' | 'googlePay' | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    if (!stripe) {
      console.log("[WalletButtons] Stripe not loaded yet");
      return;
    }

    console.log("[WalletButtons] Creating payment request for amount:", amount);

    const pr = stripe.paymentRequest({
      country: 'BR',
      currency: 'brl',
      total: {
        label: label,
        amount: Math.round(amount * 100), // Convert to cents
      },
      requestPayerName: true,
      requestPayerEmail: true,
    });

    // Check if Apple Pay or Google Pay is available
    pr.canMakePayment().then(result => {
      console.log("[WalletButtons] canMakePayment result:", result);
      
      if (result) {
        setPaymentRequest(pr);
        setIsAvailable(true);
        
        const type = result.applePay ? 'applePay' : 'googlePay';
        setWalletType(type);
        console.log("[WalletButtons] Wallet available:", type);
        
        onAvailabilityChange?.(true, type);
      } else {
        console.log("[WalletButtons] No wallet available on this device");
        setIsAvailable(false);
        onAvailabilityChange?.(false, null);
      }
    }).catch(err => {
      console.error("[WalletButtons] Error checking wallet availability:", err);
      setIsAvailable(false);
      onAvailabilityChange?.(false, null);
    });

    // Handle payment method event
    pr.on('paymentmethod', async (ev) => {
      console.log("[WalletButtons] Payment method received:", ev.paymentMethod.id);
      
      if (clientSecret && stripe) {
        // Confirm the payment with the client secret
        const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        );

        if (confirmError) {
          console.error("[WalletButtons] Payment confirmation error:", confirmError);
          ev.complete('fail');
          return;
        }

        console.log("[WalletButtons] Payment confirmed:", paymentIntent?.status);
        ev.complete('success');
        
        if (paymentIntent?.status === 'requires_capture' || paymentIntent?.status === 'succeeded') {
          onPaymentMethod(ev);
        }
      } else {
        // Just pass the payment method to parent
        ev.complete('success');
        onPaymentMethod(ev);
      }
    });

    return () => {
      // Cleanup
    };
  }, [stripe, amount, label, clientSecret]);

  // Update amount when it changes
  useEffect(() => {
    if (paymentRequest) {
      paymentRequest.update({
        total: {
          label: label,
          amount: Math.round(amount * 100),
        },
      });
    }
  }, [amount, label, paymentRequest]);

  if (!isAvailable || !paymentRequest) {
    return null;
  }

  return (
    <div className="w-full">
      <PaymentRequestButtonElement
        options={{
          paymentRequest,
          style: {
            paymentRequestButton: {
              type: 'default',
              theme: 'dark',
              height: '56px',
            },
          },
        }}
      />
      <p className="text-xs text-muted-foreground text-center mt-2">
        {walletType === 'applePay' ? '🍎 Apple Pay' : '🔴 Google Pay'} disponível
      </p>
    </div>
  );
}

// Component to check wallet availability without rendering button
export function useWalletAvailability() {
  const stripe = useStripe();
  const [isAvailable, setIsAvailable] = useState(false);
  const [walletType, setWalletType] = useState<'applePay' | 'googlePay' | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: 'BR',
      currency: 'brl',
      total: {
        label: 'Check',
        amount: 100,
      },
    });

    pr.canMakePayment().then(result => {
      if (result) {
        setIsAvailable(true);
        setWalletType(result.applePay ? 'applePay' : 'googlePay');
      }
      setIsChecking(false);
    }).catch(() => {
      setIsChecking(false);
    });
  }, [stripe]);

  return { isAvailable, walletType, isChecking };
}
