import { useState, useEffect } from "react";
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
        <h1 className="my-2">Spatial Diary</h1>
        <button onClick={() => navigate(`/scene/${Date.now()}`)}>
          Create New Scene
        </button>
      </div>

      <ul className="text-left w-full list-none">
        {scenes.map((scene) => (
          <li key={scene.id} className="my-2 flex justify-between items-center">
            <div className="mx-2">
              {" "}
              {new Date(parseInt(scene.id)).toLocaleString()} {scene.name}{" "}
            </div>
            <div>
              <button
                className="mx-0.5"
                onClick={() => navigate(`/scene/${scene.id}`)}
              >
                Open
              </button>
              <button
                className="mx-0.5"
                onClick={() => handleDeleteScene(scene.id)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
