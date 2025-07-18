'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { BGPattern } from '@/components/bg-pattern';

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

        // Load user votes for active polls
        if (user && active.length > 0) {
          loadUserVotes(active.map((poll: Poll) => poll.id));
        }
      }
    } catch (error) {
      console.error('Error loading polls:', error);
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
        console.error(`Error loading vote for ${pollId}:`, error);
      }
    }
    
    setUserVotes(votes);
  };

  const loadUserTokens = async () => {
    // Simulate the number of tokens for the user
    // In a real system, this would come from the blockchain
    setUserTokens(50); // Default 50 tokens for demo
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
        // Update local votes
        setUserVotes(prev => ({
          ...prev,
          [pollId]: { optionId, tokenPower: userTokens.toString() }
        }));
        
        // Reload polls to get new totals
        loadPolls();
      }
    } catch (error) {
      console.error('Error voting:', error);
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
      console.error('Error closing poll:', error);
    }
  };

  const calculateResults = (poll: Poll) => {
    const totalTokens = parseInt(poll.club.totalSupply || '0');
    if (totalTokens === 0) return { totalVotes: 0, results: [] };

    // Simulate results based on votes
    const results = poll.options.map(option => {
      // In a real system, we would calculate the total tokenPower for each option
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
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white text-gray-900 relative flex items-center justify-center">
        <BGPattern 
          variant="diagonal-stripes" 
          mask="fade-edges" 
          size={32}
          fill="#e5e7eb"
          className="opacity-30"
        />
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <div className="text-xl font-semibold mb-2 text-gray-900">Loading polls...</div>
          <div className="w-8 h-8 border-2 rounded-full animate-spin mx-auto relative z-10" style={{borderColor: '#fa0089', borderTopColor: 'transparent'}}></div>
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
        <div className="max-w-7xl mx-auto px-6 py-4 relative z-10">
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
                onClick={() => window.location.href = `/clubs/${params.id}`}
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Club
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">Polls</span>
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

      <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 mb-8 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3 text-gray-900">
                📊 Club Polls
              </h1>
              <p className="text-gray-600">
                Participate in important decisions with your tokens 
              </p>
            </div>
            <button 
              onClick={() => router.push(`/clubs/${params.id}/polls/create`)}
              className="px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 text-white hover:opacity-90"
              style={{backgroundColor: '#fa0089'}}
            >
              ➕ Create Poll
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-2 mb-8 shadow-lg">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              activeTab === 'active' 
                ? 'text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={activeTab === 'active' ? {backgroundColor: '#fa0089'} : {}}
          >
            🔴 Active Polls ({activePolls.length})
          </button>
          <button
            onClick={() => setActiveTab('archived')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
              activeTab === 'archived' 
                ? 'text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
            style={activeTab === 'archived' ? {backgroundColor: '#fa0089'} : {}}
          >
            📁 Archives ({archivedPolls.length})
          </button>
        </div>

        {/* Poll List */}
        <div className="space-y-6">
          {(activeTab === 'active' ? activePolls : archivedPolls).map(poll => {
            const { results, totalVotes } = calculateResults(poll);
            const hasVoted = !!userVotes[poll.id];
            const expired = isExpired(poll.endDate);
            
            return (
              <div key={poll.id} className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 shadow-lg">
                {/* Poll Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm bg-pink-100 px-2 py-1 rounded font-medium" style={{color: '#fa0089'}}>
                        {pollTypeLabels[poll.pollType] || poll.pollType}
                      </span>
                      {poll.status === 'ACTIVE' && expired && (
                        <span className="text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded font-medium">
                          ⏰ Expired
                        </span>
                      )}
                      {hasVoted && (
                        <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                          ✅ Voted ({userVotes[poll.id]?.tokenPower} tokens)
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{poll.title}</h3>
                    <p className="text-gray-700 mb-3">{poll.description}</p>
                    <div className="text-sm text-gray-600">
                      End: {formatDate(poll.endDate)} • <span style={{color: '#fa0089', fontWeight: '600'}}>{totalVotes} voting tokens</span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  {activeTab === 'active' && poll.status === 'ACTIVE' && (
                    <button
                      onClick={() => closePoll(poll.id)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                    >
                      🔒 Close Poll
                    </button>
                  )}
                </div>

                {/* Options and Results */}
                <div className="space-y-3">
                  {results.map(option => (
                    <div key={option.id} className="relative">
                      {/* Progress Bar */}
                      <div className="bg-gray-100 rounded-lg overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-pink-200 to-pink-400 h-12 transition-all duration-500 flex items-center"
                          style={{ width: `${Math.max(option.percentage, 2)}%` }}
                        >
                          <div className="pl-4 text-sm font-medium text-white">
                            {option.votes} tokens ({option.percentage.toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                      
                      {/* Option Text */}
                      <div className="absolute inset-0 flex items-center justify-between px-4">
                        <span className="font-medium text-gray-900">{option.text}</span>
                        
                        {/* Vote Button */}
                        {canVote(poll) && (
                          <button
                            onClick={() => vote(poll.id, option.id)}
                            className="text-white px-4 py-1 rounded text-sm font-semibold transition ml-4 hover:opacity-90"
                            style={{backgroundColor: '#fa0089'}}
                          >
                            Vote ({userTokens} tokens)
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message if cannot vote */}
                {activeTab === 'active' && poll.status === 'ACTIVE' && !canVote(poll) && !hasVoted && (
                  <div className="mt-4 text-center text-gray-600 text-sm">
                    {!authenticated ? '🔒 Login to vote' :
                     expired ? '⏰ Poll expired' : ''}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Message if no polls */}
        {(activeTab === 'active' ? activePolls : archivedPolls).length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">
              {activeTab === 'active' ? '📊' : '📁'}
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">
              {activeTab === 'active' ? 'No active polls' : 'No archived polls'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'active' 
                ? 'Create the first poll to consult your supporters'
                : 'Completed polls will appear here'
              }
            </p>
            {activeTab === 'active' && (
              <button 
                onClick={() => router.push(`/clubs/${params.id}/polls/create`)}
                className="text-white px-6 py-3 rounded-lg font-semibold transition hover:opacity-90"
                style={{backgroundColor: '#fa0089'}}
              >
                ➕ Create Poll
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}