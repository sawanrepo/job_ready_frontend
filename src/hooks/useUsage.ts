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

  const triggerPaymentFlow = () => {
    console.log("Trigger Payment Flow");
    toast({
      title: "Payment Flow",
      description: "Payment integration coming soon!",
    });
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