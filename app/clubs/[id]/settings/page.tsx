'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import dynamic from 'next/dynamic';

// Import dynamique du créateur 3D pour éviter les erreurs SSR
const TokenCreator3D = dynamic(() => import('@/components/3d/TokenCreator3D'), {
  ssr: false,
  loading: () => <div className="text-center p-8">Chargement du créateur 3D...</div>
});

export default function ClubSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, authenticated } = usePrivy();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    clubName: '',
    description: '',
    logo: null as File | null,
    logoPreview: '',
    socialLinks: {
      facebook: '',
      instagram: '',
      website: ''
    }
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showTokenCreator, setShowTokenCreator] = useState(false);
  const [token3DData, setToken3DData] = useState({
    texture: null as string | null,
    bandColor: '#8B4513',
    animationEnabled: true
  });

  // Charger les données 3D existantes
  useEffect(() => {
    const loadToken3DData = async () => {
      try {
        const response = await fetch(`/api/clubs/${params.id}/token3d`);
        if (response.ok) {
          const data = await response.json();
          if (data.tokenData) {
            setToken3DData(data.tokenData);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données 3D:', error);
      }
    };

    if (params.id) {
      loadToken3DData();
    }
  }, [params.id]);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('social.')) {
      const socialField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner un fichier image');
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Le fichier ne doit pas dépasser 5MB');
        return;
      }

      setFormData(prev => ({ ...prev, logo: file }));
      
      // Créer une preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, logoPreview: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const removeLogo = () => {
    setFormData(prev => ({ 
      ...prev, 
      logo: null, 
      logoPreview: '' 
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsSaving(true);

    try {
      // TODO: Implémenter la sauvegarde des paramètres
      console.log('Saving club settings:', {
        clubId: params.id,
        ...formData
      });

      // Simuler un délai pour la démo
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSuccessMessage('Paramètres sauvegardés avec succès !');
      
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const openTokenCreator3D = () => {
    setShowTokenCreator(true);
  };

  const handleSaveToken3D = async (tokenData: {
    texture: string | null;
    bandColor: string;
    animationEnabled: boolean;
  }) => {
    try {
      const response = await fetch(`/api/clubs/${params.id}/token3d`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tokenData)
      });

      if (response.ok) {
        setToken3DData(tokenData);
        setShowTokenCreator(false);
        setSuccessMessage('Design 3D du token sauvegardé avec succès !');
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la sauvegarde du design 3D');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setError('Erreur lors de la sauvegarde du design 3D');
    }
  };

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
              <span className="text-[#FEFEFE]/80">Paramètres Club</span>
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
            <div className="text-6xl mb-4">⚙️</div>
            <h1 className="text-3xl font-bold mb-2">Paramètres du Club</h1>
            <p className="text-[#FEFEFE]/60">
              Personnalisez l'apparence et les informations de votre club
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            {/* Section Logo */}
            <div className="bg-[#330051]/20 border border-[#330051] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🖼️ Logo du Club
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Télécharger un logo
                  </label>
                  <div className="border-2 border-dashed border-[#330051] rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="text-4xl mb-2">📁</div>
                      <p className="text-lg font-medium mb-1">Choisir un fichier</p>
                      <p className="text-sm text-[#FEFEFE]/60">
                        PNG, JPG jusqu'à 5MB
                      </p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Aperçu
                  </label>
                  <div className="bg-[#330051]/30 border border-[#330051] rounded-lg p-6 flex items-center justify-center min-h-[150px]">
                    {formData.logoPreview ? (
                      <div className="relative">
                        <img 
                          src={formData.logoPreview} 
                          alt="Logo preview" 
                          className="max-w-[120px] max-h-[120px] rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-4xl text-[#FEFEFE]/40 mb-2">🏆</div>
                        <p className="text-[#FEFEFE]/40">Aucun logo</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section Informations */}
            <div className="bg-[#330051]/20 border border-[#330051] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                📝 Informations du Club
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nom du Club
                  </label>
                  <input
                    type="text"
                    value={formData.clubName}
                    onChange={(e) => handleInputChange('clubName', e.target.value)}
                    className="w-full bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE] placeholder-[#FEFEFE]/40"
                    placeholder="Ex: FC Montreuil"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE] placeholder-[#FEFEFE]/40 h-24 resize-none"
                    placeholder="Décrivez votre club..."
                  />
                </div>
              </div>
            </div>

            {/* Section Réseaux Sociaux */}
            <div className="bg-[#330051]/20 border border-[#330051] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                🌐 Réseaux Sociaux
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <span className="text-blue-500">📘</span> Facebook
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.facebook}
                    onChange={(e) => handleInputChange('social.facebook', e.target.value)}
                    className="w-full bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE] placeholder-[#FEFEFE]/40"
                    placeholder="https://facebook.com/votre-club"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <span className="text-pink-500">📷</span> Instagram
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.instagram}
                    onChange={(e) => handleInputChange('social.instagram', e.target.value)}
                    className="w-full bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE] placeholder-[#FEFEFE]/40"
                    placeholder="https://instagram.com/votre-club"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <span className="text-gray-400">🌍</span> Site Web
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.website}
                    onChange={(e) => handleInputChange('social.website', e.target.value)}
                    className="w-full bg-[#330051]/50 border border-[#330051] rounded-lg px-4 py-3 text-[#FEFEFE] placeholder-[#FEFEFE]/40"
                    placeholder="https://votre-club.com"
                  />
                </div>
              </div>
            </div>

            {/* Section Jeton 3D */}
            <div className="bg-[#FA0089]/10 border border-[#FA0089] rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[#FA0089]">
                🎨 Créateur de Jeton 3D
              </h2>
              <p className="text-[#FEFEFE]/80 mb-4">
                Utilisez notre interface 3D pour personnaliser l'apparence de vos jetons. 
                Créez un design unique qui représente votre club.
              </p>
              <button
                type="button"
                onClick={openTokenCreator3D}
                className="bg-[#FA0089] hover:bg-[#FA0089]/80 px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
              >
                ✨ Ouvrir le Créateur 3D
              </button>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-900/20 border border-green-500 rounded-lg p-4">
                <p className="text-green-400 text-sm">{successMessage}</p>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition ${
                  isSaving
                    ? 'bg-[#330051]/50 cursor-not-allowed'
                    : 'bg-[#FA0089] hover:bg-[#FA0089]/80 transform hover:scale-105'
                }`}
              >
                {isSaving ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sauvegarde...
                  </div>
                ) : (
                  '💾 Sauvegarder les Paramètres'
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

      {/* Créateur 3D Modal */}
      {showTokenCreator && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center">Chargement...</div>}>
          <TokenCreator3D
            onSave={handleSaveToken3D}
            onClose={() => setShowTokenCreator(false)}
            initialData={token3DData}
          />
        </Suspense>
      )}
    </div>
  );
}