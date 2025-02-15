import React, { useRef } from "react";
import { Group } from "three";
import { useGLTF } from "@react-three/drei";

function Sphere({
  url,
  position,
  isSelected,
  onSelect,
}: {
  url: string;
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<Group>(null);

  return (
    <group ref={groupRef} position={position} onClick={onSelect}>
      {/* 3D Sticky Note Model */}
      <primitive
        object={scene}
        scale={[0.06, 0.06, 0.06]}
        receiveShadow
        castShadow
      />

      {/* Light moves with the sticky note */}
      <pointLight position={[0, 0, 0.5]} intensity={15.0} color="red" />
      {isSelected && <meshStandardMaterial color="yellow" />}
    </group>
  );
}

export default Sphere;
