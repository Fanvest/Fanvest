'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

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

export default function ClubPollsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, authenticated } = usePrivy();
  
  const [activePolls, setActivePolls] = useState<Poll[]>([]);
  const [archivedPolls, setArchivedPolls] = useState<Poll[]>([]);
  const [userVotes, setUserVotes] = useState<{ [pollId: string]: UserVote }>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [userTokens, setUserTokens] = useState(0);

  useEffect(() => {
    if (params.id) {
      loadPolls();
      loadUserTokens();
    }
  }, [params.id, user]);

  const loadPolls = async () => {
    try {
      const response = await fetch(`/api/polls?clubId=${params.id}`);
      if (response.ok) {
        const polls = await response.json();
        
        const active = polls.filter((poll: Poll) => poll.status === 'ACTIVE');
        const archived = polls.filter((poll: Poll) => ['COMPLETED', 'CANCELLED'].includes(poll.status));
        
        setActivePolls(active);
        setArchivedPolls(archived);

        // Charger les votes de l'utilisateur pour les sondages actifs
        if (user && active.length > 0) {
          loadUserVotes(active.map((poll: Poll) => poll.id));
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sondages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserVotes = async (pollIds: string[]) => {
    if (!user?.id) return;

    const votes: { [pollId: string]: UserVote } = {};
    
    for (const pollId of pollIds) {
      try {
        const response = await fetch(`/api/polls/${pollId}/vote?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.response) {
            votes[pollId] = {
              optionId: data.response.optionId,
              tokenPower: data.response.tokenPower
            };
          }
        }
      } catch (error) {
        console.error(`Erreur lors du chargement du vote pour ${pollId}:`, error);
      }
    }
    
    setUserVotes(votes);
  };

  const loadUserTokens = async () => {
    // Simuler le nombre de tokens de l'utilisateur
    // Dans un vrai système, cela viendrait de la blockchain
    setUserTokens(50); // Par défaut 50 tokens pour la démo
  };

  const vote = async (pollId: string, optionId: string) => {
    if (!user?.id) return;

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
        
        // Recharger les sondages pour avoir les nouveaux totaux
        loadPolls();
      }
    } catch (error) {
      console.error('Erreur lors du vote:', error);
    }
  };

  const closePoll = async (pollId: string) => {
    try {
      const response = await fetch(`/api/polls/${pollId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'COMPLETED' })
      });

      if (response.ok) {
        loadPolls();
      }
    } catch (error) {
      console.error('Erreur lors de la clôture:', error);
    }
  };

  const calculateResults = (poll: Poll) => {
    const totalTokens = parseInt(poll.club.totalSupply || '0');
    if (totalTokens === 0) return { totalVotes: 0, results: [] };

    // Simuler les résultats en fonction des votes
    const results = poll.options.map(option => {
      // Dans un vrai système, on calculerait le total des tokenPower pour chaque option
      const votes = Math.floor(Math.random() * (totalTokens / 4)); // Simulation
      return {
        ...option,
        votes,
        percentage: totalTokens > 0 ? (votes / totalTokens) * 100 : 0
      };
    });

    const totalVotes = results.reduce((sum, result) => sum + result.votes, 0);
    
    return { totalVotes, results };
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const canVote = (poll: Poll) => {
    return authenticated && 
 
           poll.status === 'ACTIVE' && 
           !isExpired(poll.endDate) &&
           !userVotes[poll.id];
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
          <div className="text-6xl mb-4">📊</div>
          <div className="text-xl font-semibold mb-2">Chargement des sondages...</div>
          <div className="w-8 h-8 border-2 border-[#FA0089] border-t-transparent rounded-full animate-spin mx-auto"></div>
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
                onClick={() => window.location.href = `/clubs/${params.id}`}
                className="text-[#FEFEFE]/80 hover:text-[#FEFEFE] transition"
              >
                Club
              </button>
              <span className="text-[#FEFEFE]/40">/</span>
              <span className="text-[#FEFEFE]/80">Sondages</span>
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
        {/* Header */}
        <div className="bg-[#330051]/30 border border-[#330051] rounded-2xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                📊 Sondages du Club
              </h1>
              <p className="text-[#FEFEFE]/60">
                Participez aux décisions importantes avec vos tokens ({userTokens} tokens)
              </p>
            </div>
            <button 
              onClick={() => router.push(`/clubs/${params.id}/polls/create`)}
              className="bg-[#FA0089] hover:bg-[#FA0089]/80 px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
            >
              ➕ Créer un sondage
            </button>
          </div>
        </div>

        {/* Onglets */}
        <div className="flex bg-[#330051]/30 border border-[#330051] rounded-xl p-2 mb-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              activeTab === 'active' 
                ? 'bg-[#FA0089] text-white' 
                : 'text-[#FEFEFE]/80 hover:text-[#FEFEFE]'
            }`}
          >
            🔴 Sondages actifs ({activePolls.length})
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              activeTab === 'archived' 
                ? 'bg-[#FA0089] text-white' 
                : 'text-[#FEFEFE]/80 hover:text-[#FEFEFE]'
            }`}
          >
            📁 Archives ({archivedPolls.length})
          </button>
        </div>

        {/* Liste des sondages */}
        <div className="space-y-6">
          {(activeTab === 'active' ? activePolls : archivedPolls).map(poll => {
            const { results, totalVotes } = calculateResults(poll);
            const hasVoted = !!userVotes[poll.id];
            const expired = isExpired(poll.endDate);
            
            return (
              <div key={poll.id} className="bg-[#330051]/30 border border-[#330051] rounded-2xl p-6">
                {/* En-tête du sondage */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm bg-[#FA0089]/20 text-[#FA0089] px-2 py-1 rounded">
                        {pollTypeLabels[poll.pollType] || poll.pollType}
                      </span>
                      {poll.status === 'ACTIVE' && expired && (
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
                      Fin: {formatDate(poll.endDate)} • {totalVotes} tokens votants
                    </div>
                  </div>
                  
                  {/* Actions */}
                  {activeTab === 'active' && poll.status === 'ACTIVE' && (
                    <button
                      onClick={() => closePoll(poll.id)}
                      className="bg-orange-500 hover:bg-orange-400 px-4 py-2 rounded-lg text-sm font-semibold transition"
                    >
                      🔒 Clôturer
                    </button>
                  )}
                </div>

                {/* Options et résultats */}
                <div className="space-y-3">
                  {results.map(option => (
                    <div key={option.id} className="relative">
                      {/* Barre de progression */}
                      <div className="bg-[#330051]/50 rounded-lg overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-[#FA0089]/30 to-[#FA0089]/60 h-12 transition-all duration-500 flex items-center"
                          style={{ width: `${Math.max(option.percentage, 2)}%` }}
                        >
                          <div className="pl-4 text-sm font-medium">
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
                    </div>
                  ))}
                </div>

                {/* Message si ne peut pas voter */}
                {activeTab === 'active' && poll.status === 'ACTIVE' && !canVote(poll) && !hasVoted && (
                  <div className="mt-4 text-center text-[#FEFEFE]/60 text-sm">
                    {!authenticated ? '🔒 Connectez-vous pour voter' :
                     expired ? '⏰ Sondage expiré' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Message si aucun sondage */}
        {(activeTab === 'active' ? activePolls : archivedPolls).length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {activeTab === 'active' ? '📊' : '📁'}
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {activeTab === 'active' ? 'Aucun sondage actif' : 'Aucun sondage archivé'}
            </h3>
            <p className="text-[#FEFEFE]/60 mb-6">
              {activeTab === 'active' 
                ? 'Créez le premier sondage pour consulter vos supporters'
                : 'Les sondages terminés apparaîtront ici'
              }
            </p>
            {activeTab === 'active' && (
              <button 
                onClick={() => router.push(`/clubs/${params.id}/polls/create`)}
                className="bg-[#FA0089] hover:bg-[#FA0089]/80 px-6 py-3 rounded-lg font-semibold transition"
              >
                ➕ Créer un sondage
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}