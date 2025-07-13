'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export function useTokenBalance(clubId: string | undefined) {
  const { authenticated, user } = usePrivy();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    if (!authenticated || !clubId || !user) {
      setBalance(0);
      setPercentage(0);
      return;
    }

    loadBalance();
  }, [authenticated, clubId, user]);

  const loadBalance = async () => {
    if (!clubId || !user?.id) return;

    setIsLoading(true);

    try {
      // Appeler notre API pour récupérer le solde
      const response = await fetch(`/api/users/${user.id}/token-balance?clubId=${clubId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const data = await response.json();
      setBalance(data.balance || 0);
      setPercentage(data.percentage || 0);

      console.log('Token balance loaded:', {
        clubId,
        balance: data.balance,
        percentage: data.percentage
      });

    } catch (error) {
      console.error('Error loading token balance:', error);
      setBalance(0);
      setPercentage(0);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    balance,
    percentage,
    isLoading,
    refetch: loadBalance
  };
}