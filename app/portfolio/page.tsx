'use client';

import { FanStockNavbar } from '@/components/ui/navbar';
import { BGPattern } from '@/components/bg-pattern';

export default function PortfolioPage() {
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
          <h1 className="text-4xl font-bold mb-4">💼 Mon Portefeuille</h1>
          <p className="text-sub/80 text-lg">
            Gérez vos investissements et suivez la performance de vos tokens
          </p>
        </div>
        
        <div className="bg-accent2/30 border border-main rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold mb-4">Fonctionnalité en développement</h2>
          <p className="text-sub/80">
            Cette page sera bientôt disponible pour suivre vos investissements en temps réel.
          </p>
        </div>
      </div>
    </div>
  );
}