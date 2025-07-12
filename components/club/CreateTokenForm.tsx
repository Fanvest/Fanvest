'use client';

import { useState } from 'react';
import { useCreateClubToken } from '@/hooks/useCreateClubToken';

interface CreateTokenFormProps {
  clubId: string;
  clubName: string;
  onSuccess?: (tokenAddress: string) => void;
  testnet?: boolean;
}

export function CreateTokenForm({ 
  clubId, 
  clubName, 
  onSuccess, 
  testnet = true 
}: CreateTokenFormProps) {
  const [formData, setFormData] = useState({
    tokenName: `${clubName} Fan Token`,
    tokenSymbol: '', // Will be auto-generated from club name
    totalSupply: '10000',
    pricePerToken: '1.0'
  });

  const { createToken, isCreating, error, isSuccess } = useCreateClubToken();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tokenSymbol) {
      // Auto-generate symbol from club name
      const symbol = clubName
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 5) + 'T'; // Add 'T' for token
      
      setFormData(prev => ({ ...prev, tokenSymbol: symbol }));
    }

    try {
      const result = await createToken({
        clubId,
        tokenName: formData.tokenName,
        tokenSymbol: formData.tokenSymbol,
        totalSupply: formData.totalSupply,
        pricePerToken: formData.pricePerToken,
        testnet
      });

      if (result.success && result.tokenAddress) {
        onSuccess?.(result.tokenAddress);
      }
    } catch (err) {
      console.error('Token creation failed:', err);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSuccess) {
    return (
      <div className="bg-green-900/20 border border-green-500 rounded-lg p-6 text-center">
        <div className="text-green-500 text-4xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-green-400 mb-2">Token Created Successfully!</h3>
        <p className="text-gray-300">
          Your club token has been deployed and the database has been updated.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold mb-6">Create Club Token</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Token Name</label>
          <input
            type="text"
            value={formData.tokenName}
            onChange={(e) => handleInputChange('tokenName', e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            placeholder="FC Montreuil Fan Token"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Token Symbol</label>
          <input
            type="text"
            value={formData.tokenSymbol}
            onChange={(e) => handleInputChange('tokenSymbol', e.target.value.toUpperCase())}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
            placeholder="FCMT"
            maxLength={6}
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Max 6 characters (e.g., FCMT for FC Montreuil Token)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Total Supply</label>
            <input
              type="number"
              value={formData.totalSupply}
              onChange={(e) => handleInputChange('totalSupply', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              placeholder="10000"
              min="1"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Number of tokens to create</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price per Token (CHZ)</label>
            <input
              type="number"
              step="0.1"
              value={formData.pricePerToken}
              onChange={(e) => handleInputChange('pricePerToken', e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              placeholder="1.0"
              min="0.1"
              required
            />
            <p className="text-xs text-gray-400 mt-1">Price in CHZ</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error.message}</p>
          </div>
        )}

        <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
          <h4 className="font-semibold text-blue-400 mb-2">What happens next:</h4>
          <ul className="text-sm text-blue-300 space-y-1">
            <li>• Smart contract will be deployed to Chiliz {testnet ? 'Spicy Testnet' : 'Mainnet'}</li>
            <li>• You'll become the contract owner</li>
            <li>• Database will be updated with token information</li>
            <li>• Fans can start purchasing tokens</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={isCreating}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
            isCreating
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isCreating ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating Token...
            </div>
          ) : (
            'Create Token Contract'
          )}
        </button>
      </form>
    </div>
  );
}