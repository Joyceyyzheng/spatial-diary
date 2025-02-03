import React, { useRef, useState } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';
import { TransformControls } from '@react-three/drei';

function Sphere({ position, isSelected, onSelect }: { 
  position: [number, number, number]; 
  isSelected: boolean; 
  onSelect: () => void; 
}) {
  const meshRef = useRef<Mesh>(null);

  return (
    <>
      <mesh 
        ref={meshRef} 
        position={position} 
        onClick={onSelect} //select the sphere
      >
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshStandardMaterial color={isSelected ? 'hotpink' : 'blue'} />
      </mesh>

      
      {isSelected && (
        <>
       
          <TransformControls object={meshRef.current!} mode="translate" /> 
        </>
      )}
    </>
  );
}

export default Sphere;