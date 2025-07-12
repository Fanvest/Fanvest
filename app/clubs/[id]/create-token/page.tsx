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
        throw new Error('Tous les champs sont obligatoires');
      }

      const totalSupply = parseInt(formData.totalSupply);
      const pricePerToken = parseInt(formData.pricePerToken);

      if (totalSupply < 1000) {
        throw new Error('Le nombre minimum de tokens est 1000');
      }

      if (pricePerToken < 1) {
        throw new Error('Le prix minimum est 1 CHZ');
      }

      // TODO: Appeler le smart contract pour créer le token
      console.log('Creating token with:', {
        clubId: params.id,
        name: formData.tokenName,
        symbol: formData.tokenSymbol,
        totalSupply,
        pricePerToken
      });

      // Simuler un délai pour la démo
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Rediriger vers la page du club
      router.push(`/clubs/${params.id}`);
      
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du token');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16001D] to-[#330051] text-[#FEFEFE]">
      {/* Navigation Header */}
      <nav className="bg-[#330051]/50 border-b border-[#330051]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.location.href = '/'}
                className="text-2xl font-bold hover:text-[#FA0089] transition"
              >
                FanStock
              </button>
              <span className="text-[#FEFEFE]/40">/</span>
              <span className="text-[#FEFEFE]/80">Créer Token</span>
            </div>
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[#FEFEFE]/80 hover:text-[#FEFEFE] transition"
            >
              ← Retour
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-[#330051]/30 border border-[#330051] rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🪙</div>
            <h1 className="text-3xl font-bold mb-2">Créer le Token de votre Club</h1>
            <p className="text-[#FEFEFE]/60">
              Définissez les paramètres de votre token. Une fois créé, ces paramètres ne pourront plus être modifiés.
            </p>
          </div>

          <form onSubmit={handleCreateToken} className="space-y-6">
            {/* Nom du Token */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Nom du Token *
              </label>
              <input
                type="text"
                value={formData.tokenName}
                onChange={(e) => handleInputChange('tokenName', e.target.value)}
                className="w-full bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE] placeholder-[#FEFEFE]/40"
                placeholder="Ex: FC Montreuil Token"
                required
                maxLength={50}
              />
              <p className="text-xs text-[#FEFEFE]/40 mt-1">
                Le nom complet de votre token
              </p>
            </div>

            {/* Symbole du Token */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Symbole (Devise) *
              </label>
              <input
                type="text"
                value={formData.tokenSymbol}
                onChange={(e) => handleInputChange('tokenSymbol', e.target.value)}
                className="w-full bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE] placeholder-[#FEFEFE]/40 uppercase"
                placeholder="Ex: FCMT"
                required
                maxLength={5}
              />
              <p className="text-xs text-[#FEFEFE]/40 mt-1">
                3-5 lettres en majuscules
              </p>
            </div>

            {/* Nombre de Tokens */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Nombre de Tokens dans la Pool *
              </label>
              <input
                type="text"
                value={formData.totalSupply}
                onChange={(e) => handleInputChange('totalSupply', e.target.value)}
                className="w-full bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE] placeholder-[#FEFEFE]/40"
                placeholder="Ex: 10000"
                required
              />
              <p className="text-xs text-[#FEFEFE]/40 mt-1">
                Minimum 1000 tokens. Recommandé : 10,000 - 100,000
              </p>
            </div>

            {/* Prix par Token */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Prix par Token (CHZ) *
              </label>
              <input
                type="text"
                value={formData.pricePerToken}
                onChange={(e) => handleInputChange('pricePerToken', e.target.value)}
                className="w-full bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE] placeholder-[#FEFEFE]/40"
                placeholder="Ex: 2"
                required
              />
              <p className="text-xs text-[#FEFEFE]/40 mt-1">
                Prix en CHZ (nombres entiers uniquement). Recommandé : 1-5 CHZ
              </p>
            </div>

            {/* Résumé */}
            {formData.totalSupply && formData.pricePerToken && (
              <div className="bg-[#FA0089]/10 border border-[#FA0089] rounded-lg p-4">
                <h3 className="font-semibold mb-2 text-[#FA0089]">📊 Résumé</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#FEFEFE]/60">Supply totale :</span>
                    <span>{parseInt(formData.totalSupply).toLocaleString()} tokens</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#FEFEFE]/60">Prix unitaire :</span>
                    <span>{formData.pricePerToken} CHZ</span>
                  </div>
                  <div className="flex justify-between font-semibold text-[#FA0089]">
                    <span>Valeur totale :</span>
                    <span>{(parseInt(formData.totalSupply) * parseInt(formData.pricePerToken)).toLocaleString()} CHZ</span>
                  </div>
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
                  ? 'bg-[#330051]/50 cursor-not-allowed'
                  : 'bg-[#FA0089] hover:bg-[#FA0089]/80 transform hover:scale-105'
              }`}
            >
              {isCreating ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Création en cours...
                </div>
              ) : (
                '🚀 Créer le Token'
              )}
            </button>

            {/* Avertissement */}
            <div className="bg-[#813066]/20 border border-[#813066] rounded-lg p-4">
              <p className="text-sm text-[#FEFEFE]/80">
                ⚠️ <strong>Important :</strong> Une fois le token créé, le nombre total et le prix initial ne pourront plus être modifiés. 
                Le token sera immédiatement disponible à l'achat pour les fans.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}