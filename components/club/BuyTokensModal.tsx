'use client';

import { useState } from 'react';
import { useBuyTokens } from '@/hooks/useBuyTokens';
import { BGPattern } from '@/components/bg-pattern';

interface BuyTokensModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: {
    id: string;
    name: string;
    tokenAddress: string;
    tokenSymbol: string;
    pricePerToken: string;
    totalSupply: string;
  };
  onSuccess?: () => void;
  testnet?: boolean;
}

export function BuyTokensModal({ isOpen, onClose, club, onSuccess, testnet = true }: BuyTokensModalProps) {
  const { buyTokens, isBuying } = useBuyTokens();
  const [amount, setAmount] = useState('10');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const pricePerToken = Number(club.pricePerToken);
  const totalCost = Number(amount) * pricePerToken;
  const totalCostEUR = totalCost * 0.85; // Approximation CHZ to EUR

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  const handleBuy = async () => {
    if (!amount || Number(amount) <= 0) return;

    setError(null);

    const result = await buyTokens({
      clubId: club.id,
      tokenAddress: club.tokenAddress,
      tokenSymbol: club.tokenSymbol,
      amount: Number(amount),
      pricePerToken,
      testnet
    });

    if (result.success) {
      setTransactionHash(result.transactionHash || null);
      setShowSuccess(true);
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setShowSuccess(false);
        setAmount('10');
        setTransactionHash(null);
      }, 5000);
    } else {
      setError(result.error || 'An error occurred');
    }
  };

  if (!isOpen) return null;

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <BGPattern 
          variant="diagonal-stripes" 
          mask="fade-edges" 
          size={32}
          fill="#e5e7eb"
          className="opacity-30"
        />
        <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-lg relative z-10">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold mb-2 text-gray-900">Purchase successful!</h3>
          <p className="text-gray-600 mb-4">
            You purchased {amount} {club.tokenSymbol} tokens
          </p>
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">
              Transaction confirmed
            </p>
            {transactionHash && (
              <a 
                href={`https://${testnet ? 'testnet.' : ''}chiliscan.com/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs hover:underline break-all"
                style={{color: '#fa0089'}}
              >
                View on ChiliScan →
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <BGPattern 
        variant="diagonal-stripes" 
        mask="fade-edges" 
        size={32}
        fill="#e5e7eb"
        className="opacity-30"
      />
      <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 max-w-md w-full mx-4 shadow-lg relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Buy {club.tokenSymbol} tokens</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl transition"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Informations du club */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold mb-2 text-gray-900">{club.name}</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Prix par token:</span>
                <span className="text-gray-900 font-medium">{pricePerToken} CHZ</span>
              </div>
              <div className="flex justify-between">
                <span>Supply totale:</span>
                <span className="text-gray-900 font-medium">{formatNumber(Number(club.totalSupply))}</span>
              </div>
            </div>
          </div>

          {/* Montant à acheter */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-900">
              Number of tokens to buy
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              max={club.totalSupply}
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-pink-500 focus:outline-none transition"
              placeholder="10"
            />
          </div>

          {/* Résumé du coût */}
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
            <h4 className="font-semibold mb-3 text-gray-900" style={{color: '#fa0089'}}>💰 Purchase Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tokens:</span>
                <span className="font-medium text-gray-900">{amount} {club.tokenSymbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unit price:</span>
                <span className="font-medium text-gray-900">{pricePerToken} CHZ</span>
              </div>
              <div className="pt-2 border-t border-pink-200">
                <div className="flex justify-between text-lg font-bold">
                  <span style={{color: '#fa0089'}}>Total:</span>
                  <span style={{color: '#fa0089'}}>{formatNumber(totalCost)} CHZ</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>≈</span>
                  <span>{formatNumber(Math.round(totalCostEUR))} €</span>
                </div>
              </div>
            </div>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="space-y-3">
            <button
              onClick={handleBuy}
              disabled={isBuying || !amount || Number(amount) <= 0}
              className={`w-full py-3 px-6 rounded-lg font-semibold transition text-white ${
                isBuying || !amount || Number(amount) <= 0
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : 'hover:opacity-90'
              }`}
              style={!(isBuying || !amount || Number(amount) <= 0) ? {backgroundColor: '#fa0089'} : {}}
            >
              {isBuying ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Transaction in progress...
                </div>
              ) : (
                `Buy for ${formatNumber(totalCost)} CHZ`
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isBuying}
              className="w-full py-2 text-gray-600 hover:text-gray-900 transition disabled:opacity-50"
            >
              Cancel
            </button>
          </div>

          {/* Avertissement */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600">
              ⚠️ Token purchases are final. Make sure you understand the risks before investing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}