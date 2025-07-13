'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { GlowingEffect } from '@/components/glowing-effect';
import { BGPattern } from '@/components/bg-pattern';
import { FanStockNavbar } from '@/components/ui/navbar';

export default function Home() {
  const { user, authenticated } = usePrivy();
  const [userClubs, setUserClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authenticated && user) {
      fetchUserClubs();
    }
  }, [authenticated, user]);

  const fetchUserClubs = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Récupérer les clubs de l'utilisateur
      const response = await fetch(`/api/clubs?ownerId=${user.id}`);
      if (response.ok) {
        const clubs = await response.json();
        setUserClubs(clubs);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasClub = userClubs.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16001D] to-[#330051] text-[#FEFEFE] relative">
      <BGPattern 
        variant="grid" 
        mask="fade-edges" 
        size={32}
        fill="#FA0089"
        className="opacity-25"
      />
      
      {/* Navigation */}
      <FanStockNavbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Own Your Local Club
          </h1>
          <p className="text-xl md:text-2xl text-[#FEFEFE]/80 mb-8 max-w-3xl mx-auto">
            FanStock brings real ownership to 50,000+ amateur football clubs across Europe. 
            Buy tokens, vote on decisions, share revenues.
          </p>
          <div className="flex justify-center">
            <button 
              onClick={() => window.location.href = '/explore'}
              className="bg-[#FA0089] hover:bg-[#FA0089]/80 px-8 py-4 rounded-lg font-semibold text-lg transition"
            >
              Explore Clubs
            </button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-[#330051]/30 border border-[#330051] p-8 rounded-xl text-center">
            <div className="text-4xl font-bold text-[#FA0089] mb-2">€1-2</div>
            <div className="text-[#FEFEFE]/60">Token Price</div>
          </div>
          <div className="bg-[#330051]/30 border border-[#330051] p-8 rounded-xl text-center">
            <div className="text-4xl font-bold text-[#FA0089] mb-2">50k+</div>
            <div className="text-[#FEFEFE]/60">Amateur Clubs</div>
          </div>
          <div className="bg-[#330051]/30 border border-[#330051] p-8 rounded-xl text-center">
            <div className="text-4xl font-bold text-[#FA0089] mb-2">100%</div>
            <div className="text-[#FEFEFE]/60">Transparent</div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Real Ownership, Real Impact
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative bg-[#330051]/30 p-6 rounded-xl overflow-hidden border border-[#330051] hover:border-[#FA0089] transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FA0089]/10 via-[#813066]/10 to-[#330051]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-2xl mb-4">🏟️</div>
                <h3 className="text-xl font-semibold mb-2">Club Creates Tokens</h3>
                <p className="text-[#FEFEFE]/60">10,000 tokens at €1-2 each for genuine fan ownership</p>
              </div>
            </div>
            <div className="relative bg-[#330051]/30 p-6 rounded-xl overflow-hidden border border-[#330051] hover:border-[#FA0089] transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#813066]/10 via-[#FA0089]/10 to-[#330051]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-2xl mb-4">💰</div>
                <h3 className="text-xl font-semibold mb-2">Revenue Sharing</h3>
                <p className="text-[#FEFEFE]/60">20% of transfers, 15% of sponsorships to token holders</p>
              </div>
            </div>
            <div className="relative bg-[#330051]/30 p-6 rounded-xl overflow-hidden border border-[#330051] hover:border-[#FA0089] transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#330051]/10 via-[#813066]/10 to-[#FA0089]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-2xl mb-4">🗳️</div>
                <h3 className="text-xl font-semibold mb-2">Real Governance</h3>
                <p className="text-[#FEFEFE]/60">Vote on coach, budget, strategy - not just bus colors</p>
              </div>
            </div>
            <div className="relative bg-[#330051]/30 p-6 rounded-xl overflow-hidden border border-[#330051] hover:border-[#FA0089] transition-all duration-300 group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FA0089]/10 via-[#330051]/10 to-[#813066]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-2xl mb-4">📈</div>
                <h3 className="text-xl font-semibold mb-2">Value Growth</h3>
                <p className="text-[#FEFEFE]/60">Token value increases with club success and promotion</p>
              </div>
            </div>
          </div>
        </div>

        {/* Why FanStock */}
        <div className="bg-[#330051]/30 border border-[#330051] rounded-2xl p-8 md:p-12 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Why Amateur Clubs?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[#FA0089]">The Problem</h3>
              <ul className="space-y-3 text-[#FEFEFE]/80">
                <li>• Chiliz serves only 70 elite clubs</li>
                <li>• 50,000+ amateur clubs have zero funding</li>
                <li>• Local fans can't invest in their community clubs</li>
                <li>• No transparency in club finances</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-[#FA0089]">Our Solution</h3>
              <ul className="space-y-3 text-[#FEFEFE]/80">
                <li>• Affordable tokens for working-class fans</li>
                <li>• Real ownership, not tourist engagement</li>
                <li>• Automated revenue sharing via smart contracts</li>
                <li>• Democratic governance on all decisions</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Bringing Blockchain to Where Passion Lives
          </h2>
          <p className="text-xl text-[#FEFEFE]/80 mb-8 max-w-2xl mx-auto">
            Join the revolution. Own your local club. Make real decisions. Share real revenues.
          </p>
          <button 
            onClick={() => window.location.href = '/register-club'}
            className="bg-[#FA0089] hover:bg-[#FA0089]/80 px-12 py-5 rounded-lg font-semibold text-xl transition"
          >
            Get Started
          </button>
        </div>
      </section>
      
      {/* Flou en bas de page */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#16001D] via-[#16001D]/80 to-transparent backdrop-blur-sm pointer-events-none z-0"></div>
    </div>
  );
}