'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export default function ClubDashboardPage() {
  const { user, authenticated } = usePrivy();
  const [userClub, setUserClub] = useState<any>(null);
  const [loadingClub, setLoadingClub] = useState(true);
  const [tokenData, setTokenData] = useState({
    exists: false,
    name: '',
    symbol: '',
    totalSupply: '',
    pricePerToken: '',
    address: ''
  });
  
  const [formData, setFormData] = useState({
    tokenName: '',
    tokenSymbol: '',
    totalSupply: '',
    pricePerToken: ''
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger le club de l'utilisateur
  useEffect(() => {
    if (authenticated && user?.id) {
      loadUserClub();
    }
  }, [authenticated, user]);

  const loadUserClub = async () => {
    try {
      setLoadingClub(true);
      // Récupérer les clubs de l'utilisateur
      const response = await fetch(`/api/clubs?ownerId=${user?.id}`);
      if (response.ok) {
        const clubs = await response.json();
        if (clubs.length > 0) {
          setUserClub(clubs[0]); // Prendre le premier club pour l'instant
          // Charger les données du token si elles existent
          loadTokenData(clubs[0].id);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du club:', error);
    } finally {
      setLoadingClub(false);
    }
  };

  const loadTokenData = async (clubId: string) => {
    try {
      const response = await fetch(`/api/clubs/${clubId}/token`);
      if (response.ok) {
        const data = await response.json();
        if (data.hasToken) {
          setTokenData({
            exists: true,
            name: data.club.name || '', // Utiliser le nom du club car tokenName n'existe pas en DB
            symbol: data.club.tokenSymbol || '',
            totalSupply: data.club.totalSupply || '',
            pricePerToken: data.club.pricePerToken || '',
            address: data.club.tokenAddress || ''
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du token:', error);
    }
  };

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
        clubId: userClub?.id,
        name: formData.tokenName,
        symbol: formData.tokenSymbol,
        totalSupply,
        pricePerToken
      });

      // Appeler l'API pour créer le token
      const response = await fetch(`/api/clubs/${userClub.id}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tokenName: formData.tokenName,
          tokenSymbol: formData.tokenSymbol,
          totalSupply,
          pricePerToken,
          ownerId: user?.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création du token');
      }

      const result = await response.json();
      
      // Mettre à jour l'état pour montrer le token en cours de déploiement
      setTokenData({
        exists: true,
        name: formData.tokenName, // Note: non sauvé en DB, juste pour l'affichage
        symbol: formData.tokenSymbol,
        totalSupply: formData.totalSupply,
        pricePerToken: formData.pricePerToken,
        address: result.tokenAddress // Sera "DEPLOYING_..." jusqu'au déploiement
      });

      // TODO: Smart Contract Integration
      // Une fois que vous fournissez le smart contract, remplacez cette section par :
      // const deploymentResult = await deployTokenContract({...});
      // puis appellez PATCH /api/clubs/${userClub.id}/token avec la vraie adresse
      
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
              <span className="text-[#FEFEFE]/80">Dashboard Club</span>
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 text-[#FEFEFE]/80 hover:text-[#FEFEFE] transition"
            >
              ← Retour à l'accueil
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-4 py-8">
        
        {/* Header */}
        <div className="bg-[#330051]/30 border border-[#330051] rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {userClub ? `${userClub.name} - Dashboard` : 'Tableau de Bord Club'}
              </h1>
              <p className="text-[#FEFEFE]/60">
                {loadingClub ? 'Chargement...' : 
                 userClub ? 'Gérez votre club et vos tokens' : 
                 'Aucun club trouvé - Créez votre club d\'abord'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {userClub && (
                <button 
                  onClick={() => window.location.href = `/clubs/${userClub.id}`}
                  className="bg-[#813066] hover:bg-[#813066]/80 px-4 py-2 rounded-lg font-semibold transition text-sm flex items-center gap-2"
                >
                  👁️ Voir page publique
                </button>
              )}
              <div className="text-4xl">👑</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#330051]/30 border border-[#330051] p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-[#FA0089] mb-2">0</div>
            <div className="text-[#FEFEFE]/60 text-sm">Fans Actifs</div>
          </div>
          <div className="bg-[#330051]/30 border border-[#330051] p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-[#813066] mb-2">0</div>
            <div className="text-[#FEFEFE]/60 text-sm">Sondages</div>
          </div>
          <div className="bg-[#330051]/30 border border-[#330051] p-6 rounded-lg text-center">
            <div className="text-3xl font-bold text-[#FA0089] mb-2">€0</div>
            <div className="text-[#FEFEFE]/60 text-sm">Revenus</div>
          </div>
        </div>

        {/* Token Management Section */}
        {userClub ? (
          <div className="mb-8">
            <div className="bg-[#330051]/30 border border-[#330051] rounded-2xl p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-4xl">🪙</div>
                <div>
                  <h2 className="text-2xl font-bold">Gestion du Token</h2>
                  <p className="text-[#FEFEFE]/60">
                    {tokenData.exists ? 'Informations de votre token' : 'Créez le token de votre club'}
                  </p>
                </div>
              </div>

            {tokenData.exists ? (
              // Token exists - Display only mode
              <div className="space-y-6">
                <div className="bg-[#FA0089]/10 border border-[#FA0089] rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-[#FA0089] mb-4">✅ Token Créé avec Succès</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#FEFEFE]/60">Nom du Token</label>
                      <div className="bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE]">
                        {tokenData.name}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#FEFEFE]/60">Symbole</label>
                      <div className="bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE]">
                        {tokenData.symbol}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#FEFEFE]/60">Supply Totale</label>
                      <div className="bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE]">
                        {parseInt(tokenData.totalSupply).toLocaleString()} tokens
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[#FEFEFE]/60">Prix par Token</label>
                      <div className="bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE]">
                        {tokenData.pricePerToken} CHZ
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-4 bg-[#330051]/30 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-[#FEFEFE]/60">Adresse du contrat :</span>
                      <span className="font-mono text-[#FA0089]">{tokenData.address}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-[#FEFEFE]/60">Prix d'une part (1%) :</span>
                      <span className="font-semibold text-[#813066]">
                        {(parseInt(tokenData.totalSupply) / 100 * parseInt(tokenData.pricePerToken)).toLocaleString()} CHZ
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-[#FEFEFE]/60">Valeur totale :</span>
                      <span className="font-semibold text-[#FA0089]">
                        {(parseInt(tokenData.totalSupply) * parseInt(tokenData.pricePerToken)).toLocaleString()} CHZ
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Token doesn't exist - Creation form
              <form onSubmit={handleCreateToken} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom du Token *</label>
                    <input
                      type="text"
                      value={formData.tokenName}
                      onChange={(e) => handleInputChange('tokenName', e.target.value)}
                      className="w-full bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE] placeholder-[#FEFEFE]/40"
                      placeholder="Ex: FC Montreuil Token"
                      required
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Symbole *</label>
                    <input
                      type="text"
                      value={formData.tokenSymbol}
                      onChange={(e) => handleInputChange('tokenSymbol', e.target.value)}
                      className="w-full bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE] placeholder-[#FEFEFE]/40 uppercase"
                      placeholder="Ex: FCMT"
                      required
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre de Tokens *</label>
                    <input
                      type="text"
                      value={formData.totalSupply}
                      onChange={(e) => handleInputChange('totalSupply', e.target.value)}
                      className="w-full bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE] placeholder-[#FEFEFE]/40"
                      placeholder="Ex: 10000"
                      required
                    />
                    <p className="text-xs text-[#FEFEFE]/40 mt-1">Minimum 1000 tokens</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Prix par Token (CHZ) *</label>
                    <input
                      type="text"
                      value={formData.pricePerToken}
                      onChange={(e) => handleInputChange('pricePerToken', e.target.value)}
                      className="w-full bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE] placeholder-[#FEFEFE]/40"
                      placeholder="Ex: 2"
                      required
                    />
                    <p className="text-xs text-[#FEFEFE]/40 mt-1">Nombres entiers uniquement</p>
                  </div>
                </div>

                {/* Résumé */}
                {formData.totalSupply && formData.pricePerToken && (
                  <div className="bg-[#FA0089]/10 border border-[#FA0089] rounded-lg p-6">
                    <h3 className="font-semibold mb-4 text-[#FA0089] text-center">📊 Résumé</h3>
                    <div className="flex justify-center gap-12">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#813066] mb-1">
                          {(parseInt(formData.totalSupply) / 100 * parseInt(formData.pricePerToken)).toLocaleString()} CHZ
                        </div>
                        <div className="text-[#FEFEFE]/60 text-sm">Prix d'une part (1%)</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#FA0089] mb-1">
                          {(parseInt(formData.totalSupply) * parseInt(formData.pricePerToken)).toLocaleString()} CHZ
                        </div>
                        <div className="text-[#FEFEFE]/60 text-sm">Valeur totale</div>
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
              </form>
            )}
            </div>
          </div>
        ) : (
          <div className="mb-8 bg-[#330051]/30 border border-[#330051] rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🏗️</div>
            <h2 className="text-2xl font-bold mb-2">Aucun Club Trouvé</h2>
            <p className="text-[#FEFEFE]/80 mb-6">
              Vous devez d'abord créer un club avant de pouvoir gérer des tokens.
            </p>
            <button 
              onClick={() => window.location.href = '/register-club'}
              className="bg-[#FA0089] hover:bg-[#FA0089]/80 px-6 py-3 rounded-lg font-semibold transition"
            >
              🏆 Créer mon Club
            </button>
          </div>
        )}

        {/* Other Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Manage Polls */}
          <div className="bg-[#330051]/30 border border-[#330051] p-6 rounded-lg">
            <div className="text-2xl mb-4">🗳️</div>
            <h3 className="text-xl font-semibold mb-2">Sondages & Votes</h3>
            <p className="text-[#FEFEFE]/60 mb-4 text-sm">
              Créez des sondages et laissez vos fans participer aux décisions
            </p>
            <button 
              onClick={() => userClub && (window.location.href = `/clubs/${userClub.id}/polls`)}
              disabled={!userClub}
              className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                userClub 
                  ? 'bg-[#813066] hover:bg-[#813066]/80' 
                  : 'bg-[#330051]/50 cursor-not-allowed'
              }`}
            >
              Gérer Sondages
            </button>
          </div>
          
          {/* Club Settings */}
          <div className="bg-[#330051]/30 border border-[#330051] p-6 rounded-lg">
            <div className="text-2xl mb-4">⚙️</div>
            <h3 className="text-xl font-semibold mb-2">Paramètres Club</h3>
            <p className="text-[#FEFEFE]/60 mb-4 text-sm">
              Modifiez les informations et paramètres de votre club
            </p>
            <button 
              onClick={() => userClub && (window.location.href = `/clubs/${userClub.id}/settings`)}
              disabled={!userClub}
              className={`w-full py-2 px-4 rounded-lg font-semibold transition ${
                userClub 
                  ? 'bg-[#330051] hover:bg-[#330051]/80' 
                  : 'bg-[#330051]/50 cursor-not-allowed'
              }`}
            >
              Paramètres
            </button>
          </div>
        </div>

        {/* Quick Start Guide */}
        <div className="mt-8 bg-[#FA0089]/10 border border-[#FA0089] rounded-lg p-6">
          <h3 className="text-xl font-semibold text-[#FA0089] mb-4">🚀 Premiers Pas</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="bg-[#FA0089] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</div>
              <div>
                <div className="font-semibold">Créez vos tokens</div>
                <div className="text-[#FEFEFE]/70">Définissez le prix et la quantité</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-[#FA0089] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</div>
              <div>
                <div className="font-semibold">Lancez un sondage</div>
                <div className="text-[#FEFEFE]/70">Engagez votre communauté</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-[#FA0089] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</div>
              <div>
                <div className="font-semibold">Partagez les revenus</div>
                <div className="text-[#FEFEFE]/70">Récompensez vos supporters</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}