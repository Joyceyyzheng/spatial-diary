import React, { useState, useEffect } from "react";
import { getSceneById, saveScene } from "../DB";

interface SceneInfoProps {
  sceneId: string;
  onClose: () => void;
}

const SceneInfo: React.FC<SceneInfoProps> = ({ sceneId, onClose }) => {
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [sceneName, setSceneName] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 加载场景数据
  useEffect(() => {
    async function loadSceneData() {
      try {
        const scene = await getSceneById(sceneId);
        if (scene) {
          setLatitude(scene.latitude);
          setLongitude(scene.longitude);
          setSceneName(scene.name || "");
        }
      } catch (error) {
        console.error("Error loading scene data:", error);
      }
    }

    loadSceneData();
  }, [sceneId]);

  // 验证经纬度输入
  const validateCoordinate = (
    value: string,
    type: "latitude" | "longitude"
  ): number | undefined => {
    if (!value.trim()) return undefined;

    const num = parseFloat(value);
    if (isNaN(num)) return undefined;

    // 验证范围
    if (type === "latitude" && (num < -90 || num > 90)) return undefined;
    if (type === "longitude" && (num < -180 || num > 180)) return undefined;

    return num;
  };

  const handleLatitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLatitude(validateCoordinate(value, "latitude"));
  };

  const handleLongitudeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLongitude(validateCoordinate(value, "longitude"));
  };

  // 随机生成经纬度
  const generateRandomCoordinates = () => {
    setLatitude(Math.random() * 180 - 90);
    setLongitude(Math.random() * 360 - 180);
  };

  // 保存场景信息
  const handleSave = async () => {
    try {
      setIsSaving(true);

      // 获取当前场景数据
      const currentScene = await getSceneById(sceneId);

      // 更新场景数据
      await saveScene({
        ...currentScene,
        id: sceneId,
        name: sceneName || currentScene?.name || `Scene ${sceneId}`,
        latitude,
        longitude,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("Error saving scene coordinates:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-[90vw]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Scene Info</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-1">Created Time:</p>
          <p>{new Date(parseInt(sceneId)).toLocaleString()}</p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-600 mb-1">Scene Name:</label>
          <input
            type="text"
            value={sceneName}
            onChange={(e) => setSceneName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Enter Scene Name"
          />
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-600">Scene Location:</label>
            <button
              onClick={generateRandomCoordinates}
              className="text-sm bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
            >
              随机位置
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="0.000001"
                min="-90"
                max="90"
                value={latitude !== undefined ? latitude : ""}
                onChange={handleLatitudeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="-90 to 90"
              />
            </div>
            <div>
              <label className="block text-gray-600 text-sm mb-1">
                Longtitude:
              </label>
              <input
                type="number"
                step="0.000001"
                min="-180"
                max="180"
                value={longitude !== undefined ? longitude : ""}
                onChange={handleLongitudeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="-180 to 180"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-1">
            Latitude range: -90° (South Pole) to 90° (North Pole)
            <br />
            Longitude range: -180° (west) to 180° (east)
          </p>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`px-4 py-2 rounded-md ${
              isSaving
                ? "bg-gray-400 cursor-not-allowed"
                : saveSuccess
                ? "bg-green-500 hover:bg-green-600"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            {isSaving ? "Saving..." : saveSuccess ? "Saved" : "Save Location"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SceneInfo;
