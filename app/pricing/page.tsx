'use client';

import { FanStockNavbar } from '@/components/ui/navbar';
import { BGPattern } from '@/components/bg-pattern';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16001D] to-[#330051] text-[#FEFEFE] relative">
      <BGPattern 
        variant="grid" 
        mask="fade-edges" 
        size={32}
        fill="#FA0089"
        className="opacity-25"
      />
      
      <FanStockNavbar />
      
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">💰 Tarifs</h1>
          <p className="text-[#FEFEFE]/80 text-lg">
            Des tarifs transparents et adaptés aux clubs amateurs
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Plan Gratuit */}
          <div className="bg-[#330051]/30 border border-[#330051] rounded-2xl p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">🆓 Découverte</h3>
              <div className="text-4xl font-bold text-[#FA0089] mb-2">Gratuit</div>
              <p className="text-[#FEFEFE]/60">Pour tester la plateforme</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Création de club</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Token 3D basique</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>5 sondages/mois</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-400">✗</span>
                <span>Smart contracts</span>
              </li>
            </ul>
            <button className="w-full bg-[#330051] hover:bg-[#330051]/80 py-3 rounded-lg font-semibold transition">
              Commencer gratuitement
            </button>
          </div>
          
          {/* Plan Pro */}
          <div className="bg-[#FA0089]/10 border-2 border-[#FA0089] rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-[#FA0089] text-[#FEFEFE] px-4 py-1 rounded-full text-sm font-semibold">
                Recommandé
              </span>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">🏆 Pro</h3>
              <div className="text-4xl font-bold text-[#FA0089] mb-2">99€</div>
              <p className="text-[#FEFEFE]/60">par mois</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Tout du plan Découverte</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Smart contracts complets</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Sondages illimités</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Support prioritaire</span>
              </li>
            </ul>
            <button className="w-full bg-[#FA0089] hover:bg-[#FA0089]/80 py-3 rounded-lg font-semibold transition">
              Choisir Pro
            </button>
          </div>
          
          {/* Plan Enterprise */}
          <div className="bg-[#330051]/30 border border-[#330051] rounded-2xl p-8">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">🌟 Enterprise</h3>
              <div className="text-4xl font-bold text-[#FA0089] mb-2">Sur mesure</div>
              <p className="text-[#FEFEFE]/60">Pour les ligues et fédérations</p>
            </div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Tout du plan Pro</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Clubs illimités</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>API personnalisée</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <span>Support dédié</span>
              </li>
            </ul>
            <button className="w-full bg-[#813066] hover:bg-[#813066]/80 py-3 rounded-lg font-semibold transition">
              Nous contacter
            </button>
          </div>
        </div>
        
        <div className="bg-[#330051]/30 border border-[#330051] rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">🎯 Phase de lancement</h2>
          <p className="text-[#FEFEFE]/80 mb-6">
            Pendant la phase testnet, tous les plans sont gratuits ! 
            Profitez-en pour tester toutes les fonctionnalités sans engagement.
          </p>
          <button 
            onClick={() => window.location.href = '/register-club'}
            className="bg-[#FA0089] hover:bg-[#FA0089]/80 px-8 py-3 rounded-lg font-semibold transition"
          >
            Commencer maintenant
          </button>
        </div>
      </div>
    </div>
  );
}