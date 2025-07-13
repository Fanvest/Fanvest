'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';
import dynamic from 'next/dynamic';
import { BGPattern } from '@/components/bg-pattern';

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
    bandColor: '#fa0089',
    animationEnabled: true
  });

  // Charger les données du club et 3D
  useEffect(() => {
    const loadClubData = async () => {
      try {
        // Charger les paramètres du club
        const settingsResponse = await fetch(`/api/clubs/${params.id}/settings`);
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json();
          setFormData({
            clubName: settingsData.clubName || '',
            description: settingsData.description || '',
            logo: null,
            logoPreview: settingsData.logo || '',
            socialLinks: settingsData.socialLinks || {
              facebook: '',
              instagram: '',
              website: ''
            }
          });
        }
        
        // Charger les données 3D du token
        const token3DResponse = await fetch(`/api/clubs/${params.id}/token3d`);
        if (token3DResponse.ok) {
          const token3DData = await token3DResponse.json();
          if (token3DData.tokenData) {
            setToken3DData(token3DData.tokenData);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      }
    };

    if (params.id) {
      loadClubData();
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
      // Préparer les données à sauvegarder
      const saveData: any = {
        clubName: formData.clubName,
        description: formData.description,
        socialLinks: formData.socialLinks
      };

      // Ajouter le logo s'il y en a un nouveau
      if (formData.logo) {
        const reader = new FileReader();
        const logoBase64 = await new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(formData.logo!);
        });
        saveData.logo = logoBase64;
      }

      console.log('📤 Sending data to API:', saveData);

      // Sauvegarder via l'API
      const response = await fetch(`/api/clubs/${params.id}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saveData)
      });

      console.log('📥 API Response:', response.status, response.ok);

      if (response.ok) {
        setSuccessMessage('Paramètres sauvegardés avec succès !');
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erreur lors de la sauvegarde');
      }
      
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
              <span className="text-gray-600">Paramètres Club</span>
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
            <div className="text-6xl mb-4">⚙️</div>
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Paramètres du Club</h1>
            <p className="text-gray-600">
              Personnalisez l'apparence et les informations de votre club
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-8">
            {/* Section Logo */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
                🖼️ Logo du Club
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    Télécharger un logo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-lg p-6 text-center transition">
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
                      <p className="text-lg font-medium mb-1 text-gray-900">Choisir un fichier</p>
                      <p className="text-sm text-gray-600">
                        PNG, JPG jusqu'à 5MB
                      </p>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    Aperçu
                  </label>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex items-center justify-center min-h-[150px]">
                    {formData.logoPreview ? (
                      <div className="relative">
                        <img 
                          src={formData.logoPreview} 
                          alt="Logo preview" 
                          className="max-w-[120px] max-h-[120px] rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={removeLogo}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-4xl text-gray-400 mb-2">🏆</div>
                        <p className="text-gray-400">Aucun logo</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section Informations */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
                📝 Informations du Club
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    Nom du Club
                  </label>
                  <input
                    type="text"
                    value={formData.clubName}
                    onChange={(e) => handleInputChange('clubName', e.target.value)}
                    className="w-full bg-white border border-gray-300 focus:border-[#fa0089] rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none transition"
                    placeholder="Ex: FC Montreuil"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-600">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full bg-white border border-gray-300 focus:border-[#fa0089] rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 h-24 resize-none focus:outline-none transition"
                    placeholder="Décrivez votre club..."
                  />
                </div>
              </div>
            </div>

            {/* Section Réseaux Sociaux */}
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
                🌐 Réseaux Sociaux
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-600">
                    <span className="text-blue-500">📘</span> Facebook
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.facebook}
                    onChange={(e) => handleInputChange('social.facebook', e.target.value)}
                    className="w-full bg-white border border-gray-300 focus:border-[#fa0089] rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none transition"
                    placeholder="https://facebook.com/votre-club"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-600">
                    <span className="text-pink-500">📷</span> Instagram
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.instagram}
                    onChange={(e) => handleInputChange('social.instagram', e.target.value)}
                    className="w-full bg-white border border-gray-300 focus:border-[#fa0089] rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none transition"
                    placeholder="https://instagram.com/votre-club"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-600">
                    <span className="text-gray-400">🌍</span> Site Web
                  </label>
                  <input
                    type="url"
                    value={formData.socialLinks.website}
                    onChange={(e) => handleInputChange('social.website', e.target.value)}
                    className="w-full bg-white border border-gray-300 focus:border-[#fa0089] rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none transition"
                    placeholder="https://votre-club.com"
                  />
                </div>
              </div>
            </div>

            {/* Section Jeton 3D */}
            <div className="bg-pink-50 border-2 rounded-xl p-6" style={{borderColor: '#fa0089'}}>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2" style={{color: '#fa0089'}}>
                🎨 Créateur de Jeton 3D
              </h2>
              <p className="text-gray-700 mb-4">
                Utilisez notre interface 3D pour personnaliser l'apparence de vos jetons. 
                Créez un design unique qui représente votre club.
              </p>
              <button
                type="button"
                onClick={openTokenCreator3D}
                className="px-6 py-3 rounded-lg font-semibold text-white flex items-center gap-2 hover:opacity-90 transition"
                style={{backgroundColor: '#fa0089'}}
              >
                ✨ Ouvrir le Créateur 3D
              </button>
            </div>

            {/* Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-600 text-sm">{successMessage}</p>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSaving}
                className={`flex-1 py-4 px-6 rounded-lg font-semibold text-lg transition ${
                  isSaving
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'text-white hover:opacity-90'
                }`}
                style={!isSaving ? {backgroundColor: '#fa0089'} : {}}
              >
                {isSaving ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
                    Sauvegarde...
                  </div>
                ) : (
                  '💾 Sauvegarder les Paramètres'
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