'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import dynamic from 'next/dynamic';
import { BGPattern } from '@/components/bg-pattern';
import { ShinyButton } from '@/components/shiny-button';
import { BuyTokensModal } from '@/components/club/BuyTokensModal';
import { useTokenBalance } from '@/hooks/useTokenBalance';

// Dynamic import of the 3D viewer
const TokenViewer3D = dynamic(() => import('@/components/TokenViewer3D'), {
  ssr: false,
  loading: () => (
    <div className="text-center">
      <div className="w-20 h-20 border-2 rounded-full animate-spin mx-auto mb-2" style={{borderColor: '#fa0089', borderTopColor: 'transparent'}}></div>
      <div className="text-sm text-gray-600">Loading 3D...</div>
    </div>
  )
});

interface Club {
  id: string;
  name: string;
  location: string;
  description?: string;
  logo?: string;
  founded?: number;
  socialLinks?: string;
  tokenAddress?: string;
  tokenSymbol?: string;
  totalSupply?: string;
  pricePerToken?: string;
  tokenTexture?: string;
  tokenBandColor?: string;
  tokenAnimation?: boolean;
  owner: {
    privyId: string;
    email?: string;
  };
}

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  website?: string;
}

interface PollOption {
  id: string;
  text: string;
  order: number;
  _count: {
    responses: number;
  };
}

interface Poll {
  id: string;
  title: string;
  description: string;
  pollType: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  createdAt: string;
  club: {
    id: string;
    name: string;
    totalSupply: string;
  };
  options: PollOption[];
  _count: {
    responses: number;
  };
}

interface UserVote {
  optionId: string;
  tokenPower: string;
}

