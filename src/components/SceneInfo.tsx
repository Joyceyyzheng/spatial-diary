import React, { useState, useEffect, useRef } from "react";
import { getSceneById, saveScene } from "../DB";
import "./SceneInfo.css";
import CalendarIcon from "../assets/calendar-icon.svg";
import LocIcon from "../assets/loc-icon.svg";
import SaveIcon from "../assets/info-save.svg";

interface SceneInfoProps {
  sceneId: string;
  onClose: () => void;
  position?: { x: number; y: number };
}

const SceneInfo: React.FC<SceneInfoProps> = ({
  sceneId,
  onClose,
  position,
}) => {
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [sceneName, setSceneName] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // 计算弹窗位置（仅在非移动端生效）
  useEffect(() => {
    if (!isMobile && position && contentRef.current) {
      const content = contentRef.current;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      const contentWidth = content.offsetWidth;
      const contentHeight = content.offsetHeight;

      let left = position.x;
      let top = position.y;

      // 检查右侧边界
      if (left + contentWidth > windowWidth) {
        left = windowWidth - contentWidth - 10;
      }

      // 检查底部边界
      if (top + contentHeight > windowHeight) {
        top = windowHeight - contentHeight - 10;
      }

      content.style.left = `${left}px`;
      content.style.top = `${top}px`;
    }
  }, [position, isMobile]);

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
    <div className="scene-info-modal">
      <div className="scene-info-content" ref={contentRef}>
        <div className="scene-info-header">
          <button onClick={onClose} className="scene-info-close">
            ✕
          </button>
          <h2 className="scene-info-title">{sceneName || "Unnamed"}</h2>
        </div>

        <div className="scene-info-section">
          {/* <p className="scene-info-label">Created Time:</p> */}
          <img src={CalendarIcon} alt="calendar icon" />
          <p>{new Date(parseInt(sceneId)).toLocaleString()}</p>
        </div>

        {/* <div className="scene-info-section">
          <label className="scene-info-label">Scene Name:</label>
          <input
            type="text"
            value={sceneName}
            onChange={(e) => setSceneName(e.target.value)}
            className="scene-info-input"
            placeholder="Enter Scene Name"
          />
        </div> */}

        <div className="scene-info-section">
          {/* <div className="scene-info-grid"> */}
          <div className="scene-info-loc">
            <div className="flex flex-row items-center gap-1.5">
              {" "}
              <img src={LocIcon} alt="calendar icon" />
              <label className="scene-info-label">Latitude</label>
            </div>

            <input
              type="number"
              step="0.000001"
              min="-90"
              max="90"
              value={latitude !== undefined ? latitude : ""}
              onChange={handleLatitudeChange}
              className="scene-info-input"
              placeholder="-90° S to 90° N"
            />
          </div>
          <div className="scene-info-loc">
            <div className="flex flex-row items-center gap-1.5">
              <img src={LocIcon} alt="calendar icon" />
              <label className="scene-info-label">Longitude:</label>
            </div>

            <input
              type="number"
              step="0.000001"
              min="-180"
              max="180"
              value={longitude !== undefined ? longitude : ""}
              onChange={handleLongitudeChange}
              className="scene-info-input"
              placeholder="-180° W to 180° E"
            />
          </div>
          {/* </div> */}
        </div>

        <div className="scene-info-save">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`scene-info-save-button flex flex-row gap-2 ${
              saveSuccess ? "scene-info-save-success" : ""
            }`}
          >
            <img src={SaveIcon} alt="save icon" />
            {isSaving ? "Saving..." : saveSuccess ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SceneInfo;
