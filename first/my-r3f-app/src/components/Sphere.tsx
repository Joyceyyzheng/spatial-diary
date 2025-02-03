import React from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';

function Sphere({ position }: { position: [number, number, number] }) {
  const meshRef = React.useRef<Mesh>(null);


//   useFrame(() => {
//     if (meshRef.current) {
//     }
//   });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.1, 32, 32]} /> 
      <meshStandardMaterial color="hotpink" />
    </mesh>
  );
}

export default Sphere;