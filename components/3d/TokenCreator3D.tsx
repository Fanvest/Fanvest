'use client';

import React, { useState, Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import Coin3D from './Coin3D';
import OrbitControls from './OrbitControls';
import * as THREE from 'three';

interface TokenCreator3DProps {
  onSave?: (tokenData: {
    texture: string | null;
    bandColor: string;
    animationEnabled: boolean;
  }) => void;
  onClose?: () => void;
  initialData?: {
    texture?: string | null;
    bandColor?: string;
    animationEnabled?: boolean;
  };
}

const TokenCreator3D: React.FC<TokenCreator3DProps> = ({ 
  onSave, 
  onClose,
  initialData = {}
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [textureDataUrl, setTextureDataUrl] = useState<string | null>(initialData.texture || null);
  const [bandColor, setBandColor] = useState(initialData.bandColor || '#8B4513');
  const [animationEnabled, setAnimationEnabled] = useState(initialData.animationEnabled ?? true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Valeurs fixes pour la bande
  const bandHeight = 0.55;
  const bandWidth = 0.08;

  // Fonction pour charger une image directement
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image');
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier ne doit pas dépasser 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setTextureDataUrl(dataUrl);
        
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            
            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;
            setTexture(texture);
          }
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Reset texture
  const resetTexture = () => {
    setTexture(null);
    setTextureDataUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Palette de couleurs prédéfinies
  const colorPalette = [
    '#8B4513', '#CD853F', '#D2691E', '#A0522D', 
    '#8B0000', '#006400', '#000080', '#4B0082',
    '#FA0089', '#330051', '#813066', '#16001D'
  ];

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Préparer les données à sauvegarder
      const tokenData = {
        texture: textureDataUrl,
        bandColor,
        animationEnabled
      };

      // Simuler un délai de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (onSave) {
        onSave(tokenData);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du token 3D');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#16001D] to-[#330051] rounded-2xl border border-[#330051] max-w-6xl w-full h-[90vh] flex overflow-hidden">
        
        {/* Panneau de contrôle */}
        <div className="w-80 bg-[#330051]/30 border-r border-[#330051] p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 text-[#FEFEFE]">🎨 Créateur 3D</h2>
            <p className="text-[#FEFEFE]/60 text-sm">Personnalisez votre jeton</p>
          </div>

          {/* Upload de texture */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-[#FA0089]">📎 Texture</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="texture-upload"
            />
            <label 
              htmlFor="texture-upload" 
              className="block w-full bg-[#330051]/50 border border-[#330051] rounded-lg p-4 text-center cursor-pointer hover:bg-[#330051]/70 transition"
            >
              <div className="text-2xl mb-2">📁</div>
              <div className="text-sm text-[#FEFEFE]">Choisir une image</div>
              <div className="text-xs text-[#FEFEFE]/60 mt-1">PNG, JPG max 5MB</div>
            </label>
            
            {textureDataUrl && (
              <div className="mt-3 relative">
                <img 
                  src={textureDataUrl} 
                  alt="Texture preview" 
                  className="w-full h-20 object-cover rounded-lg"
                />
                <button
                  onClick={resetTexture}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Couleur de l'anneau */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-[#FA0089]">🎨 Couleur Anneau</h3>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {colorPalette.map(color => (
                <div
                  key={color}
                  className={`w-12 h-12 rounded-lg cursor-pointer border-2 transition ${
                    bandColor === color ? 'border-[#FEFEFE] scale-110' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setBandColor(color)}
                />
              ))}
            </div>
            <input
              type="color"
              value={bandColor}
              onChange={(e) => setBandColor(e.target.value)}
              className="w-full h-10 border border-[#330051] rounded-lg cursor-pointer bg-transparent"
            />
          </div>

          {/* Animation */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-[#FA0089]">⚡ Animation</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={animationEnabled}
                onChange={(e) => setAnimationEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#FA0089]"
              />
              <span className="text-[#FEFEFE]">Animation activée</span>
            </label>
          </div>

          {/* Boutons d'action */}
          <div className="space-y-3 mt-auto">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition ${
                isSaving
                  ? 'bg-[#330051]/50 cursor-not-allowed'
                  : 'bg-[#FA0089] hover:bg-[#FA0089]/80'
              }`}
            >
              {isSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sauvegarde...
                </div>
              ) : (
                '💾 Sauvegarder'
              )}
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-3 px-4 border border-[#330051] hover:border-[#FA0089] rounded-lg font-semibold transition"
            >
              Fermer
            </button>
          </div>
        </div>

        {/* Scène 3D */}
        <div className="flex-1 relative">
          <div className="absolute top-4 left-4 z-10">
            <h3 className="text-xl font-bold text-[#FEFEFE] mb-1">Aperçu 3D</h3>
            <p className="text-[#FEFEFE]/60 text-sm">Utilisez la souris pour faire tourner</p>
          </div>
          
          <Canvas 
            camera={{ position: [0, 0, 8], fov: 75 }}
            style={{ background: 'transparent' }}
          >
            {/* Éclairage dramatique */}
            <ambientLight intensity={0.1} color="#ffffff" />
            <directionalLight position={[-12, 15, 8]} intensity={1.8} color="#ffffff" castShadow />
            <pointLight position={[-8, 12, 6]} intensity={0.6} color="#ffffff" />
            
            {/* Pièce de monnaie */}
            <Suspense fallback={null}>
              <Coin3D 
                customTexture={texture} 
                bandColor={bandColor}
                bandHeight={bandHeight}
                animationEnabled={animationEnabled}
                bandWidth={bandWidth}
              />
            </Suspense>
            
            {/* Contrôles de caméra */}
            <OrbitControls />
          </Canvas>
        </div>
      </div>
    </div>
  );
};

export default TokenCreator3D;