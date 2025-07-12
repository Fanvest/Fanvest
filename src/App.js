import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Coin3D from './Coin3D';
import OrbitControls from './OrbitControls';
import * as THREE from 'three';

function App() {
  const [texture, setTexture] = useState(null);
  const [bandColor, setBandColor] = useState('#8B4513');
  const [animationEnabled, setAnimationEnabled] = useState(true);
  
  // Valeurs fixes pour la bande
  const bandHeight = 0.55;
  const bandWidth = 0.08; // Largeur de la bande (comme avec le slider)

  // Fonction pour charger une image directement
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          
          const texture = new THREE.CanvasTexture(canvas);
          texture.needsUpdate = true;
          setTexture(texture);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Reset texture
  const resetTexture = () => {
    setTexture(null);
  };

  return (
    <div className="app-container">
      {/* Panneau de contrôle */}
      <div className="control-panel">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
          id="texture-upload"
        />
        <label htmlFor="texture-upload" className="upload-button">
          📎 Upload Texture
        </label>
        
        <button onClick={resetTexture} className="reset-button">
          🔄 Reset
        </button>
        

        

        
        {/* Sélecteur de couleur pour l'anneau */}
        <div className="color-controls">
          <h4>Couleur de l'anneau</h4>
          <div className="color-palette">
            {['#8B4513', '#CD853F', '#D2691E', '#A0522D', '#8B0000', '#006400', '#000080', '#4B0082'].map(color => (
              <div
                key={color}
                className={`color-option ${bandColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => setBandColor(color)}
              />
            ))}
          </div>
          <input
            type="color"
            value={bandColor}
            onChange={(e) => setBandColor(e.target.value)}
            className="color-picker"
          />
        </div>

        {/* Toggle Animation */}
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={animationEnabled}
              onChange={(e) => setAnimationEnabled(e.target.checked)}
              className="checkbox"
            />
            Animation activée
          </label>
        </div>
      </div>

      {/* Scène 3D */}
      <Canvas 
        camera={{ position: [0, 0, 8], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        
        {/* Éclairage dramatique depuis le haut à gauche */}
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
  );
}

export default App;
