'use client';

import { FanStockNavbar } from '@/components/ui/navbar';
import { BGPattern } from '@/components/bg-pattern';

export default function ClubBenefitsPage() {
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
          <h1 className="text-4xl font-bold mb-4">⭐ Avantages Club</h1>
          <p className="text-[#FEFEFE]/80 text-lg">
            Découvrez tous les bénéfices de rejoindre FanStock en tant que club
          </p>
        </div>
        
        <div className="grid gap-8 mb-12">
          <div className="bg-[#330051]/30 border border-[#330051] rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-[#FA0089]">💰 Financement et Revenus</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h4 className="font-semibold">Levée de fonds simplifiée</h4>
                    <p className="text-[#FEFEFE]/80 text-sm">Financez vos projets grâce à la vente de tokens</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📈</span>
                  <div>
                    <h4 className="font-semibold">Revenus automatisés</h4>
                    <p className="text-[#FEFEFE]/80 text-sm">Partagez automatiquement les bénéfices avec les fans</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <h4 className="font-semibold">Sponsoring facilité</h4>
                    <p className="text-[#FEFEFE]/80 text-sm">Attirez plus de sponsors grâce à votre communauté</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💎</span>
                  <div>
                    <h4 className="font-semibold">Valeur du club</h4>
                    <p className="text-[#FEFEFE]/80 text-sm">Augmentez la valeur perçue de votre club</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#330051]/30 border border-[#330051] rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-6 text-[#FA0089]">🤝 Engagement et Communauté</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🗳️</span>
                  <div>
                    <h4 className="font-semibold">Gouvernance démocratique</h4>
                    <p className="text-[#FEFEFE]/80 text-sm">Impliquez vos fans dans les décisions importantes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">👥</span>
                  <div>
                    <h4 className="font-semibold">Fidélisation des supporters</h4>
                    <p className="text-[#FEFEFE]/80 text-sm">Créez un lien plus fort avec votre communauté</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📱</span>
                  <div>
                    <h4 className="font-semibold">Outils digitaux</h4>
                    <p className="text-[#FEFEFE]/80 text-sm">Interface moderne pour gérer votre club</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎨</span>
                  <div>
                    <h4 className="font-semibold">Tokens 3D personnalisés</h4>
                    <p className="text-[#FEFEFE]/80 text-sm">Créez des tokens uniques aux couleurs de votre club</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <button 
            onClick={() => window.location.href = '/register-club'}
            className="bg-[#FA0089] hover:bg-[#FA0089]/80 px-8 py-4 rounded-lg font-semibold text-lg transition"
          >
            🏆 Créer mon club maintenant
          </button>
        </div>
      </div>
    </div>
  );
}