import React, { useState, useRef, useEffect } from "react";
import "./MapView.css";

interface Scene {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  createdAt: number;
}

interface MapViewProps {
  scenes: Scene[];
  onSceneSelect: (sceneId: string) => void;
  onSceneDelete: (sceneId: string) => void;
}

const MapView: React.FC<MapViewProps> = ({
  scenes,
  onSceneSelect,
  onSceneDelete,
}) => {
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);
  const [popupPosition, setPopupPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });
  const [mapScale, setMapScale] = useState(1);

  // 初始化地图尺寸
  useEffect(() => {
    if (mapContainerRef.current) {
      const updateDimensions = () => {
        if (mapContainerRef.current) {
          const containerWidth = mapContainerRef.current.clientWidth;
          const containerHeight = mapContainerRef.current.clientHeight;

          // 计算地图尺寸，保持1425:625的宽高比
          const mapRatio = 1425 / 625;

          // 在移动设备上，优先填满高度
          const isMobile = window.innerWidth <= 768;

          let width, height;

          if (isMobile) {
            // 移动设备上，以容器高度为基准计算宽度
            height = containerHeight;
            width = height * mapRatio;

            // 确保宽度至少是容器宽度的1.5倍，这样用户可以左右滚动
            if (width < containerWidth * 1.5) {
              width = containerWidth * 1.5;
              height = width / mapRatio;
            }
          } else {
            // 桌面设备上，保持原来的逻辑
            const containerRatio = containerWidth / containerHeight;

            if (containerRatio > mapRatio) {
              // 容器更宽，以高度为基准
              height = containerHeight;
              width = height * mapRatio;
            } else {
              // 容器更高，以宽度为基准
              width = containerWidth;
              height = width / mapRatio;
            }

            // 确保地图足够大，至少是容器的1.5倍
            const scale = Math.max(1.5, containerWidth / width);
            width *= scale;
            height *= scale;
          }

          setMapDimensions({
            width: width,
            height: height,
          });

          // 初始位置居中
          setMapPosition({
            x: (containerWidth - width) / 2,
            y: (containerHeight - height) / 2,
          });
        }
      };

      updateDimensions();
      window.addEventListener("resize", updateDimensions);

      return () => {
        window.removeEventListener("resize", updateDimensions);
      };
    }
  }, []);

  // 将经纬度转换为地图上的坐标
  const getPositionFromLatLng = (lat?: number, lng?: number) => {
    // 确保有经纬度值，否则使用随机值
    const latitude = lat ?? Math.random() * 180 - 90;
    const longitude = lng ?? Math.random() * 360 - 180;

    // 将经纬度转换为地图上的x, y坐标
    // 经度范围：-180到180，映射到地图宽度
    // 纬度范围：90到-90，映射到地图高度（注意纬度是反的，北纬90度在顶部）
    const x = ((longitude + 180) / 360) * mapDimensions.width;
    const y = ((90 - latitude) / 180) * mapDimensions.height;

    return { x, y };
  };

  // 处理鼠标按下事件（开始拖动）
  const handleMouseDown = (event: React.MouseEvent) => {
    if (event.button !== 0) return; // 只处理左键点击

    setIsDragging(true);
    setDragStart({
      x: event.clientX - mapPosition.x,
      y: event.clientY - mapPosition.y,
    });

    // 防止选中文本
    event.preventDefault();
  };

  // 处理鼠标移动事件（拖动中）
  const handleMouseMove = (event: React.MouseEvent) => {
    if (!isDragging) return;

    const newX = event.clientX - dragStart.x;
    const newY = event.clientY - dragStart.y;

    // 限制拖动范围，确保地图不会完全拖出视图
    const containerWidth = mapContainerRef.current?.clientWidth || 0;
    const containerHeight = mapContainerRef.current?.clientHeight || 0;

    const minX = containerWidth - mapDimensions.width;
    const minY = containerHeight - mapDimensions.height;

    setMapPosition({
      x: Math.min(Math.max(newX, minX), 0),
      y: Math.min(Math.max(newY, minY), 0),
    });
  };

  // 处理鼠标释放事件（结束拖动）
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 处理鼠标离开事件（结束拖动）
  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  // 处理滚轮事件（缩放）
  const handleWheel = (event: React.WheelEvent) => {
    // event.preventDefault();

    const delta = -event.deltaY;
    const scaleChange = delta > 0 ? 1.1 : 0.9;
    const newScale = Math.max(1, Math.min(5, mapScale * scaleChange));

    // 计算鼠标位置相对于地图的偏移
    const rect = mapContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // 计算鼠标位置相对于地图原点的偏移
    const relativeX = mouseX - mapPosition.x;
    const relativeY = mouseY - mapPosition.y;

    // 计算新的地图位置，保持鼠标指向的点不变
    const newX = mouseX - relativeX * scaleChange;
    const newY = mouseY - relativeY * scaleChange;

    setMapScale(newScale);
    setMapDimensions({
      width: (mapDimensions.width / mapScale) * newScale,
      height: (mapDimensions.height / mapScale) * newScale,
    });
    setMapPosition({ x: newX, y: newY });
  };

  // 处理触摸开始事件
  const handleTouchStart = (event: React.TouchEvent) => {
    if (event.touches.length === 1) {
      const touch = event.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - mapPosition.x,
        y: touch.clientY - mapPosition.y,
      });
    }
  };

  // 处理触摸移动事件
  const handleTouchMove = (event: React.TouchEvent) => {
    if (!isDragging || event.touches.length !== 1) return;

    const touch = event.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;

    // 限制拖动范围，确保地图不会完全拖出视图
    const containerWidth = mapContainerRef.current?.clientWidth || 0;
    const containerHeight = mapContainerRef.current?.clientHeight || 0;

    const minX = containerWidth - mapDimensions.width;
    const minY = containerHeight - mapDimensions.height;

    setMapPosition({
      x: Math.min(Math.max(newX, minX), 0),
      y: Math.min(Math.max(newY, minY), 0),
    });

    // 防止页面滚动
    // event.preventDefault();
  };

  // 处理触摸结束事件
  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // 处理标记点击
  const handleMarkerClick = (scene: Scene, event: React.MouseEvent) => {
    event.stopPropagation();
    setSelectedScene(scene);

    // 计算弹出框位置
    const rect = mapContainerRef.current?.getBoundingClientRect();
    if (rect) {
      const position = getPositionFromLatLng(scene.latitude, scene.longitude);
      setPopupPosition({
        x: position.x + mapPosition.x,
        y: position.y + mapPosition.y,
      });
    }
  };

  // 处理地图点击（关闭弹出框）
  const handleMapClick = () => {
    setSelectedScene(null);
    setPopupPosition(null);
  };

  // 处理场景选择
  const handleSceneOpen = () => {
    if (selectedScene) {
      onSceneSelect(selectedScene.id);
      setSelectedScene(null);
      setPopupPosition(null);
    }
  };

  // 处理场景删除
  const handleSceneDelete = () => {
    if (selectedScene) {
      onSceneDelete(selectedScene.id);
      setSelectedScene(null);
      setPopupPosition(null);
    }
  };

  return (
    <div
      className="map-view-container"
      ref={mapContainerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handleMapClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      //   onWheel={handleWheel}
    >
      <div
        className="world-map-background"
        ref={mapRef}
        style={{
          width: `${mapDimensions.width}px`,
          height: `${mapDimensions.height}px`,
          transform: `translate(${mapPosition.x}px, ${mapPosition.y}px)`,
          cursor: isDragging ? "grabbing" : "grab",
        }}
      />

      {/* 场景标记 */}
      {scenes.map((scene) => {
        const position = getPositionFromLatLng(scene.latitude, scene.longitude);
        return (
          <div
            key={scene.id}
            className={`map-marker ${
              selectedScene?.id === scene.id ? "selected" : ""
            }`}
            style={{
              left: `${position.x + mapPosition.x}px`,
              top: `${position.y + mapPosition.y}px`,
            }}
            onClick={(e) => handleMarkerClick(scene, e)}
            title={scene.name || "Unnamed Scene"}
          />
        );
      })}

      {/* 弹出框 */}
      {selectedScene && popupPosition && (
        <div
          className="scene-popup"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3>{selectedScene.name || "Unnamed Scene"}</h3>
          <p>
            Create Time: {new Date(selectedScene.createdAt).toLocaleString()}
          </p>
          <div className="popup-buttons">
            <button onClick={handleSceneOpen}>Open</button>
            <button onClick={handleSceneDelete} className="delete-button">
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default MapView;
