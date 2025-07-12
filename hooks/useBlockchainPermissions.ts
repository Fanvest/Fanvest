'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useQuery } from '@tanstack/react-query';
import { BlockchainService } from '@/lib/blockchain-service';

interface BlockchainPermissions {
  isOwner: boolean;
  canManage: boolean;
  canVote: boolean;
  canCreatePolls: boolean;
  tokenBalance: string;
  hasTokens: boolean;
}

// Hook to get permissions from blockchain
export function useBlockchainPermissions(clubTokenAddress?: string, testnet: boolean = true) {
  const { user, authenticated } = usePrivy();
  const walletAddress = user?.wallet?.address;

  const { data: permissions, isLoading, error } = useQuery({
    queryKey: ['blockchain-permissions', walletAddress, clubTokenAddress, testnet],
    queryFn: async () => {
      if (!walletAddress || !clubTokenAddress) {
        return {
          isOwner: false,
          canManage: false,
          canVote: false,
          canCreatePolls: false,
          tokenBalance: '0',
          hasTokens: false
        };
      }

      return BlockchainService.getUserClubPermissions(
        walletAddress,
        clubTokenAddress,
        testnet
      );
    },
    enabled: !!walletAddress && !!clubTokenAddress && authenticated,
    staleTime: 30000, // Cache for 30 seconds
    refetchInterval: 60000 // Refetch every minute
  });

  return {
    permissions: permissions || {
      isOwner: false,
      canManage: false,
      canVote: false,
      canCreatePolls: false,
      tokenBalance: '0',
      hasTokens: false
    },
    isLoading,
    error
  };
}

// Hook to check token balance
export function useTokenBalance(tokenAddress?: string, testnet: boolean = true) {
  const { user } = usePrivy();
  const walletAddress = user?.wallet?.address;

  const { data: balance, isLoading, error } = useQuery({
    queryKey: ['token-balance', walletAddress, tokenAddress, testnet],
    queryFn: async () => {
      if (!walletAddress || !tokenAddress) return '0';

      const balance = await BlockchainService.getUserTokenBalance(
        walletAddress,
        tokenAddress,
        testnet
      );

      return balance.toString();
    },
    enabled: !!walletAddress && !!tokenAddress,
    staleTime: 30000,
    refetchInterval: 60000
  });

  return {
    balance: balance || '0',
    isLoading,
    error,
    hasTokens: balance ? BigInt(balance) > 0n : false
  };
}

// Hook to check if user owns any clubs
export function useIsClubOwner(clubs: { tokenAddress?: string | null }[], testnet: boolean = true) {
  const { user, authenticated } = usePrivy();
  const walletAddress = user?.wallet?.address;

  const { data: isOwner, isLoading } = useQuery({
    queryKey: ['is-club-owner', walletAddress, clubs.map(c => c.tokenAddress), testnet],
    queryFn: async () => {
      if (!walletAddress || clubs.length === 0) return false;

      return BlockchainService.isClubOwner(walletAddress, clubs, testnet);
    },
    enabled: !!walletAddress && authenticated && clubs.length > 0,
    staleTime: 30000
  });

  return {
    isClubOwner: isOwner || false,
    isLoading
  };
}

// Hook to get token info
export function useTokenInfo(tokenAddress?: string, testnet: boolean = true) {
  const { data: tokenInfo, isLoading, error } = useQuery({
    queryKey: ['token-info', tokenAddress, testnet],
    queryFn: async () => {
      if (!tokenAddress) return null;

      return BlockchainService.getTokenInfo(tokenAddress, testnet);
    },
    enabled: !!tokenAddress,
    staleTime: 300000 // Cache for 5 minutes
  });

  return {
    tokenInfo,
    isLoading,
    error
  };
}