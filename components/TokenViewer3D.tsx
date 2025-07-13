'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Coin3D from './3d/Coin3D';
import OrbitControls from './3d/OrbitControls';

interface TokenViewer3DProps {
  bandColor?: string;
  animationEnabled?: boolean;
  texture?: string | null;
}

const TokenViewer3D: React.FC<TokenViewer3DProps> = ({ 
  bandColor = '#8B4513', 
  animationEnabled = true,
  texture = null
}) => {
  // Convertir la texture base64 en objet THREE.Texture
  const [textureObj, setTextureObj] = React.useState<any>(null);

  React.useEffect(() => {
    if (texture && typeof window !== 'undefined') {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          // Import THREE dynamiquement
          import('three').then((THREE) => {
            const threeTexture = new THREE.CanvasTexture(canvas);
            threeTexture.needsUpdate = true;
            setTextureObj(threeTexture);
          });
        }
      };
      img.src = texture;
    }
  }, [texture]);
  return (
    <div className="w-full h-full">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 75 }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Éclairage conditionnel selon l'animation */}
        {animationEnabled ? (
          <>
            <ambientLight intensity={0.2} />
            <directionalLight position={[-5, 5, 5]} intensity={1.2} />
            <pointLight position={[3, 3, 3]} intensity={0.8} />
          </>
        ) : (
          <>
            <ambientLight intensity={0.4} />
            <directionalLight position={[5, 5, 5]} intensity={1.0} />
          </>
        )}
        
        {/* Token 3D */}
        <Suspense fallback={null}>
          <Coin3D 
            bandColor={bandColor}
            animationEnabled={animationEnabled}
            customTexture={textureObj} // Utiliser la texture chargée
          />
        </Suspense>
        
        {/* Contrôles de caméra désactivés pour éviter les déplacements */}
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
        />
      </Canvas>
    </div>
  );
};

export default TokenViewer3D;