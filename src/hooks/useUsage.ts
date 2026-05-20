import { useState, useEffect } from 'react';
import { apiClient, UsageResponse } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

export const useUsage = () => {
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient.getUsage();
      setUsage(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch usage data';
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Failed to load usage data",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const formatResetTime = (resetTime: string) => {
    const date = new Date(resetTime);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loadRazorpayCore = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const triggerPaymentFlow = async (plan: string = 'ats_one_time') => {
    setIsLoading(true);
    try {
      const res = await loadRazorpayCore();
      if (!res) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Razorpay SDK failed to load. Are you online?",
        });
        return;
      }

      // Create Order
      const order = await apiClient.createOrder(plan);

      const options = {
        key: order.key,
        amount: order.amount,
        currency: "INR",
        name: "Job Ready",
        description: `Purchase ${order.plan}`,
        order_id: order.order_id,
        handler: async function (response: any) {
          try {
            const data = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              user_id: order.notes?.user_id || "",
              plan_name: plan
            };

            await apiClient.verifyPayment(data);

            toast({
              title: "Success",
              description: "Payment successful! Your credits have been added.",
            });

            fetchUsage(); // Refresh usage limits

          } catch (err: any) {
            toast({
              variant: "destructive",
              title: "Verification Failed",
              description: err.message || "Payment verification failed",
            });
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        theme: {
          color: "#3399cc"
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();

    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: err.message || "Something went wrong during payment",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    usage,
    isLoading,
    error,
    fetchUsage,
    formatResetTime,
    triggerPaymentFlow,
  };
};
