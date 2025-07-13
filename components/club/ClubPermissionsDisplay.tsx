'use client';

import { useBlockchainPermissions, useTokenBalance } from '@/hooks/useBlockchainPermissions';
import { formatEther } from 'viem';

interface ClubPermissionsDisplayProps {
  clubTokenAddress: string;
  testnet?: boolean;
}

export function ClubPermissionsDisplay({ 
  clubTokenAddress, 
  testnet = true 
}: ClubPermissionsDisplayProps) {
  const { permissions, isLoading: permLoading } = useBlockchainPermissions(clubTokenAddress, testnet);
  const { balance, hasTokens, isLoading: balLoading } = useTokenBalance(clubTokenAddress, testnet);

  if (permLoading || balLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-24 bg-gray-700 rounded-lg"></div>
      </div>
    );
  }

  const balanceInTokens = balance ? formatEther(BigInt(balance)) : '0';

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold">Your Club Status</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-400">Role</p>
          <p className="text-xl font-bold">
            {permissions.isOwner ? '👑 Owner' : hasTokens ? '💎 Member' : '👤 Fan'}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-400">Token Balance</p>
          <p className="text-xl font-bold">
            {parseFloat(balanceInTokens).toFixed(2)} tokens
          </p>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <h4 className="text-sm font-semibold mb-2">Permissions</h4>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <span className={permissions.canManage ? 'text-green-500' : 'text-gray-500'}>
              {permissions.canManage ? '✅' : '❌'}
            </span>
            <span>Manage Club</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={permissions.canCreatePolls ? 'text-green-500' : 'text-gray-500'}>
              {permissions.canCreatePolls ? '✅' : '❌'}
            </span>
            <span>Create Polls</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={permissions.canVote ? 'text-green-500' : 'text-gray-500'}>
              {permissions.canVote ? '✅' : '❌'}
            </span>
            <span>Vote on Decisions</span>
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-500 mt-4">
        * Permissions are determined by your on-chain token ownership
      </div>
    </div>
  );
}