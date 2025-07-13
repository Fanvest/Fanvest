'use client';

import { FanStockNavbar } from '@/components/ui/navbar';
import { BGPattern } from '@/components/bg-pattern';

export default function ClubBenefitsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-main to-accent2 text-main relative">
      <BGPattern 
        variant="diagonal-stripes" 
        mask="fade-edges" 
        size={32}
        fill="#ffd700"
        className="opacity-10"
      />
      
      <FanStockNavbar />
      
      <div className="max-w-6xl mx-auto px-6 pt-32 pb-20 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">⭐ Avantages Club</h1>
          <p className="text-sub/80 text-lg">
            Découvrez tous les bénéfices de rejoindre FanStock en tant que club
          </p>
        </div>
        
        <div className="grid gap-8 mb-12">
          <div className="bg-accent2/30 border border-main rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-accent1">💰 Financement et Revenus</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h4 className="font-semibold">Levée de fonds simplifiée</h4>
                    <p className="text-sub/80 text-sm">Financez vos projets grâce à la vente de tokens</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📈</span>
                  <div>
                    <h4 className="font-semibold">Revenus automatisés</h4>
                    <p className="text-sub/80 text-sm">Partagez automatiquement les bénéfices avec les fans</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <h4 className="font-semibold">Sponsoring facilité</h4>
                    <p className="text-sub/80 text-sm">Attirez plus de sponsors grâce à votre communauté</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💎</span>
                  <div>
                    <h4 className="font-semibold">Valeur du club</h4>
                    <p className="text-sub/80 text-sm">Augmentez la valeur perçue de votre club</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-accent2/30 border border-main rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-accent1">🤝 Engagement et Communauté</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🗳️</span>
                  <div>
                    <h4 className="font-semibold">Gouvernance démocratique</h4>
                    <p className="text-sub/80 text-sm">Impliquez vos fans dans les décisions importantes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">👥</span>
                  <div>
                    <h4 className="font-semibold">Fidélisation des supporters</h4>
                    <p className="text-sub/80 text-sm">Créez un lien plus fort avec votre communauté</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <h4 className="font-semibold">Outils digitaux</h4>
                    <p className="text-sub/80 text-sm">Interface moderne pour gérer votre club</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎨</span>
                  <div>
                    <h4 className="font-semibold">Tokens 3D personnalisés</h4>
                    <p className="text-sub/80 text-sm">Créez des tokens uniques aux couleurs de votre club</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <button 
            onClick={() => window.location.href = '/register-club'}
            className="bg-accent1 hover:bg-accent1/80 px-8 py-4 rounded-lg font-semibold text-lg transition"
          >
            🏆 Créer mon club maintenant
          </button>
        </div>
      </div>
    </div>
  );
}