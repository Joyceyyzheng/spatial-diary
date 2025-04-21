import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const GlowingSphere = ({
  position = [0, 0, 0],
  color = new THREE.Color(0xffa500),
  scale = 0.2,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const scaleFactor = scale + Math.sin(timeRef.current * 2) * 0.05;
    if (meshRef.current) {
      meshRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
      meshRef.current.material.emissiveIntensity =
        1.5 + Math.sin(timeRef.current * 3) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
      />
    </mesh>
  );
};

export default GlowingSphere;
