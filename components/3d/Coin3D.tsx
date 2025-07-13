'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Coin3DProps {
  customTexture?: THREE.Texture | null;
  bandColor?: string;
  bandHeight?: number;
  animationEnabled?: boolean;
  bandWidth?: number;
}

const Coin3D: React.FC<Coin3DProps> = ({ 
  customTexture, 
  bandColor = 'var(--accent-primary)', 
  bandHeight: propBandHeight = 0.55, 
  animationEnabled = true, 
  bandWidth = 0.08 
}) => {
  const coinRef = useRef<THREE.Group>(null);
  
  // Valeurs fixes pour jeton
  const rotationSpeed = 0.5; 
  const faceRadius = 2.0;
  const thickness = 0.4;
  const bandHeight = propBandHeight; 
  
  // Texture unique pour les deux faces
  const coinTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return new THREE.CanvasTexture(canvas);
    
    // Créer un gradient radial basé sur notre palette
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
    gradient.addColorStop(0, '#f8f8ff');
    gradient.addColorStop(0.3, '#e1e5fe');
    gradient.addColorStop(0.7, '#669bbc');
    gradient.addColorStop(0.9, '#003049');
    gradient.addColorStop(1, '#16001d');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    // Ajouter des détails de pièce de monnaie
    ctx.fillStyle = '#003049';
    ctx.font = 'bold 64px serif';
    ctx.textAlign = 'center';
    ctx.fillText('€', 256, 280);
    
    // Ajouter l'année
    ctx.font = 'bold 32px serif';
    ctx.fillText('2024', 256, 350);
    
    // Cercles décoratifs concentriques
    ctx.strokeStyle = '#003049';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(256, 256, 220, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(256, 256, 200, 0, Math.PI * 2);
    ctx.stroke();
    
    // Petits points décoratifs
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI * 2) / 12;
      const x = 256 + Math.cos(angle) * 180;
      const y = 256 + Math.sin(angle) * 180;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Animation de rotation chaotique privilégiant les faces
  useFrame((state, delta) => {
    if (coinRef.current && animationEnabled) {
      const time = state.clock.elapsedTime;
      const speed = delta * rotationSpeed;
      
      // Rotation chaotique avec moins de rotation sur X pour éviter de voir trop la tranche
      coinRef.current.rotation.x += speed * (0.3 + Math.sin(time * 1.8) * 0.2); // Réduit pour moins voir la tranche
      coinRef.current.rotation.y += speed * (1.2 + Math.cos(time * 1.7) * 0.8); // Augmenté pour plus voir pile/face
      coinRef.current.rotation.z += speed * (0.6 + Math.sin(time * 2.5) * 0.4); // Modéré pour l'effet toupie
    }
  });

  // Géométrie simple du jeton
  const geometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(faceRadius, faceRadius, thickness, 64);
    return geo;
  }, [faceRadius, thickness]);

  // Géométrie de la bande autour de la pièce (anneau creux)
  const bandGeometry = useMemo(() => {
    const innerRadius = faceRadius + 0.02; // Rayon intérieur (proche de la pièce)
    const outerRadius = faceRadius + bandWidth; // Rayon extérieur (contrôlable)
    
    // Créer un anneau plat puis l'extruder
    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
    
    const hole = new THREE.Path();
    hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    ringShape.holes.push(hole);
    
    const extrudeSettings = {
      depth: bandHeight,
      bevelEnabled: false,
      curveSegments: 64
    };
    
    const geometry = new THREE.ExtrudeGeometry(ringShape, extrudeSettings);
    
    // Centrer la géométrie
    geometry.translate(0, 0, -bandHeight / 2);
    geometry.rotateX(Math.PI / 2);
    
    return geometry;
  }, [faceRadius, bandHeight, bandWidth]);

  // Texture simple pour les deux faces
  const finalTexture = useMemo(() => {
    if (!customTexture) return coinTexture;
    
    // Cloner et corriger la texture
    const texture = customTexture.clone();
    texture.flipY = true;
    texture.needsUpdate = true;
    
    return texture;
  }, [customTexture, coinTexture]);

  // Matériau unique pour les faces
  const faceMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: finalTexture,
      metalness: 0.3,
      roughness: 0.4,
      envMapIntensity: 1.2, // Plus d'effets de lumière
    });
  }, [finalTexture]);

  // Matériau métallique pour l'arête
  const edgeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: bandColor,
      metalness: 0.4, // Plus métallique
      roughness: 0.5,
    });
  }, [bandColor]);

  // Matériau métallique pour la bande
  const bandMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: bandColor,
      metalness: 0.4, // Plus métallique
      roughness: 0.5,
    });
  }, [bandColor]);

  return (
    <group ref={coinRef}>
      {/* Pièce principale */}
      <mesh geometry={geometry} material={[edgeMaterial, faceMaterial, faceMaterial]} />
      
      {/* Bande autour de la pièce */}
      <mesh 
        geometry={bandGeometry} 
        material={bandMaterial}
      />
    </group>
  );
};

export default Coin3D;