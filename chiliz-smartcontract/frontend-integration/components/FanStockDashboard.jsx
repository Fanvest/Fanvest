// Dashboard principal FanStock avec Privy
import React, { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useFanStockFactory, useChzPrice } from '../hooks/useFanStockPrivy';

export function FanStockDashboard() {
  const { ready, authenticated, login, user } = usePrivy();
  const { totalClubs, factoryFee, createClub, getClubsList, loading } = useFanStockFactory();
  const { price: chzPrice } = useChzPrice();
  
  const [clubs, setClubs] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClub, setNewClub] = useState({
    clubName: '',
    tokenName: '',
    tokenSymbol: '',
    priceInEur: 1.0,
  });

  // Charger la liste des clubs
  useEffect(() => {
    if (totalClubs > 0) {
      loadClubs();
    }
  }, [totalClubs]);

  const loadClubs = async () => {
    const clubAddresses = await getClubsList(0, totalClubs);
    setClubs(clubAddresses);
  };

  // Créer un nouveau club
  const handleCreateClub = async (e) => {
    e.preventDefault();
    
    const priceInChz = newClub.priceInEur / chzPrice;
    
    const result = await createClub({
      ...newClub,
      priceInChz,
    });
    
    if (result.success) {
      alert('✅ Club créé avec succès !');
      setShowCreateForm(false);
      setNewClub({ clubName: '', tokenName: '', tokenSymbol: '', priceInEur: 1.0 });
      loadClubs();
    } else {
      alert('❌ Erreur: ' + result.error);
    }
  };

  // Si pas connecté
  if (!ready || !authenticated) {
    return (
      <div className="fanstock-dashboard min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">🏆 FanStock</h1>
          <p className="text-gray-600 mb-8">
            Démocratisation des fan tokens pour 50,000+ clubs amateurs
          </p>
          <button
            onClick={login}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            🔐 Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fanstock-dashboard min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">🏆 FanStock</h1>
              <p className="text-sm text-gray-600">
                {totalClubs} clubs • Prix CHZ: €{chzPrice.toFixed(4)}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                👤 {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
              </span>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
              >
                ➕ Nouveau club
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{totalClubs}</div>
            <div className="text-sm text-gray-600">Clubs créés</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">€{chzPrice.toFixed(4)}</div>
            <div className="text-sm text-gray-600">Prix CHZ</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">{factoryFee}</div>
            <div className="text-sm text-gray-600">Frais création (CHZ)</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">10%</div>
            <div className="text-sm text-gray-600">Part fans</div>
          </div>
        </div>

        {/* Formulaire de création */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">🆕 Créer un nouveau club</h2>
            <form onSubmit={handleCreateClub} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom du club</label>
                <input
                  type="text"
                  value={newClub.clubName}
                  onChange={(e) => setNewClub({...newClub, clubName: e.target.value})}
                  placeholder="ex: FC Montreuil"
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom du token</label>
                <input
                  type="text"
                  value={newClub.tokenName}
                  onChange={(e) => setNewClub({...newClub, tokenName: e.target.value})}
                  placeholder="ex: FC Montreuil Fan Token"
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Symbole</label>
                <input
                  type="text"
                  value={newClub.tokenSymbol}
                  onChange={(e) => setNewClub({...newClub, tokenSymbol: e.target.value.toUpperCase()})}
                  placeholder="ex: FCM"
                  maxLength="5"
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Prix par token (EUR)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="10"
                  value={newClub.priceInEur}
                  onChange={(e) => setNewClub({...newClub, priceInEur: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  ≈ {(newClub.priceInEur / chzPrice).toFixed(4)} CHZ
                </div>
              </div>
              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '⏳ Création...' : '🚀 Créer le club'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="bg-gray-500 text-white px-6 py-2 rounded font-semibold hover:bg-gray-600"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste des clubs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((clubAddress, index) => (
            <ClubCard key={clubAddress} clubAddress={clubAddress} />
          ))}
          
          {clubs.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-6xl mb-4">⚽</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Aucun club pour le moment
              </h3>
              <p className="text-gray-500 mb-4">
                Soyez le premier à créer un club FanStock !
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                🏆 Créer le premier club
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Composant Club Card simplifié
function ClubCard({ clubAddress }) {
  const { name, tokenPrice, tokensSold, saleActive, actions } = useClub(clubAddress);
  const [buyAmount, setBuyAmount] = useState(1);

  const handleBuy = async () => {
    const result = await actions.buyTokens(buyAmount);
    if (result.success) {
      alert('✅ Tokens achetés !');
    } else {
      alert('❌ Erreur: ' + result.error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-bold mb-2">{name}</h3>
      <div className="text-sm text-gray-600 mb-4">
        Prix: {parseFloat(tokenPrice).toFixed(4)} CHZ/token
      </div>
      <div className="text-sm text-gray-600 mb-4">
        Vendus: {tokensSold}/10,000
      </div>
      
      {saleActive && (
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="number"
            min="1"
            max="100"
            value={buyAmount}
            onChange={(e) => setBuyAmount(parseInt(e.target.value) || 1)}
            className="w-20 px-2 py-1 border rounded"
          />
          <button
            onClick={handleBuy}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded font-semibold hover:bg-blue-700"
          >
            💳 Acheter
          </button>
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        📊 Cliquez pour voir les détails
      </div>
    </div>
  );
}

export default FanStockDashboard;