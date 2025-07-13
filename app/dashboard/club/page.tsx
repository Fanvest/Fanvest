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
      
      {/* 3D Token in background - only if 3D data exists */}
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
      
      {/* Main content */}
      <div className="relative z-10">
        {/* Modern and minimalist header */}
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
                  {userClub ? `Dashboard · ${userClub.name}` : 'Club Dashboard'}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {userClub && (
                  <button 
                    onClick={() => window.location.href = `/clubs/${userClub.id}`}
                    className="text-sm text-gray-600 hover:text-gray-900 transition flex items-center gap-1"
                  >
                    👁️ Public page
                  </button>
                )}
                <button 
                  onClick={() => window.location.href = '/'}
                  className="text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  ← Home
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto p-6">
          
          {userClub ? (
            <div className="space-y-6">
              
              {/* Club title */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900">
                    👑 {userClub.name}
                  </h1>
                  <p className="text-gray-600 mt-2">
                    {loadingClub ? 'Loading...' : 'Manage your club, tokens and community'}
                  </p>
                </div>
                
                {/* Quick actions */}
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => window.location.href = `/clubs/${userClub.id}/settings`}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                  >
                    🎨 Customize
                  </button>
                  <button 
                    onClick={() => window.location.href = `/clubs/${userClub.id}`}
                    className="border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                  >
                    👁️ Public Page
                  </button>
                </div>
              </div>

              {/* Main layout with sidebar */}
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
                          📊 Overview
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
                          🪙 Token Management
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
                          🗳️ Polls
                        </button>
                      </nav>
                      
            
                    </div>
                  </div>
                </div>

                {/* Main content */}
                <div className="col-span-9">
                  {/* Conditional content based on active section */}
                  {activeSection === 'apercu' && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        📊 Club Overview
                      </h2>
                      
                      {/* Main metrics */}
                      <div className="grid grid-cols-3 gap-6">
                        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-6 rounded-xl shadow-lg">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl">👥</div>
                            <div>
                              <div className="text-3xl font-bold" style={{color: '#fa0089'}}>0</div>
                              <div className="text-gray-600">Active Fans</div>
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
                              <div className="text-gray-600">Active Polls</div>
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
                              <div className="text-gray-600">Total Revenue</div>
                            </div>
                          </div>
                          <div className="mt-4 h-2 bg-pink-50 rounded-full">
                            <div className="w-1/2 h-2 rounded-full bg-gray-400"></div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Activity chart */}
                      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                        <div className="flex items-center justify-center h-32 bg-pink-50 rounded-lg">
                          <div className="text-gray-500 text-center">
                            <div className="text-4xl mb-2">📈</div>
                            <div>No recent activity</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSection === 'token' && (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        🪙 Token Management
                      </h2>
                      
                      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-lg">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="text-3xl">🪙</div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {tokenData.exists ? 'Your token information' : 'Create your club token'}
                            </h3>
                            <p className="text-gray-600">
                              {tokenData.exists ? 'Your token is deployed and active' : 'Configure and deploy your club token'}
                            </p>
                          </div>
                        </div>

                        {tokenData.exists ? (
                          /* Token exists - Read-only display */
                          <div className="space-y-6">
                            <div className="bg-pink-50 border-2 rounded-xl p-6" style={{borderColor: '#fa0089'}}>
                              <h4 className="text-lg font-semibold mb-4" style={{color: '#fa0089'}}>✅ Active Token</h4>
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <label className="block text-sm font-medium mb-2 text-gray-600">Symbol</label>
                                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 font-mono text-lg">
                                    {tokenData.symbol}
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2 text-gray-600">Price per Token</label>
                                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 text-lg">
                                    {tokenData.pricePerToken} CHZ
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2 text-gray-600">Total Supply</label>
                                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-900 text-lg">
                                    {parseInt(tokenData.totalSupply).toLocaleString()} tokens
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-2 text-gray-600">Total Value</label>
                                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 font-semibold text-lg" style={{color: '#fa0089'}}>
                                    {(parseInt(tokenData.totalSupply) * parseInt(tokenData.pricePerToken)).toLocaleString()} CHZ
                                  </div>
                                </div>
                              </div>
                              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Contract address:</span>
                                  <span className="font-mono text-sm" style={{color: '#fa0089'}}>{tokenData.address.slice(0, 20)}...</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Token doesn't exist - Creation form */
                          <form onSubmit={handleCreateToken} className="space-y-6">
                            {error && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                                {error}
                              </div>
                            )}
                            
                            <div className="grid grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium mb-2 text-gray-600">Token Name</label>
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
                                <label className="block text-sm font-medium mb-2 text-gray-600">Symbol (3-5 letters)</label>
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
                                <label className="block text-sm font-medium mb-2 text-gray-600">Number of Tokens (min: 1000)</label>
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
                                <label className="block text-sm font-medium mb-2 text-gray-600">Price per Token (CHZ)</label>
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

                            {/* Summary */}
                            {(formData.totalSupply || formData.pricePerToken) && (
                              <div className="bg-pink-50 border-2 rounded-lg p-4" style={{borderColor: '#fa0089'}}>
                                <h4 className="font-semibold mb-3" style={{color: '#fa0089'}}>📊 Summary</h4>
                                <div className="space-y-2">
                                  {formData.totalSupply && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Total supply:</span>
                                      <span className="text-gray-900">{parseInt(formData.totalSupply).toLocaleString()} tokens</span>
                                    </div>
                                  )}
                                  {formData.pricePerToken && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Unit price:</span>
                                      <span className="text-gray-900">{formData.pricePerToken} CHZ</span>
                                    </div>
                                  )}
                                  {formData.totalSupply && formData.pricePerToken && (
                                    <div className="flex justify-between font-semibold pt-2 border-t border-pink-200" style={{color: '#fa0089'}}>
                                      <span>Total value:</span>
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
                                  Creating...
                                </div>
                              ) : (
                                '🚀 Create Token'
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
                          🗳️ Polls
                        </h2>
                      </div>
                      
                      <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-8 shadow-lg">
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">🗳️</div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">No polls yet</h3>
                          <p className="text-gray-600 mb-6">
                            Create your first poll to engage your community and make important decisions together.
                          </p>
                          <div className="space-y-3">
                            <ShinyButton
                              onClick={() => window.location.href = `/clubs/${userClub.id}/polls/create`}
                              className="px-6 py-3 font-medium text-white"
                              style={{backgroundColor: '#fa0089', '--primary': '250 0 137'} as React.CSSProperties}
                            >
                              📊 Create your first poll
                            </ShinyButton>
                            <div>
                              <button
                                onClick={() => window.location.href = `/clubs/${userClub.id}/polls`}
                                className="text-gray-600 hover:text-gray-900 transition text-sm"
                              >
                                View all polls
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
            /* No club found */
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-8 text-center shadow-sm">
              <div className="text-4xl mb-4">🏗️</div>
              <h2 className="text-xl font-bold mb-2 text-gray-900">No Club Found</h2>
              <p className="text-gray-600 mb-6 text-sm">
                You must first create a club before you can manage tokens.
              </p>
              <ShinyButton
                onClick={() => window.location.href = '/register-club'}
                className="px-6 py-3 font-medium text-white"
                style={{backgroundColor: '#fa0089', '--primary': '250 0 137'} as React.CSSProperties}
              >
                🏆 Create my Club
              </ShinyButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
