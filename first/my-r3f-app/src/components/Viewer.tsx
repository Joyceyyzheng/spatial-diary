import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import Sphere from "./Sphere";
import { Group } from "three";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url) as GLTF;
  // console.log('Model position:', scene.position);
  return <primitive object={scene} />;
}

function ModelViewer() {
  const [selectedBall, setSelectedBall] = useState<boolean>(false);
  const [ballPosition, setBallPosition] = useState<[number, number, number]>([
    0, 0, 0,
  ]);

  // Function to move the sticky note in 3D space
  const moveBall = (
    axis: "x" | "y" | "z",
    direction: "positive" | "negative"
  ) => {
    setBallPosition((prev) => {
      const step = 0.1; // Movement step size
      let [x, y, z] = prev;

      if (axis === "x") x += direction === "positive" ? step : -step;
      if (axis === "y") y += direction === "positive" ? step : -step;
      if (axis === "z") z += direction === "positive" ? step : -step;

      return [x, y, z];
    });
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

      {/* UI Buttons for Moving in 3D Space */}
      {selectedBall && (
        <div
          style={{
            marginBottom: "10px",
            display: "grid",
            gridTemplateColumns: "repeat(3, auto)",
            gap: "5px",
          }}
        >
          <button onClick={() => moveBall("x", "negative")}>Left (-X)</button>
          <button onClick={() => moveBall("x", "positive")}>Right (+X)</button>
          <button onClick={() => moveBall("y", "positive")}>Up (+Y)</button>
          <button onClick={() => moveBall("y", "negative")}>Down (-Y)</button>
          <button onClick={() => moveBall("z", "negative")}>
            Backward (-Z)
          </button>
          <button onClick={() => moveBall("z", "positive")}>
            Forward (+Z)
          </button>
        </div>
      )}

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
