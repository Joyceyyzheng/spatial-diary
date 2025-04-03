import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./LeafletMapView.css";

// 修改图标路径
let DefaultIcon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Scene {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  createdAt: number;
}

interface LeafletMapViewProps {
  scenes: Scene[];
  onSceneSelect: (sceneId: string) => void;
  onSceneDelete: (sceneId: string) => void;
}

// 自定义组件用于更新地图视图和设置边界限制
function MapUpdater({ scenes }: { scenes: Scene[] }) {
  const map = useMap();

  useEffect(() => {
    // 设置世界边界
    const worldBounds = L.latLngBounds(
      L.latLng(-85.06, -180), // 南极附近
      L.latLng(85.06, 180) // 北极附近
    );

    // 设置地图最大边界
    map.setMaxBounds(worldBounds);

    // 防止地图拖动到边界外
    map.on("drag", function () {
      map.panInsideBounds(worldBounds, { animate: false });
    });

    // 禁用环绕效果
    (map as any)._setCenterOffset = function () {};

    if (scenes.length > 0) {
      // 找出所有有效的经纬度
      const validScenes = scenes.filter(
        (scene) => scene.latitude !== undefined && scene.longitude !== undefined
      );

      if (validScenes.length > 0) {
        // 创建边界包含所有标记
        const bounds = L.latLngBounds(
          validScenes.map((scene) => [
            scene.latitude as number,
            scene.longitude as number,
          ])
        );

        // 设置地图视图以包含所有标记，但不超出世界边界
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 13, // 限制最大缩放级别
        });
      } else {
        // 如果没有有效的场景，显示世界地图
        map.setView([20, 0], 2);
      }
    } else {
      // 如果没有场景，显示世界地图
      map.setView([20, 0], 2);
    }

    // 设置最小缩放级别，防止过度缩小
    map.setMinZoom(2);

    return () => {
      // 清理事件监听器
      map.off("drag");
    };
  }, [map, scenes]);

  return null;
}

const LeafletMapView: React.FC<LeafletMapViewProps> = ({
  scenes,
  onSceneSelect,
  onSceneDelete,
}) => {
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null);

  // 处理标记点击
  const handleMarkerClick = (scene: Scene) => {
    setSelectedScene(scene);
  };

  // 处理场景打开
  const handleSceneOpen = () => {
    if (selectedScene) {
      onSceneSelect(selectedScene.id);
    }
  };

  // 处理场景删除
  const handleSceneDelete = () => {
    if (selectedScene && window.confirm("确定要删除这个场景吗？")) {
      onSceneDelete(selectedScene.id);
      setSelectedScene(null);
    }
  };

  return (
    <div className="leaflet-map-container">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
        attributionControl={false} // 隐藏归属信息
        maxBoundsViscosity={1.0} // 边界粘性，防止拖出边界
        worldCopyJump={true} // 在经度方向上无缝跳转
        minZoom={2} // 最小缩放级别
        maxZoom={18} // 最大缩放级别
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          noWrap={true} // 防止地图水平重复
        />

        <MapUpdater scenes={scenes} />

        {scenes.map((scene) => {
          // 只显示有经纬度的场景
          if (scene.latitude === undefined || scene.longitude === undefined) {
            return null;
          }

          return (
            <Marker
              key={scene.id}
              position={[scene.latitude, scene.longitude]}
              eventHandlers={{
                click: () => handleMarkerClick(scene),
              }}
            >
              <Popup>
                <div className="scene-popup-content">
                  <h3>{scene.name || "未命名场景"}</h3>
                  <p>创建时间: {new Date(scene.createdAt).toLocaleString()}</p>
                  <div className="popup-buttons">
                    <button onClick={handleSceneOpen} className="open-button">
                      打开
                    </button>
                    <button
                      onClick={handleSceneDelete}
                      className="delete-button"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default LeafletMapView;
