import React, { useRef, useEffect } from 'react';
import { extend, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as ThreeOrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Étendre R3F avec OrbitControls
extend({ OrbitControls: ThreeOrbitControls });

const OrbitControls = () => {
  const { camera, gl } = useThree();
  const controlsRef = useRef();

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enableDamping = true;
      controlsRef.current.dampingFactor = 0.05;
      controlsRef.current.enablePan = true;
      controlsRef.current.enableZoom = true;
      controlsRef.current.enableRotate = true;
      controlsRef.current.minDistance = 3;
      controlsRef.current.maxDistance = 15;
    }
  }, []);

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
