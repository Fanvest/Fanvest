'use client';

import React, { useRef, useEffect } from 'react';
import { extend, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Étendre R3F avec OrbitControls
extend({ OrbitControls: ThreeOrbitControls });

interface OrbitControlsProps {
  enableZoom?: boolean;
  enablePan?: boolean;
  enableRotate?: boolean;
}

const OrbitControls: React.FC<OrbitControlsProps> = ({ 
  enableZoom = true,
  enablePan = true,
  enableRotate = true
}) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<any>();

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enableDamping = true;
      controlsRef.current.dampingFactor = 0.05;
      controlsRef.current.enablePan = enablePan;
      controlsRef.current.enableZoom = enableZoom;
      controlsRef.current.enableRotate = enableRotate;
      controlsRef.current.minDistance = 3;
      controlsRef.current.maxDistance = 15;
    }
  }, [enableZoom, enablePan, enableRotate]);

  useFrame(() => {
    if (controlsRef.current) {
      controlsRef.current.update();
    }
  });

  return (
    <orbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
    />
  );
};

export default OrbitControls;