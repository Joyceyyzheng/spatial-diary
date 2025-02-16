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

const StickyNote = React.memo(
  ({ id, url, position, isSelected, onSelect, onMove }) => {
    const { scene } = React.useMemo(() => useGLTF(url), [url]);
    const groupRef = useRef<Group>(null);

    return (
      <>
        <group ref={groupRef} position={position} onClick={onSelect}>
          <primitive
            object={scene}
            scale={[0.06, 0.06, 0.06]}
            receiveShadow
            castShadow
          />
          <pointLight position={[0, 0, 0.5]} intensity={15.0} color="red" />
          {isSelected && <meshStandardMaterial color="yellow" />}
        </group>
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.position[0] === nextProps.position[0] &&
      prevProps.position[1] === nextProps.position[1] &&
      prevProps.position[2] === nextProps.position[2]
    );
  }
);

export default StickyNote;