export default function ClubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { authenticated, user } = usePrivy();

  // Function to format numbers with spaces
  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };
  
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [polls, setPolls] = useState<Poll[]>([]);
  const [userVotes, setUserVotes] = useState<{ [pollId: string]: UserVote }>({});
  // Use the hook to get the actual token balance from database
  const { balance: userTokens, percentage: userPercentage, refetch: refetchBalance } = useTokenBalance(params.id as string);
  const [pollsLoading, setPollsLoading] = useState(false);
  const [pollsTab, setPollsTab] = useState<'active' | 'archived'>('active');
  const [showCryptoInfo, setShowCryptoInfo] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

  // Check if current user is the club owner
  const isOwner = authenticated && user?.id && club?.owner?.privyId === user.id;

  useEffect(() => {
    if (params.id) {
      loadClubData();
      loadPolls();
    }
  }, [params.id]);

  // No need for loadUserTokens as the useTokenBalance hook handles this automatically

  useEffect(() => {
    if (authenticated && polls.length > 0) {
      loadUserVotes();
    }
  }, [authenticated, polls]);

  const loadClubData = async () => {
    try {
      setLoading(true);
      
      // Load club data
      const response = await fetch(`/api/clubs/${params.id}/settings`);
      if (response.ok) {
        const data = await response.json();
        
        // Also get token data
        const tokenResponse = await fetch(`/api/clubs/${params.id}/token`);
        let tokenData = {};
        if (tokenResponse.ok) {
          const tokenInfo = await tokenResponse.json();
          if (tokenInfo.hasToken) {
            tokenData = tokenInfo.club;
          }
        }

        // Get token 3D data
        const token3DResponse = await fetch(`/api/clubs/${params.id}/token3d`);
        let token3DData = {};
        if (token3DResponse.ok) {
          const token3DInfo = await token3DResponse.json();
          if (token3DInfo.tokenData) {
            token3DData = {
              tokenTexture: token3DInfo.tokenData.texture,
              tokenBandColor: token3DInfo.tokenData.bandColor,
              tokenAnimation: token3DInfo.tokenData.animationEnabled
            };
          }
        }

        const clubData = {
          id: data.clubId,
          name: data.clubName,
          location: data.location,
          description: data.description,
          logo: data.logo,
          founded: data.founded,
          socialLinks: data.socialLinks,
          owner: { privyId: 'demo-user', email: 'demo@fanstock.com' },
          ...tokenData,
          ...token3DData
        };

        setClub(clubData);

        // Parse social links
        if (data.socialLinks) {
          try {
            setSocialLinks(JSON.parse(data.socialLinks));
          } catch (e) {
            setSocialLinks({});
          }
        }
      } else {
        setError('Club not found');
      }
    } catch (err) {
      console.error('Error loading club:', err);
      setError('Error loading');
    } finally {
      setLoading(false);
    }
  };

  const loadPolls = async () => {
    try {
      setPollsLoading(true);
      // Load all polls (active and closed)
      const response = await fetch(`/api/polls?clubId=${params.id}`);
      if (response.ok) {
        const pollsData = await response.json();
        setPolls(pollsData);
      }
    } catch (error) {
      console.error('Error loading polls:', error);
    } finally {
      setPollsLoading(false);
    }
  };

  // Function removed - handled by useTokenBalance hook

  const loadUserVotes = async () => {
    if (!authenticated || !user?.id) return;

    const votes: { [pollId: string]: UserVote } = {};
    
    for (const poll of polls) {
      try {
        const response = await fetch(`/api/polls/${poll.id}/vote?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.response) {
            votes[poll.id] = {
              optionId: data.response.optionId,
              tokenPower: data.response.tokenPower
            };
          }
        }
      } catch (error) {
        console.error(`Error loading vote for ${poll.id}:`, error);
      }
    }
    
    setUserVotes(votes);
  };

  const vote = async (pollId: string, optionId: string) => {
    if (!authenticated || !user?.id) return;

    try {
      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          optionId,
          tokenPower: userTokens.toString()
        })
      });

      if (response.ok) {
        // Update local votes
        setUserVotes(prev => ({
          ...prev,
          [pollId]: { optionId, tokenPower: userTokens.toString() }
        }));
        
        // Reload results in real-time
        loadPollResults(pollId);
        
        // Reload polls to get new totals
        loadPolls();
      }
    } catch (error) {
      console.error('Error while voting:', error);
    }
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const canVote = (poll: Poll) => {
    return authenticated && 
           userTokens > 0 && // User must own tokens to vote
           poll.status === 'ACTIVE' && 
           !isExpired(poll.endDate) &&
           !userVotes[poll.id];
  };

  const [pollResults, setPollResults] = useState<{ [pollId: string]: any }>({});

  const loadPollResults = async (pollId: string) => {
    try {
      const response = await fetch(`/api/polls/${pollId}/results`);
      if (response.ok) {
        const data = await response.json();
        setPollResults(prev => ({
          ...prev,
          [pollId]: data
        }));
      }
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };

  const calculateResults = (poll: Poll) => {
    const results = pollResults[poll.id];
    if (!results) {
      // Load results if not yet available
      loadPollResults(poll.id);
      
      // Return temporary data while waiting
      return {
        totalVotes: 0,
        results: poll.options.map(option => ({
          ...option,
          votes: 0,
          percentage: 0
        })),
        winner: null
      };
    }

    const mappedResults = results.results.map((result: any) => ({
      id: result.id,
      text: result.text,
      order: result.order,
      votes: result.tokenVotes,
      percentage: result.relativePercentage || result.percentage
    }));

    // Find the winner
    const winner = mappedResults.reduce((prev, current) => 
      (prev.votes > current.votes) ? prev : current
    );

    return {
      totalVotes: results.totalTokensVoted,
      results: mappedResults,
      winner: winner.votes > 0 ? winner : null
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pollTypeLabels: { [key: string]: string } = {
    GOVERNANCE: '🏛️ Governance',
    COACH_SELECTION: '👨‍💼 Coach Selection',
    BUDGET_ALLOCATION: '💰 Budget Allocation',
    STRATEGY: '🎯 Strategy',
    FACILITY_IMPROVEMENT: '🏟️ Facility Improvement',
    OTHER: '📋 Other'
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
          <div className="text-6xl mb-4">⚽</div>
          <div className="text-xl font-semibold mb-2 text-gray-900">Club loading...</div>
          <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto" style={{borderColor: '#fa0089', borderTopColor: 'transparent'}}></div>
        </div>
      </div>
    );
  }

  if (error || !club) {
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
          <div className="text-6xl mb-4">❌</div>
          <div className="text-xl font-semibold mb-4 text-gray-900">{error || 'Club not found'}</div>
          <ShinyButton 
            onClick={() => router.back()}
            className="px-6 py-3 font-semibold text-white"
            style={{backgroundColor: '#fa0089', '--primary': '250 0 137'}}
          >
            Back
          </ShinyButton>
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
      
      {/* Token 3D in background - only if the club has a token */}
      {club.tokenAddress && typeof window !== 'undefined' && (
        <div className="fixed inset-0 z-0 opacity-10 pointer-events-none">
          <TokenViewer3D 
            bandColor={club.tokenBandColor || '#fa0089'}
            animationEnabled={true}
            texture={club.tokenTexture || null}
            disableControls={true}
          />
        </div>
      )}
      
      {/* Main content */}
      <div className="relative z-10">
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
              <button 
                onClick={() => window.location.href = '/explore'}
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Explore
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">{club.name}</span>
            </div>
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              ← Back
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Club header */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Club logo */}
            <div className="flex-shrink-0">
              {club.logo ? (
                <img 
                  src={club.logo} 
                  alt={`${club.name} Logo`}
                  className="w-32 h-32 rounded-2xl object-cover border-2" style={{borderColor: '#fa0089'}}
                />
              ) : (
                <div className="w-32 h-32 bg-pink-50 border-2 border-gray-200 rounded-2xl flex items-center justify-center">
                  <div className="text-4xl">🏆</div>
                </div>
              )}
            </div>

            {/* Main information */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2 text-gray-900">{club.name}</h1>
              <div className="flex items-center gap-4 text-gray-600 mb-4">
                <span className="flex items-center gap-2">
                  📍 {club.location}
                </span>
                {club.founded && (
                  <span className="flex items-center gap-2">
                    📅 Founded in {club.founded}
                  </span>
                )}
              </div>
              
              {club.description && (
                <p className="text-gray-800 text-lg leading-relaxed mb-6">
                  {club.description}
                </p>
              )}

              {/* Social media */}
              {(socialLinks.facebook || socialLinks.instagram || socialLinks.website) && (
                <div className="space-y-3">
                  <span className="text-gray-500 text-sm">Follow us:</span>
                  <div className="flex items-center gap-3 flex-wrap">
                    {socialLinks.facebook && (
                      <a 
                        href={socialLinks.facebook.startsWith('http') ? socialLinks.facebook : `https://${socialLinks.facebook}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 text-sm"
                      >
                        📘 Facebook
                      </a>
                    )}
                    {socialLinks.instagram && (
                      <a 
                        href={socialLinks.instagram.startsWith('http') ? socialLinks.instagram : `https://${socialLinks.instagram}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 text-sm"
                      >
                        📷 Instagram
                      </a>
                    )}
                    {socialLinks.website && (
                      <a 
                        href={socialLinks.website.startsWith('http') ? socialLinks.website : `https://${socialLinks.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 text-sm border border-gray-300"
                      >
                        🌍 Website
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Token Section */}
        {club.tokenAddress ? (
          !showCryptoInfo ? (
            // Initial view - Information in euros with CHZ option
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Support {club.name}</h2>
                <p className="text-gray-600">
                  Become an owner of part of the club and participate in important decisions
                </p>
              </div>
              
              {/* Information in euros */}
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4 text-center" style={{color: '#fa0089'}}>💰 Investment</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1" style={{color: '#fa0089'}}>
                      {club.pricePerToken && club.totalSupply ? 
                        `${formatNumber(Math.round(parseInt(club.totalSupply) / 100 * parseInt(club.pricePerToken) * 0.85))} €` : 
                        'N/A'
                      }
                    </div>
                    <div className="text-gray-600 text-sm">Price of one share (1%)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1" style={{color: '#fa0089'}}>
                      {club.pricePerToken && club.totalSupply ? 
                        `${formatNumber(Math.round(parseInt(club.totalSupply) * parseInt(club.pricePerToken) * 0.85))} €` : 
                        'N/A'
                      }
                    </div>
                    <div className="text-gray-600 text-sm">Total project value</div>
                  </div>
                </div>
              </div>
              
              {/* User Token Balance */}
              {authenticated && userTokens > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold mb-3 text-green-800">🎯 Your Participation</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold text-green-700">{formatNumber(userTokens)}</div>
                      <div className="text-green-600 text-sm">Tokens owned</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-green-700">{userPercentage.toFixed(2)}%</div>
                      <div className="text-green-600 text-sm">Club share</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-green-700">
                        {club.pricePerToken ? `${formatNumber(userTokens * parseInt(club.pricePerToken))} CHZ` : 'N/A'}
                      </div>
                      <div className="text-green-600 text-sm">Current value</div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action buttons */}
              <div className="space-y-3">
                {isOwner ? (
                  <div className="text-center p-4 bg-gray-100 rounded-lg border border-gray-200">
                    <div className="text-2xl mb-2">👑</div>
                    <div className="font-semibold mb-1" style={{color: '#fa0089'}}>You are the owner</div>
                    <div className="text-sm text-gray-600">
                      As the owner, you cannot invest in your own club
                    </div>
                  </div>
                ) : (
                  <>
                    <ShinyButton 
                      onClick={() => {
                        if (!authenticated) {
                          alert('Please login to invest');
                          return;
                        }
                        setShowBuyModal(true);
                      }}
                      className="w-full py-3 px-6 text-lg font-semibold text-white" 
                      style={{backgroundColor: '#fa0089', '--primary': '250 0 137'}}
                    >
                      💳 Invest in Euros
                    </ShinyButton>
                    <button 
                      onClick={() => setShowCryptoInfo(true)}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 hover:text-gray-900 py-2 px-6 rounded-lg font-medium transition text-sm"
                    >
                      🔗 Pay with CHZ (crypto)
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            // Crypto view - Display token info
            <div className="bg-pink-50 border border-pink-200 rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold" style={{color: '#fa0089'}}>Club Token</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Symbol</span>
                  <span className="font-bold text-lg text-gray-900">{club.tokenSymbol}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Supply</span>
                  <span className="font-bold text-gray-900">{club.totalSupply ? formatNumber(parseInt(club.totalSupply)) : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price per Token</span>
                  <span className="font-bold text-gray-900">{club.pricePerToken} CHZ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price of one share (1%)</span>
                  <span className="font-bold" style={{color: '#fa0089'}}>
                    {club.pricePerToken && club.totalSupply ? 
                      `${formatNumber(parseInt(club.totalSupply) / 100 * parseInt(club.pricePerToken))} CHZ` : 
                      'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Address</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {club.tokenAddress?.slice(0, 10)}...{club.tokenAddress?.slice(-8)}
                  </span>
                </div>
              </div>

              {isOwner ? (
                <div className="text-center p-4 bg-gray-100 rounded-lg border border-gray-200 mt-6">
                  <div className="text-xl mb-2">👑</div>
                  <div className="font-semibold mb-1" style={{color: '#fa0089'}}>You are the owner of the club</div>
                  <div className="text-sm text-gray-600">
                    You cannot invest in your own club
                  </div>
                </div>
              ) : (
                <ShinyButton 
                  onClick={() => {
                    if (!authenticated) {
                      alert('Please login to invest');
                      return;
                    }
                    setShowBuyModal(true);
                  }}
                  className="w-full mt-6 py-3 px-6 font-semibold text-white" 
                  style={{backgroundColor: '#fa0089', '--primary': '250 0 137'}}
                >
                  💰 Invest in {club.tokenSymbol}
                </ShinyButton>
              )}
              
              <button 
                onClick={() => setShowCryptoInfo(false)}
                className="w-full mt-2 text-gray-500 hover:text-gray-800 text-sm transition"
              >
                ← Back
              </button>
            </div>
          )
        ) : (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 text-center shadow-lg">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Token Coming Soon</h2>
            <p className="text-gray-600 mb-6">
              This club has not launched its token yet. Stay tuned to be notified when it goes live!
            </p>
            <ShinyButton className="px-6 py-3 font-semibold text-white" style={{backgroundColor: '#fa0089', '--primary': '250 0 137'}}>
              🔔 Notify me at launch
            </ShinyButton>
          </div>
        )}

        {/* Polls Section */}
        {polls.length > 0 && (
          <div className="mt-8">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
                  📊 Club Polls
                </h2>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setPollsTab('active')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    pollsTab === 'active'
                      ? 'text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  style={pollsTab === 'active' ? {backgroundColor: '#fa0089'} : {}}
                >
                  Active Polls
                </button>
                <button
                  onClick={() => setPollsTab('archived')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    pollsTab === 'archived'
                      ? 'text-white'
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  style={pollsTab === 'archived' ? {backgroundColor: '#fa0089'} : {}}
                >
                  Closed Polls
                </button>
              </div>

              {pollsLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-2" style={{borderColor: '#fa0089', borderTopColor: 'transparent'}}></div>
                  <div className="text-sm text-gray-600">Loading polls...</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {polls
                    .filter(poll => {
                      const expired = poll.endDate && new Date(poll.endDate) < new Date();
                      if (pollsTab === 'active') {
                        return poll.status === 'ACTIVE' && !expired;
                      } else {
                        return poll.status !== 'ACTIVE' || expired;
                      }
                    })
                    .map(poll => {
                      const { results, totalVotes, winner } = calculateResults(poll);
                      const hasVoted = !!userVotes[poll.id];
                      const expired = isExpired(poll.endDate);
                      const isArchived = poll.status !== 'ACTIVE' || expired;
                      
                      return (
                      <div key={poll.id} className={`border border-gray-200 rounded-xl p-6 ${
                        !isArchived
                          ? 'bg-white/90 backdrop-blur-sm shadow-lg' 
                          : 'bg-gray-50/80 backdrop-blur-sm shadow-sm'
                      }`}>
                        {/* Poll header */}
                        <div className="mb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm bg-pink-100 px-2 py-1 rounded font-medium" style={{color: '#fa0089'}}>
                              {pollTypeLabels[poll.pollType] || poll.pollType}
                            </span>
                            {!isArchived && (
                              <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                                🟢 Active
                              </span>
                            )}
                            {hasVoted && (
                              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                                ✅ Voted ({userVotes[poll.id]?.tokenPower} tokens)
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold mb-2 text-gray-900">
                            {poll.title}
                            {isArchived && winner && (
                              <span className="ml-3 text-sm font-normal" style={{color: '#fa0089'}}>
                                🏆 Winner: {winner.text} ({winner.votes} tokens)
                              </span>
                            )}
                          </h3>
                          <p className="text-gray-700 mb-3">{poll.description}</p>
                          <div className="text-sm text-gray-600">
                            End: {formatDate(poll.endDate)} • {totalVotes} tokens cast
                          </div>
                        </div>

                        {/* Options and results */}
                        <div className="space-y-3">
                          {results.map(option => {
                            const isWinner = isArchived && winner && option.id === winner.id;
                            
                            return (
                              <div key={option.id} className="relative group">
                                {/* Progress bar */}
                                <div className="bg-gray-100 rounded-lg overflow-hidden">
                                  <div 
                                    className={`h-12 transition-all duration-500 flex items-center ${
                                      isWinner 
                                        ? 'bg-gradient-to-r from-pink-300 to-pink-500' 
                                        : 'bg-gradient-to-r from-pink-200 to-pink-400'
                                    }`}
                                    style={{ width: `${Math.max(option.percentage, 2)}%` }}
                                  >
                                    {/* Token text only visible on hover for active polls, always visible for archived */}
                                    <div className={`pl-4 text-sm font-medium text-white transition-opacity duration-300 ${
                                      isArchived ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                    }`}>
                                      {option.votes} tokens ({option.percentage.toFixed(1)}%)
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Option text */}
                                <div className="absolute inset-0 flex items-center justify-between px-4">
                                  <span className={`font-medium text-gray-900 ${
                                    isWinner ? 'font-bold' : ''
                                  }`} style={isWinner ? {color: '#fa0089'} : {}}>
                                    {option.text}
                                    {isWinner && ' 🏆'}
                                  </span>
                                  
                                  {/* Vote button */}
                                  {canVote(poll) && (
                                    <button
                                      onClick={() => vote(poll.id, option.id)}
                                      className="text-white px-4 py-1 rounded text-sm font-semibold transition ml-4 hover:opacity-90"
                                      style={{backgroundColor: '#fa0089'}}
                                    >
                                      Vote
                                    </button>
                                  )}
                                </div>

                                {/* Tooltip on hover to display details */}
                                {!isArchived && (
                                  <div className="absolute -top-2 left-4 bg-white border-2 rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 shadow-lg" style={{borderColor: '#fa0089'}}>
                                    <span style={{color: '#fa0089'}}>{option.votes} tokens ({option.percentage.toFixed(1)}%)</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Results summary */}
                        {pollResults[poll.id] && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                              <div>
                                <div className="font-bold" style={{color: '#fa0089'}}>{pollResults[poll.id].totalTokensVoted}</div>
                                <div className="text-gray-600">Tokens voted</div>
                              </div>
                              <div>
                                <div className="font-bold" style={{color: '#fa0089'}}>{pollResults[poll.id].totalVoters}</div>
                                <div className="text-gray-600">Voters</div>
                              </div>
                              <div>
                                <div className="font-bold" style={{color: '#fa0089'}}>{pollResults[poll.id].participationRate?.toFixed(1)}%</div>
                                <div className="text-gray-600">Participation</div>
                              </div>
                              <div>
                                <div className="font-bold" style={{color: '#fa0089'}}>{pollResults[poll.id].totalSupply}</div>
                                <div className="text-gray-600">Total tokens</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Message if cannot vote */}
                        {!isArchived && !canVote(poll) && !hasVoted && (
                          <div className="mt-4 text-center text-gray-500 text-sm">
                            {!authenticated ? '🔒 Connect to vote' : 
                             userTokens === 0 ? '💰 Buy tokens to participate in votes' : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
      
      {/* Buy tokens modal */}
      {club && club.tokenAddress && (
        <BuyTokensModal
          isOpen={showBuyModal}
          onClose={() => setShowBuyModal(false)}
          club={club}
          onSuccess={() => {
            refetchBalance();
            setShowBuyModal(false);
          }}
        />
      )}
    </div>
  );
}