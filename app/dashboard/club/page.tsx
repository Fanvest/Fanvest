'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import dynamic from 'next/dynamic';
import { BGPattern } from '@/components/bg-pattern';
import { ShinyButton } from '@/components/shiny-button';

// Import dynamique du viewer 3D
const TokenViewer3D = dynamic(() => import('@/components/TokenViewer3D'), {
  ssr: false,
  loading: () => (
    <div className="text-center">
      <div className="w-20 h-20 border-2 rounded-full animate-spin mx-auto mb-2" style={{borderColor: '#fa0089', borderTopColor: 'transparent'}}></div>
      <div className="text-sm text-gray-600">Chargement 3D...</div>
    </div>
  )
});

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
  const [token3DData, setToken3DData] = useState({
    texture: null as string | null,
    bandColor: '#ffd700',
    animationEnabled: true
  });
  
  const [formData, setFormData] = useState({
    tokenName: '',
    tokenSymbol: '',
    totalSupply: '',
    pricePerToken: ''
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'apercu' | 'token' | 'sondages'>('apercu');

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
          // Charger les données 3D du token
          load3DTokenData(clubs[0].id);
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
      // Récupérer les données du token existant
      const response = await fetch(`/api/clubs/${clubId}/token`);
      if (response.ok) {
        const data = await response.json();
        if (data.hasToken) {
          setTokenData({
            exists: true,
            name: data.club.tokenName || 'Token Name',
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

  const load3DTokenData = async (clubId: string) => {
    try {
      const response = await fetch(`/api/clubs/${clubId}/token3d`);
      if (response.ok) {
        const data = await response.json();
        if (data.tokenData) {
          setToken3DData({
            texture: data.tokenData.texture,
            bandColor: data.tokenData.bandColor || '#ffd700',
            animationEnabled: data.tokenData.animationEnabled ?? true
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données 3D:', error);
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

      // Appeler l'API pour créer le token
      const response = await fetch(`/api/clubs/${userClub?.id}/token`, {
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
        throw new Error(errorData.error || 'Erreur lors de la création');
      }

      const result = await response.json();
      
      // Mettre à jour l'état pour montrer le token en cours de déploiement
      setTokenData({
        exists: true,
        name: formData.tokenName,
        symbol: formData.tokenSymbol,
        totalSupply: formData.totalSupply,
        pricePerToken: formData.pricePerToken,
        address: result.tokenAddress
      });
      
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du token');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white text-gray-900 relative">
      <BGPattern 
        variant="diagonal-stripes" 
        mask="fade-edges" 
        size={32}
        fill="#e5e7eb"
        className="opacity-30"
      />
      
      {/* Token 3D en background - uniquement si les données 3D existent */}
      {(token3DData.texture || token3DData.bandColor !== '#ffd700') && typeof window !== 'undefined' && (
        <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
          <TokenViewer3D 
            bandColor={token3DData.bandColor}
            animationEnabled={true}
            texture={token3DData.texture}
            disableControls={true}
          />
        </div>
      )}
      
      {/* Contenu principal */}
      <div className="relative z-10">
        {/* Header moderne et minimaliste */}
        <div className="border-b border-gray-200 bg-white/90 backdrop-blur-sm">
          <div className="max-w-[95vw] mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => window.location.href = '/'}
                  className="text-xl font-bold hover:opacity-80 transition"
                  style={{color: '#fa0089'}}
                >
                  FanStock
                </button>
                <div className="text-sm text-gray-600 font-medium">
                  {userClub ? `Dashboard · ${userClub.name}` : 'Dashboard Club'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {userClub && (
                  <button 
                    onClick={() => window.location.href = `/clubs/${userClub.id}`}
                    className="text-sm text-gray-600 hover:text-gray-900 transition flex items-center gap-1"
                  >
                    👁️ Page publique
                  </button>
                )}
                <button 
                  onClick={() => window.location.href = '/'}
                  className="text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  ← Accueil
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          
          {userClub ? (
            <div className="space-y-6">
              
              {/* Titre du club */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900">
                    👑 {userClub.name}
                  </h1>
                  <p className="text-gray-600 mt-2">
                    {loadingClub ? 'Chargement...' : 'Gérez votre club, tokens et communauté'}
                  </p>
                </div>
                
                {/* Actions rapides */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => window.location.href = `/clubs/${userClub.id}/settings`}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                  >
                    🎨 Personnaliser
                  </button>
                  <button 
                    onClick={() => window.location.href = `/clubs/${userClub.id}`}
                    className="border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                  >
                    👁️ Page Publique
                  </button>
                </div>
              </div>

              {/* Layout principal avec sidebar */}
              <div className="grid grid-cols-12 gap-6">{/* Sidebar */}
                <div className="col-span-3">
                  <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl shadow-lg sticky top-6">
                    <div className="p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h2>
                      <nav className="space-y-2">
                        <button
                          onClick={() => setActiveSection('apercu')}
                          className={`w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ${
                            activeSection === 'apercu'
                              ? 'text-white shadow-lg'
                              : 'text-gray-700 hover:bg-pink-50 hover:text-gray-900'
                          }`}
                          style={activeSection === 'apercu' ? {backgroundColor: '#fa0089'} : {}}
                        >
                          📊 Aperçu
                        </button>
                        <button
                          onClick={() => setActiveSection('token')}
                          className={`w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ${
                            activeSection === 'token'
                              ? 'text-white shadow-lg'
                              : 'text-gray-700 hover:bg-pink-50 hover:text-gray-900'
                          }`}
                          style={activeSection === 'token' ? {backgroundColor: '#fa0089'} : {}}
                        >
                          🪙 Gestion du Token
                        </button>
                        <button
                          onClick={() => setActiveSection('sondages')}
                          className={`w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ${
                            activeSection === 'sondages'
                              ? 'text-white shadow-lg'
                              : 'text-gray-700 hover:bg-pink-50 hover:text-gray-900'
                          }`}
                          style={activeSection === 'sondages' ? {backgroundColor: '#fa0089'} : {}}
                        >
                          🗳️ Sondages
                        </button>
                      </nav>
                      
            
                    </div>
                  </div>
                </div>

                {/* Contenu principal */}
                <div className="col-span-9">
                  {/* Contenu conditionnel selon la section active */}
                  {activeSection === 'apercu' && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        📊 Aperçu du Club
                      </h2>
                      
                      {/* Métriques principales */}
                      <div className="grid grid-cols-3 gap-6">
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-6 rounded-xl shadow-lg">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl">👥</div>
                            <div>
                              <div className="text-3xl font-bold" style={{color: '#fa0089'}}>0</div>
                              <div className="text-gray-600">Fans Actifs</div>
                            </div>
                          </div>
                          <div className="mt-4 h-2 bg-pink-50 rounded-full">
                            <div className="w-full h-2 rounded-full" style={{backgroundColor: '#fa0089'}}></div>
                          </div>
                        </div>
                        
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-6 rounded-xl shadow-lg">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl">🗳️</div>
                            <div>
                              <div className="text-3xl font-bold" style={{color: '#fa0089'}}>0</div>
                              <div className="text-gray-600">Sondages Actifs</div>
                            </div>
                          </div>
                          <div className="mt-4 h-2 bg-pink-50 rounded-full">
                            <div className="w-3/4 h-2 rounded-full" style={{backgroundColor: '#fa0089'}}></div>
                          </div>
                        </div>
                        
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-6 rounded-xl shadow-lg">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl">💰</div>
                            <div>
                              <div className="text-3xl font-bold" style={{color: '#fa0089'}}>€0</div>
                              <div className="text-gray-600">Revenus Totaux</div>
                            </div>
                          </div>
                          <div className="mt-4 h-2 bg-pink-50 rounded-full">
                            <div className="w-1/2 h-2 rounded-full bg-gray-400"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Graphique d'activité */}
                      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité Récente</h3>
                        <div className="flex items-center justify-center h-32 bg-pink-50 rounded-lg">
                          <div className="text-gray-500 text-center">
                            <div className="text-4xl mb-2">📈</div>
                            <div>Aucune activité récente</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'token' && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        🪙 Gestion du Token
                      </h2>
                      
                      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-lg">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="text-3xl">🪙</div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {tokenData.exists ? 'Informations de votre token' : 'Créez le token de votre club'}
                            </h3>
                            <p className="text-gray-600">
                              {tokenData.exists ? 'Votre token est déployé et actif' : 'Configurez et déployez votre token de club'}
                            </p>
                          </div>
                        </div>

                        {tokenData.exists ? (
                          /* Token existe - Affichage en lecture seule */
                          <div className="space-y-6">
                            <div className="bg-pink-50 border-2 rounded-xl p-6" style={{borderColor: '#fa0089'}}>
                              <h4 className="text-lg font-semibold mb-4" style={{color: '#fa0089'}}>✅ Token Actif</h4>
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <label className="block text-sm font-medium mb-2 text-gray-600">Symbole</label>
                                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 font-mono text-lg">
                                    {tokenData.symbol}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2 text-gray-600">Prix par Token</label>
                                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 text-lg">
                                    {tokenData.pricePerToken} CHZ
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2 text-gray-600">Supply Totale</label>
                                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 text-lg">
                                    {parseInt(tokenData.totalSupply).toLocaleString()} tokens
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2 text-gray-600">Valeur Totale</label>
                                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 font-semibold text-lg" style={{color: '#fa0089'}}>
                                    {(parseInt(tokenData.totalSupply) * parseInt(tokenData.pricePerToken)).toLocaleString()} CHZ
                                  </div>
                                </div>
                              </div>
                              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Adresse du contrat :</span>
                                  <span className="font-mono text-sm" style={{color: '#fa0089'}}>{tokenData.address.slice(0, 20)}...</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Token n'existe pas - Formulaire de création */
                          <form onSubmit={handleCreateToken} className="space-y-6">
                            {error && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                                {error}
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-600">Nom du Token</label>
                                <input
                                  type="text"
                                  value={formData.tokenName}
                                  onChange={(e) => handleInputChange('tokenName', e.target.value)}
                                  placeholder="Ex: Angoulême Fan Token"
                                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none"
                                  style={{borderColor: formData.tokenName ? '#fa0089' : undefined}}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-600">Symbole (3-5 lettres)</label>
                                <input
                                  type="text"
                                  value={formData.tokenSymbol}
                                  onChange={(e) => handleInputChange('tokenSymbol', e.target.value)}
                                  placeholder="Ex: ANGLO"
                                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none font-mono"
                                  style={{borderColor: formData.tokenSymbol ? '#fa0089' : undefined}}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-600">Nombre de Tokens (min: 1000)</label>
                                <input
                                  type="text"
                                  value={formData.totalSupply}
                                  onChange={(e) => handleInputChange('totalSupply', e.target.value)}
                                  placeholder="10000"
                                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none"
                                  style={{borderColor: formData.totalSupply ? '#fa0089' : undefined}}
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-600">Prix par Token (CHZ)</label>
                                <input
                                  type="text"
                                  value={formData.pricePerToken}
                                  onChange={(e) => handleInputChange('pricePerToken', e.target.value)}
                                  placeholder="2"
                                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none"
                                  style={{borderColor: formData.pricePerToken ? '#fa0089' : undefined}}
                                />
                              </div>
                            </div>

                            {/* Résumé */}
                            {(formData.totalSupply || formData.pricePerToken) && (
                              <div className="bg-pink-50 border-2 rounded-lg p-4" style={{borderColor: '#fa0089'}}>
                                <h4 className="font-semibold mb-3" style={{color: '#fa0089'}}>📊 Résumé</h4>
                                <div className="space-y-2">
                                  {formData.totalSupply && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Supply totale :</span>
                                      <span className="text-gray-900">{parseInt(formData.totalSupply).toLocaleString()} tokens</span>
                                    </div>
                                  )}
                                  {formData.pricePerToken && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Prix unitaire :</span>
                                      <span className="text-gray-900">{formData.pricePerToken} CHZ</span>
                                    </div>
                                  )}
                                  {formData.totalSupply && formData.pricePerToken && (
                                    <div className="flex justify-between font-semibold pt-2 border-t border-pink-200" style={{color: '#fa0089'}}>
                                      <span>Valeur totale :</span>
                                      <span>{(parseInt(formData.totalSupply) * parseInt(formData.pricePerToken)).toLocaleString()} CHZ</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <ShinyButton
                              type="submit"
                              disabled={isCreating}
                              className={`w-full py-4 px-6 font-semibold text-lg ${
                                isCreating ? 'opacity-50 cursor-not-allowed' : 'text-white'
                              }`}
                              style={!isCreating ? {backgroundColor: '#fa0089', '--primary': '250 0 137'} as React.CSSProperties : {backgroundColor: '#d1d5db'}}
                            >
                              {isCreating ? (
                                <div className="flex items-center justify-center gap-3">
                                  <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                                  Création en cours...
                                </div>
                              ) : (
                                '🚀 Créer le Token'
                              )}
                            </ShinyButton>
                          </form>
                        )}
                      </div>
                    </div>
                  )}

                  {activeSection === 'sondages' && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                          🗳️ Sondages
                        </h2>
                      </div>
                      
                      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-lg">
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">🗳️</div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun sondage pour le moment</h3>
                          <p className="text-gray-600 mb-6">
                            Créez votre premier sondage pour engager votre communauté et prendre des décisions importantes ensemble.
                          </p>
                          <div className="space-y-3">
                            <ShinyButton
                              onClick={() => window.location.href = `/clubs/${userClub.id}/polls/create`}
                              className="px-6 py-3 font-medium text-white"
                              style={{backgroundColor: '#fa0089', '--primary': '250 0 137'} as React.CSSProperties}
                            >
                              📊 Créer votre premier sondage
                            </ShinyButton>
                            <div>
                              <button
                                onClick={() => window.location.href = `/clubs/${userClub.id}/polls`}
                                className="text-gray-600 hover:text-gray-900 transition text-sm"
                              >
                                Voir tous les sondages
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Aucun club trouvé */
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-8 text-center shadow-sm">
              <div className="text-4xl mb-4">🏗️</div>
              <h2 className="text-xl font-bold mb-2 text-gray-900">Aucun Club Trouvé</h2>
              <p className="text-gray-600 mb-6 text-sm">
                Vous devez d'abord créer un club avant de pouvoir gérer des tokens.
              </p>
              <ShinyButton
                onClick={() => window.location.href = '/register-club'}
                className="px-6 py-3 font-medium text-white"
                style={{backgroundColor: '#fa0089', '--primary': '250 0 137'} as React.CSSProperties}
              >
                🏆 Créer mon Club
              </ShinyButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
