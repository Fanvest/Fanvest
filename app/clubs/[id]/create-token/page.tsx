'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

export default function CreateTokenPage() {
  const params = useParams();
  const router = useRouter();
  const { user, authenticated } = usePrivy();
  
  const [formData, setFormData] = useState({
    tokenName: '',
    tokenSymbol: '',
    totalSupply: '',
    pricePerToken: ''
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    // Pour totalSupply et pricePerToken, on ne garde que les nombres entiers
    if (field === 'totalSupply' || field === 'pricePerToken') {
      value = value.replace(/\D/g, '');
    }
    
    // Pour tokenSymbol, on met en majuscules et limite à 5 caractères
    if (field === 'tokenSymbol') {
      value = value.toUpperCase().slice(0, 5);
    }
    
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsCreating(true);

    try {
      // Validation
      if (!formData.tokenName || !formData.tokenSymbol || !formData.totalSupply || !formData.pricePerToken) {
        throw new Error('All fields are required');
      }

      const totalSupply = parseInt(formData.totalSupply);
      const pricePerToken = parseInt(formData.pricePerToken);

      if (totalSupply < 1000) {
        throw new Error('Minimum number of tokens is 1000');
      }

      if (pricePerToken < 1) {
        throw new Error('Minimum price is 1 CHZ');
      }

      // Appeler l'API pour créer le token via smart contract
      const response = await fetch(`/api/clubs/${params.id}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tokenName: formData.tokenName,
          tokenSymbol: formData.tokenSymbol,
          totalSupply,
          pricePerToken,
          ownerId: user?.id // Use Privy user ID
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error creating token');
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message || 'Error creating token');
      }

      console.log('Token creation result:', result);

      // Rediriger vers la page du club
      router.push(`/clubs/${params.id}`);
      
    } catch (err: any) {
      setError(err.message || 'Error creating token');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-bg to-accent-secondary text-text-primary">
      {/* Navigation Header */}
      <nav className="bg-accent-secondary/50 border-b border-accent-secondary">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.location.href = '/'}
                className="text-2xl font-bold hover:text-accent-primary transition"
              >
                Fanvest
              </button>
              <span className="text-text-primary/40">/</span>
              <span className="text-text-primary/80">Create Token</span>
            </div>
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-text-primary/80 hover:text-text-primary transition"
            >
              ← Retour
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-accent-secondary/30 border border-accent-secondary rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🪙</div>
            <h1 className="text-3xl font-bold mb-2">Create Your Club Token</h1>
            <p className="text-text-primary/60">
              Define your token parameters. Once created, these parameters cannot be modified.
            </p>
          </div>

          <form onSubmit={handleCreateToken} className="space-y-6">
            {/* Nom du Token */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Token Name *
              </label>
              <input
                type="text"
                value={formData.tokenName}
                onChange={(e) => handleInputChange('tokenName', e.target.value)}
                className="w-full bg-bg-main border border-main rounded-lg px-4 py-3 text-main placeholder-sub/60 focus:border-accent1 focus:outline-none"
                placeholder="Ex: FC Montreuil Token"
                required
                maxLength={50}
              />
              <p className="text-xs text-sub/60 mt-1">
                The full name of your token
              </p>
            </div>

            {/* Symbole du Token */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Symbol (Currency) *
              </label>
              <input
                type="text"
                value={formData.tokenSymbol}
                onChange={(e) => handleInputChange('tokenSymbol', e.target.value)}
                className="w-full bg-accent-secondary/50 border border-accent-secondary rounded-lg px-4 py-3 text-text-primary placeholder-text-primary/40 uppercase"
                placeholder="Ex: FCMT"
                required
                maxLength={5}
              />
              <p className="text-xs text-sub/60 mt-1">
                3-5 uppercase letters
              </p>
            </div>

            {/* Nombre de Tokens */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Number of Tokens in Pool *
              </label>
              <input
                type="text"
                value={formData.totalSupply}
                onChange={(e) => handleInputChange('totalSupply', e.target.value)}
                className="w-full bg-bg-main border border-main rounded-lg px-4 py-3 text-main placeholder-sub/60 focus:border-accent1 focus:outline-none"
                placeholder="Ex: 10000"
                required
              />
              <p className="text-xs text-sub/60 mt-1">
                Minimum 1000 tokens. Recommended: 10,000 - 100,000
              </p>
            </div>

            {/* Prix par Token */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Price per Token (CHZ) *
              </label>
              <input
                type="text"
                value={formData.pricePerToken}
                onChange={(e) => handleInputChange('pricePerToken', e.target.value)}
                className="w-full bg-bg-main border border-main rounded-lg px-4 py-3 text-main placeholder-sub/60 focus:border-accent1 focus:outline-none"
                placeholder="Ex: 2"
                required
              />
              <p className="text-xs text-sub/60 mt-1">
                Price in CHZ (whole numbers only). Recommended: 1-5 CHZ
              </p>
            </div>

            {/* Summary */}
            {(formData.totalSupply || formData.pricePerToken) && (
              <div className="bg-accent-primary/10 border border-accent-primary rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-accent-primary">📊 Summary</h3>
                <div className="space-y-1 text-sm">
                  {formData.totalSupply && (
                    <div className="flex justify-between">
                      <span className="text-text-primary/60">Total supply:</span>
                      <span>{parseInt(formData.totalSupply).toLocaleString()} tokens</span>
                    </div>
                  )}
                  {formData.pricePerToken && (
                    <div className="flex justify-between">
                      <span className="text-text-primary/60">Unit price:</span>
                      <span>{formData.pricePerToken} CHZ</span>
                    </div>
                  )}
                  {formData.totalSupply && formData.pricePerToken && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-text-primary/60">Price of one share (1%):</span>
                        <span>{(parseInt(formData.totalSupply) / 100 * parseInt(formData.pricePerToken)).toLocaleString()} CHZ</span>
                      </div>
                      <div className="flex justify-between font-semibold text-accent-primary pt-2 border-t border-accent-primary/20">
                        <span>Total value:</span>
                        <span>{(parseInt(formData.totalSupply) * parseInt(formData.pricePerToken)).toLocaleString()} CHZ</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Bouton de création */}
            <button
              type="submit"
              disabled={isCreating || !formData.tokenName || !formData.tokenSymbol || !formData.totalSupply || !formData.pricePerToken}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition ${
                isCreating || !formData.tokenName || !formData.tokenSymbol || !formData.totalSupply || !formData.pricePerToken
                  ? 'bg-accent-secondary/50 cursor-not-allowed'
                  : 'bg-accent-primary hover:bg-accent-primary/80 transform hover:scale-105'
              }`}
            >
              {isCreating ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </div>
              ) : (
                '🚀 Create Token'
              )}
            </button>

            {/* Avertissement */}
            <div className="bg-accent-secondary/20 border border-accent-secondary rounded-lg p-4">
              <p className="text-sm text-text-primary/80">
                ⚠️ <strong>Important:</strong> Once the token is created, the total number and initial price cannot be modified. 
                The token will be immediately available for purchase by fans.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}