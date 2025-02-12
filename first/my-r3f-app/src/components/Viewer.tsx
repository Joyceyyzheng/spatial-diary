import React, { useState } from "react";
import { Canvas, group } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import Sphere from "./Sphere";
// import { Group } from 'three/examples/jsm/libs/tween.module.js';

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url) as GLTF;
  // console.log('Model position:', scene.position);
  return <primitive object={scene} />;
}

function ModelViewer() {
  //the sphere
  const [ballPosition, setBallPosition] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const [selectedBall, setSelectedBall] = useState<boolean>(false);

  //moving the sphere
  const moveBall = (
    direction: "left" | "right" | "up" | "down" | "forward" | "backward"
  ) => {
    const [x, y, z] = ballPosition;
    switch (direction) {
      case "left":
        setBallPosition([x - 0.1, y, z]);
        break;
      case "right":
        setBallPosition([x + 0.1, y, z]);
        break;
      case "up":
        setBallPosition([x, y + 0.1, z]);
        break;
      case "down":
        setBallPosition([x, y - 0.1, z]);
        break;
      case "forward":
        setBallPosition([x, y, z + 0.1]);
        break;
      case "backward":
        setBallPosition([x, y, z - 0.1]);
        break;
      default:
        break;
    }
  };

  //scene loader
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <button onClick={() => setModelUrl("/models/1221shanghai.glb")}>
          Shanghai
        </button>
        <button onClick={() => setModelUrl("/models/roomscan_1104.gltf")}>
          BK
        </button>
        <button onClick={() => setModelUrl("/models/iris1.gltf")}>
          Mahjong
        </button>
        <button onClick={() => setModelUrl("/models/iris2.gltf")}>Puppy</button>
      </div>

      <Canvas style={{ width: "90vw", height: "80vh" }} shadows>
        <ambientLight intensity={0.5} />
        {/* <pointLight position={[10, 10, 10]} /> */}
        {modelUrl && <Model url={modelUrl} />}
        {!selectedBall && <OrbitControls />}

        <group position={ballPosition}>
          {/* <pointLight
            position={[ballPosition[0], ballPosition[1], ballPosition[2] + 0.5]}
            // position={[0, 0, 0.5]}

            intensity={15.0}
            color="red"
          /> */}
          <axesHelper args={[2]} position={ballPosition} />

          <Sphere
            url="/models/notes.glb"
            // rotation={[90, 0, 90]} //rotation used to work for group above
            //  position={ballPosition}
            isSelected={selectedBall}
            onSelect={() => setSelectedBall(!selectedBall)}
          />
        </group>

        {/* <axesHelper args={[5]} /> */}
      </Canvas>
    </div>
  );
}

export default ModelViewer;
