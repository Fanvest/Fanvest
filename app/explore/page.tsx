'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { BGPattern } from '@/components/bg-pattern';
import { ShinyButton } from '@/components/shiny-button';

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
      console.error('Error loading clubs:', error);
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
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white text-gray-900 flex items-center justify-center relative">
        <BGPattern 
          variant="diagonal-stripes" 
          mask="fade-edges" 
          size={32}
          fill="#e5e7eb"
          className="opacity-30"
        />
        <div className="text-center relative z-10">
          <div className="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4" style={{borderColor: '#fa0089', borderTopColor: 'transparent'}}></div>
          <p className="text-gray-600">Loading clubs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white text-gray-900 relative">
      <BGPattern 
        variant="diagonal-stripes" 
        mask="fade-edges" 
        size={32}
        fill="#e5e7eb"
        className="opacity-30"
      />
      
      {/* Navigation Header */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.location.href = '/'}
                className="text-2xl font-bold hover:opacity-80 transition"
                style={{color: '#fa0089'}}
              >
                FanStock
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">Explore Clubs</span>
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-gray-900">Explore Clubs</h1>
              <p className="text-gray-600">Discover and invest in your favorite clubs</p>
            </div>
            <div className="text-5xl">🏟️</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-4 text-center shadow-lg">
              <div className="text-2xl font-bold" style={{color: '#fa0089'}}>{clubs.length}</div>
              <div className="text-sm text-gray-600">Total Clubs</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-4 text-center shadow-lg">
              <div className="text-2xl font-bold" style={{color: '#fa0089'}}>
                {clubs.filter(c => !!c.tokenAddress).length}
              </div>
              <div className="text-sm text-gray-600">With Tokens</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-4 text-center shadow-lg">
              <div className="text-2xl font-bold" style={{color: '#fa0089'}}>
                {filteredClubs.length}
              </div>
              <div className="text-sm text-gray-600">Visible Clubs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-6 py-6 relative z-10">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/90 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-[#fa0089] focus:outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Clubs Grid */}
        {filteredClubs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">No club found</h3>
            <p className="text-gray-600">
              {clubs.length === 0 
                ? "No club has been registered yet." 
                : "Try changing your search criteria."}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map((club) => {
              const stats = getClubStats(club);
              return (
                <div key={club.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 hover:border-[#fa0089] transition-all duration-300 group shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-pink-50 rounded-full flex items-center justify-center">
                        {club.logo ? (
                          <img src={club.logo} alt={club.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <span className="text-xl">⚽</span>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900">{club.name}</h3>
                        <p className="text-gray-600 text-sm">{club.location}</p>
                      </div>
                    </div>
                  </div>

                  {club.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {club.description}
                    </p>
                  )}

                  <div className="space-y-3 mb-4">
                    {club.founded && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">📅 Founded in</span>
                        <span className="text-gray-900">{club.founded}</span>
                      </div>
                    )}
                    
                    {stats.hasToken ? (
                      <div className="bg-pink-50 border border-pink-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span style={{color: '#fa0089'}}>🪙</span>
                          <span className="font-semibold" style={{color: '#fa0089'}}>{club.tokenSymbol}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <div className="text-gray-600">Supply</div>
                            <div className="font-medium text-gray-900">{stats.supply.toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Price</div>
                            <div className="font-medium text-gray-900">€{stats.price.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                        <span className="text-gray-600 text-sm">No token yet</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => window.location.href = `/clubs/${club.id}`}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold transition text-sm"
                    >
                      View Details
                    </button>
                    {stats.hasToken && (
                      <ShinyButton className="flex-1 px-4 py-2 text-sm font-semibold text-white" style={{backgroundColor: '#fa0089', '--primary': '250 0 137'}}>
                        Invest
                      </ShinyButton>
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