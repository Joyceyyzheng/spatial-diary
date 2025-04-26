import { useState, useEffect } from "react";
import { getScenes, deleteScene, saveScene } from "../DB";
import { useNavigate } from "react-router-dom";
// import EarthView from "./EarthView";
// import "./EarthView.css";
// import MapView from "./MapView";
// import "./MapView.css";
import LeafletMapView from "./LeafletMapView";
import "./LeafletMapView.css";
import ListIcon from "../assets/list-view.svg";
import MapIcon from "../assets/map-view.svg";
import AddIcon from "../assets/add-button.svg";
import EnterIcon from "../assets/laptop-enter.svg";
import InfoIcon from "../assets/info-gray.svg";
import DeleteIcon from "../assets/delete-gray.svg";
import SceneInfo from "./SceneInfo";
import "./Home.css";

interface Scene {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  createdAt: number;
  modelUrl?: string;
}

function Home() {
  const [scenes, setScenes] = useState<{ id: string; name: string }[]>([]);
  const navigate = useNavigate();

  const [isList, setIsList] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [infoPosition, setInfoPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const loadScenes = async () => {
    const storedScenes = await getScenes();
    const processedScenes = storedScenes.map((scene) => ({
      ...scene,
      latitude: scene.latitude ?? Math.random() * 180 - 90,
      longitude: scene.longitude ?? Math.random() * 360 - 180,
      createdAt: parseInt(scene.id),
    }));

    // 添加预定义场景
    const predefinedScene = {
      id: "predefined",
      name: "Example",
      latitude: 40.7128,
      longitude: -74.006,
      createdAt: Date.now(),
      modelUrl: "/models/livingroom.glb",
    };

    // 检查是否已经存在预定义场景
    const existingPredefinedScene = processedScenes.find(
      (scene) => scene.id === "predefined"
    );
    if (!existingPredefinedScene) {
      // 如果不存在，添加到数据库
      await saveScene(predefinedScene);
    }
    const refreshedScenes = await getScenes();

    setScenes([
      predefinedScene,
      ...refreshedScenes.filter((scene) => scene.id !== "predefined"),
    ]);
  };

  useEffect(() => {
    loadScenes();
  }, []);

  const handleDeleteScene = async (sceneId: string) => {
    await deleteScene(sceneId);

    if (sceneId && window.confirm("Are you sure you want to delete it？")) {
      setScenes((prevScenes) =>
        prevScenes.filter((scene) => scene.id !== sceneId)
      );
    }
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

  const handleView = () => {
    setIsList(!isList);
  };

  const handleInfoClick = (e: React.MouseEvent, sceneId: string) => {
    e.stopPropagation(); // 阻止事件冒泡
    const rect = e.currentTarget.getBoundingClientRect();
    setInfoPosition({
      x: rect.right + 10, // 在按钮右侧显示
      y: rect.top,
    });
    setSelectedSceneId(sceneId);
    setShowInfo(true);
  };

  return (
    <div>
      <div className="flex flex-row justify-between">
        {" "}
        <h1 className="my-2 text-left text-6xl font-bold">Spatial Diary</h1>
        <div className="my-2 text-left  home-btns">
          <button
            className="home-add"
            onClick={() => navigate(`/scene/${Date.now()}`)}
          >
            <img src={AddIcon} alt="view toggle" />
          </button>
          <button className="home-map" onClick={handleView}>
            <img src={isList ? MapIcon : ListIcon} alt="view toggle" />
          </button>
        </div>
      </div>

      {isList ? (
        <ul className="text-left w-full list-none list-view">
          {scenes.map((scene) => (
            <li
              key={scene.id}
              className="scene-entry my-2 flex justify-between items-center cursor-pointer"
            >
              <div
                className="list-info my-2 flex"
                onClick={() => navigate(`/scene/${scene.id}`)}
              >
                {" "}
                <div className="list-info-name  flex flex-row items-center gap-2">
                  <img src={EnterIcon} alt="enter icon" />
                  {scene.name}
                </div>
                <div className="list-info-time  flex flex-row items-center ">
                  {new Date(parseInt(scene.id)).toLocaleDateString()}{" "}
                </div>
              </div>
              <div className="mx-2 flex gap-2">
                <button
                  className="home-info mx-0.5"
                  onClick={(e) => handleInfoClick(e, scene.id)}
                >
                  <img src={InfoIcon} alt="info icon" />
                </button>
                <button
                  className="home-delete mx-0.5"
                  onClick={() => handleDeleteScene(scene.id)}
                >
                  <img src={DeleteIcon} alt="delete icon" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <LeafletMapView
          scenes={scenes}
          onSceneSelect={handleSceneSelect}
          onSceneDelete={handleDeleteScene}
        />
      )}

      {showInfo && selectedSceneId && (
        <SceneInfo
          sceneId={selectedSceneId}
          onClose={() => {
            setShowInfo(false);
            setSelectedSceneId(null);
            setInfoPosition(null);
            loadScenes();
          }}
          position={infoPosition || undefined}
        />
      )}

      {/* <div className="earth-container">
        <EarthView
          scenes={scenes}
          onSceneSelect={handleSceneSelect}
          onSceneDelete={handleDeleteScene}
        />
      </div> */}

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
