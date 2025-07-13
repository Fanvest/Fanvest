'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { GlowingEffect } from '@/components/glowing-effect';
import { BGPattern } from '@/components/bg-pattern';
import { FanStockNavbar } from '@/components/ui/navbar';
import { ShinyButton } from '@/components/shiny-button';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white text-gray-900 relative">
      <BGPattern 
        variant="diagonal-stripes" 
        mask="fade-edges" 
        size={32}
        fill="#e5e7eb"
        className="opacity-30"
      />
      
      {/* Navigation */}
      <FanStockNavbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Own Your Local Club
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            FanStock brings real ownership to 50,000+ amateur football clubs across Europe. 
            Buy tokens, vote on decisions, share revenues.
          </p>
          <div className="flex justify-center">
            <ShinyButton 
              onClick={() => window.location.href = '/explore'}
              className="px-8 py-4 text-lg font-semibold text-white shadow-lg border border-[#fb7ac1ff]"
              style={{
                backgroundColor: '#ff008cff',
                '--primary': '250 0 137' // HSL values pour #fb7ac1ff
              }}
            >
              Explore Clubs
            </ShinyButton>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-8 rounded-xl text-center shadow-lg">
            <div className="text-4xl font-bold mb-2" style={{color: '#fa0089'}}>€1</div>
            <div className="text-gray-600">Token Price</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-8 rounded-xl text-center shadow-lg">
            <div className="text-4xl font-bold mb-2" style={{color: '#fa0089'}}>50k+</div>
            <div className="text-gray-600">Amateur Clubs</div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 p-8 rounded-xl text-center shadow-lg">
            <div className="text-4xl font-bold mb-2" style={{color: '#fa0089'}}>100%</div>
            <div className="text-gray-600">Transparent</div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Real Ownership, Real Impact
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 group shadow-lg hover:border-[#fa0089]">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-50 via-fuchsia-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-2xl mb-4">🏟️</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Club Creates Tokens</h3>
                <p className="text-gray-600">10,000 tokens at €1 each for genuine fan ownership</p>
              </div>
            </div>
            <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 group shadow-lg hover:border-[#fa0089]">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-50 via-fuchsia-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-2xl mb-4">💰</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Revenue Sharing</h3>
                <p className="text-gray-600">20% of transfers, 15% of sponsorships to token holders</p>
              </div>
            </div>
            <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 group shadow-lg hover:border-[#fa0089]">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-50 via-fuchsia-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-2xl mb-4">🗳️</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Real Governance</h3>
                <p className="text-gray-600">Vote on coach, budget, strategy - not just bus colors</p>
              </div>
            </div>
            <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-xl overflow-hidden border border-gray-200 transition-all duration-300 group shadow-lg hover:border-[#fa0089]">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-50 via-fuchsia-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="text-2xl mb-4">📈</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Value Growth</h3>
                <p className="text-gray-600">Token value increases with club success and promotion</p>
              </div>
            </div>
          </div>
        </div>

        {/* Why FanStock */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 md:p-12 mb-20 shadow-lg">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900">
            Why Amateur Clubs?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-red-600">The Problem</h3>
              <ul className="space-y-3 text-gray-600">
                <li>• Chiliz serves only 70 elite clubs</li>
                <li>• 50,000+ amateur clubs have zero funding</li>
                <li>• Local fans can't invest in their community clubs</li>
                <li>• No transparency in club finances</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-green-600">Our Solution</h3>
              <ul className="space-y-3 text-gray-600">
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
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join the revolution. Own your local club. Make real decisions. Share real revenues.
          </p>
          <ShinyButton 
            onClick={() => window.location.href = '/register-club'}
            className="px-12 py-5 text-xl font-semibold text-white shadow-lg border-2 border-[#fa0089]"
            style={{
              backgroundColor: '#fa0089',
              '--primary': '250 0 137' // HSL values pour #fa0089
            }}
          >
            Get Started
          </ShinyButton>
        </div>
      </section>
      
      {/* Flou en bas de page */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-main via-bg-main/80 to-transparent backdrop-blur-sm pointer-events-none z-0"></div>
    </div>
  );
}