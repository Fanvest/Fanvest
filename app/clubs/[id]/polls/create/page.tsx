'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import { BGPattern } from '@/components/bg-pattern';

interface PollOption {
  id: string;
  text: string;
}

export default function CreatePollPage() {
  const params = useParams();
  const router = useRouter();
  const { user, authenticated } = usePrivy();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pollType: 'GOVERNANCE' as 'GOVERNANCE' | 'COACH_SELECTION' | 'BUDGET_ALLOCATION' | 'STRATEGY' | 'FACILITY_IMPROVEMENT' | 'OTHER',
    endDate: ''
  });
  
  const [options, setOptions] = useState<PollOption[]>([
    { id: '1', text: '' },
    { id: '2', text: '' }
  ]);
  
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, { 
        id: Date.now().toString(), 
        text: '' 
      }]);
    }
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(opt => opt.id !== id));
    }
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map(opt => 
      opt.id === id ? { ...opt, text } : opt
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsCreating(true);

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error('Le titre est requis');
      }
      if (!formData.description.trim()) {
        throw new Error('La description est requise');
      }
      if (!formData.endDate) {
        throw new Error('La date de fin est requise');
      }
      
      const validOptions = options.filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        throw new Error('Au moins 2 options sont requises');
      }

      // Créer le sondage
      const response = await fetch('/api/polls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          pollType: formData.pollType,
          startDate: new Date().toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
          clubId: params.id,
          options: validOptions.map((opt, index) => ({
            text: opt.text.trim(),
            order: index
          }))
        })
      });

      if (response.ok) {
        router.push(`/clubs/${params.id}/polls`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la création');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const pollTypeLabels = {
    GOVERNANCE: '🏛️ Gouvernance',
    COACH_SELECTION: '👨‍💼 Sélection d\'entraîneur',
    BUDGET_ALLOCATION: '💰 Allocation budgétaire',
    STRATEGY: '🎯 Stratégie',
    FACILITY_IMPROVEMENT: '🏟️ Amélioration des installations',
    OTHER: '📋 Autre'
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white text-gray-900 relative flex items-center justify-center">
        <BGPattern 
          variant="diagonal-stripes" 
          mask="fade-edges" 
          size={32}
          fill="#e5e7eb"
          className="opacity-30"
        />
        <div className="text-center relative z-10">
          <div className="text-6xl mb-4">🔒</div>
          <div className="text-xl font-semibold text-gray-900">Connexion requise</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white text-gray-900 relative">
      <BGPattern 
        variant="diagonal-stripes" 
        mask="fade-edges" 
        size={32}
        fill="#e5e7eb"
        className="opacity-30"
      />
      {/* Navigation Header */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.location.href = '/'}
                className="text-2xl font-bold hover:opacity-80 transition"
                style={{color: '#fa0089'}}
              >
                FanStock
              </button>
              <span className="text-gray-400">/</span>
              <button 
                onClick={() => window.location.href = `/clubs/${params.id}/polls`}
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Sondages
              </button>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">Créer un sondage</span>
            </div>
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              ← Retour
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12 relative z-10">
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📊</div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Créer un sondage</h1>
            <p className="text-gray-600">
              Consultez vos supporters pour les décisions importantes du club
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informations de base */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
                📝 Informations de base
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    Titre du sondage
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-white border border-gray-300 focus:border-[#fa0089] rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none transition"
                    placeholder="Ex: Choix du nouveau maillot domicile"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-white border border-gray-300 focus:border-[#fa0089] rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 h-24 resize-none focus:outline-none transition"
                    placeholder="Décrivez le contexte et l'enjeu de ce sondage..."
                    maxLength={500}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-600">
                      Type de sondage
                    </label>
                    <select
                      value={formData.pollType}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        pollType: e.target.value as typeof formData.pollType 
                      }))}
                      className="w-full bg-white border border-gray-300 focus:border-[#fa0089] rounded-lg px-4 py-3 text-gray-900 focus:outline-none transition"
                    >
                      {Object.entries(pollTypeLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-600">
                      Date de fin
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)} // Au moins 1h dans le futur
                      className="w-full bg-white border border-gray-300 focus:border-[#fa0089] rounded-lg px-4 py-3 text-gray-900 focus:outline-none transition"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Options du sondage */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900">
                  ☑️ Options de vote
                </h2>
                <button
                  type="button"
                  onClick={addOption}
                  disabled={options.length >= 6}
                  className="px-3 py-1 rounded text-sm font-semibold text-white transition disabled:opacity-50 hover:opacity-90"
                  style={{backgroundColor: '#fa0089'}}
                >
                  + Ajouter option
                </button>
              </div>
              
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600 w-8">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(option.id, e.target.value)}
                      className="flex-1 bg-white border border-gray-300 focus:border-[#fa0089] rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none transition"
                      placeholder={`Option ${index + 1}`}
                      maxLength={100}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(option.id)}
                        className="text-red-500 hover:text-red-600 transition px-2 py-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-gray-600 mt-2">
                Minimum 2 options, maximum 6. Le poids de chaque vote = nombre de tokens détenus.
              </p>
            </div>

            {/* Messages d'erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isCreating}
                className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition ${
                  isCreating
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'text-white hover:opacity-90'
                }`}
                style={!isCreating ? {backgroundColor: '#fa0089'} : {}}
              >
                {isCreating ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                    Création en cours...
                  </div>
                ) : (
                  '📊 Créer le sondage'
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-4 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 rounded-lg font-semibold transition"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}