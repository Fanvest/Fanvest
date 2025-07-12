'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export default function RegisterClubPage() {
  const { user, authenticated } = usePrivy();
  
  const [formData, setFormData] = useState({
    clubName: '',
    location: '',
    description: '',
    documents: [] as File[]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdClub, setCreatedClub] = useState<any>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(file => 
        file.type === 'application/pdf'
      );
      setFormData(prev => ({ ...prev, documents: files }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!authenticated || !user) {
      setError("Vous devez être connecté pour créer un club");
      setIsSubmitting(false);
      return;
    }

    try {
      // Étape 1: Créer ou récupérer l'utilisateur
      const userResponse = await fetch(`/api/auth/user?privyId=${user.id}`);
      
      if (!userResponse.ok) {
        throw new Error('Erreur lors de la création du profil utilisateur');
      }
      
      const userData = await userResponse.json();

      // Étape 2: Créer la demande de club (avec auto-approbation)
      const clubRequestResponse = await fetch('/api/clubs/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.privyId,
          clubName: formData.clubName,
          location: formData.location,
          description: formData.description,
          contactEmail: user.email?.address || '',
          legalDocuments: formData.documents.map(file => file.name), // Simulation des fichiers
          autoApprove: true // Auto-approval pour hackathon
        })
      });

      if (!clubRequestResponse.ok) {
        const errorData = await clubRequestResponse.json();
        throw new Error(errorData.error || 'Erreur lors de la création du club');
      }

      const result = await clubRequestResponse.json();
      setCreatedClub(result.club);
      setIsSuccess(true);
      
    } catch (err: any) {
      console.error('Erreur lors de la création du club:', err);
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#16001D] to-[#330051] text-[#FEFEFE] flex items-center justify-center p-4">
        <div className="bg-[#FA0089]/20 border border-[#FA0089] rounded-lg p-8 text-center max-w-lg">
          <div className="text-[#FA0089] text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-[#FA0089] mb-4">
            Club Enregistré avec Succès !
          </h2>
          <p className="text-[#FEFEFE]/80 mb-4">
            Félicitations ! Votre club "{formData.clubName}" a été créé et approuvé instantanément.
          </p>
          
          {createdClub && (
            <div className="bg-[#330051]/30 border border-[#330051] rounded-lg p-3 mb-4 text-sm">
              <div className="font-semibold text-[#FA0089]">Club créé :</div>
              <div>ID: {createdClub.id}</div>
              <div>Nom: {createdClub.name}</div>
              <div>Localisation: {createdClub.location}</div>
              <div>Propriétaire: {user?.email?.address}</div>
            </div>
          )}
          
          <div className="bg-[#330051]/30 border border-[#330051] rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-[#FA0089] mb-3">🔑 Vos Nouveaux Privilèges</h3>
            <div className="space-y-2 text-sm text-left">
              <div className="flex items-center gap-2">
                <span className="text-[#FA0089]">✓</span>
                <span>Créer et gérer des tokens pour votre club</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#FA0089]">✓</span>
                <span>Lancer des sondages et votes</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#FA0089]">✓</span>
                <span>Gérer les revenus et distributions</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#FA0089]">✓</span>
                <span>Accès au tableau de bord club</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={() => window.location.href = '/dashboard/club'}
              className="flex-1 bg-[#FA0089] hover:bg-[#FA0089]/80 px-6 py-3 rounded-lg font-semibold transition"
            >
              Suivant →
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex-1 bg-[#330051] hover:bg-[#330051]/80 px-6 py-3 rounded-lg font-semibold transition"
            >
              Accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vérification de connexion
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#16001D] to-[#330051] text-[#FEFEFE] flex items-center justify-center p-4">
        <div className="bg-[#330051]/30 border border-[#330051] rounded-lg p-8 text-center max-w-md">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="text-xl font-bold mb-4">Connexion Requise</h2>
          <p className="text-[#FEFEFE]/80 mb-6">
            Vous devez vous connecter avec votre wallet pour créer un club.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="bg-[#813066] hover:bg-[#813066]/80 px-6 py-3 rounded-lg font-semibold transition"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#16001D] to-[#330051] text-[#FEFEFE] p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-[#330051]/30 border border-[#330051] rounded-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="text-3xl">⚽</div>
            <div>
              <h1 className="text-2xl font-bold">Enregistrer Votre Club</h1>
              <p className="text-[#FEFEFE]/60">Rejoignez la révolution FanStock</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom du club */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Nom du Club *
              </label>
              <input
                type="text"
                value={formData.clubName}
                onChange={(e) => handleInputChange('clubName', e.target.value)}
                className="w-full bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE] placeholder-[#FEFEFE]/40"
                placeholder="Ex: FC Montreuil"
                required
              />
            </div>

            {/* Localisation */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Localisation *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE] placeholder-[#FEFEFE]/40"
                placeholder="Ex: Montreuil, France"
                required
              />
            </div>

            {/* Détails */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Détails du Club *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 h-32 resize-none"
                placeholder="Décrivez votre club : histoire, niveau, nombre de joueurs, installations..."
                required
              />
            </div>

            {/* Email automatique depuis Privy */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Email de Contact
              </label>
              <div className="w-full bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE]/80 flex items-center gap-2">
                <span>📧</span>
                <span>{user?.email?.address || 'Email non disponible'}</span>
                <span className="text-xs text-[#FEFEFE]/40 ml-auto">Depuis votre compte Privy</span>
              </div>
            </div>

            {/* Upload de documents PDF (fictif) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Documents Justificatifs (PDF) *
              </label>
              <div className="border-2 border-dashed border-[#330051] rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-4xl mb-2">📄</div>
                  <p className="text-lg font-medium mb-1">Déposez vos documents PDF</p>
                  <p className="text-sm text-[#FEFEFE]/60 mb-3">
                    Statuts, licence FFF, certificats, photos des installations...
                  </p>
                  <div className="bg-[#813066] hover:bg-[#813066]/80 px-4 py-2 rounded-lg inline-block transition">
                    Choisir les fichiers
                  </div>
                </label>
              </div>
              
              {formData.documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-[#FA0089]">
                    {formData.documents.length} document(s) sélectionné(s) :
                  </p>
                  {formData.documents.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm bg-[#330051]/50 rounded px-3 py-2">
                      <span>📄</span>
                      <span>{file.name}</span>
                      <span className="text-[#FEFEFE]/60">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Affichage des erreurs */}
            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <h4 className="font-semibold text-red-400 mb-2">❌ Erreur</h4>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={isSubmitting || !formData.clubName || !formData.location || !formData.description}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition ${
                isSubmitting || !formData.clubName || !formData.location || !formData.description
                  ? 'bg-[#330051]/50 cursor-not-allowed'
                  : 'bg-[#FA0089] hover:bg-[#FA0089]/80 transform hover:scale-105'
              }`}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Envoi en cours...
                </div>
              ) : (
                '🚀 Soumettre la Demande'
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}