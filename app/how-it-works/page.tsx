'use client';

import { FanStockNavbar } from '@/components/ui/navbar';
import { BGPattern } from '@/components/bg-pattern';

export default function HowItWorksPage() {
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
          <h1 className="text-4xl font-bold mb-4">❓ Comment ça marche</h1>
          <p className="text-sub/80 text-lg">
            Découvrez le fonctionnement de FanStock en 3 étapes simples
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-accent2/30 border border-main rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-bold mb-4">1. Créez votre club</h3>
            <p className="text-sub/80">
              Enregistrez votre club amateur et créez vos tokens personnalisés en 3D
            </p>
          </div>
          
          <div className="bg-accent2/30 border border-main rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-4">2. Vendez des tokens</h3>
            <p className="text-sub/80">
              Les fans achètent vos tokens pour devenir propriétaires d'une partie du club
            </p>
          </div>
          
          <div className="bg-accent2/30 border border-main rounded-2xl p-8 text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-4">3. Gouvernance partagée</h3>
            <p className="text-sub/80">
              Les détenteurs votent sur les décisions importantes et partagent les revenus
            </p>
          </div>
        </div>
        
        <div className="bg-accent1/10 border border-accent1 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-center">🌟 Avantages pour tous</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-3 text-accent1">Pour les clubs :</h4>
              <ul className="space-y-2 text-sub/80">
                <li>💰 Financement participatif</li>
                <li>🤝 Engagement des supporters</li>
                <li>📈 Nouvelles sources de revenus</li>
                <li>🎯 Décisions collectives</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3 text-accent1">Pour les fans :</h4>
              <ul className="space-y-2 text-sub/80">
                <li>🏆 Vraie propriété du club</li>
                <li>🗳️ Pouvoir de décision</li>
                <li>💎 Partage des bénéfices</li>
                <li>🎨 Tokens 3D personnalisés</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}