import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { saveScene, getSceneById, saveModel, getModel } from "../DB";
import { Canvas, useThree, useLoader } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { GLTF } from "three-stdlib";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function ModelRenderer({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function ModelViewer({ fileData }: { fileData: ArrayBuffer | null }) {
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!fileData) return;

    console.log("Model data found, creating Blob...");

    try {
      const blob = new Blob([fileData], { type: "model/gltf-binary" });
      const url = URL.createObjectURL(blob);
      setModelUrl(url);
    } catch (error) {
      console.error("Error creating model URL:", error);
    }
  }, [fileData]);

  if (!modelUrl) return <p>Loading model...</p>;

  return (
    <Canvas style={{ width: "90vw", height: "80vh" }}>
      <ambientLight intensity={0.5} />
      <OrbitControls />
      <ModelRenderer url={modelUrl} />
    </Canvas>
  );
}

function ScenePage() {
  const { sceneId } = useParams(); // Get dynamic route ID
  const navigate = useNavigate();
  const [scene, setScene] = useState<{ id: string; name: string } | null>(null);
  const [sceneName, setSceneName] = useState("");

  useEffect(() => {
    async function loadScene() {
      if (sceneId) {
        const storedScene = await getSceneById(sceneId);
        if (storedScene) {
          setScene(storedScene);
          setSceneName(storedScene.name);
        }
      }
    }
    loadScene();
  }, [sceneId]);

  const handleSaveScene = async () => {
    if (!sceneId) return;
    const newScene = { id: sceneId, name: sceneName || `Scene ${sceneId}` };
    await saveScene(newScene);
    setScene(newScene);
  };

  //3d model
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null);

  useEffect(() => {
    async function loadModel() {
      const storedModel = await getModel(sceneId!);
      if (storedModel) setFileData(storedModel.model);
    }
    loadModel();
  }, [sceneId]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await saveModel(sceneId!, file);
      setFileData(await file.arrayBuffer());
    }
  };

  return (
    <div>
      {/* newly added  */}
      <div>
        <h1>Scene {sceneId}</h1>
        <input type="file" accept=".glb,.gltf" onChange={handleFileUpload} />
        <ModelViewer fileData={fileData} />
      </div>
      {/* newly added  */}

      <h1>{scene ? `Edit Scene: ${scene.name}` : "Create New Scene"}</h1>
      <input
        type="text"
        placeholder="Enter scene name"
        value={sceneName}
        onChange={(e) => setSceneName(e.target.value)}
      />
      <button onClick={handleSaveScene}>Save Scene</button>
      <button onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
}

export default ScenePage;
