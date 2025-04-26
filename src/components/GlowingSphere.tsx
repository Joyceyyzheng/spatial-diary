import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface GlowingSphereProps {
  id: string;
  position: [number, number, number];
  content?: string;
  imageUrl?: string;
  isSelected: boolean;
  onSelect: () => void;
  onMove: (
    id: string,
    axis: "x" | "y" | "z",
    direction: "positive" | "negative"
  ) => void;
  nextNotePosition?: [number, number, number];
  breathRate?: number;
}

const GlowingSphere: React.FC<GlowingSphereProps> = ({
  id,
  position,
  content,
  imageUrl,
  isSelected,
  onSelect,
  onMove,
  nextNotePosition,
  breathRate,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    timeRef.current += delta;
    const baseScale = 0.1;
    const scaleFactor =
      baseScale + Math.sin(timeRef.current * (breathRate ?? 1.5)) * 0.05;
    if (meshRef.current) {
      meshRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={isSelected ? "#72E949" : "#FF6200"}
        transparent
        opacity={0.9}
        roughness={0.1}
        metalness={0.1}
        emissive={isSelected ? "#2BA700" : "#FFAA00"}
        emissiveIntensity={isSelected ? 3 : 2.6}
      />
    </mesh>
  );
};

export default GlowingSphere;
