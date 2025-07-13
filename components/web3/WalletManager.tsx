'use client';

import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState } from 'react';
import { createWalletClient, custom, formatEther } from 'viem';
import { chiliz, chilizSpicy } from '@/lib/wagmi';

export function WalletManager() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();
  const [balance, setBalance] = useState<string>('');
  const [currentChain, setCurrentChain] = useState<string>('');

  const activeWallet = wallets.find(wallet => wallet.walletClientType === 'privy');

  const getWalletInfo = async () => {
    if (!activeWallet) return;

    try {
      const provider = await activeWallet.getEthereumProvider();
      const walletClient = createWalletClient({
        transport: custom(provider),
      });

      // Get chain ID
      const chainId = await provider.request({ method: 'eth_chainId' });
      const chainIdNumber = parseInt(chainId, 16);
      
      if (chainIdNumber === chiliz.id) {
        setCurrentChain('Chiliz Mainnet');
      } else if (chainIdNumber === chilizSpicy.id) {
        setCurrentChain('Chiliz Spicy Testnet');
      } else {
        setCurrentChain(`Chain ${chainIdNumber}`);
      }

      // Get balance
      const balanceWei = await provider.request({
        method: 'eth_getBalance',
        params: [activeWallet.address, 'latest'],
      });
      const balanceEth = formatEther(BigInt(balanceWei));
      setBalance(parseFloat(balanceEth).toFixed(4));
    } catch (error) {
      console.error('Error getting wallet info:', error);
    }
  };

  const switchToChiliz = async () => {
    if (!activeWallet) return;

    try {
      const provider = await activeWallet.getEthereumProvider();
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chiliz.id.toString(16)}` }],
      });
      getWalletInfo();
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, add it
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${chiliz.id.toString(16)}`,
              chainName: chiliz.name,
              nativeCurrency: chiliz.nativeCurrency,
              rpcUrls: [chiliz.rpcUrls.default.http[0]],
              blockExplorerUrls: chiliz.blockExplorers ? [chiliz.blockExplorers.default.url] : [],
            }],
          });
          getWalletInfo();
        } catch (addError) {
          console.error('Error adding chain:', addError);
        }
      } else {
        console.error('Error switching chain:', error);
      }
    }
  };

  const switchToSpicy = async () => {
    if (!activeWallet) return;

    try {
      const provider = await activeWallet.getEthereumProvider();
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chilizSpicy.id.toString(16)}` }],
      });
      getWalletInfo();
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, add it
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${chilizSpicy.id.toString(16)}`,
              chainName: chilizSpicy.name,
              nativeCurrency: chilizSpicy.nativeCurrency,
              rpcUrls: [chilizSpicy.rpcUrls.default.http[0]],
              blockExplorerUrls: [chilizSpicy.blockExplorers.default.url],
            }],
          });
          getWalletInfo();
        } catch (addError) {
          console.error('Error adding chain:', addError);
        }
      } else {
        console.error('Error switching chain:', error);
      }
    }
  };

  if (!ready) {
    return <div className="animate-pulse bg-gray-700 h-10 w-32 rounded"></div>;
  }

  if (!authenticated) {
    return (
      <button 
        onClick={login}
        className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {activeWallet && (
        <div className="flex items-center gap-2">
          <button
            onClick={getWalletInfo}
            className="text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition"
          >
            Refresh
          </button>
          {balance && (
            <span className="text-sm text-gray-300">
              {balance} CHZ
            </span>
          )}
          {currentChain && (
            <span className="text-xs bg-gray-600 px-2 py-1 rounded">
              {currentChain}
            </span>
          )}
        </div>
      )}
      
      <div className="flex gap-2">
        <button
          onClick={switchToChiliz}
          className="text-xs bg-orange-600 hover:bg-orange-700 px-2 py-1 rounded transition"
        >
          Mainnet
        </button>
        <button
          onClick={switchToSpicy}
          className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded transition"
        >
          Testnet
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm">
          {user?.email?.address || user?.google?.email || 'Connected'}
        </span>
        <button 
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}