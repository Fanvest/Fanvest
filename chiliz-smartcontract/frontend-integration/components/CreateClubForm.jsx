// Formulaire pour créer un nouveau club
import React, { useState } from 'react';
import { useFactory, useChzPrice } from '../hooks/useFanStock';
import { useAccount } from 'wagmi';
import { parseEther } from 'viem';

export function CreateClubForm({ onClubCreated }) {
  const { address } = useAccount();
  const { createClub, factoryFee, isCreating } = useFactory();
  const chzPrice = useChzPrice();

  const [formData, setFormData] = useState({
    clubName: '',
    tokenName: '',
    tokenSymbol: '',
    priceInEur: 1.0,
    fanVotingPower: 40, // Par défaut 40%
    fanRevenueShare: 10, // Par défaut 10%
  });

  const [errors, setErrors] = useState({});

  // Calculer le prix en CHZ
  const priceInChz = formData.priceInEur / chzPrice;

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.clubName.trim()) {
      newErrors.clubName = 'Nom du club requis';
    }
    
    if (!formData.tokenName.trim()) {
      newErrors.tokenName = 'Nom du token requis';
    }
    
    if (!formData.tokenSymbol.trim()) {
      newErrors.tokenSymbol = 'Symbole du token requis';
    } else if (formData.tokenSymbol.length > 5) {
      newErrors.tokenSymbol = 'Symbole trop long (max 5 caractères)';
    }
    
    if (formData.priceInEur <= 0 || formData.priceInEur > 10) {
      newErrors.priceInEur = 'Prix doit être entre 0.01€ et 10€';
    }
    
    if (formData.fanVotingPower < 10 || formData.fanVotingPower > 49) {
      newErrors.fanVotingPower = 'Le pouvoir de vote des fans doit être entre 10% et 49%';
    }
    
    if (formData.fanRevenueShare < 0 || formData.fanRevenueShare > 15) {
      newErrors.fanRevenueShare = 'Le partage des revenus pour les fans doit être entre 0% et 15%';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!address) return;

    try {
      const priceInWei = parseEther(priceInChz.toString());
      const feeInWei = parseEther(factoryFee);
      
      await createClub({
        args: [
          formData.clubName,
          formData.tokenName,
          formData.tokenSymbol,
          address, // Club wallet = créateur pour la démo
          priceInWei,
          formData.fanVotingPower,
          formData.fanRevenueShare,
        ],
        value: feeInWei,
      });

      // Reset form
      setFormData({
        clubName: '',
        tokenName: '',
        tokenSymbol: '',
        priceInEur: 1.0,
        fanVotingPower: 40,
        fanRevenueShare: 10,
      });

      if (onClubCreated) onClubCreated();

    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  if (!address) {
    return (
      <div className="create-club-form bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">🏆 Créer un nouveau club</h2>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Connectez votre wallet pour créer un club</p>
          <div className="text-6xl mb-4">🔒</div>
        </div>
      </div>
    );
  }

  return (
    <div className="create-club-form bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">🏆 Créer un nouveau club</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nom du club */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom du club
          </label>
          <input
            type="text"
            value={formData.clubName}
            onChange={(e) => handleInputChange('clubName', e.target.value)}
            placeholder="ex: FC Montreuil"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.clubName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.clubName && (
            <p className="text-red-500 text-xs mt-1">{errors.clubName}</p>
          )}
        </div>

        {/* Nom du token */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom du token
          </label>
          <input
            type="text"
            value={formData.tokenName}
            onChange={(e) => handleInputChange('tokenName', e.target.value)}
            placeholder="ex: FC Montreuil Fan Token"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.tokenName ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.tokenName && (
            <p className="text-red-500 text-xs mt-1">{errors.tokenName}</p>
          )}
        </div>

        {/* Symbole */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Symbole (3-5 lettres)
          </label>
          <input
            type="text"
            value={formData.tokenSymbol}
            onChange={(e) => handleInputChange('tokenSymbol', e.target.value.toUpperCase())}
            placeholder="ex: FCM"
            maxLength="5"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.tokenSymbol ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.tokenSymbol && (
            <p className="text-red-500 text-xs mt-1">{errors.tokenSymbol}</p>
          )}
        </div>

        {/* Prix du token */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prix par token (EUR)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            max="10"
            value={formData.priceInEur}
            onChange={(e) => handleInputChange('priceInEur', parseFloat(e.target.value) || 0)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.priceInEur ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <div className="text-xs text-gray-600 mt-1">
            ≈ {priceInChz.toFixed(4)} CHZ (cours actuel: €{chzPrice.toFixed(4)})
          </div>
          {errors.priceInEur && (
            <p className="text-red-500 text-xs mt-1">{errors.priceInEur}</p>
          )}
        </div>

        {/* Pouvoir de vote des fans */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Pouvoir de vote des fans (%)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="10"
              max="49"
              value={formData.fanVotingPower}
              onChange={(e) => handleInputChange('fanVotingPower', parseInt(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              min="10"
              max="49"
              value={formData.fanVotingPower}
              onChange={(e) => handleInputChange('fanVotingPower', parseInt(e.target.value) || 10)}
              className={`w-16 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.fanVotingPower ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <span className="text-sm text-gray-600">%</span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Club: {100 - formData.fanVotingPower}% + droit de veto
          </div>
          {errors.fanVotingPower && (
            <p className="text-red-500 text-xs mt-1">{errors.fanVotingPower}</p>
          )}
        </div>

        {/* Partage des revenus avec les fans */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Partage des revenus avec les fans (%)
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="0"
              max="15"
              value={formData.fanRevenueShare}
              onChange={(e) => handleInputChange('fanRevenueShare', parseInt(e.target.value))}
              className="flex-1"
            />
            <input
              type="number"
              min="0"
              max="15"
              value={formData.fanRevenueShare}
              onChange={(e) => handleInputChange('fanRevenueShare', parseInt(e.target.value) || 0)}
              className={`w-16 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.fanRevenueShare ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <span className="text-sm text-gray-600">%</span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            Club: {100 - formData.fanRevenueShare}% des revenus
          </div>
          {errors.fanRevenueShare && (
            <p className="text-red-500 text-xs mt-1">{errors.fanRevenueShare}</p>
          )}
        </div>

        {/* Récapitulatif */}
        <div className="bg-blue-50 p-3 rounded-md">
          <h3 className="font-semibold text-blue-800 mb-2">📋 Récapitulatif</h3>
          <div className="text-sm text-blue-700 space-y-1">
            <div>• 10,000 tokens maximum</div>
            <div>• Fans: {formData.fanRevenueShare}% revenus, {formData.fanVotingPower}% votes</div>
            <div>• Club: {100 - formData.fanRevenueShare}% revenus, {100 - formData.fanVotingPower}% votes + veto</div>
            <div>• Frais de création: {factoryFee} CHZ</div>
          </div>
        </div>

        {/* Bouton de soumission */}
        <button
          type="submit"
          disabled={isCreating || Object.keys(errors).length > 0}
          className={`w-full py-3 px-4 rounded-md font-semibold transition-colors ${
            isCreating || Object.keys(errors).length > 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isCreating ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin mr-2">⏳</span>
              Création en cours...
            </span>
          ) : (
            '🚀 Créer le club'
          )}
        </button>
      </form>

      {/* Info FanStock */}
      <div className="mt-6 p-3 bg-green-50 rounded-md">
        <div className="text-xs text-green-800 text-center">
          <div className="font-semibold mb-1">💡 FanStock</div>
          <div>Démocratisation des fan tokens pour 50,000+ clubs amateurs</div>
        </div>
      </div>
    </div>
  );
}

export default CreateClubForm;