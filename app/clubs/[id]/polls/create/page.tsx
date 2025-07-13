'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

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
      <div className="min-h-screen bg-gradient-to-br from-[#16001D] to-[#330051] text-[#FEFEFE] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <div className="text-xl font-semibold">Connexion requise</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16001D] to-[#330051] text-[#FEFEFE]">
      {/* Navigation Header */}
      <nav className="bg-[#330051]/50 border-b border-[#330051]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.location.href = '/'}
                className="text-2xl font-bold hover:text-[#FA0089] transition"
              >
                FanStock
              </button>
              <span className="text-[#FEFEFE]/40">/</span>
              <button 
                onClick={() => window.location.href = `/clubs/${params.id}/polls`}
                className="text-[#FEFEFE]/80 hover:text-[#FEFEFE] transition"
              >
                Sondages
              </button>
              <span className="text-[#FEFEFE]/40">/</span>
              <span className="text-[#FEFEFE]/80">Créer un sondage</span>
            </div>
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[#FEFEFE]/80 hover:text-[#FEFEFE] transition"
            >
              ← Retour
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-[#330051]/30 border border-[#330051] rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📊</div>
            <h1 className="text-3xl font-bold mb-2">Créer un sondage</h1>
            <p className="text-[#FEFEFE]/60">
              Consultez vos supporters pour les décisions importantes du club
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informations de base */}
            <div className="bg-[#330051]/20 border border-[#330051] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                📝 Informations de base
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Titre du sondage
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE] placeholder-[#FEFEFE]/40"
                    placeholder="Ex: Choix du nouveau maillot domicile"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE] placeholder-[#FEFEFE]/40 h-24 resize-none"
                    placeholder="Décrivez le contexte et l'enjeu de ce sondage..."
                    maxLength={500}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Type de sondage
                    </label>
                    <select
                      value={formData.pollType}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        pollType: e.target.value as typeof formData.pollType 
                      }))}
                      className="w-full bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE]"
                    >
                      {Object.entries(pollTypeLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Date de fin
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      min={new Date(Date.now() + 3600000).toISOString().slice(0, 16)} // Au moins 1h dans le futur
                      className="w-full bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE]"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Options du sondage */}
            <div className="bg-[#330051]/20 border border-[#330051] rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  ☑️ Options de vote
                </h2>
                <button
                  type="button"
                  onClick={addOption}
                  disabled={options.length >= 6}
                  className="bg-[#FA0089] hover:bg-[#FA0089]/80 px-3 py-1 rounded text-sm font-semibold transition disabled:opacity-50"
                >
                  + Ajouter option
                </button>
              </div>
              
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={option.id} className="flex items-center gap-3">
                    <span className="text-sm font-medium text-[#FEFEFE]/80 w-8">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={option.text}
                      onChange={(e) => updateOption(option.id, e.target.value)}
                      className="flex-1 bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-2 text-[#FEFEFE] placeholder-[#FEFEFE]/40"
                      placeholder={`Option ${index + 1}`}
                      maxLength={100}
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(option.id)}
                        className="text-red-400 hover:text-red-300 transition px-2 py-2"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-[#FEFEFE]/60 mt-2">
                Minimum 2 options, maximum 6. Le poids de chaque vote = nombre de tokens détenus.
              </p>
            </div>

            {/* Messages d'erreur */}
            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isCreating}
                className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition ${
                  isCreating
                    ? 'bg-[#330051]/50 cursor-not-allowed'
                    : 'bg-[#FA0089] hover:bg-[#FA0089]/80 transform hover:scale-105'
                }`}
              >
                {isCreating ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Création en cours...
                  </div>
                ) : (
                  '📊 Créer le sondage'
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-4 border border-[#330051] hover:border-[#FA0089] rounded-lg font-semibold transition"
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