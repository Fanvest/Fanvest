'use client';

import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { parseEther, createWalletClient, createPublicClient, custom, http, Address } from 'viem';
import { chilizSpicy, chilizMainnet } from '@/lib/web3/config';
import ClubTokenABI from '@/lib/contracts/ClubToken.json';

interface BuyTokensParams {
  clubId: string;
  tokenAddress: string;
  tokenSymbol: string;
  amount: number;
  pricePerToken: number;
  testnet?: boolean;
}

interface BuyTokensResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export function useBuyTokens() {
  const { authenticated, user } = usePrivy();
  const { wallets } = useWallets();
  const [isBuying, setIsBuying] = useState(false);

  const buyTokens = async (params: BuyTokensParams): Promise<BuyTokensResult> => {
    if (!authenticated || !user) {
      return {
        success: false,
        error: 'Veuillez vous connecter pour acheter des tokens'
      };
    }

    const wallet = wallets[0]; // Utiliser le premier wallet disponible
    if (!wallet) {
      return {
        success: false,
        error: 'Aucun wallet connecté'
      };
    }

    setIsBuying(true);

    try {
      const { tokenAddress, amount, pricePerToken, tokenSymbol, testnet = true } = params;
      const totalCostCHZ = amount * pricePerToken;

      // Toujours utiliser la base de données pour la simulation
      console.log('📀 DATABASE MODE: Purchasing tokens via API...');
      
      // Appeler notre API pour enregistrer l'achat
      const response = await fetch(`/api/clubs/${params.clubId}/buy-tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          amount,
          pricePerToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'achat');
      }

      const result = await response.json();
      
      console.log('✅ Database purchase successful:', {
        tokenSymbol,
        amount,
        totalCost: totalCostCHZ,
        transactionHash: result.transactionHash,
        totalTokens: result.totalTokens
      });

      return {
        success: true,
        transactionHash: result.transactionHash
      };

    } catch (error: any) {
      console.error('Token purchase failed:', error);
      
      // Gérer les erreurs spécifiques
      if (error.message?.includes('insufficient funds')) {
        return {
          success: false,
          error: 'Solde CHZ insuffisant pour cette transaction'
        };
      }
      
      if (error.message?.includes('user rejected')) {
        return {
          success: false,
          error: 'Transaction annulée par l\'utilisateur'
        };
      }

      return {
        success: false,
        error: error.message || 'Échec de l\'achat des tokens'
      };
    } finally {
      setIsBuying(false);
    }
  };

  return {
    buyTokens,
    isBuying
  };
}