import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { GLTF } from 'three-stdlib';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url) as GLTF;
  return <primitive object={scene} />;
}


function ModelViewer() {
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setModelUrl('/models/1221shanghai.glb')}>BK home</button>
        <button onClick={() => setModelUrl('/models/roomscan_1104.gltf')}>Shanghai</button>
        <button onClick={() => setModelUrl('/models/iris1.gltf')}>Mahjong</button>
        <button onClick={() => setModelUrl('/models/iris2.gltf')}>Puppy</button>
      </div>

      <Canvas style={{ width: '90vw', height: '80vh' }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        {modelUrl && <Model url={modelUrl} />}
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default ModelViewer;