import { useRef, useMemo } from "react";
import { Group } from "three";
import { useGLTF, Billboard, useTexture } from "@react-three/drei";

interface StickyNoteProps {
  id: string;
  url: string;
  position: [number, number, number];
  content?: string;
  imageUrl?: string;
  isSelected: boolean;
  onSelect: () => void;
}

export default function StickyNote({
  id,
  url,
  position,
  content,
  imageUrl,
  isSelected,
  onSelect,
}: StickyNoteProps) {
  const gltf = useGLTF(url);
  const clonedScene = useMemo(() => gltf.scene.clone(), [gltf.scene]);
  const groupRef = useRef<Group>(null);
  const texture = useTexture(url);

  return (
    <>
      <Billboard position={position} onClick={onSelect}>
        <group
          ref={groupRef}
          position={position}
          onClick={onSelect}
          rotation={[1.5, 0, 0]}
        >
          <primitive
            object={clonedScene}
            scale={[0.06, 0.06, 0.06]}
            receiveShadow
            castShadow
          />
          {/* {content && (
          <Text
            position={[0, 0.5, 0]}
            fontSize={0.2}
            color="black"
            anchorX="center"
            anchorY="middle"
          >
            {content}
          </Text>
        )} */}
          {/* {imageUrl && (
          <mesh position={[0, 0, 0.1]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={new TextureLoader().load(imageUrl)} />
          </mesh>
        )} */}
          <pointLight position={[0, 0, 0.5]} intensity={3.0} color="yellow" />
          {isSelected && <meshStandardMaterial color="blue" />}
        </group>
      </Billboard>
    </>
  );
}
