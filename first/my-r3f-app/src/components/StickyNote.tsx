import React, { useRef, useMemo } from "react";
import { Group } from "three";
import { useGLTF } from "@react-three/drei";

interface StickyNoteProps {
  id: string; // Unique ID for each sticky note
  url: string;
  position: [number, number, number];
  isSelected: boolean;
  onSelect: () => void;
  onMove: (
    id: string,
    axis: "x" | "y" | "z",
    direction: "positive" | "negative"
  ) => Promise<void>;
  //   onMove: (
  //     id: string,
  //     axis: "x" | "y" | "z",
  //     direction: "positive" | "negative"
  //   ) => void;
}

export default function StickyNote({
  id,
  url,
  position,
  isSelected,
  onSelect,
}: StickyNoteProps) {
  const gltf = useGLTF(url);

  const clonedScene = useMemo(() => gltf.scene.clone(), [gltf.scene]);
  const groupRef = useRef<Group>(null);

  return (
    <>
      <group ref={groupRef} position={position} onClick={onSelect}>
        <primitive
          object={clonedScene}
          scale={[0.06, 0.06, 0.06]}
          receiveShadow
          castShadow
        />
        <pointLight position={[0, 0, 0.5]} intensity={15.0} color="red" />
        {isSelected && <meshStandardMaterial color="yellow" />}
      </group>
    </>
  );
}

// export default StickyNote;
