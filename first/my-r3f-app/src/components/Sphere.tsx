import React, { useRef, useState } from "react";
import { Group } from "three";
import { useGLTF } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { Vector3 } from "three";

function Sphere({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const groupRef = useRef<Group>(null);
  const { camera, raycaster, mouse } = useThree();
  const [dragging, setDragging] = useState(false);

  useFrame(() => {
    if (dragging && groupRef.current) {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(groupRef.current, true);
      if (intersects.length > 0) {
        const point = intersects[0].point;
        groupRef.current.position.lerp(
          new Vector3(point.x, point.y, groupRef.current.position.z),
          0.2
        );
      }
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerDown={() => setDragging(true)}
      onPointerUp={() => setDragging(false)}
      onPointerOut={() => setDragging(false)}
    >
      <primitive
        object={scene}
        scale={[0.06, 0.06, 0.06]}
        receiveShadow
        castShadow
      />
      <pointLight position={[0, 0, 0.5]} intensity={15.0} color="red" />
    </group>
  );
}

export default Sphere;
