import React, { useRef } from "react";
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

function StickyNote({
  id,
  url,
  position,
  isSelected,
  onSelect,
  onMove,
}: StickyNoteProps) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<Group>(null);

  return (
    <>
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

        {/* Highlight selected note */}
        {isSelected && <meshStandardMaterial color="yellow" />}
      </group>

      {/* Movement Buttons (Render outside the 3D Scene)
      {isSelected && (
        <div style={{ marginTop: "10px" }}>
          <button onClick={() => onMove(id, "x", "negative")}>Left (-X)</button>
          <button onClick={() => onMove(id, "x", "positive")}>
            Right (+X)
          </button>
          <button onClick={() => onMove(id, "y", "positive")}>Up (+Y)</button>
          <button onClick={() => onMove(id, "y", "negative")}>Down (-Y)</button>
          <button onClick={() => onMove(id, "z", "negative")}>
            Backward (-Z)
          </button>
          <button onClick={() => onMove(id, "z", "positive")}>
            Forward (+Z)
          </button>
        </div>
      )} */}
    </>
  );
}

export default StickyNote;
