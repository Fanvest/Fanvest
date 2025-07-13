// Composant pour afficher une carte de club
import React from 'react';
import { useClub, useUserTokens, useChzPrice } from '../hooks/useFanStock';
import { useAccount } from 'wagmi';

export function ClubCard({ clubAddress }) {
  const { address } = useAccount();
  const chzPrice = useChzPrice();
  
  const {
    clubName,
    tokenName,
    tokenPrice,
    tokensSold,
    totalRevenue,
    proposalCount,
    saleActive,
    buyTokens,
    isBuying,
  } = useClub(clubAddress);

  const { balance, claimableRevenue } = useUserTokens(clubAddress, address);

  const [buyAmount, setBuyAmount] = React.useState(1);
  
  // Calculer le prix en EUR
  const priceInEur = parseFloat(tokenPrice) * chzPrice;
  const totalCost = buyAmount * parseFloat(tokenPrice);

  const handleBuyTokens = () => {
    if (buyAmount > 0) {
      buyTokens(buyAmount, totalCost.toString());
    }
  };

  return (
    <div className="club-card bg-white rounded-lg shadow-lg p-6 m-4 max-w-md">
      {/* Header */}
      <div className="club-header mb-4">
        <h3 className="text-xl font-bold text-gray-800">{clubName}</h3>
        <p className="text-sm text-gray-600">{tokenName}</p>
        <div className="flex items-center mt-2">
          <span className={`px-2 py-1 rounded-full text-xs ${
            saleActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {saleActive ? '🟢 Vente active' : '🔴 Vente fermée'}
          </span>
        </div>
      </div>

      {/* Prix */}
      <div className="pricing mb-4 p-3 bg-blue-50 rounded">
        <div className="text-lg font-semibold text-blue-800">
          💰 {priceInEur.toFixed(2)}€ par token
        </div>
        <div className="text-sm text-blue-600">
          ({parseFloat(tokenPrice).toFixed(4)} CHZ)
        </div>
      </div>

      {/* Statistiques */}
      <div className="stats grid grid-cols-2 gap-4 mb-4">
        <div className="stat text-center">
          <div className="text-2xl font-bold text-gray-800">{tokensSold}</div>
          <div className="text-xs text-gray-600">Tokens vendus</div>
        </div>
        <div className="stat text-center">
          <div className="text-2xl font-bold text-gray-800">{proposalCount}</div>
          <div className="text-xs text-gray-600">Propositions</div>
        </div>
      </div>

      {/* Mes tokens (si connecté) */}
      {address && (
        <div className="my-tokens mb-4 p-3 bg-green-50 rounded">
          <h4 className="font-semibold text-green-800 mb-2">Mes tokens</h4>
          <div className="flex justify-between">
            <span>Balance: {parseFloat(balance).toFixed(2)} tokens</span>
            <span>À réclamer: {parseFloat(claimableRevenue).toFixed(4)} CHZ</span>
          </div>
        </div>
      )}

      {/* Achat de tokens */}
      {saleActive && address && (
        <div className="buy-section mb-4">
          <h4 className="font-semibold mb-2">Acheter des tokens</h4>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              max="100"
              value={buyAmount}
              onChange={(e) => setBuyAmount(parseInt(e.target.value) || 1)}
              className="w-20 px-2 py-1 border rounded"
            />
            <span>tokens</span>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Total: {(buyAmount * priceInEur).toFixed(2)}€ ({totalCost.toFixed(4)} CHZ)
          </div>
          <button
            onClick={handleBuyTokens}
            disabled={isBuying || !saleActive}
            className={`w-full mt-2 px-4 py-2 rounded font-semibold ${
              isBuying 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isBuying ? '⏳ Achat en cours...' : `💳 Acheter ${buyAmount} token${buyAmount > 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {/* Actions rapides */}
      <div className="actions flex space-x-2">
        <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
          📊 Voir détails
        </button>
        <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
          🗳️ Gouvernance
        </button>
      </div>

      {/* Revenue share info */}
      <div className="revenue-info mt-4 p-3 bg-yellow-50 rounded">
        <div className="text-xs text-yellow-800">
          <div className="flex justify-between">
            <span>Revenus club: 90%</span>
            <span>Revenus fans: 10%</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Pouvoir club: 60% + veto</span>
            <span>Pouvoir fans: 40%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClubCard;