'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';

interface Club {
  id: string;
  name: string;
  location: string;
  description?: string;
  logo?: string;
  founded?: number;
  tokenAddress?: string;
  tokenSymbol?: string;
  totalSupply?: string;
  pricePerToken?: string;
  owner: {
    privyId: string;
    email?: string;
  };
}

export default function ExplorePage() {
  const { authenticated } = usePrivy();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const response = await fetch('/api/clubs');
      if (response.ok) {
        const data = await response.json();
        setClubs(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClubs = clubs.filter(club => {
    const matchesSearch = club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         club.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getClubStats = (club: Club) => {
    const hasToken = !!club.tokenAddress;
    const supply = club.totalSupply ? parseInt(club.totalSupply) : 0;
    const price = club.pricePerToken ? parseFloat(club.pricePerToken) : 0;
    return { hasToken, supply, price };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#16001D] to-[#330051] text-[#FEFEFE] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FA0089] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#FEFEFE]/60">Chargement des clubs...</p>
        </div>
      </div>
    );
  }

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
              <span className="text-[#FEFEFE]/80">Explorer les Clubs</span>
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

      {/* Header */}
      <div className="bg-gradient-to-r from-[#330051]/50 to-[#16001D]/50 border-b border-[#330051]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Explorer les Clubs</h1>
              <p className="text-[#FEFEFE]/60">Découvrez et investissez dans vos clubs favoris</p>
            </div>
            <div className="text-5xl">🏟️</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#330051]/30 border border-[#330051] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#FA0089]">{clubs.length}</div>
              <div className="text-sm text-[#FEFEFE]/60">Clubs Totaux</div>
            </div>
            <div className="bg-[#330051]/30 border border-[#330051] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#813066]">
                {clubs.filter(c => !!c.tokenAddress).length}
              </div>
              <div className="text-sm text-[#FEFEFE]/60">Avec Tokens</div>
            </div>
            <div className="bg-[#330051]/30 border border-[#330051] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#FA0089]">
                {filteredClubs.length}
              </div>
              <div className="text-sm text-[#FEFEFE]/60">Clubs Visibles</div>
            </div>
            <div className="bg-[#330051]/30 border border-[#330051] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#813066]">
                {clubs.filter(c => c.founded).length}
              </div>
              <div className="text-sm text-[#FEFEFE]/60">Avec Année</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par nom ou localisation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#330051]/30 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE] placeholder-[#FEFEFE]/40"
            />
          </div>
        </div>

        {/* Clubs Grid */}
        {filteredClubs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Aucun club trouvé</h3>
            <p className="text-[#FEFEFE]/60">
              {clubs.length === 0 
                ? "Aucun club n'est encore enregistré." 
                : "Essayez de modifier vos critères de recherche."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => {
              const stats = getClubStats(club);
              return (
                <div key={club.id} className="bg-[#330051]/30 rounded-xl p-6 border border-[#330051] hover:border-[#FA0089] transition-all duration-300 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#330051] rounded-full flex items-center justify-center">
                        {club.logo ? (
                          <img src={club.logo} alt={club.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <span className="text-xl">⚽</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{club.name}</h3>
                        <p className="text-[#FEFEFE]/60 text-sm">{club.location}</p>
                      </div>
                    </div>
                  </div>

                  {club.description && (
                    <p className="text-[#FEFEFE]/80 text-sm mb-4 line-clamp-2">
                      {club.description}
                    </p>
                  )}

                  <div className="space-y-3 mb-4">
                    {club.founded && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-[#FEFEFE]/60">📅 Fondé en</span>
                        <span>{club.founded}</span>
                      </div>
                    )}
                    
                    {stats.hasToken ? (
                      <div className="bg-[#FA0089]/20 border border-[#FA0089]/30 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[#FA0089]">🪙</span>
                          <span className="font-semibold text-[#FA0089]">{club.tokenSymbol}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <div className="text-[#FEFEFE]/60">Supply</div>
                            <div className="font-medium">{stats.supply.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-[#FEFEFE]/60">Prix</div>
                            <div className="font-medium">€{stats.price.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#330051]/30 border border-[#330051] rounded-lg p-3 text-center">
                        <span className="text-[#FEFEFE]/60 text-sm">Pas encore de token</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.location.href = `/clubs/${club.id}`}
                      className="flex-1 bg-[#813066] hover:bg-[#813066]/80 px-4 py-2 rounded-lg font-semibold transition text-sm"
                    >
                      Voir Détails
                    </button>
                    {stats.hasToken && (
                      <button className="flex-1 bg-[#FA0089] hover:bg-[#FA0089]/80 px-4 py-2 rounded-lg font-semibold transition text-sm">
                        Investir
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}