'use client';

import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { createWalletClient, custom, parseEther } from 'viem';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chiliz, chilizSpicy } from '@/lib/wagmi';

interface CreateTokenParams {
  clubId: string;
  tokenName: string;
  tokenSymbol: string;
  totalSupply: string; // in tokens (will be converted to wei)
  pricePerToken: string; // in CHZ
  testnet?: boolean;
}

interface TokenCreationResult {
  success: boolean;
  tokenAddress?: string;
  transactionHash?: string;
  error?: string;
}

export function useCreateClubToken() {
  const { wallets } = useWallets();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const activeWallet = wallets.find(wallet => wallet.walletClientType === 'privy');

  const createTokenMutation = useMutation({
    mutationFn: async (params: CreateTokenParams): Promise<TokenCreationResult> => {
      if (!activeWallet) {
        throw new Error('No wallet connected');
      }

      setIsCreating(true);

      try {
        // 1. Deploy smart contract
        const deployResult = await deployClubToken(params);
        
        if (!deployResult.success || !deployResult.tokenAddress) {
          throw new Error(deployResult.error || 'Failed to deploy contract');
        }

        // 2. Update club in database
        const updateResult = await updateClubWithToken({
          clubId: params.clubId,
          tokenAddress: deployResult.tokenAddress,
          tokenSymbol: params.tokenSymbol,
          totalSupply: params.totalSupply,
          pricePerToken: params.pricePerToken,
          transactionHash: deployResult.transactionHash
        });

        if (!updateResult.success) {
          console.warn('Contract deployed but DB update failed:', updateResult.error);
        }

        // 3. Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['clubs'] });
        queryClient.invalidateQueries({ queryKey: ['blockchain-permissions'] });

        return deployResult;
      } catch (error: any) {
        console.error('Token creation failed:', error);
        return {
          success: false,
          error: error.message || 'Failed to create token'
        };
      } finally {
        setIsCreating(false);
      }
    }
  });

  // Deploy the actual smart contract
  const deployClubToken = async (params: CreateTokenParams): Promise<TokenCreationResult> => {
    try {
      const provider = await activeWallet!.getEthereumProvider();
      const walletClient = createWalletClient({
        transport: custom(provider),
        chain: params.testnet ? chilizSpicy : chiliz
      });

      // For now, this is a placeholder for actual contract deployment
      // In production, you would:
      // 1. Have a factory contract deployed
      // 2. Call factory.createClubToken() with parameters
      // 3. Get the deployed token address from event logs

      // Placeholder contract deployment
      const totalSupplyWei = parseEther(params.totalSupply);
      const priceWei = parseEther(params.pricePerToken);

      // Example factory contract call (replace with actual contract)
      // const factoryAddress = '0x...' // Your deployed factory address
      // const hash = await walletClient.writeContract({
      //   address: factoryAddress,
      //   abi: FACTORY_ABI,
      //   functionName: 'createClubToken',
      //   args: [params.tokenName, params.tokenSymbol, totalSupplyWei, priceWei]
      // });

      // For demo purposes, simulate contract deployment
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
      
      const mockTokenAddress = `0x${Math.random().toString(16).substr(2, 40)}`;
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      return {
        success: true,
        tokenAddress: mockTokenAddress,
        transactionHash: mockTxHash
      };

    } catch (error: any) {
      console.error('Contract deployment failed:', error);
      return {
        success: false,
        error: error.message || 'Contract deployment failed'
      };
    }
  };

  // Update club in database with token info
  const updateClubWithToken = async (data: {
    clubId: string;
    tokenAddress: string;
    tokenSymbol: string;
    totalSupply: string;
    pricePerToken: string;
    transactionHash?: string;
  }) => {
    try {
      const response = await fetch(`/api/clubs/${data.clubId}/token`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update club');
      }

      return { success: true };
    } catch (error: any) {
      console.error('DB update failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  };

  return {
    createToken: createTokenMutation.mutateAsync,
    isCreating: isCreating || createTokenMutation.isPending,
    error: createTokenMutation.error,
    isSuccess: createTokenMutation.isSuccess,
    reset: createTokenMutation.reset
  };
}