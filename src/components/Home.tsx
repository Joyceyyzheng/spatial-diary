import { useState, useEffect } from "react";
import { getScenes, deleteScene } from "../DB";
import { useNavigate } from "react-router-dom";
// import EarthView from "./EarthView";
// import "./EarthView.css";
// import MapView from "./MapView";
// import "./MapView.css";
import LeafletMapView from "./LeafletMapView";
import "./LeafletMapView.css";

interface Scene {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  createdAt: number;
}

function Home() {
  const [scenes, setScenes] = useState<{ id: string; name: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadScenes() {
      const storedScenes = await getScenes();
      const processedScenes = storedScenes.map((scene) => ({
        ...scene,
        latitude: scene.latitude ?? Math.random() * 180 - 90,
        longitude: scene.longitude ?? Math.random() * 360 - 180,
        createdAt: parseInt(scene.id),
      }));

      setScenes(processedScenes);
    }
    loadScenes();
  }, []);

  const handleDeleteScene = async (sceneId: string) => {
    await deleteScene(sceneId);
    setScenes((prevScenes) =>
      prevScenes.filter((scene) => scene.id !== sceneId)
    );
  };

  const handleCreateScene = () => {
    // 创建新场景时随机生成经纬度
    const latitude = Math.random() * 180 - 90;
    const longitude = Math.random() * 360 - 180;
    const newSceneId = Date.now().toString();

    // 保存新场景（需要更新DB.ts以支持经纬度）
    updateScene({
      id: newSceneId,
      name: "新场景",
      latitude,
      longitude,
    });

    navigate(`/scene/${newSceneId}`);
  };

  const handleSceneSelect = (sceneId: string) => {
    navigate(`/scene/${sceneId}`);
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
      {/* <div className="earth-container">
        <EarthView
          scenes={scenes}
          onSceneSelect={handleSceneSelect}
          onSceneDelete={handleDeleteScene}
        />
      </div> */}
      <LeafletMapView
        scenes={scenes}
        onSceneSelect={handleSceneSelect}
        onSceneDelete={handleDeleteScene}
      />
      <div className="map-container">
        {/* <MapView
          scenes={scenes}
          onSceneSelect={handleSceneSelect}
          onSceneDelete={handleDeleteScene}
        /> */}
      </div>
      <div className="home-container">
        {/* <div className="header">
          <h1 className="title">空间日记</h1>
          <button className="create-button" onClick={handleCreateScene}>
            创建新场景
          </button>
        </div> */}
      </div>
    </div>
  );
}

export default Home;
