'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import dynamic from 'next/dynamic';

// Import dynamique du viewer 3D
const TokenViewer3D = dynamic(() => import('@/components/TokenViewer3D'), {
  ssr: false,
  loading: () => (
    <div className="text-center">
      <div className="w-8 h-8 border-2 border-[#FA0089] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <div className="text-sm text-[#FEFEFE]/60">Chargement 3D...</div>
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
  minTokens: string;
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
  
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [polls, setPolls] = useState<Poll[]>([]);
  const [userVotes, setUserVotes] = useState<{ [pollId: string]: UserVote }>({});
  const [userTokens, setUserTokens] = useState(0);
  const [pollsLoading, setPollsLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadClubData();
      loadPolls();
    }
  }, [params.id]);

  useEffect(() => {
    if (club) {
      loadUserTokens();
    }
  }, [authenticated, club]);

  useEffect(() => {
    if (authenticated && polls.length > 0) {
      loadUserVotes();
    }
  }, [authenticated, polls]);

  const loadClubData = async () => {
    try {
      setLoading(true);
      
      // Charger les données du club
      const response = await fetch(`/api/clubs/${params.id}/settings`);
      if (response.ok) {
        const data = await response.json();
        
        // Récupérer aussi les données de token
        const tokenResponse = await fetch(`/api/clubs/${params.id}/token`);
        let tokenData = {};
        if (tokenResponse.ok) {
          const tokenInfo = await tokenResponse.json();
          if (tokenInfo.hasToken) {
            tokenData = tokenInfo.club;
          }
        }

        // Récupérer les données 3D du token
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

        // Parser les liens sociaux
        if (data.socialLinks) {
          try {
            setSocialLinks(JSON.parse(data.socialLinks));
          } catch (e) {
            setSocialLinks({});
          }
        }
      } else {
        setError('Club introuvable');
      }
    } catch (err) {
      console.error('Erreur lors du chargement du club:', err);
      setError('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadPolls = async () => {
    try {
      setPollsLoading(true);
      const response = await fetch(`/api/polls?clubId=${params.id}&status=ACTIVE`);
      if (response.ok) {
        const pollsData = await response.json();
        setPolls(pollsData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sondages:', error);
    } finally {
      setPollsLoading(false);
    }
  };

  const loadUserTokens = async () => {
    if (!club?.tokenAddress) {
      setUserTokens(0);
      return;
    }
    
    // Pour la démo, simuler selon le statut d'authentification
    // Dans un vrai système, cela viendrait de la blockchain via le tokenAddress
    if (authenticated) {
      // Simuler différents niveaux de tokens selon l'utilisateur
      const userId = user?.id || '';
      const tokenCount = userId.length % 3 === 0 ? 100 : 
                        userId.length % 3 === 1 ? 25 : 50;
      setUserTokens(tokenCount);
    } else {
      setUserTokens(0);
    }
  };

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
        console.error(`Erreur lors du chargement du vote pour ${poll.id}:`, error);
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
        // Mettre à jour les votes locaux
        setUserVotes(prev => ({
          ...prev,
          [pollId]: { optionId, tokenPower: userTokens.toString() }
        }));
        
        // Recharger les résultats en temps réel
        loadPollResults(pollId);
        
        // Recharger les sondages pour avoir les nouveaux totaux
        loadPolls();
      }
    } catch (error) {
      console.error('Erreur lors du vote:', error);
    }
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const canVote = (poll: Poll) => {
    return authenticated && 
           userTokens >= parseInt(poll.minTokens) && 
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
      console.error('Erreur lors du chargement des résultats:', error);
    }
  };

  const calculateResults = (poll: Poll) => {
    const results = pollResults[poll.id];
    if (!results) {
      // Charger les résultats si pas encore disponibles
      loadPollResults(poll.id);
      
      // Retourner des données temporaires en attendant
      return {
        totalVotes: 0,
        results: poll.options.map(option => ({
          ...option,
          votes: 0,
          percentage: 0
        }))
      };
    }

    return {
      totalVotes: results.totalTokensVoted,
      results: results.results.map((result: any) => ({
        id: result.id,
        text: result.text,
        order: result.order,
        votes: result.tokenVotes,
        percentage: result.percentage
      }))
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pollTypeLabels: { [key: string]: string } = {
    GOVERNANCE: '🏛️ Gouvernance',
    COACH_SELECTION: '👨‍💼 Sélection d\'entraîneur',
    BUDGET_ALLOCATION: '💰 Allocation budgétaire',
    STRATEGY: '🎯 Stratégie',
    FACILITY_IMPROVEMENT: '🏟️ Amélioration des installations',
    OTHER: '📋 Autre'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#16001D] to-[#330051] text-[#FEFEFE] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚽</div>
          <div className="text-xl font-semibold mb-2">Chargement du club...</div>
          <div className="w-8 h-8 border-2 border-[#FA0089] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#16001D] to-[#330051] text-[#FEFEFE] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-xl font-semibold mb-4">{error || 'Club introuvable'}</div>
          <button 
            onClick={() => router.back()}
            className="bg-[#FA0089] hover:bg-[#FA0089]/80 px-6 py-3 rounded-lg font-semibold transition"
          >
            Retour
          </button>
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
              <button 
                onClick={() => window.location.href = '/explore'}
                className="text-[#FEFEFE]/80 hover:text-[#FEFEFE] transition"
              >
                Explorer
              </button>
              <span className="text-[#FEFEFE]/40">/</span>
              <span className="text-[#FEFEFE]/80">{club.name}</span>
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

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* En-tête du club */}
        <div className="bg-[#330051]/30 border border-[#330051] rounded-2xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Logo du club */}
            <div className="flex-shrink-0">
              {club.logo ? (
                <img 
                  src={club.logo} 
                  alt={`Logo ${club.name}`}
                  className="w-32 h-32 rounded-2xl object-cover border-2 border-[#FA0089]"
                />
              ) : (
                <div className="w-32 h-32 bg-[#330051]/50 border-2 border-[#330051] rounded-2xl flex items-center justify-center">
                  <div className="text-4xl">🏆</div>
                </div>
              )}
            </div>

            {/* Informations principales */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{club.name}</h1>
              <div className="flex items-center gap-4 text-[#FEFEFE]/80 mb-4">
                <span className="flex items-center gap-2">
                  📍 {club.location}
                </span>
                {club.founded && (
                  <span className="flex items-center gap-2">
                    📅 Fondé en {club.founded}
                  </span>
                )}
              </div>
              
              {club.description && (
                <p className="text-[#FEFEFE]/90 text-lg leading-relaxed mb-6">
                  {club.description}
                </p>
              )}

              {/* Réseaux sociaux */}
              {(socialLinks.facebook || socialLinks.instagram || socialLinks.website) && (
                <div className="space-y-3">
                  <span className="text-[#FEFEFE]/60 text-sm">Suivez-nous :</span>
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
                        className="bg-[#330051] hover:bg-[#330051]/80 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 text-sm border border-[#330051]"
                      >
                        🌍 Site Web
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section Token */}
        {club.tokenAddress ? (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Informations du token */}
            <div className="bg-[#FA0089]/10 border border-[#FA0089] rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6 text-[#FA0089] flex items-center gap-2">
                🪙 Token du Club
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#FEFEFE]/80">Symbole</span>
                  <span className="font-bold text-lg">{club.tokenSymbol}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#FEFEFE]/80">Supply Total</span>
                  <span className="font-bold">{club.totalSupply}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#FEFEFE]/80">Prix par Token</span>
                  <span className="font-bold">{club.pricePerToken} CHZ</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#FEFEFE]/80">Adresse</span>
                  <span className="font-mono text-xs bg-[#330051]/50 px-2 py-1 rounded">
                    {club.tokenAddress?.slice(0, 10)}...{club.tokenAddress?.slice(-8)}
                  </span>
                </div>
              </div>

              <button className="w-full mt-6 bg-[#FA0089] hover:bg-[#FA0089]/80 py-3 px-6 rounded-lg font-semibold transition">
                💰 Investir dans {club.tokenSymbol}
              </button>
            </div>

            {/* Visualisation 3D du token */}
            <div className="bg-[#330051]/30 border border-[#330051] rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-4">🎨 Aperçu 3D du Token</h3>
              <div className="h-64 bg-[#330051]/20 rounded-lg flex items-center justify-center">
                {typeof window !== 'undefined' ? (
                  <TokenViewer3D 
                    bandColor={club.tokenBandColor || '#8B4513'}
                    animationEnabled={club.tokenAnimation ?? true}
                    texture={club.tokenTexture || null}
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-[#FA0089] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <div className="text-sm text-[#FEFEFE]/60">Chargement 3D...</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#330051]/30 border border-[#330051] rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-2xl font-bold mb-2">Token à venir</h2>
            <p className="text-[#FEFEFE]/80 mb-6">
              Ce club n'a pas encore lancé son token. Restez connecté pour être informé du lancement !
            </p>
            <button className="bg-[#813066] hover:bg-[#813066]/80 px-6 py-3 rounded-lg font-semibold transition">
              🔔 Me notifier du lancement
            </button>
          </div>
        )}

        {/* Section Sondages */}
        {polls.length > 0 && (
          <div className="mt-8">
            <div className="bg-[#330051]/30 border border-[#330051] rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  📊 Sondages en cours
                </h2>
                {authenticated && (
                  <div className="text-sm text-[#FEFEFE]/60">
                    Vos tokens: {userTokens}
                  </div>
                )}
              </div>

              {pollsLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-[#FA0089] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <div className="text-sm text-[#FEFEFE]/60">Chargement des sondages...</div>
                </div>
              ) : (
                <div className="space-y-6">
                  {polls.map(poll => {
                    const { results, totalVotes } = calculateResults(poll);
                    const hasVoted = !!userVotes[poll.id];
                    const expired = isExpired(poll.endDate);
                    
                    return (
                      <div key={poll.id} className="bg-[#330051]/50 border border-[#330051] rounded-xl p-6">
                        {/* En-tête du sondage */}
                        <div className="mb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-sm bg-[#FA0089]/20 text-[#FA0089] px-2 py-1 rounded">
                              {pollTypeLabels[poll.pollType] || poll.pollType}
                            </span>
                            {expired && (
                              <span className="text-sm bg-orange-500/20 text-orange-400 px-2 py-1 rounded">
                                ⏰ Expiré
                              </span>
                            )}
                            {hasVoted && (
                              <span className="text-sm bg-green-500/20 text-green-400 px-2 py-1 rounded">
                                ✅ Voté ({userVotes[poll.id]?.tokenPower} tokens)
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold mb-2">{poll.title}</h3>
                          <p className="text-[#FEFEFE]/80 mb-3">{poll.description}</p>
                          <div className="text-sm text-[#FEFEFE]/60">
                            Fin: {formatDate(poll.endDate)} • Min: {poll.minTokens} tokens • {totalVotes} tokens exprimés
                          </div>
                        </div>

                        {/* Options et résultats */}
                        <div className="space-y-3">
                          {results.map(option => (
                            <div key={option.id} className="relative group">
                              {/* Barre de progression */}
                              <div className="bg-[#330051]/50 rounded-lg overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-[#FA0089]/30 to-[#FA0089]/60 h-12 transition-all duration-500 flex items-center"
                                  style={{ width: `${Math.max(option.percentage, 2)}%` }}
                                >
                                  {/* Texte des tokens visible uniquement au survol */}
                                  <div className="pl-4 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    {option.votes} tokens ({option.percentage.toFixed(1)}%)
                                  </div>
                                </div>
                              </div>
                              
                              {/* Texte de l'option */}
                              <div className="absolute inset-0 flex items-center justify-between px-4">
                                <span className="font-medium">{option.text}</span>
                                
                                {/* Bouton de vote */}
                                {canVote(poll) && (
                                  <button
                                    onClick={() => vote(poll.id, option.id)}
                                    className="bg-[#FA0089] hover:bg-[#FA0089]/80 px-4 py-1 rounded text-sm font-semibold transition ml-4"
                                  >
                                    Voter ({userTokens} tokens)
                                  </button>
                                )}
                              </div>

                              {/* Tooltip au survol pour afficher les détails */}
                              <div className="absolute -top-2 left-4 bg-[#330051] border border-[#FA0089] rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                {option.votes} tokens ({option.percentage.toFixed(1)}%)
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Résumé des résultats */}
                        {pollResults[poll.id] && (
                          <div className="mt-4 p-4 bg-[#330051]/30 rounded-lg">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                              <div>
                                <div className="font-bold text-[#FA0089]">{pollResults[poll.id].totalTokensVoted}</div>
                                <div className="text-[#FEFEFE]/60">Tokens votés</div>
                              </div>
                              <div>
                                <div className="font-bold text-[#FA0089]">{pollResults[poll.id].totalVoters}</div>
                                <div className="text-[#FEFEFE]/60">Votants</div>
                              </div>
                              <div>
                                <div className="font-bold text-[#FA0089]">{pollResults[poll.id].participationRate?.toFixed(1)}%</div>
                                <div className="text-[#FEFEFE]/60">Participation</div>
                              </div>
                              <div>
                                <div className="font-bold text-[#FA0089]">{pollResults[poll.id].totalSupply}</div>
                                <div className="text-[#FEFEFE]/60">Tokens total</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Message si ne peut pas voter */}
                        {poll.status === 'ACTIVE' && !canVote(poll) && !hasVoted && (
                          <div className="mt-4 text-center text-[#FEFEFE]/60 text-sm">
                            {!authenticated ? '🔒 Connectez-vous pour voter' :
                             userTokens < parseInt(poll.minTokens) ? `❌ ${poll.minTokens} tokens minimum requis (vous avez ${userTokens})` :
                             expired ? '⏰ Sondage expiré' : ''}
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
  );
}