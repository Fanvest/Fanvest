'use client';

import { WalletManager } from '@/components/web3/WalletManager';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="text-2xl font-bold">FanStock</div>
        <WalletManager />
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Own Your Local Club
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            FanStock brings real ownership to 50,000+ amateur football clubs across Europe. 
            Buy tokens, vote on decisions, share revenues.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg font-semibold text-lg transition">
              Explore Clubs
            </button>
            <button className="border border-gray-600 hover:border-gray-400 px-8 py-4 rounded-lg font-semibold text-lg transition">
              List Your Club
            </button>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-gray-800 p-8 rounded-xl text-center">
            <div className="text-4xl font-bold text-green-500 mb-2">€1-2</div>
            <div className="text-gray-400">Token Price</div>
          </div>
          <div className="bg-gray-800 p-8 rounded-xl text-center">
            <div className="text-4xl font-bold text-green-500 mb-2">50k+</div>
            <div className="text-gray-400">Amateur Clubs</div>
          </div>
          <div className="bg-gray-800 p-8 rounded-xl text-center">
            <div className="text-4xl font-bold text-green-500 mb-2">100%</div>
            <div className="text-gray-400">Transparent</div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Real Ownership, Real Impact
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="text-2xl mb-4">🏟️</div>
              <h3 className="text-xl font-semibold mb-2">Club Creates Tokens</h3>
              <p className="text-gray-400">10,000 tokens at €1-2 each for genuine fan ownership</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="text-2xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">Revenue Sharing</h3>
              <p className="text-gray-400">20% of transfers, 15% of sponsorships to token holders</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="text-2xl mb-4">🗳️</div>
              <h3 className="text-xl font-semibold mb-2">Real Governance</h3>
              <p className="text-gray-400">Vote on coach, budget, strategy - not just bus colors</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="text-2xl mb-4">📈</div>
              <h3 className="text-xl font-semibold mb-2">Value Growth</h3>
              <p className="text-gray-400">Token value increases with club success and promotion</p>
            </div>
          </div>
        </div>

        {/* Why FanStock */}
        <div className="bg-gray-800 rounded-2xl p-8 md:p-12 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">
            Why Amateur Clubs?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-green-500">The Problem</h3>
              <ul className="space-y-3 text-gray-300">
                <li>• Chiliz serves only 70 elite clubs</li>
                <li>• 50,000+ amateur clubs have zero funding</li>
                <li>• Local fans can't invest in their community clubs</li>
                <li>• No transparency in club finances</li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-green-500">Our Solution</h3>
              <ul className="space-y-3 text-gray-300">
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
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the revolution. Own your local club. Make real decisions. Share real revenues.
          </p>
          <button className="bg-green-600 hover:bg-green-700 px-12 py-5 rounded-lg font-semibold text-xl transition">
            Get Started
          </button>
        </div>
      </section>
    </div>
  );
}