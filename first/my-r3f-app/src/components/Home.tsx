import React, { useState, useEffect } from "react";
import { getScenes, deleteScene } from "../DB";
import { useNavigate } from "react-router-dom";

function Home() {
  const [scenes, setScenes] = useState<{ id: string; name: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadScenes() {
      const storedScenes = await getScenes();
      setScenes(storedScenes);
    }
    loadScenes();
  }, []);

  const handleDeleteScene = async (sceneId: string) => {
    await deleteScene(sceneId);
    setScenes((prevScenes) =>
      prevScenes.filter((scene) => scene.id !== sceneId)
    );
  };

  return (
    <div>
      <div style={{}}>
        {" "}
        <h1>Spatial Diary</h1>
        <button onClick={() => navigate(`/scene/${Date.now()}`)}>
          Create New Scene
        </button>
      </div>

      <ul>
        {scenes.map((scene) => (
          <li key={scene.id}>
            {new Date(parseInt(scene.id)).toLocaleString()} {scene.name}{" "}
            <button onClick={() => navigate(`/scene/${scene.id}`)}>Open</button>
            <button onClick={() => handleDeleteScene(scene.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
