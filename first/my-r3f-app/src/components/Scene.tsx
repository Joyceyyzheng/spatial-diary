import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { saveScene, getSceneById } from "../DB";

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

  return (
    <div>
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
